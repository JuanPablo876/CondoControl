import express from "express";
import { remindersRouter } from "./modules/reminders/remindersRouter";
import { bankRouter } from "./modules/payments/bankRouter";
import { voiceRouter } from "./modules/voice/voiceRouter";

export function buildServer() {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true })); // For Twilio webhook form data

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", servicio: "condocontrol-api" });
  });

  app.use("/api/reminders", remindersRouter);
  app.use("/api/payments", bankRouter);
  app.use("/api/voice", voiceRouter);

  return app;
}
