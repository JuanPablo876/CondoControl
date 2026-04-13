import { ReminderChannel, ReminderContext } from "@condocontrol/shared-types";
import { tenantRepository } from "../tenants/tenantRepository";
import { composeReminderMessage } from "../messaging/messageComposer";
import { emailProvider } from "../messaging/providers/emailProvider";
import { whatsappProvider } from "../messaging/providers/whatsappProvider";
import { callProvider } from "../messaging/providers/callProvider";

const channelSequence: ReminderChannel[] = ["email", "whatsapp", "call"];

export const reminderService = {
  async runDueCheck(now = new Date()) {
    const pending = await tenantRepository.listPendingPaymentsByDate(now);

    const results = [];
    for (const item of pending) {
      const context: ReminderContext = {
        organizationId: item.payment.organizationId,
        tenant: item.tenant,
        lease: item.lease,
        payment: item.payment,
        channels: channelSequence
      };

      const message = await composeReminderMessage(context);
      const sentChannels: string[] = [];

      for (const channel of channelSequence) {
        if (channel === "email") {
          const result = await emailProvider.sendReminder(context, message);
          if (result.sent) sentChannels.push("email");
        }

        if (channel === "whatsapp") {
          const result = await whatsappProvider.sendReminder(context, message);
          if (result.sent) sentChannels.push("whatsapp");
        }

        if (channel === "call" && item.payment.status === "late") {
          const result = await callProvider.placeReminderCall(context, message);
          if (result.sent) sentChannels.push("call");
        }
      }

      results.push({
        tenantId: item.tenant.id,
        paymentId: item.payment.id,
        sentChannels
      });
    }

    return {
      checkedAt: now.toISOString(),
      totalPending: pending.length,
      reminders: results
    };
  }
};
