import { ReminderContext } from "@condocontrol/shared-types";

export const emailProvider = {
  async sendReminder(context: ReminderContext, message: string) {
    if (!context.tenant.email) {
      return { sent: false, reason: "tenant-email-missing" };
    }

    // Punto de extension para SendGrid u otro proveedor de correo.
    console.log(`[email] -> ${context.tenant.email}: ${message}`);
    return { sent: true };
  }
};
