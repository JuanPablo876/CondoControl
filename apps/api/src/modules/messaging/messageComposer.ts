import axios from "axios";
import { ReminderContext } from "@condocontrol/shared-types";
import { env } from "../config/env";

export async function composeReminderMessage(context: ReminderContext): Promise<string> {
  const fallback = `Hola ${context.tenant.fullName}, tu renta de ${context.payment.amount} ${context.payment.currency} para ${context.payment.period} esta pendiente. Por favor confirma el pago.`;

  if (!env.OPENROUTER_API_KEY) {
    return fallback;
  }

  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: env.OPENROUTER_MODEL,
        messages: [
          {
            role: "system",
            content:
              "Eres un asistente de cobranza para condominios. Redacta mensajes breves, educados y en espanol neutro."
          },
          {
            role: "user",
            content: `Genera un recordatorio para ${context.tenant.fullName}. Monto ${context.payment.amount} ${context.payment.currency}, periodo ${context.payment.period}.`
          }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        },
        timeout: 12000
      }
    );

    return response.data?.choices?.[0]?.message?.content?.trim() || fallback;
  } catch (error) {
    console.error("OpenRouter composer failed", error);
    return fallback;
  }
}
