"use client";

import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Trash2, 
  User, 
  Mail, 
  Phone, 
  Globe, 
  Calendar, 
  Clock, 
  Home, 
  MapPin, 
  DollarSign,
  CreditCard,
  MessageSquare,
  FileText,
  AlertTriangle,
  CheckCircle,
  Send
} from "lucide-react";
import { BackofficeShell } from "../../../components/BackofficeShell";
import { useData, LANGUAGES, UNIT_TYPES, getContractEndDate, getContractMonthsRemaining, BotLanguage } from "../../../context/DataContext";
import Link from "next/link";

function statusClass(status: string) {
  if (status === "Al dia") return "status-pill status-pill--success";
  if (status === "Pendiente") return "status-pill status-pill--warning";
  return "status-pill status-pill--danger";
}

function unitStatusClass(status: string) {
  if (status === "Ocupada") return "status-pill status-pill--success";
  if (status === "Vacante") return "status-pill status-pill--warning";
  return "status-pill status-pill--danger";
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(price);
}

function getUnitTypeLabel(unitType: string): string {
  return UNIT_TYPES.find(t => t.value === unitType)?.label ?? unitType;
}

function getUnitTypeIcon(unitType: string): string {
  return UNIT_TYPES.find(t => t.value === unitType)?.icon ?? "🏠";
}

