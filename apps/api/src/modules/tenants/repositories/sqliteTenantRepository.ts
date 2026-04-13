import { dirname } from "node:path";
import { mkdirSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
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

export class SqliteTenantRepository implements TenantRepository {
  private readonly db: DatabaseSync;

  constructor(filePath: string) {
    mkdirSync(dirname(filePath), { recursive: true });
    this.db = new DatabaseSync(filePath);
    this.bootstrap();
  }

  private bootstrap() {
    this.db.exec(`
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
        monthly_amount REAL NOT NULL,
        currency TEXT NOT NULL,
        due_day_of_month INTEGER NOT NULL,
        grace_days INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS payments (
        id TEXT PRIMARY KEY,
        organization_id TEXT NOT NULL,
        lease_id TEXT NOT NULL,
        period TEXT NOT NULL,
        amount REAL NOT NULL,
        currency TEXT NOT NULL,
        status TEXT NOT NULL,
        external_payment_id TEXT,
        settled_at TEXT
      );
    `);

    this.db.prepare(
      `INSERT OR IGNORE INTO tenants (id, organization_id, full_name, email, phone_e164, whatsapp_e164, preferred_language)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run("tenant_1", "org_1", "Carlos Perez", "carlos@example.com", "+15550000001", "+15550000001", "es");

    this.db.prepare(
      `INSERT OR IGNORE INTO leases (id, organization_id, tenant_id, property_unit_id, monthly_amount, currency, due_day_of_month, grace_days)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).run("lease_1", "org_1", "tenant_1", "unit_1", 950, "USD", 5, 2);

    this.db.prepare(
      `INSERT OR IGNORE INTO payments (id, organization_id, lease_id, period, amount, currency, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run("pay_1", "org_1", "lease_1", "2026-04", 950, "USD", "pending");
  }

  async listPendingPaymentsByDate(_today: Date) {
    const rows = this.db
      .prepare(
        `SELECT
          p.id AS payment_id,
          p.organization_id AS payment_organization_id,
          p.lease_id AS payment_lease_id,
          p.period AS payment_period,
          p.amount AS payment_amount,
          p.currency AS payment_currency,
          p.status AS payment_status,
          p.external_payment_id AS payment_external_payment_id,
          p.settled_at AS payment_settled_at,
          l.id AS lease_id,
          l.organization_id AS lease_organization_id,
          l.tenant_id AS lease_tenant_id,
          l.property_unit_id AS lease_property_unit_id,
          l.monthly_amount AS lease_monthly_amount,
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
        WHERE p.status <> 'settled'`
      )
      .all() as JoinedRow[];

    return rows.map((row) => {
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
    this.db
      .prepare(`UPDATE payments SET status = 'settled', settled_at = ? WHERE external_payment_id = ?`)
      .run(settledAt, externalPaymentId);

    const row = this.db
      .prepare(`SELECT * FROM payments WHERE external_payment_id = ?`)
      .get(externalPaymentId) as
      | {
          id: string;
          organization_id: string;
          lease_id: string;
          period: string;
          amount: number;
          currency: string;
          status: "pending" | "settled" | "late";
          external_payment_id: string | null;
          settled_at: string | null;
        }
      | undefined;

    if (!row) {
      return null;
    }

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
    this.db
      .prepare(`UPDATE payments SET external_payment_id = ? WHERE id = ?`)
      .run(externalPaymentId, paymentId);

    const row = this.db.prepare(`SELECT * FROM payments WHERE id = ?`).get(paymentId) as
      | {
          id: string;
          organization_id: string;
          lease_id: string;
          period: string;
          amount: number;
          currency: string;
          status: "pending" | "settled" | "late";
          external_payment_id: string | null;
          settled_at: string | null;
        }
      | undefined;

    if (!row) {
      return null;
    }

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
