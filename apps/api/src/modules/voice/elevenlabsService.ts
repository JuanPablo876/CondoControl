/**
 * ElevenLabs Conversational AI Service
 * 
 * Handles the integration with ElevenLabs Conversational AI for real-time
 * voice conversations. Uses WebSocket for streaming audio to/from ElevenLabs.
 * 
 * Flow:
 * 1. Twilio receives incoming call → webhook to /api/voice/incoming
 * 2. We return TwiML that connects the call audio stream to our WebSocket
 * 3. WebSocket proxies audio to/from ElevenLabs Conversational AI
 * 4. ElevenLabs handles STT → LLM → TTS in real-time
 */

import { env } from "../config/env";

// ElevenLabs Conversational AI WebSocket URL
const ELEVENLABS_WS_URL = "wss://api.elevenlabs.io/v1/convai/conversation";

export interface ConversationConfig {
  agentId: string;
  voiceId?: string;
  language?: "es" | "en" | "pt";
  tenantName?: string;
  tenantContext?: string;
}

export interface ElevenLabsMessage {
  type: string;
  audio?: string; // Base64 encoded audio
  text?: string;
  transcript?: string;
  is_final?: boolean;
}

/**
 * Creates the signed URL for ElevenLabs Conversational AI WebSocket
 */
export function getElevenLabsWSUrl(config: ConversationConfig): string | null {
  const apiKey = env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    console.error("[elevenlabs] Missing ELEVENLABS_API_KEY");
    return null;
  }

  const params = new URLSearchParams({
    agent_id: config.agentId,
    xi_api_key: apiKey,
  });

  return `${ELEVENLABS_WS_URL}?${params.toString()}`;
}

/**
 * Generates the initial context prompt for the AI agent based on tenant info
 */
export function generateAgentContext(config: ConversationConfig): string {
  const langGreeting = {
    es: "Hola, bienvenido a CondoControl.",
    en: "Hello, welcome to CondoControl.",
    pt: "Olá, bem-vindo ao CondoControl.",
  };

  const greeting = langGreeting[config.language ?? "es"];
  
  let context = `${greeting}\n\n`;
  context += "Eres el asistente virtual de CondoControl, un sistema de administración de condominios.\n";
  context += "Tu rol es ayudar a los inquilinos con:\n";
  context += "- Consultas sobre pagos y saldos\n";
  context += "- Reportes de mantenimiento\n";
  context += "- Reservaciones de áreas comunes\n";
  context += "- Información general del condominio\n\n";

  if (config.tenantName) {
    context += `Estás hablando con ${config.tenantName}.\n`;
  }

  if (config.tenantContext) {
    context += `Contexto adicional: ${config.tenantContext}\n`;
  }

  context += "\nResponde de manera amable, profesional y concisa.";
  context += ` Siempre responde en ${config.language === "en" ? "inglés" : config.language === "pt" ? "portugués" : "español"}.`;

  return context;
}

/**
 * Validates that we have the required ElevenLabs configuration
 */
export function validateElevenLabsConfig(): { valid: boolean; missing: string[] } {
  const missing: string[] = [];
  
  if (!env.ELEVENLABS_API_KEY) missing.push("ELEVENLABS_API_KEY");
  
  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Get available voices for the language
 */
export function getVoicesForLanguage(language: string = "es"): { id: string; name: string }[] {
  const voices: Record<string, { id: string; name: string }[]> = {
    es: [
      { id: "pFZP5JQG7iQjIQuC4Bku", name: "Mateo" },
      { id: "ThT5KcBeYPX3keUQqHPh", name: "Valentina" },
      { id: "onwK4e9ZLuTAKqWW03F9", name: "Diego" },
      { id: "XB0fDUnXU5powFXDhCwa", name: "Sofía" },
    ],
    en: [
      { id: "21m00Tcm4TlvDq8ikWAM", name: "Rachel" },
      { id: "TxGEqnHWrfWFTfGW9XjX", name: "Josh" },
      { id: "pNInz6obpgDQGcFmaJgB", name: "Adam" },
      { id: "EXAVITQu4vr4xnSDxMaL", name: "Bella" },
    ],
    pt: [
      { id: "zcAOhNBS3c14rBihAFp1", name: "Lucas" },
      { id: "pqHfZKP75CvOlQylNhV4", name: "Isabella" },
    ],
  };

  return voices[language] ?? voices.es;
}

export const elevenlabsService = {
  getElevenLabsWSUrl,
  generateAgentContext,
  validateElevenLabsConfig,
  getVoicesForLanguage,
};