export default function TenantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { tenants, units, deleteTenant, updateTenantLanguage } = useData();
  
  const tenant = tenants.find(t => t.id === params.id);
  const unit = tenant?.unitId ? units.find(u => u.id === tenant.unitId) : null;

  if (!tenant) {
    return (
      <BackofficeShell title="Inquilino no encontrado" description="">
        <div className="empty-state">
          <p>El inquilino que buscas no existe o fue eliminado.</p>
          <Link href="/tenants" className="primary-button">
            <ArrowLeft size={16} />
            Volver a inquilinos
          </Link>
        </div>
      </BackofficeShell>
    );
  }

  const handleDelete = () => {
    if (confirm("¿Estás seguro de eliminar este inquilino?")) {
      deleteTenant(tenant.id);
      router.push("/tenants");
    }
  };

  const endDate = getContractEndDate(tenant);
  const monthsRemaining = getContractMonthsRemaining(tenant);

  // Calculate payment history (demo data)
  const paymentHistory = unit ? [
    { month: "Abril 2026", amount: unit.price, status: tenant.status === "Al dia" ? "Pagado" : tenant.status === "Pendiente" ? "Pendiente" : "Atrasado", date: tenant.status === "Al dia" ? "8 Abr 2026" : "—" },
    { month: "Marzo 2026", amount: unit.price, status: "Pagado", date: "5 Mar 2026" },
    { month: "Febrero 2026", amount: unit.price, status: "Pagado", date: "3 Feb 2026" },
    { month: "Enero 2026", amount: unit.price, status: "Pagado", date: "4 Ene 2026" },
  ] : [];

  // Communication history (demo)
  const communications = [
    { type: "WhatsApp", message: "Recordatorio de pago enviado", date: "10 Abr 2026", status: "Entregado" },
    { type: "Email", message: "Recibo de pago de marzo", date: "5 Mar 2026", status: "Abierto" },
    { type: "WhatsApp", message: "Recordatorio de pago enviado", date: "10 Mar 2026", status: "Entregado" },
  ];

  return (
    <BackofficeShell 
      title="" 
      description=""
    >
      {/* Breadcrumb & Actions */}
      <div className="detail-page-header">
        <Link href="/tenants" className="back-link">
          <ArrowLeft size={18} />
          Inquilinos
        </Link>
        <div className="detail-page-actions">
          <button className="secondary-button" onClick={handleDelete}>
            <Trash2 size={14} />
            Eliminar
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="detail-hero detail-hero--tenant">
        <div className="detail-hero-info">
          <div className="detail-hero-avatar">
            <User size={32} />
          </div>
          <div className="detail-hero-text">
            <h1>{tenant.name}</h1>
            <div className="detail-hero-meta">
              <span className={statusClass(tenant.status)}>{tenant.status}</span>
              {monthsRemaining !== null && monthsRemaining <= 2 && monthsRemaining > 0 && (
                <span className="status-pill status-pill--warning">
                  <Clock size={12} /> Contrato próximo a vencer
                </span>
              )}
              {monthsRemaining !== null && monthsRemaining <= 0 && (
                <span className="status-pill status-pill--danger">
                  <AlertTriangle size={12} /> Contrato vencido
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="detail-page-grid">
        {/* Contact Info */}
        <article className="card detail-section-card">
          <h3>Información de contacto</h3>
          <div className="detail-info-grid">
            <div className="detail-info-item">
              <Mail size={16} />
              <div>
                <span className="detail-info-label">Email</span>
                <span className="detail-info-value">{tenant.email || "—"}</span>
              </div>
            </div>
            <div className="detail-info-item">
              <Phone size={16} />
              <div>
                <span className="detail-info-label">Teléfono</span>
                <span className="detail-info-value">{tenant.phone || "—"}</span>
              </div>
            </div>
            <div className="detail-info-item">
              <Globe size={16} />
              <div>
                <span className="detail-info-label">Idioma del bot</span>
                <select
                  className="field-select inline-select"
                  value={tenant.language}
                  onChange={(e) => updateTenantLanguage(tenant.id, e.target.value as BotLanguage)}
                >
                  {LANGUAGES.map((l) => (
                    <option key={l.value} value={l.value}>{l.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </article>

        {/* Contract Info */}
        <article className="card detail-section-card">
          <h3>Contrato</h3>
          <div className="detail-info-grid">
            {tenant.contractMonths && (
              <div className="detail-info-item">
                <Calendar size={16} />
                <div>
                  <span className="detail-info-label">Duración</span>
                  <span className="detail-info-value">{tenant.contractMonths} meses</span>
                </div>
              </div>
            )}
            {tenant.contractStartDate && (
              <div className="detail-info-item">
                <Calendar size={16} />
                <div>
                  <span className="detail-info-label">Inicio</span>
                  <span className="detail-info-value">
                    {new Date(tenant.contractStartDate).toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" })}
                  </span>
                </div>
              </div>
            )}
            {endDate && (
              <div className="detail-info-item">
                <Clock size={16} />
                <div>
                  <span className="detail-info-label">Vencimiento</span>
                  <span className="detail-info-value">
                    {endDate.toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" })}
                    {monthsRemaining !== null && monthsRemaining > 0 && ` (${monthsRemaining} mes${monthsRemaining === 1 ? "" : "es"} restantes)`}
                  </span>
                </div>
              </div>
            )}
            {!tenant.contractMonths && !tenant.contractStartDate && (
              <p className="muted">Sin información de contrato registrada.</p>
            )}
          </div>
        </article>

        {/* Assigned Unit */}
        <article className="card detail-section-card">
          <h3>Propiedad asignada</h3>
          {unit ? (
            <>
              <div className="unit-card-preview">
                <div className="unit-preview-icon">
                  <span>{getUnitTypeIcon(unit.unitType)}</span>
                </div>
                <div className="unit-preview-info">
                  <Link href={`/units/${unit.id}`} className="tenant-name-link">
                    {unit.name}
                  </Link>
                  <div className="unit-preview-meta">
                    <span className="unit-type-badge">{getUnitTypeLabel(unit.unitType)}</span>
                    <span className={unitStatusClass(unit.status)}>{unit.status}</span>
                  </div>
                </div>
              </div>
              <div className="detail-info-grid" style={{ marginTop: 16 }}>
                <div className="detail-info-item">
                  <MapPin size={16} />
                  <div>
                    <span className="detail-info-label">Ubicación</span>
                    <span className="detail-info-value">{unit.location}</span>
                  </div>
                </div>
                <div className="detail-info-item">
                  <DollarSign size={16} />
                  <div>
                    <span className="detail-info-label">Renta mensual</span>
                    <span className="detail-info-value detail-info-value--highlight">{formatPrice(unit.price)}</span>
                  </div>
                </div>
              </div>
              <div className="detail-card-actions">
                <Link href={`/units/${unit.id}`} className="primary-button">
                  Ver propiedad completa
                </Link>
              </div>
            </>
          ) : (
            <div className="empty-tenant-state">
              <Home size={32} />
              <p>Sin propiedad asignada</p>
              <Link href="/tenants" className="primary-button">
                Asignar propiedad
              </Link>
            </div>
          )}
        </article>

        {/* Payment History */}
        {unit && (
          <article className="card detail-section-card detail-section-card--wide">
            <div className="detail-section-header">
              <h3>Historial de pagos</h3>
              <Link href="/payments" className="text-link">Ver todos</Link>
            </div>
            <div className="payment-history-table">
              <table>
                <thead>
                  <tr>
                    <th>Mes</th>
                    <th>Monto</th>
                    <th>Estado</th>
                    <th>Fecha de pago</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentHistory.map((p, i) => (
                    <tr key={i}>
                      <td>{p.month}</td>
                      <td>{formatPrice(p.amount)}</td>
                      <td>
                        <span className={
                          p.status === "Pagado" ? "status-pill status-pill--success" : 
                          p.status === "Pendiente" ? "status-pill status-pill--warning" :
                          "status-pill status-pill--danger"
                        }>
                          {p.status}
                        </span>
                      </td>
                      <td>{p.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        )}

        {/* Communication History */}
        <article className="card detail-section-card">
          <div className="detail-section-header">
            <h3>Historial de comunicación</h3>
            <Link href="/bot" className="text-link">Ver conversaciones</Link>
          </div>
          <div className="communication-list">
            {communications.map((c, i) => (
              <div key={i} className="communication-item">
                <div className="communication-icon">
                  {c.type === "WhatsApp" ? <MessageSquare size={14} /> : <Mail size={14} />}
                </div>
                <div className="communication-content">
                  <span className="communication-message">{c.message}</span>
                  <span className="communication-meta">{c.type} • {c.date}</span>
                </div>
                <span className={`communication-status ${c.status === "Entregado" || c.status === "Abierto" ? "communication-status--success" : ""}`}>
                  {c.status === "Entregado" || c.status === "Abierto" ? <CheckCircle size={12} /> : null}
                  {c.status}
                </span>
              </div>
            ))}
          </div>
        </article>

        {/* Quick Actions */}
        <article className="card detail-section-card">
          <h3>Acciones rápidas</h3>
          <div className="quick-actions-grid">
            <Link href="/chat" className="quick-action-btn">
              <MessageSquare size={18} />
              <span>Enviar mensaje</span>
            </Link>
            <Link href="/payments" className="quick-action-btn">
              <CreditCard size={18} />
              <span>Registrar pago</span>
            </Link>
            <Link href="/notifications" className="quick-action-btn">
              <Send size={18} />
              <span>Enviar recordatorio</span>
            </Link>
          </div>
        </article>
      </div>
    </BackofficeShell>
  );
}
