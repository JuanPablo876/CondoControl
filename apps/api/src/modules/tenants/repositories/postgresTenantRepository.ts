import { Pool } from "pg";
import { Lease, Payment, Tenant } from "@condocontrol/shared-types";
import { TenantRepository } from "../tenantRepository.types";

type JoinedRow = {
  payment_id: string;
  payment_organization_id: string;
  payment_lease_id: string;
  payment_period: string;
  payment_amount: number;
  payment_currency: string;
  payment_status: "pending" | "settled" | "late";
  payment_external_payment_id: string | null;
  payment_settled_at: string | null;
  lease_id: string;
  lease_organization_id: string;
  lease_tenant_id: string;
  lease_property_unit_id: string;
  lease_monthly_amount: number;
  lease_currency: string;
  lease_due_day_of_month: number;
  lease_grace_days: number;
  tenant_id: string;
  tenant_organization_id: string;
  tenant_full_name: string;
  tenant_email: string | null;
  tenant_phone_e164: string | null;
  tenant_whatsapp_e164: string | null;
  tenant_preferred_language: "es" | "en";
};

export class PostgresTenantRepository implements TenantRepository {
  private readonly pool: Pool;
  private bootstrapPromise: Promise<void>;

  constructor(connectionString: string) {
    this.pool = new Pool({ connectionString });
    this.bootstrapPromise = this.bootstrap();
  }

