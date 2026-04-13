import { Lease, Payment, Tenant } from "@condocontrol/shared-types";
import { TenantRepository } from "../tenantRepository.types";

const tenants: Tenant[] = [
  {
    id: "tenant_1",
    organizationId: "org_1",
    fullName: "Carlos Perez",
    email: "carlos@example.com",
    phoneE164: "+15550000001",
    whatsappE164: "+15550000001",
    preferredLanguage: "es"
  }
];

const leases: Lease[] = [
  {
    id: "lease_1",
    organizationId: "org_1",
    tenantId: "tenant_1",
    propertyUnitId: "unit_1",
    monthlyAmount: 950,
    currency: "USD",
    dueDayOfMonth: 5,
    graceDays: 2
  }
];

const payments: Payment[] = [
  {
    id: "pay_1",
    organizationId: "org_1",
    leaseId: "lease_1",
    period: "2026-04",
    amount: 950,
    currency: "USD",
    status: "pending"
  }
];

export class MemoryTenantRepository implements TenantRepository {
  async listPendingPaymentsByDate(_today: Date) {
    return payments
      .filter((payment) => payment.status !== "settled")
      .map((payment) => {
        const lease = leases.find((item) => item.id === payment.leaseId)!;
        const tenant = tenants.find((item) => item.id === lease.tenantId)!;
        return { payment, lease, tenant };
      });
  }

  async markPaymentSettledByExternalId(externalPaymentId: string, settledAt: string) {
    const payment = payments.find((item) => item.externalPaymentId === externalPaymentId);
    if (!payment) {
      return null;
    }

    payment.status = "settled";
    payment.settledAt = settledAt;
    return payment;
  }

  async bindExternalPaymentId(paymentId: string, externalPaymentId: string) {
    const payment = payments.find((item) => item.id === paymentId);
    if (!payment) {
      return null;
    }

    payment.externalPaymentId = externalPaymentId;
    return payment;
  }
}
