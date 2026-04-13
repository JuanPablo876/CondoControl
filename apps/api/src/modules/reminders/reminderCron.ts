import cron from "node-cron";
import { reminderService } from "./reminderService";

export function startReminderCron() {
  // Todos los dias a las 09:00. Recomendado mover a config por organizacion.
  cron.schedule("0 9 * * *", async () => {
    try {
      const summary = await reminderService.runDueCheck();
      console.log("[reminders] cron summary", summary);
    } catch (error) {
      console.error("[reminders] cron error", error);
    }
  });
}
