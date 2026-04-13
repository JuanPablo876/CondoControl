/**
 * Voice Router
 * 
 * Handles Twilio voice webhooks for incoming calls and connects them
 * to ElevenLabs Conversational AI for real-time voice conversations.
 * 
 * Endpoints:
 * - POST /api/voice/incoming  - Twilio webhook for incoming calls
 * - POST /api/voice/status    - Call status callback
 * - GET  /api/voice/config    - Get current voice configuration
 */

import { Router, Request, Response } from "express";
import { env } from "../config/env";
import { twilioVoice } from "./twilioVoice";
import { elevenlabsService } from "./elevenlabsService";

export const voiceRouter = Router();

// Store active call sessions (in production, use Redis)
const activeCalls = new Map<string, {
  callSid: string;
  from: string;
  tenantId?: string;
  tenantName?: string;
  language: string;
  startTime: Date;
}>();

/**
 * POST /api/voice/incoming
 * Twilio webhook for incoming voice calls
 * Returns TwiML that either:
 * 1. Connects to ElevenLabs Conversational AI via WebSocket (if configured)
 * 2. Falls back to simple Gather/Say TwiML
 */
voiceRouter.post("/incoming", async (req: Request, res: Response) => {
  const { CallSid, From, To, CallerCity, CallerCountry } = req.body;
  
  console.log(`[voice] Incoming call: ${CallSid} from ${From}`);

  // Look up tenant by phone number (would query database in production)
  const tenant = await lookupTenantByPhone(From);
  const language = tenant?.language ?? "es";
  const languageCode = language === "en" ? "en-US" : language === "pt" ? "pt-BR" : "es-MX";

  // Store call session
  activeCalls.set(CallSid, {
    callSid: CallSid,
    from: From,
    tenantId: tenant?.id,
    tenantName: tenant?.name,
    language,
    startTime: new Date(),
  });

  // Check if ElevenLabs is configured for WebSocket streaming
  const elevenLabsConfig = elevenlabsService.validateElevenLabsConfig();
  const agentId = process.env.ELEVENLABS_AGENT_ID;

  if (elevenLabsConfig.valid && agentId) {
    // Use ElevenLabs Conversational AI with WebSocket streaming
    const wsBaseUrl = getWebSocketBaseUrl(req);
    const streamUrl = `${wsBaseUrl}/api/voice/stream?callSid=${CallSid}`;
    
    const welcomeMessage = language === "en" 
      ? "Connecting you to our assistant, please wait..."
      : language === "pt"
      ? "Conectando você ao nosso assistente, aguarde..."
      : "Conectándote con nuestro asistente, por favor espera...";

    const twiml = twilioVoice.generateStreamTwiML(streamUrl, welcomeMessage);
    
    res.type("text/xml");
    res.send(twiml);
  } else {
    // Fallback: Simple Gather/Say flow
    const apiBaseUrl = getApiBaseUrl(req);
    const prompt = language === "en"
      ? `Hello${tenant?.name ? ` ${tenant.name}` : ""}. Welcome to CondoControl. How can I help you today?`
      : language === "pt"
      ? `Olá${tenant?.name ? ` ${tenant.name}` : ""}. Bem-vindo ao CondoControl. Como posso ajudá-lo?`
      : `Hola${tenant?.name ? ` ${tenant.name}` : ""}. Bienvenido a CondoControl. ¿En qué puedo ayudarte?`;

    const twiml = twilioVoice.generateGatherTwiML(
      prompt,
      `${apiBaseUrl}/api/voice/respond`,
      { language: languageCode, timeout: 5, speechTimeout: "auto" }
    );

    res.type("text/xml");
    res.send(twiml);
  }
});

/**
 * POST /api/voice/respond
 * Handles speech input from Gather (fallback mode without ElevenLabs streaming)
 * Uses OpenRouter to generate a response
 */
voiceRouter.post("/respond", async (req: Request, res: Response) => {
  const { CallSid, SpeechResult, Confidence } = req.body;
  
  console.log(`[voice] Speech input: "${SpeechResult}" (confidence: ${Confidence})`);

  const session = activeCalls.get(CallSid);
  const language = session?.language ?? "es";
  const languageCode = language === "en" ? "en-US" : language === "pt" ? "pt-BR" : "es-MX";

  if (!SpeechResult) {
    const noInputMessage = language === "en"
      ? "I didn't catch that. Could you please repeat?"
      : language === "pt"
      ? "Não entendi. Poderia repetir, por favor?"
      : "No escuché bien. ¿Podrías repetir por favor?";

    const twiml = twilioVoice.generateSayTwiML(noInputMessage, languageCode);
    res.type("text/xml");
    return res.send(twiml);
  }

  // Generate AI response using OpenRouter
  const aiResponse = await generateAIResponse(SpeechResult, session);
  
  // Check if user wants to end the call
  const endCallPhrases = ["adiós", "adios", "chao", "bye", "goodbye", "tchau", "terminar", "colgar"];
  const shouldEndCall = endCallPhrases.some(phrase => 
    SpeechResult.toLowerCase().includes(phrase)
  );

  if (shouldEndCall) {
    const goodbyeMessage = language === "en"
      ? "Thank you for calling CondoControl. Have a great day!"
      : language === "pt"
      ? "Obrigado por ligar para o CondoControl. Tenha um ótimo dia!"
      : "Gracias por llamar a CondoControl. ¡Que tengas un excelente día!";

    const twiml = twilioVoice.generateHangupTwiML(goodbyeMessage, languageCode);
    activeCalls.delete(CallSid);
    res.type("text/xml");
    return res.send(twiml);
  }

  // Continue conversation
  const apiBaseUrl = getApiBaseUrl(req);
  const twiml = twilioVoice.generateGatherTwiML(
    aiResponse,
    `${apiBaseUrl}/api/voice/respond`,
    { language: languageCode, timeout: 5, speechTimeout: "auto" }
  );

  res.type("text/xml");
  res.send(twiml);
});

