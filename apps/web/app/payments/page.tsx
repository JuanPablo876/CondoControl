"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, User, Calendar, DollarSign, Clock, CheckCircle, AlertCircle, XCircle } from "lucide-react";
import { BackofficeShell } from "../../components/BackofficeShell";

type PaymentStatus = "Pagado" | "Pendiente" | "Mora";

type Payment = {
  id: string;
  period: string;
  amount: number;
  status: PaymentStatus;
  date: string | null; // Payment date (null if not paid)
  method: string | null;
};

type TenantPayments = {
  tenantId: string;
  tenantName: string;
  unit: string;
  monthlyRent: number;
  payments: Payment[];
};

const tenantsPayments: TenantPayments[] = [
  {
    tenantId: "t1",
    tenantName: "Carlos Perez",
    unit: "A-301",
    monthlyRent: 4500,
    payments: [
      { id: "p1", period: "2026-04", amount: 4500, status: "Pagado", date: "2026-04-10", method: "Transferencia" },
      { id: "p2", period: "2026-03", amount: 4500, status: "Pagado", date: "2026-03-14", method: "Transferencia" },
      { id: "p3", period: "2026-02", amount: 4500, status: "Pagado", date: "2026-02-15", method: "Efectivo" },
      { id: "p4", period: "2026-01", amount: 4500, status: "Pagado", date: "2026-01-12", method: "Transferencia" },
      { id: "p5", period: "2025-12", amount: 4500, status: "Pagado", date: "2025-12-15", method: "Transferencia" },
      { id: "p6", period: "2025-11", amount: 4500, status: "Pagado", date: "2025-11-14", method: "Transferencia" },
    ],
  },
  {
    tenantId: "t2",
    tenantName: "Maria Gutierrez",
    unit: "C-205",
    monthlyRent: 3800,
    payments: [
      { id: "p7", period: "2026-04", amount: 3800, status: "Pendiente", date: null, method: null },
      { id: "p8", period: "2026-03", amount: 3800, status: "Pagado", date: "2026-03-18", method: "Transferencia" },
      { id: "p9", period: "2026-02", amount: 3800, status: "Pagado", date: "2026-02-20", method: "Deposito" },
      { id: "p10", period: "2026-01", amount: 3800, status: "Pagado", date: "2026-01-15", method: "Transferencia" },
      { id: "p11", period: "2025-12", amount: 3800, status: "Pagado", date: "2025-12-16", method: "Transferencia" },
    ],
  },
  {
    tenantId: "t3",
    tenantName: "Jorge Medina",
    unit: "B-114",
    monthlyRent: 6200,
    payments: [
      { id: "p12", period: "2026-04", amount: 6200, status: "Mora", date: null, method: null },
      { id: "p13", period: "2026-03", amount: 6200, status: "Mora", date: null, method: null },
      { id: "p14", period: "2026-02", amount: 6200, status: "Pagado", date: "2026-02-28", method: "Transferencia" },
      { id: "p15", period: "2026-01", amount: 6200, status: "Pagado", date: "2026-01-20", method: "Transferencia" },
    ],
  },
];

function statusClass(status: PaymentStatus) {
  if (status === "Pagado") return "status-pill status-pill--success";
  if (status === "Pendiente") return "status-pill status-pill--warning";
  return "status-pill status-pill--danger";
}

function StatusIcon({ status }: { status: PaymentStatus }) {
  if (status === "Pagado") return <CheckCircle size={14} className="status-icon status-icon--success" />;
  if (status === "Pendiente") return <Clock size={14} className="status-icon status-icon--warning" />;
  return <XCircle size={14} className="status-icon status-icon--danger" />;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(amount);
}

function formatPeriod(period: string) {
  const [year, month] = period.split("-");
  const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  return `${monthNames[parseInt(month) - 1]} ${year}`;
}

function formatDate(date: string | null) {
  if (!date) return "—";
  const d = new Date(date);
  return d.toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" });
}

