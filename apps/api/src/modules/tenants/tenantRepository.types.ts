import { Lease, Payment, Tenant } from "@condocontrol/shared-types";

export interface PendingPaymentRecord {
  payment: Payment;
  lease: Lease;
  tenant: Tenant;
}

export interface TenantRepository {
  listPendingPaymentsByDate(today: Date): Promise<PendingPaymentRecord[]>;
  markPaymentSettledByExternalId(externalPaymentId: string, settledAt: string): Promise<Payment | null>;
  bindExternalPaymentId(paymentId: string, externalPaymentId: string): Promise<Payment | null>;
}
