/**
 * Twilio Voice TwiML Helpers
 * 
 * Generates TwiML (Twilio Markup Language) responses for voice calls.
 * TwiML tells Twilio how to handle the call (play audio, gather input, 
 * connect to streams, etc.)
 */

import { env } from "../config/env";

/**
 * Generate TwiML to start a WebSocket stream for real-time audio
 * This connects the Twilio call to our WebSocket server which proxies to ElevenLabs
 */
export function generateStreamTwiML(websocketUrl: string, welcomeMessage?: string): string {
  let twiml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  twiml += "<Response>\n";

  // Optional welcome message while connecting
  if (welcomeMessage) {
    twiml += `  <Say voice="Polly.Lucia" language="es-MX">${escapeXml(welcomeMessage)}</Say>\n`;
  }

  // Connect to WebSocket for bidirectional audio streaming
  twiml += "  <Connect>\n";
  twiml += `    <Stream url="${escapeXml(websocketUrl)}">\n`;
  twiml += '      <Parameter name="track" value="both_tracks" />\n';
  twiml += "    </Stream>\n";
  twiml += "  </Connect>\n";

  twiml += "</Response>";
  return twiml;
}

/**
 * Generate TwiML for a simple voice response (no streaming)
 * Uses Amazon Polly for Spanish TTS as fallback
 */
export function generateSayTwiML(message: string, language: string = "es-MX"): string {
  const voice = language.startsWith("es") ? "Polly.Lucia" 
              : language.startsWith("pt") ? "Polly.Camila" 
              : "Polly.Joanna";

  let twiml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  twiml += "<Response>\n";
  twiml += `  <Say voice="${voice}" language="${language}">${escapeXml(message)}</Say>\n`;
  twiml += "</Response>";
  return twiml;
}

/**
 * Generate TwiML for gathering speech input
 */
export function generateGatherTwiML(
  prompt: string,
  actionUrl: string,
  options: {
    language?: string;
    timeout?: number;
    speechTimeout?: string;
  } = {}
): string {
  const { language = "es-MX", timeout = 5, speechTimeout = "auto" } = options;
  const voice = language.startsWith("es") ? "Polly.Lucia" 
              : language.startsWith("pt") ? "Polly.Camila" 
              : "Polly.Joanna";

  let twiml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  twiml += "<Response>\n";
  twiml += `  <Gather input="speech" action="${escapeXml(actionUrl)}" language="${language}" timeout="${timeout}" speechTimeout="${speechTimeout}">\n`;
  twiml += `    <Say voice="${voice}" language="${language}">${escapeXml(prompt)}</Say>\n`;
  twiml += "  </Gather>\n";
  // Fallback if no input
  twiml += `  <Say voice="${voice}" language="${language}">No escuché una respuesta. Por favor intenta de nuevo.</Say>\n`;
  twiml += `  <Redirect>${escapeXml(actionUrl.replace("/respond", "/incoming"))}</Redirect>\n`;
  twiml += "</Response>";
  return twiml;
}

/**
 * Generate TwiML to play audio from a URL (e.g., ElevenLabs generated audio)
 */
export function generatePlayTwiML(audioUrl: string): string {
  let twiml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  twiml += "<Response>\n";
  twiml += `  <Play>${escapeXml(audioUrl)}</Play>\n`;
  twiml += "</Response>";
  return twiml;
}

/**
 * Generate TwiML to hang up with a goodbye message
 */
export function generateHangupTwiML(message?: string, language: string = "es-MX"): string {
  const voice = language.startsWith("es") ? "Polly.Lucia" 
              : language.startsWith("pt") ? "Polly.Camila" 
              : "Polly.Joanna";

  let twiml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  twiml += "<Response>\n";
  if (message) {
    twiml += `  <Say voice="${voice}" language="${language}">${escapeXml(message)}</Say>\n`;
  }
  twiml += "  <Hangup />\n";
  twiml += "</Response>";
  return twiml;
}

/**
 * Escape special XML characters
 */
function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Validate Twilio webhook signature
 */
export function validateTwilioSignature(
  signature: string,
  url: string,
  params: Record<string, string>
): boolean {
  // In production, use twilio.validateRequest()
  // For now, we'll accept all in development
  if (env.NODE_ENV === "development") {
    return true;
  }

  // Twilio signature validation would go here
  // Requires TWILIO_AUTH_TOKEN
  if (!env.TWILIO_AUTH_TOKEN) {
    console.warn("[twilio] Missing TWILIO_AUTH_TOKEN for signature validation");
    return true; // Allow in dev
  }

  // TODO: Implement actual signature validation
  // const twilio = require('twilio');
  // return twilio.validateRequest(env.TWILIO_AUTH_TOKEN, signature, url, params);
  return true;
}

export const twilioVoice = {
  generateStreamTwiML,
  generateSayTwiML,
  generateGatherTwiML,
  generatePlayTwiML,
  generateHangupTwiML,
  validateTwilioSignature,
};
