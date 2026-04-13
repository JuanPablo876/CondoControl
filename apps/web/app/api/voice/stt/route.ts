import { NextRequest, NextResponse } from "next/server";

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get("audio") as File | null;
    const languageCode = formData.get("language") as string || "es";

    if (!audioFile) {
      return NextResponse.json(
        { error: "Archivo de audio requerido" },
        { status: 400 }
      );
    }

    if (!ELEVENLABS_API_KEY) {
      // Demo mode: return mock transcription
      return NextResponse.json({
        text: "[Demo] Transcripción de prueba. Configura ELEVENLABS_API_KEY en .env para STT real.",
        demo: true,
        language: languageCode,
      });
    }

    // Prepare form data for ElevenLabs STT API
    const elevenLabsFormData = new FormData();
    elevenLabsFormData.append("file", audioFile);
    elevenLabsFormData.append("model_id", "scribe_v1"); // ElevenLabs STT model

    const response = await fetch(
      "https://api.elevenlabs.io/v1/speech-to-text",
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
        },
        body: elevenLabsFormData,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("ElevenLabs STT error:", errorText);
      
      // Fallback to alternative interpretation
      return NextResponse.json(
        { error: "Error transcribiendo audio", details: errorText },
        { status: response.status }
      );
    }

    const result = await response.json();

    return NextResponse.json({
      text: result.text || result.transcription || "",
      language: result.language_code || languageCode,
      confidence: result.confidence,
      words: result.words, // Word-level timestamps if available
    });
  } catch (error) {
    console.error("STT API error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
