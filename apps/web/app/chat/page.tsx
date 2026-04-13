"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Send, 
  Bot, 
  User, 
  Sparkles,
  Building2,
  Users,
  CreditCard,
  AlertTriangle,
  TrendingUp,
  Calendar,
  Loader2
} from "lucide-react";
import { BackofficeShell } from "../../components/BackofficeShell";
import { useData, getContractEndDate, getContractMonthsRemaining } from "../../context/DataContext";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

const quickActions = [
  { label: "Resumen del portafolio", icon: TrendingUp, prompt: "Dame un resumen de cómo va mi portafolio" },
  { label: "Pagos vencidos", icon: AlertTriangle, prompt: "¿Qué inquilinos tienen pagos vencidos?" },
  { label: "Propiedades vacantes", icon: Building2, prompt: "¿Qué propiedades tengo vacantes?" },
  { label: "Contratos por vencer", icon: Calendar, prompt: "¿Hay contratos próximos a vencer?" },
];

export default function ChatPage() {
  const { units, tenants, getTenantName, getUnitName } = useData();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Build context for the AI
  const buildContext = () => {
    const unitContext = units.map(u => ({
      id: u.id,
      name: u.name,
      type: u.unitType,
      price: u.price,
      location: u.location,
      status: u.status,
      tenant: u.tenantId ? getTenantName(u.tenantId) : null,
      details: {
        ...(u.tower && { torre: u.tower }),
        ...(u.floor && { piso: u.floor }),
        ...(u.bedrooms && { recámaras: u.bedrooms }),
        ...(u.bathrooms && { baños: u.bathrooms }),
        ...(u.areaSqm && { área: `${u.areaSqm}m²` }),
        ...(u.parkingSpots && { estacionamientos: u.parkingSpots }),
      }
    }));

    const tenantContext = tenants.map(t => {
      const endDate = getContractEndDate(t);
      const monthsRemaining = getContractMonthsRemaining(t);
      return {
        id: t.id,
        name: t.name,
        email: t.email,
        phone: t.phone,
        unit: t.unitId ? getUnitName(t.unitId) : null,
        status: t.status,
        language: t.language === "es" ? "Español" : t.language === "en" ? "Inglés" : "Portugués",
        contractMonths: t.contractMonths,
        contractStartDate: t.contractStartDate,
        contractEndDate: endDate ? endDate.toLocaleDateString("es-MX") : null,
        monthsRemaining
      };
    });

    const occupiedUnits = units.filter(u => u.status === "Ocupada").length;
    const vacantUnits = units.filter(u => u.status === "Vacante").length;
    const maintenanceUnits = units.filter(u => u.status === "Mantenimiento").length;
    const totalRent = units.filter(u => u.status === "Ocupada").reduce((sum, u) => sum + u.price, 0);
    const pendingAmount = tenants.filter(t => t.status === "Pendiente").reduce((sum, t) => {
      const unit = units.find(u => u.tenantId === t.id);
      return sum + (unit?.price || 0);
    }, 0);
    const overdueAmount = tenants.filter(t => t.status === "Mora").reduce((sum, t) => {
      const unit = units.find(u => u.tenantId === t.id);
      return sum + (unit?.price || 0);
    }, 0);

    return {
      units: unitContext,
      tenants: tenantContext,
      payments: {
        total: totalRent,
        pending: pendingAmount,
        overdue: overdueAmount,
        thisMonth: totalRent
      },
      summary: {
        totalUnits: units.length,
        occupiedUnits,
        vacantUnits,
        maintenanceUnits,
        totalTenants: tenants.length,
        tenantsInGoodStanding: tenants.filter(t => t.status === "Al dia").length,
        tenantsPending: tenants.filter(t => t.status === "Pendiente").length,
        tenantsOverdue: tenants.filter(t => t.status === "Mora").length
      }
    };
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: "user",
      content: content.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const context = buildContext();
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          })),
          context
        })
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const assistantMessage: Message = {
        id: `msg_${Date.now()}_assistant`,
        role: "assistant",
        content: data.message.content,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: Message = {
        id: `msg_${Date.now()}_error`,
        role: "assistant",
        content: "Lo siento, hubo un error al procesar tu mensaje. Por favor intenta de nuevo.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleQuickAction = (prompt: string) => {
    sendMessage(prompt);
  };

  // Format message content with markdown-like styling
  const formatContent = (content: string) => {
    // Handle bold text **text**
    let formatted = content.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    // Handle line breaks
    formatted = formatted.replace(/\n/g, '<br />');
    return formatted;
  };

  return (
    <BackofficeShell title="Asistente IA" description="Habla con tu asistente inteligente para gestionar tus propiedades.">
      <div className="chat-container">
        {/* Chat Header Stats */}
        <div className="chat-stats">
          <div className="chat-stat">
            <Building2 size={16} />
            <span>{units.length} propiedades</span>
          </div>
          <div className="chat-stat">
            <Users size={16} />
            <span>{tenants.length} inquilinos</span>
          </div>
          <div className="chat-stat">
            <CreditCard size={16} />
            <span>${units.filter(u => u.status === "Ocupada").reduce((s, u) => s + u.price, 0).toLocaleString()} MXN/mes</span>
          </div>
        </div>

        {/* Messages Area */}
        <div className="chat-messages">
          {messages.length === 0 ? (
            <div className="chat-empty">
              <div className="chat-empty-icon">
                <Sparkles size={48} />
              </div>
              <h3>¡Hola! Soy tu asistente de CondoControl</h3>
              <p>Puedo ayudarte a gestionar tus propiedades, revisar pagos, identificar problemas y más. Pregúntame lo que necesites.</p>
              
              <div className="chat-quick-actions">
                {quickActions.map((action) => (
                  <button
                    key={action.label}
                    className="chat-quick-btn"
                    onClick={() => handleQuickAction(action.prompt)}
                    type="button"
                  >
                    <action.icon size={16} />
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`chat-message ${msg.role === "user" ? "chat-message--user" : "chat-message--assistant"}`}
                >
                  <div className="chat-message-avatar">
                    {msg.role === "user" ? <User size={18} /> : <Bot size={18} />}
                  </div>
                  <div className="chat-message-content">
                    <div 
                      className="chat-message-text"
                      dangerouslySetInnerHTML={{ __html: formatContent(msg.content) }}
                    />
                    <span className="chat-message-time">
                      {msg.timestamp.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="chat-message chat-message--assistant">
                  <div className="chat-message-avatar">
                    <Bot size={18} />
                  </div>
                  <div className="chat-message-content">
                    <div className="chat-typing">
                      <Loader2 size={16} className="chat-typing-spinner" />
                      <span>Pensando...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Quick Actions (when there are messages) */}
        {messages.length > 0 && (
          <div className="chat-quick-bar">
            {quickActions.map((action) => (
              <button
                key={action.label}
                className="chat-quick-chip"
                onClick={() => handleQuickAction(action.prompt)}
                type="button"
                disabled={isLoading}
              >
                <action.icon size={14} />
                {action.label}
              </button>
            ))}
          </div>
        )}

        {/* Input Area */}
        <form className="chat-input-form" onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            className="chat-input"
            placeholder="Escribe tu mensaje..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />
          <button 
            type="submit" 
            className="chat-send-btn"
            disabled={!input.trim() || isLoading}
          >
            {isLoading ? <Loader2 size={18} className="chat-typing-spinner" /> : <Send size={18} />}
          </button>
        </form>
      </div>
    </BackofficeShell>
  );
}