function getTenantOverallStatus(payments: Payment[]): PaymentStatus {
  const latest = payments[0];
  if (!latest) return "Pendiente";
  return latest.status;
}

function getPendingAmount(payments: Payment[]): number {
  return payments.filter(p => p.status !== "Pagado").reduce((sum, p) => sum + p.amount, 0);
}

export default function PaymentsPage() {
  const [expandedTenant, setExpandedTenant] = useState<string | null>(null);

  const toggleTenant = (tenantId: string) => {
    setExpandedTenant((prev) => (prev === tenantId ? null : tenantId));
  };

  const totalPending = tenantsPayments.reduce((sum, t) => sum + getPendingAmount(t.payments), 0);
  const totalCollected = tenantsPayments.reduce(
    (sum, t) => sum + t.payments.filter(p => p.status === "Pagado").reduce((s, p) => s + p.amount, 0),
    0
  );

  return (
    <BackofficeShell title="Pagos" description="Control de conciliacion y seguimiento de pagos.">
      {/* Summary cards */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon stat-icon--success"><DollarSign size={20} /></div>
          <div className="stat-content">
            <span className="stat-value">{formatCurrency(totalCollected)}</span>
            <span className="stat-label">Recaudado</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon--warning"><Clock size={20} /></div>
          <div className="stat-content">
            <span className="stat-value">{formatCurrency(totalPending)}</span>
            <span className="stat-label">Pendiente</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon--brand"><User size={20} /></div>
          <div className="stat-content">
            <span className="stat-value">{tenantsPayments.length}</span>
            <span className="stat-label">Inquilinos</span>
          </div>
        </div>
      </div>

      {/* Tenants grouped payments */}
      <article className="card">
        <div className="page-header-row">
          <h2>Pagos por inquilino</h2>
          <span className="muted">Click para ver historial</span>
        </div>

        <div className="tenant-payments-list">
          {tenantsPayments.map((tenant) => {
            const isExpanded = expandedTenant === tenant.tenantId;
            const latestPayment = tenant.payments[0];
            const overallStatus = getTenantOverallStatus(tenant.payments);
            const pending = getPendingAmount(tenant.payments);

            return (
              <div key={tenant.tenantId} className="tenant-payment-item">
                <button
                  className="tenant-payment-header"
                  type="button"
                  onClick={() => toggleTenant(tenant.tenantId)}
                >
                  <div className="tenant-payment-left">
                    <div className="tenant-avatar">
                      <User size={18} />
                    </div>
                    <div className="tenant-payment-info">
                      <span className="tenant-payment-name">{tenant.tenantName}</span>
                      <span className="tenant-payment-unit">{tenant.unit} • Renta: {formatCurrency(tenant.monthlyRent)}</span>
                    </div>
                  </div>
                  <div className="tenant-payment-right">
                    {pending > 0 && (
                      <span className="tenant-pending-badge">
                        <AlertCircle size={12} />
                        {formatCurrency(pending)} pendiente
                      </span>
                    )}
                    <span className={statusClass(overallStatus)}>{overallStatus}</span>
                    <span className="tenant-payment-latest">
                      {latestPayment ? formatPeriod(latestPayment.period) : "—"}
                    </span>
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="payment-history">
                    <div className="payment-history-header">
                      <Calendar size={14} />
                      <span>Historial de pagos</span>
                    </div>
                    <div className="payment-history-list">
                      {tenant.payments.map((payment) => (
                        <div key={payment.id} className={`payment-history-row payment-history-row--${payment.status.toLowerCase()}`}>
                          <div className="payment-history-period">
                            <StatusIcon status={payment.status} />
                            <span>{formatPeriod(payment.period)}</span>
                          </div>
                          <div className="payment-history-amount">{formatCurrency(payment.amount)}</div>
                          <div className="payment-history-date">{formatDate(payment.date)}</div>
                          <div className="payment-history-method">{payment.method ?? "—"}</div>
                          <span className={statusClass(payment.status)}>{payment.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </article>
    </BackofficeShell>
  );
}
