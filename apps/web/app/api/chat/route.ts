import { NextRequest, NextResponse } from "next/server";

// Types for context data
type UnitContext = {
  id: string;
  name: string;
  type: string;
  price: number;
  location: string;
  status: string;
  tenant: string | null;
  details: Record<string, unknown>;
};

type TenantContext = {
  id: string;
  name: string;
  email: string;
  phone: string;
  unit: string | null;
  status: string;
  language: string;
  contractMonths: number | null;
  contractStartDate: string | null;
  contractEndDate: string | null;
  monthsRemaining: number | null;
};

type PaymentContext = {
  total: number;
  pending: number;
  overdue: number;
  thisMonth: number;
};

type PropertyContext = {
  units: UnitContext[];
  tenants: TenantContext[];
  payments: PaymentContext;
  summary: {
    totalUnits: number;
    occupiedUnits: number;
    vacantUnits: number;
    maintenanceUnits: number;
    totalTenants: number;
    tenantsInGoodStanding: number;
    tenantsPending: number;
    tenantsOverdue: number;
  };
};

type Message = {
  role: "system" | "user" | "assistant";
  content: string;
};

function buildSystemPrompt(context: PropertyContext): string {
  const today = new Date().toLocaleDateString("es-MX", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  return `Eres el asistente de gestión de propiedades para el administrador (landlord) de CondoControl. Tu rol es ayudar al administrador a gestionar sus propiedades, inquilinos y pagos.

FECHA ACTUAL: ${today}

## TUS CAPACIDADES
- Responder preguntas sobre propiedades, inquilinos y pagos
- Ayudar a identificar problemas (pagos vencidos, contratos por vencer, unidades vacantes)
- Dar recomendaciones de gestión
- Resumir la situación actual del portafolio

## DATOS DEL PORTAFOLIO

### RESUMEN
- Total de propiedades: ${context.summary.totalUnits}
- Ocupadas: ${context.summary.occupiedUnits}
- Vacantes: ${context.summary.vacantUnits}
- En mantenimiento: ${context.summary.maintenanceUnits}
- Total de inquilinos: ${context.summary.totalTenants}
- Al día: ${context.summary.tenantsInGoodStanding}
- Con pago pendiente: ${context.summary.tenantsPending}
- En mora: ${context.summary.tenantsOverdue}

### PROPIEDADES
${context.units.map(u => `- ${u.name} (${u.type})
  Estado: ${u.status}
  Renta: $${u.price.toLocaleString()} MXN
  Ubicación: ${u.location}
  Inquilino: ${u.tenant || "Sin inquilino"}
  ${Object.entries(u.details).map(([k,v]) => `${k}: ${v}`).join(", ")}`).join("\n\n")}

### INQUILINOS
${context.tenants.map(t => `- ${t.name}
  Email: ${t.email} | Teléfono: ${t.phone}
  Unidad: ${t.unit || "Sin asignar"}
  Estado de pago: ${t.status}
  Idioma preferido: ${t.language}
  ${t.contractMonths ? `Contrato: ${t.contractMonths} meses desde ${t.contractStartDate}` : "Sin contrato registrado"}
  ${t.contractEndDate ? `Vencimiento: ${t.contractEndDate}` : ""}
  ${t.monthsRemaining !== null ? `Meses restantes: ${t.monthsRemaining}` : ""}`).join("\n\n")}

### PAGOS
- Ingresos totales: $${context.payments.total.toLocaleString()} MXN
- Pendientes: $${context.payments.pending.toLocaleString()} MXN
- Vencidos: $${context.payments.overdue.toLocaleString()} MXN
- Esperado este mes: $${context.payments.thisMonth.toLocaleString()} MXN

## REGLAS
1. Responde siempre en español
2. Sé conciso pero informativo
3. Cuando menciones montos, incluye el formato con comas y "MXN"
4. Si te preguntan algo que no está en los datos, dilo claramente
5. Puedes sugerir acciones como "te recomiendo contactar a..." o "considera revisar..."
6. Mantén un tono profesional pero amigable
7. Si detectas problemas urgentes (mora, contratos por vencer en menos de 30 días), menciónalos proactivamente`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, context } = body as {
      messages: Message[];
      context: PropertyContext;
    };

    const apiKey = process.env.OPENROUTER_API_KEY;
    const model = process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini";

    if (!apiKey) {
      // Demo mode: return a static response
      return NextResponse.json({
        message: {
          role: "assistant",
          content: getDemoResponse(messages[messages.length - 1]?.content || "", context)
        }
      });
    }

    const systemPrompt = buildSystemPrompt(context);

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "https://condocontrol.app",
        "X-Title": "CondoControl Assistant"
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.map(m => ({ role: m.role, content: m.content }))
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("OpenRouter error:", error);
      return NextResponse.json(
        { error: "Error al comunicarse con el asistente" },
        { status: 500 }
      );
    }

    const data = await response.json();
    const assistantMessage = data.choices?.[0]?.message;

    if (!assistantMessage) {
      return NextResponse.json(
        { error: "Respuesta vacía del asistente" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: {
        role: "assistant",
        content: assistantMessage.content
      }
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// Demo responses when no API key is configured
function getDemoResponse(userMessage: string, context: PropertyContext): string {
  const msg = userMessage.toLowerCase();

  if (msg.includes("resumen") || msg.includes("cómo va") || msg.includes("como va") || msg.includes("status")) {
    return `📊 **Resumen de tu portafolio**

**Propiedades:** ${context.summary.totalUnits} en total
- ✅ ${context.summary.occupiedUnits} ocupadas
- 🏠 ${context.summary.vacantUnits} vacantes
- 🔧 ${context.summary.maintenanceUnits} en mantenimiento

**Inquilinos:** ${context.summary.totalTenants} registrados
- ✅ ${context.summary.tenantsInGoodStanding} al día
- ⏳ ${context.summary.tenantsPending} con pago pendiente
- ⚠️ ${context.summary.tenantsOverdue} en mora

**Ingresos esperados este mes:** $${context.payments.thisMonth.toLocaleString()} MXN

${context.summary.tenantsOverdue > 0 ? `\n⚠️ **Acción recomendada:** Tienes ${context.summary.tenantsOverdue} inquilino(s) en mora. Te sugiero contactarlos para resolver la situación.` : ""}`;
  }

  if (msg.includes("mora") || msg.includes("vencido") || msg.includes("deuda")) {
    const overdueTenants = context.tenants.filter(t => t.status === "Mora");
    if (overdueTenants.length === 0) {
      return "🎉 ¡Excelentes noticias! No tienes ningún inquilino en mora actualmente. Todos los pagos están al día o pendientes dentro del plazo.";
    }
    return `⚠️ **Inquilinos en mora:**\n\n${overdueTenants.map(t => 
      `- **${t.name}** (${t.unit || "Sin unidad"})\n  📧 ${t.email} | 📱 ${t.phone}`
    ).join("\n\n")}\n\n**Recomendación:** Contacta a estos inquilinos lo antes posible para establecer un plan de pago.`;
  }

  if (msg.includes("vacante") || msg.includes("disponible") || msg.includes("vacías")) {
    const vacantUnits = context.units.filter(u => u.status === "Vacante");
    if (vacantUnits.length === 0) {
      return "🏠 Todas tus propiedades están ocupadas o en mantenimiento. ¡Felicidades por la ocupación completa!";
    }
    return `🏠 **Propiedades vacantes:**\n\n${vacantUnits.map(u => 
      `- **${u.name}**\n  Tipo: ${u.type}\n  Renta: $${u.price.toLocaleString()} MXN\n  Ubicación: ${u.location}`
    ).join("\n\n")}\n\n**Tip:** Considera publicar estas propiedades en plataformas de renta o revisar el precio si llevan tiempo vacantes.`;
  }

  if (msg.includes("contrato") || msg.includes("vencer") || msg.includes("renovar")) {
    const soonToExpire = context.tenants.filter(t => 
      t.monthsRemaining !== null && t.monthsRemaining <= 2 && t.monthsRemaining > 0
    );
    if (soonToExpire.length === 0) {
      return "📋 No hay contratos que venzan en los próximos 2 meses. Todos tus contratos están vigentes.";
    }
    return `📋 **Contratos próximos a vencer:**\n\n${soonToExpire.map(t => 
      `- **${t.name}** (${t.unit})\n  Vence: ${t.contractEndDate}\n  Meses restantes: ${t.monthsRemaining}`
    ).join("\n\n")}\n\n**Acción sugerida:** Contacta a estos inquilinos para negociar la renovación del contrato.`;
  }

  if (msg.includes("hola") || msg.includes("buenos") || msg.includes("buenas")) {
    return `¡Hola! 👋 Soy tu asistente de CondoControl. Estoy aquí para ayudarte a gestionar tus ${context.summary.totalUnits} propiedades y ${context.summary.totalTenants} inquilinos.

Puedo ayudarte con:
- **Resumen del portafolio** - "¿Cómo va todo?"
- **Inquilinos en mora** - "¿Quién tiene pagos vencidos?"
- **Propiedades vacantes** - "¿Qué propiedades tengo disponibles?"
- **Contratos** - "¿Hay contratos por vencer?"

¿En qué te puedo ayudar hoy?`;
  }

  // Default response
  return `Entiendo tu consulta sobre "${userMessage}". 

Actualmente manejo información sobre:
- 📊 ${context.summary.totalUnits} propiedades
- 👥 ${context.summary.totalTenants} inquilinos
- 💰 Pagos y cobros

¿Podrías ser más específico? Por ejemplo:
- "Dame un resumen del portafolio"
- "¿Quién tiene pagos pendientes?"
- "¿Qué propiedades tengo vacantes?"`;
}
