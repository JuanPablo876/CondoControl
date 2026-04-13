import { ReminderContext } from "@condocontrol/shared-types";
import { env } from "../../config/env";

export const whatsappProvider = {
  async sendReminder(context: ReminderContext, message: string) {
    if (!context.tenant.whatsappE164) {
      return { sent: false, reason: "tenant-whatsapp-missing" };
    }

    // Estrategia recomendada: usar Twilio para produccion, Baileys para respaldo/operacion interna.
    const mode = env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN ? "twilio" : "baileys";

    console.log(`[whatsapp:${mode}] -> ${context.tenant.whatsappE164}: ${message}`);
    return { sent: true, mode };
  }
};
