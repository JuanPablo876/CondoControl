import { ReminderContext } from "@condocontrol/shared-types";
import { env } from "../../config/env";

export const callProvider = {
  async placeReminderCall(context: ReminderContext, message: string) {
    if (!context.tenant.phoneE164) {
      return { sent: false, reason: "tenant-phone-missing" };
    }

    const voiceProvider = env.ELEVENLABS_API_KEY ? "elevenlabs" : "default-tts";
    console.log(
      `[call:${voiceProvider}] -> ${context.tenant.phoneE164}: ${message}`
    );

    return { sent: true, voiceProvider };
  }
};
