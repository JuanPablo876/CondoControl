"use client";

import { useState, useRef } from "react";
import { Save, MessageSquare, User, Bot as BotIcon, ChevronDown, ChevronUp, Globe, Mic, Volume2, ExternalLink, Play, Square, Loader2, MicOff } from "lucide-react";
import { BackofficeShell } from "../../components/BackofficeShell";
import { LANGUAGES, BotLanguage } from "../../context/DataContext";

// Best ElevenLabs voices for Spanish and English
const ELEVENLABS_VOICES = [
  // Spanish voices
  { id: "pFZP5JQG7iQjIQuC4Bku", name: "Mateo", lang: "es", description: "Español masculino, conversacional" },
  { id: "ThT5KcBeYPX3keUQqHPh", name: "Valentina", lang: "es", description: "Español femenino, cálido" },
  { id: "onwK4e9ZLuTAKqWW03F9", name: "Diego", lang: "es", description: "Español masculino, profesional" },
  { id: "XB0fDUnXU5powFXDhCwa", name: "Sofía", lang: "es", description: "Español femenino, amigable" },
  // English voices
  { id: "21m00Tcm4TlvDq8ikWAM", name: "Rachel", lang: "en", description: "English female, calm" },
  { id: "TxGEqnHWrfWFTfGW9XjX", name: "Josh", lang: "en", description: "English male, conversational" },
  { id: "pNInz6obpgDQGcFmaJgB", name: "Adam", lang: "en", description: "English male, professional" },
  { id: "EXAVITQu4vr4xnSDxMaL", name: "Bella", lang: "en", description: "English female, warm" },
  // Portuguese voices
  { id: "zcAOhNBS3c14rBihAFp1", name: "Lucas", lang: "pt", description: "Português masculino" },
  { id: "pqHfZKP75CvOlQylNhV4", name: "Isabella", lang: "pt", description: "Português femenino" },
];

type Message = {
  from: "bot" | "user";
  text: string;
  time: string;
};

type Conversation = {
  id: string;
  tenant: string;
  language: BotLanguage;
  channel: "WhatsApp" | "Email" | "Voz";
  date: string;
  preview: string;
  messages: Message[];
};

const demoConversations: Conversation[] = [
  {
    id: "c1",
    tenant: "Carlos Perez",
    language: "es",
    channel: "WhatsApp",
    date: "12 Abr 2026, 09:15",
    preview: "Consulta sobre fecha de pago",
    messages: [
      { from: "user", text: "Hola, quiero saber cuando es mi fecha de pago este mes", time: "09:15" },
      { from: "bot", text: "Hola Carlos, tu fecha de pago es el dia 15 de cada mes. Tu saldo pendiente es de $4,500 MXN.", time: "09:15" },
      { from: "user", text: "Perfecto, gracias", time: "09:16" },
      { from: "bot", text: "Con gusto. Si necesitas algo mas, estoy aqui para ayudarte.", time: "09:16" },
    ],
  },
  {
    id: "c2",
    tenant: "Maria Gutierrez",
    language: "es",
    channel: "WhatsApp",
    date: "11 Abr 2026, 14:32",
    preview: "Reporte de mantenimiento",
    messages: [
      { from: "user", text: "Buenas tardes, hay una fuga de agua en el bano de mi departamento C-205", time: "14:32" },
      { from: "bot", text: "Hola Maria, lamento escuchar eso. He registrado tu reporte de mantenimiento #MT-047. El equipo de mantenimiento te contactara en las proximas 2 horas.", time: "14:33" },
      { from: "user", text: "Okay muchas gracias, es urgente porque esta goteando bastante", time: "14:33" },
      { from: "bot", text: "Entendido, he marcado el reporte como urgente. Tambien notifique al administrador. Te mantendremos informada.", time: "14:34" },
    ],
  },
  {
    id: "c3",
    tenant: "Jorge Medina",
    language: "en",
    channel: "Email",
    date: "10 Abr 2026, 11:00",
    preview: "Automatic payment reminder",
    messages: [
      { from: "bot", text: "Hi Jorge, this is a friendly reminder that your rent payment of $6,200 MXN is due on April 15. You can pay via bank transfer or through the platform.", time: "11:00" },
      { from: "user", text: "I already made the transfer yesterday, sending the receipt", time: "16:45" },
      { from: "bot", text: "Thank you Jorge, we received your receipt. Your payment will be verified within 24 hours and your status will be updated automatically.", time: "16:46" },
    ],
  },
  {
    id: "c4",
    tenant: "Carlos Perez",
    language: "es",
    channel: "Voz",
    date: "9 Abr 2026, 20:10",
    preview: "Llamada — consulta sobre areas comunes",
    messages: [
      { from: "user", text: "[STT] Hola, puedo reservar el salon de eventos para el sabado?", time: "20:10" },
      { from: "bot", text: "[TTS] Hola Carlos, el salon de eventos esta disponible el sabado 12 de abril. El horario disponible es de 10:00 a 22:00. ¿Te gustaria hacer la reservacion?", time: "20:10" },
      { from: "user", text: "[STT] Si, de 18:00 a 22:00 por favor", time: "20:11" },
      { from: "bot", text: "[TTS] Listo, he reservado el salon de eventos para el sabado 12 de abril de 18:00 a 22:00 a nombre de Carlos Perez (A-301). Recuerda revisar el reglamento de uso. ¡Que disfrutes tu evento!", time: "20:12" },
    ],
  },
];

