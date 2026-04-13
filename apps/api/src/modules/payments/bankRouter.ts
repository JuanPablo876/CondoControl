import { Router } from "express";
import { z } from "zod";
import { tenantRepository } from "../tenants/tenantRepository";

const paymentSettledSchema = z.object({
  externalPaymentId: z.string().min(2),
  settledAt: z.string().datetime()
});

const bindExternalPaymentSchema = z.object({
  externalPaymentId: z.string().min(2)
});

export const bankRouter = Router();

bankRouter.post("/:paymentId/bind-external", async (req, res) => {
  const parsed = bindExternalPaymentSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Payload invalido" });
  }

  const payment = await tenantRepository.bindExternalPaymentId(
    req.params.paymentId,
    parsed.data.externalPaymentId
  );

  if (!payment) {
    return res.status(404).json({ error: "Pago no encontrado" });
  }

  return res.status(200).json({ ok: true, payment });
});

bankRouter.post("/webhooks/payment-settled", async (req, res) => {
  const parsed = paymentSettledSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Payload de banco invalido" });
  }

  const payment = await tenantRepository.markPaymentSettledByExternalId(
    parsed.data.externalPaymentId,
    parsed.data.settledAt
  );

  if (!payment) {
    return res.status(404).json({ error: "Pago no encontrado" });
  }

  return res.status(200).json({ ok: true, payment });
});
