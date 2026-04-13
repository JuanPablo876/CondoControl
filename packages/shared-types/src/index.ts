export type ReminderChannel = "email" | "whatsapp" | "call";

export interface Tenant {
  id: string;
  organizationId: string;
  fullName: string;
  email?: string;
  phoneE164?: string;
  whatsappE164?: string;
  preferredLanguage: "es" | "en";
}

export interface PropertyUnit {
  id: string;
  organizationId: string;
  propertyName: string;
  unitLabel: string;
}

export interface Lease {
  id: string;
  organizationId: string;
  tenantId: string;
  propertyUnitId: string;
  monthlyAmount: number;
  currency: string;
  dueDayOfMonth: number;
  graceDays: number;
}

export interface Payment {
  id: string;
  organizationId: string;
  leaseId: string;
  period: string;
  amount: number;
  currency: string;
  status: "pending" | "settled" | "late";
  externalPaymentId?: string;
  settledAt?: string;
}

export interface ReminderContext {
  organizationId: string;
  tenant: Tenant;
  lease: Lease;
  payment: Payment;
  channels: ReminderChannel[];
}
