import { Router } from "express";
import { reminderService } from "./reminderService";

export const remindersRouter = Router();

remindersRouter.post("/run-due-check", async (_req, res) => {
  const summary = await reminderService.runDueCheck();
  res.json(summary);
});
