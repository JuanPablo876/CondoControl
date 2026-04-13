import { buildServer } from "./server";
import { env } from "./modules/config/env";
import { startReminderCron } from "./modules/reminders/reminderCron";

async function bootstrap() {
  const app = buildServer();
  app.listen(env.API_PORT, () => {
    console.log(`[api] Running on port ${env.API_PORT}`);
  });

  startReminderCron();
}

bootstrap().catch((error) => {
  console.error("Error starting API", error);
  process.exit(1);
});