/**
 * POST /api/voice/status
 * Call status webhook (completed, failed, etc.)
 */
voiceRouter.post("/status", (req: Request, res: Response) => {
  const { CallSid, CallStatus, CallDuration } = req.body;
  
  console.log(`[voice] Call ${CallSid} status: ${CallStatus} (duration: ${CallDuration}s)`);

  if (CallStatus === "completed" || CallStatus === "failed" || CallStatus === "busy" || CallStatus === "no-answer") {
    const session = activeCalls.get(CallSid);
    if (session) {
      const duration = (new Date().getTime() - session.startTime.getTime()) / 1000;
      console.log(`[voice] Call ended: ${CallSid}, tenant: ${session.tenantName ?? "unknown"}, duration: ${duration}s`);
      activeCalls.delete(CallSid);
    }
  }

  res.json({ received: true });
});

/**
 * GET /api/voice/config
 * Returns current voice configuration status
 */
voiceRouter.get("/config", (_req: Request, res: Response) => {
  const elevenLabsConfig = elevenlabsService.validateElevenLabsConfig();
  const hasAgentId = !!process.env.ELEVENLABS_AGENT_ID;
  const hasTwilio = !!(env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN);

  res.json({
    status: "ok",
    elevenlabs: {
      configured: elevenLabsConfig.valid,
      agentConfigured: hasAgentId,
      missing: elevenLabsConfig.missing,
    },
    twilio: {
      configured: hasTwilio,
      voiceNumber: env.TWILIO_VOICE_FROM ?? null,
    },
    mode: elevenLabsConfig.valid && hasAgentId ? "streaming" : "fallback",
    activeCalls: activeCalls.size,
  });
});

// ---- Helper functions ----

/**
 * Look up tenant by phone number
 * In production, this would query the database
 */
async function lookupTenantByPhone(phone: string): Promise<{
  id: string;
  name: string;
  language: string;
} | null> {
  // Normalize phone number
  const normalized = phone.replace(/\D/g, "").slice(-10);

  // Demo data (would be database query)
  const tenants: Record<string, { id: string; name: string; language: string }> = {
    "5550101": { id: "t1", name: "Carlos Perez", language: "es" },
    "5550102": { id: "t2", name: "Maria Gutierrez", language: "es" },
    "5550103": { id: "t3", name: "Jorge Medina", language: "en" },
  };

  return tenants[normalized] ?? null;
}

/**
 * Generate AI response using OpenRouter
 */
async function generateAIResponse(
  userMessage: string,
  session?: { tenantName?: string; language: string }
): Promise<string> {
  const apiKey = env.OPENROUTER_API_KEY;
  
  if (!apiKey) {
    return session?.language === "en"
      ? "I apologize, but our AI assistant is temporarily unavailable. Please try again later or contact administration directly."
      : session?.language === "pt"
      ? "Desculpe, nosso assistente está temporariamente indisponível. Tente novamente mais tarde."
      : "Disculpa, nuestro asistente está temporalmente no disponible. Por favor intenta más tarde o contacta a administración directamente.";
  }

  const systemPrompt = `Eres el asistente virtual de CondoControl, un sistema de administración de condominios.
Tu rol es ayudar a los inquilinos con consultas sobre pagos, mantenimiento y reservaciones.
${session?.tenantName ? `Estás hablando con ${session.tenantName}.` : ""}
Responde de manera concisa (máximo 2-3 oraciones) ya que esto será convertido a audio.
Responde en ${session?.language === "en" ? "inglés" : session?.language === "pt" ? "portugués" : "español"}.`;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://condocontrol.app",
      },
      body: JSON.stringify({
        model: env.OPENROUTER_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        max_tokens: 150,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    return data.choices?.[0]?.message?.content ?? "Lo siento, no pude procesar tu solicitud.";
  } catch (error) {
    console.error("[voice] AI generation error:", error);
    return "Disculpa, hubo un error al procesar tu solicitud. Por favor intenta de nuevo.";
  }
}

/**
 * Get the base API URL from request
 */
function getApiBaseUrl(req: Request): string {
  const protocol = req.headers["x-forwarded-proto"] ?? req.protocol;
  const host = req.headers["x-forwarded-host"] ?? req.headers.host;
  return `${protocol}://${host}`;
}

/**
 * Get WebSocket base URL (wss:// for production, ws:// for local)
 */
function getWebSocketBaseUrl(req: Request): string {
  const protocol = req.headers["x-forwarded-proto"] === "https" ? "wss" : "ws";
  const host = req.headers["x-forwarded-host"] ?? req.headers.host;
  return `${protocol}://${host}`;
}