function channelStyle(channel: string) {
  if (channel === "WhatsApp") return "status-pill status-pill--success";
  if (channel === "Voz") return "status-pill status-pill--brand";
  return "status-pill status-pill--warning";
}

export default function BotPage() {
  const [greeting, setGreeting] = useState(
    "Hola, soy el asistente de CondoControl. ¿En que puedo ayudarte?"
  );
  const [defaultLanguage, setDefaultLanguage] = useState<BotLanguage>("es");
  const [autoReply, setAutoReply] = useState(true);
  const [paymentReminders, setPaymentReminders] = useState(true);
  const [maintenanceAlerts, setMaintenanceAlerts] = useState(true);
  const [sttEnabled, setSttEnabled] = useState(true);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [ttsProvider, setTtsProvider] = useState("elevenlabs");
  const [selectedVoice, setSelectedVoice] = useState("pFZP5JQG7iQjIQuC4Bku"); // Mateo (Spanish)
  const [tone, setTone] = useState("formal");
  const [savedAt, setSavedAt] = useState("");
  const [expandedConvo, setExpandedConvo] = useState<string | null>(null);
  
  // Voice test states
  const [isPlayingTTS, setIsPlayingTTS] = useState(false);
  const [ttsError, setTtsError] = useState("");
  const [testText, setTestText] = useState("Hola, soy el asistente de CondoControl. ¿En qué puedo ayudarte hoy?");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // STT states
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [sttError, setSttError] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const onSave = () => {
    setSavedAt(new Date().toLocaleTimeString("es-MX"));
  };

  const toggleConvo = (id: string) => {
    setExpandedConvo((prev) => (prev === id ? null : id));
  };

  // TTS Test function
  const testTTS = async () => {
    if (isPlayingTTS) {
      // Stop playing
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setIsPlayingTTS(false);
      return;
    }

    setIsPlayingTTS(true);
    setTtsError("");

    try {
      const response = await fetch("/api/voice/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: testText,
          voiceId: selectedVoice,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error generando audio");
      }

      // Check if it's demo mode (JSON response) or actual audio
      const contentType = response.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        const data = await response.json();
        if (data.demo) {
          setTtsError(data.message);
          setIsPlayingTTS(false);
          return;
        }
      }

      // Play audio
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        setIsPlayingTTS(false);
        URL.revokeObjectURL(audioUrl);
      };

      audio.onerror = () => {
        setTtsError("Error reproduciendo audio");
        setIsPlayingTTS(false);
      };

      await audio.play();
    } catch (error) {
      console.error("TTS test error:", error);
      setTtsError(error instanceof Error ? error.message : "Error de conexión");
      setIsPlayingTTS(false);
    }
  };

  // STT Recording functions
  const startRecording = async () => {
    try {
      setSttError("");
      setTranscription("");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        stream.getTracks().forEach((track) => track.stop());
        
        // Send to STT API
        const formData = new FormData();
        formData.append("audio", audioBlob, "recording.webm");
        formData.append("language", defaultLanguage);

        try {
          const response = await fetch("/api/voice/stt", {
            method: "POST",
            body: formData,
          });

          const result = await response.json();
          if (result.error && !result.demo) {
            setSttError(result.error);
          } else {
            setTranscription(result.text);
          }
        } catch (error) {
          setSttError("Error enviando audio");
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Recording error:", error);
      setSttError("No se pudo acceder al micrófono");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <BackofficeShell title="Bot" description="Configuracion del asistente automatizado de WhatsApp y correo.">
      <article className="card">
        <h2>Mensaje de bienvenida</h2>
        <div className="bot-welcome-grid">
          <label className="field">
            <span>Saludo inicial</span>
            <input
              type="text"
              value={greeting}
              onChange={(e) => setGreeting(e.target.value)}
            />
          </label>

          <label className="field">
            <span>Tono de respuesta</span>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="field-select"
            >
              <option value="formal">Formal</option>
              <option value="friendly">Amigable</option>
              <option value="brief">Breve</option>
            </select>
          </label>

          <div className="bot-language-section">
            <label className="field">
              <span><Globe size={13} style={{ verticalAlign: "middle", marginRight: 4 }} />Idioma por defecto</span>
              <select
                value={defaultLanguage}
                onChange={(e) => setDefaultLanguage(e.target.value as BotLanguage)}
                className="field-select"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.value} value={l.value}>{l.label}</option>
                ))}
              </select>
            </label>
            <p className="muted bot-language-hint">
              El bot usa este idioma por defecto. Si un inquilino tiene un idioma configurado en su perfil, el bot lo detecta automaticamente.
            </p>
          </div>
        </div>
      </article>

      <article className="card">
        <h2><Mic size={16} style={{ verticalAlign: "middle", marginRight: 6 }} />Voz — STT y TTS</h2>
        <p className="muted" style={{ marginBottom: 12 }}>
          Speech-to-Text (STT) transcribe mensajes de voz entrantes. Text-to-Speech (TTS) genera respuestas en audio.
        </p>
        <div className="settings-grid">
          <label className="toggle-row">
            <input
              type="checkbox"
              checked={sttEnabled}
              onChange={(e) => setSttEnabled(e.target.checked)}
            />
            <span><Mic size={14} style={{ verticalAlign: "middle", marginRight: 4 }} />Speech-to-Text (STT) — Transcribir mensajes de voz</span>
          </label>

          {/* STT Test Section */}
          {sttEnabled && (
            <div className="stt-test-section">
              <div className="stt-test-controls">
                <button
                  className={`voice-test-btn ${isRecording ? "voice-test-btn--recording" : ""}`}
                  onClick={isRecording ? stopRecording : startRecording}
                  type="button"
                >
                  {isRecording ? (
                    <>
                      <MicOff size={14} />
                      Detener grabación
                    </>
                  ) : (
                    <>
                      <Mic size={14} />
                      Probar STT (grabar)
                    </>
                  )}
                </button>
                {isRecording && <span className="recording-indicator">Grabando...</span>}
              </div>
              {transcription && (
                <div className="stt-result">
                  <span className="stt-label">Transcripción:</span>
                  <p className="stt-text">{transcription}</p>
                </div>
              )}
              {sttError && <p className="voice-error">{sttError}</p>}
            </div>
          )}

          <label className="toggle-row">
            <input
              type="checkbox"
              checked={ttsEnabled}
              onChange={(e) => setTtsEnabled(e.target.checked)}
            />
            <span><Volume2 size={14} style={{ verticalAlign: "middle", marginRight: 4 }} />Text-to-Speech (TTS) — Responder con audio</span>
          </label>

          {ttsEnabled && (
            <label className="field" style={{ marginTop: 4 }}>
              <span>Proveedor TTS</span>
              <select
                value={ttsProvider}
                onChange={(e) => setTtsProvider(e.target.value)}
                className="field-select"
              >
                <option value="elevenlabs">ElevenLabs (alta calidad)</option>
                <option value="google">Google Cloud TTS</option>
                <option value="browser">Web Speech API (navegador)</option>
              </select>
            </label>
          )}

          {ttsEnabled && ttsProvider === "elevenlabs" && (
            <div className="voice-selector-section">
              <label className="field" style={{ marginTop: 4 }}>
                <span><Volume2 size={13} style={{ verticalAlign: "middle", marginRight: 4 }} />Voz de ElevenLabs</span>
                <select
                  value={selectedVoice}
                  onChange={(e) => setSelectedVoice(e.target.value)}
                  className="field-select"
                >
                  <optgroup label="🇪🇸 Español">
                    {ELEVENLABS_VOICES.filter(v => v.lang === "es").map(v => (
                      <option key={v.id} value={v.id}>{v.name} — {v.description}</option>
                    ))}
                  </optgroup>
                  <optgroup label="🇺🇸 English">
                    {ELEVENLABS_VOICES.filter(v => v.lang === "en").map(v => (
                      <option key={v.id} value={v.id}>{v.name} — {v.description}</option>
                    ))}
                  </optgroup>
                  <optgroup label="🇧🇷 Português">
                    {ELEVENLABS_VOICES.filter(v => v.lang === "pt").map(v => (
                      <option key={v.id} value={v.id}>{v.name} — {v.description}</option>
                    ))}
                  </optgroup>
                </select>
              </label>
              
              {/* TTS Test Section */}
              <div className="voice-test-section">
                <label className="field">
                  <span>Probar voz (TTS)</span>
                  <textarea
                    value={testText}
                    onChange={(e) => setTestText(e.target.value)}
                    rows={2}
                    placeholder="Escribe el texto para probar la voz..."
                  />
                </label>
                <button 
                  className={`voice-test-btn ${isPlayingTTS ? "voice-test-btn--active" : ""}`}
                  onClick={testTTS}
                  type="button"
                >
                  {isPlayingTTS ? (
                    <>
                      <Square size={14} />
                      Detener
                    </>
                  ) : (
                    <>
                      <Play size={14} />
                      Reproducir
                    </>
                  )}
                </button>
                {ttsError && <p className="voice-error">{ttsError}</p>}
              </div>

              <a
                href="https://elevenlabs.io/voice-library"
                target="_blank"
                rel="noopener noreferrer"
                className="voice-library-link"
              >
                <ExternalLink size={14} />
                Explorar más voces en ElevenLabs
              </a>
            </div>
          )}
        </div>
      </article>

      <article className="card">
        <h2>Funciones automaticas</h2>
        <div className="settings-grid">
          <label className="toggle-row">
            <input
              type="checkbox"
              checked={autoReply}
              onChange={(e) => setAutoReply(e.target.checked)}
            />
            <span>Respuesta automatica a inquilinos</span>
          </label>

          <label className="toggle-row">
            <input
              type="checkbox"
              checked={paymentReminders}
              onChange={(e) => setPaymentReminders(e.target.checked)}
            />
            <span>Recordatorios de pago por WhatsApp</span>
          </label>

          <label className="toggle-row">
            <input
              type="checkbox"
              checked={maintenanceAlerts}
              onChange={(e) => setMaintenanceAlerts(e.target.checked)}
            />
            <span>Alertas de mantenimiento</span>
          </label>
        </div>

        <div className="settings-footer">
          <button className="primary-button" type="button" onClick={onSave}>
            <Save size={16} />
            Guardar configuracion
          </button>
          {savedAt ? <p className="muted">Guardado a las {savedAt}</p> : null}
        </div>
      </article>

      <article className="card">
        <div className="page-header-row">
          <h2>Conversaciones recientes</h2>
          <span className="muted">{demoConversations.length} conversaciones</span>
        </div>

        <div className="convo-list">
          {demoConversations.map((convo) => {
            const isExpanded = expandedConvo === convo.id;
            const langLabel = LANGUAGES.find((l) => l.value === convo.language)?.label ?? "Español";
            return (
              <div key={convo.id} className="convo-item">
                <button
                  className="convo-header"
                  type="button"
                  onClick={() => toggleConvo(convo.id)}
                >
                  <div className="convo-header-left">
                    {convo.channel === "Voz" ? <Mic size={16} /> : <MessageSquare size={16} />}
                    <div className="convo-meta">
                      <span className="convo-tenant">{convo.tenant}</span>
                      <span className="convo-preview">{convo.preview}</span>
                    </div>
                  </div>
                  <div className="convo-header-right">
                    <span className="convo-lang">{langLabel}</span>
                    <span className={channelStyle(convo.channel)}>
                      {convo.channel}
                    </span>
                    <span className="convo-date">{convo.date}</span>
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="convo-messages">
                    {convo.messages.map((msg, i) => (
                      <div key={i} className={`convo-msg convo-msg--${msg.from}`}>
                        <div className="convo-msg-icon">
                          {msg.from === "bot" ? <BotIcon size={14} /> : <User size={14} />}
                        </div>
                        <div className="convo-msg-body">
                          <p className="convo-msg-text">{msg.text}</p>
                          <span className="convo-msg-time">{msg.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </article>
    </BackofficeShell>
  );
}
