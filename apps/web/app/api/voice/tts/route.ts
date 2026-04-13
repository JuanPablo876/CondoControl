import { NextRequest, NextResponse } from "next/server";

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const DEFAULT_VOICE_ID = process.env.ELEVENLABS_VOICE_ID || "pFZP5JQG7iQjIQuC4Bku"; // Mateo (Spanish)

export async function POST(request: NextRequest) {
  try {
    const { text, voiceId, modelId = "eleven_multilingual_v2" } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: "Texto requerido" },
        { status: 400 }
      );
    }

    if (!ELEVENLABS_API_KEY) {
      // Demo mode: return empty audio indicator
      return NextResponse.json(
        { 
          error: "ElevenLabs API key no configurada", 
          demo: true,
          message: "En modo demo. Configura ELEVENLABS_API_KEY en .env para TTS real."
        },
        { status: 200 }
      );
    }

    const voice = voiceId || DEFAULT_VOICE_ID;

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voice}`,
      {
        method: "POST",
        headers: {
          "Accept": "audio/mpeg",
          "Content-Type": "application/json",
          "xi-api-key": ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text,
          model_id: modelId,
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.0,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("ElevenLabs TTS error:", errorText);
      return NextResponse.json(
        { error: "Error generando audio", details: errorText },
        { status: response.status }
      );
    }

    // Return audio as binary
    const audioBuffer = await response.arrayBuffer();
    
    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": String(audioBuffer.byteLength),
      },
    });
  } catch (error) {
    console.error("TTS API error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