  private async bootstrap() {
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS tenants (
        id TEXT PRIMARY KEY,
        organization_id TEXT NOT NULL,
        full_name TEXT NOT NULL,
        email TEXT,
        phone_e164 TEXT,
        whatsapp_e164 TEXT,
        preferred_language TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS leases (
        id TEXT PRIMARY KEY,
        organization_id TEXT NOT NULL,
        tenant_id TEXT NOT NULL,
        property_unit_id TEXT NOT NULL,
        monthly_amount NUMERIC NOT NULL,
        currency TEXT NOT NULL,
        due_day_of_month INTEGER NOT NULL,
        grace_days INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS payments (
        id TEXT PRIMARY KEY,
        organization_id TEXT NOT NULL,
        lease_id TEXT NOT NULL,
        period TEXT NOT NULL,
        amount NUMERIC NOT NULL,
        currency TEXT NOT NULL,
        status TEXT NOT NULL,
        external_payment_id TEXT,
        settled_at TIMESTAMPTZ
      );
    `);

    await this.pool.query(
      `INSERT INTO tenants (id, organization_id, full_name, email, phone_e164, whatsapp_e164, preferred_language)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (id) DO NOTHING`,
      ["tenant_1", "org_1", "Carlos Perez", "carlos@example.com", "+15550000001", "+15550000001", "es"]
    );

    await this.pool.query(
      `INSERT INTO leases (id, organization_id, tenant_id, property_unit_id, monthly_amount, currency, due_day_of_month, grace_days)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (id) DO NOTHING`,
      ["lease_1", "org_1", "tenant_1", "unit_1", 950, "USD", 5, 2]
    );

    await this.pool.query(
      `INSERT INTO payments (id, organization_id, lease_id, period, amount, currency, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (id) DO NOTHING`,
      ["pay_1", "org_1", "lease_1", "2026-04", 950, "USD", "pending"]
    );
  }

  async listPendingPaymentsByDate(_today: Date) {
    await this.bootstrapPromise;

    const result = await this.pool.query<JoinedRow>(`
      SELECT
        p.id AS payment_id,
        p.organization_id AS payment_organization_id,
        p.lease_id AS payment_lease_id,
        p.period AS payment_period,
        p.amount::float AS payment_amount,
        p.currency AS payment_currency,
        p.status AS payment_status,
        p.external_payment_id AS payment_external_payment_id,
        p.settled_at::text AS payment_settled_at,
        l.id AS lease_id,
        l.organization_id AS lease_organization_id,
        l.tenant_id AS lease_tenant_id,
        l.property_unit_id AS lease_property_unit_id,
        l.monthly_amount::float AS lease_monthly_amount,
        l.currency AS lease_currency,
        l.due_day_of_month AS lease_due_day_of_month,
        l.grace_days AS lease_grace_days,
        t.id AS tenant_id,
        t.organization_id AS tenant_organization_id,
        t.full_name AS tenant_full_name,
        t.email AS tenant_email,
        t.phone_e164 AS tenant_phone_e164,
        t.whatsapp_e164 AS tenant_whatsapp_e164,
        t.preferred_language AS tenant_preferred_language
      FROM payments p
      INNER JOIN leases l ON l.id = p.lease_id
      INNER JOIN tenants t ON t.id = l.tenant_id
      WHERE p.status <> 'settled'
    `);

    return result.rows.map((row) => {
      const payment: Payment = {
        id: row.payment_id,
        organizationId: row.payment_organization_id,
        leaseId: row.payment_lease_id,
        period: row.payment_period,
        amount: row.payment_amount,
        currency: row.payment_currency,
        status: row.payment_status,
        externalPaymentId: row.payment_external_payment_id || undefined,
        settledAt: row.payment_settled_at || undefined
      };

      const lease: Lease = {
        id: row.lease_id,
        organizationId: row.lease_organization_id,
        tenantId: row.lease_tenant_id,
        propertyUnitId: row.lease_property_unit_id,
        monthlyAmount: row.lease_monthly_amount,
        currency: row.lease_currency,
        dueDayOfMonth: row.lease_due_day_of_month,
        graceDays: row.lease_grace_days
      };

      const tenant: Tenant = {
        id: row.tenant_id,
        organizationId: row.tenant_organization_id,
        fullName: row.tenant_full_name,
        email: row.tenant_email || undefined,
        phoneE164: row.tenant_phone_e164 || undefined,
        whatsappE164: row.tenant_whatsapp_e164 || undefined,
        preferredLanguage: row.tenant_preferred_language
      };

      return { payment, lease, tenant };
    });
  }

  async markPaymentSettledByExternalId(externalPaymentId: string, settledAt: string) {
    await this.bootstrapPromise;

    const result = await this.pool.query(
      `UPDATE payments
       SET status = 'settled', settled_at = $1
       WHERE external_payment_id = $2
       RETURNING id, organization_id, lease_id, period, amount::float, currency, status, external_payment_id, settled_at::text`,
      [settledAt, externalPaymentId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0] as {
      id: string;
      organization_id: string;
      lease_id: string;
      period: string;
      amount: number;
      currency: string;
      status: "pending" | "settled" | "late";
      external_payment_id: string | null;
      settled_at: string | null;
    };

    return {
      id: row.id,
      organizationId: row.organization_id,
      leaseId: row.lease_id,
      period: row.period,
      amount: row.amount,
      currency: row.currency,
      status: row.status,
      externalPaymentId: row.external_payment_id || undefined,
      settledAt: row.settled_at || undefined
    };
  }

  async bindExternalPaymentId(paymentId: string, externalPaymentId: string) {
    await this.bootstrapPromise;

    const result = await this.pool.query(
      `UPDATE payments
       SET external_payment_id = $1
       WHERE id = $2
       RETURNING id, organization_id, lease_id, period, amount::float, currency, status, external_payment_id, settled_at::text`,
      [externalPaymentId, paymentId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0] as {
      id: string;
      organization_id: string;
      lease_id: string;
      period: string;
      amount: number;
      currency: string;
      status: "pending" | "settled" | "late";
      external_payment_id: string | null;
      settled_at: string | null;
    };

    return {
      id: row.id,
      organizationId: row.organization_id,
      leaseId: row.lease_id,
      period: row.period,
      amount: row.amount,
      currency: row.currency,
      status: row.status,
      externalPaymentId: row.external_payment_id || undefined,
      settledAt: row.settled_at || undefined
    };
  }
}
