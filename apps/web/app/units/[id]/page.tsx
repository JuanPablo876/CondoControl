"use client";

import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  LinkIcon, 
  Unlink, 
  MapPin, 
  DollarSign, 
  Building, 
  Bed, 
  Bath, 
  Car, 
  Trees, 
  Ruler, 
  User, 
  Mail, 
  Phone, 
  Calendar,
  Clock,
  Globe,
  CreditCard,
  FileText,
  Wrench,
  MessageSquare
} from "lucide-react";
import { BackofficeShell } from "../../../components/BackofficeShell";
import { useData, UNIT_TYPES, getContractEndDate, getContractMonthsRemaining } from "../../../context/DataContext";
import Link from "next/link";

function statusClass(status: string) {
  if (status === "Ocupada") return "status-pill status-pill--success";
  if (status === "Vacante") return "status-pill status-pill--warning";
  return "status-pill status-pill--danger";
}

function tenantStatusClass(status: string) {
  if (status === "Al dia") return "status-pill status-pill--success";
  if (status === "Pendiente") return "status-pill status-pill--warning";
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

export default function UnitDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { units, tenants, unassignUnit, deleteUnit } = useData();
  
  const unit = units.find(u => u.id === params.id);
  const tenant = unit?.tenantId ? tenants.find(t => t.id === unit.tenantId) : null;

  if (!unit) {
    return (
      <BackofficeShell title="Propiedad no encontrada" description="">
        <div className="empty-state">
          <p>La propiedad que buscas no existe o fue eliminada.</p>
          <Link href="/units" className="primary-button">
            <ArrowLeft size={16} />
            Volver a propiedades
          </Link>
        </div>
      </BackofficeShell>
    );
  }

  const handleDelete = () => {
    if (confirm("¿Estás seguro de eliminar esta propiedad?")) {
      deleteUnit(unit.id);
      router.push("/units");
    }
  };

  const handleUnassign = () => {
    if (confirm("¿Deseas desasignar al inquilino de esta propiedad?")) {
      unassignUnit(unit.id);
    }
  };

  // Calculate payment history (demo data)
  const paymentHistory = [
    { month: "Abril 2026", amount: unit.price, status: "Pendiente", date: "—" },
    { month: "Marzo 2026", amount: unit.price, status: "Pagado", date: "5 Mar 2026" },
    { month: "Febrero 2026", amount: unit.price, status: "Pagado", date: "3 Feb 2026" },
    { month: "Enero 2026", amount: unit.price, status: "Pagado", date: "4 Ene 2026" },
  ];

  return (
    <BackofficeShell 
      title="" 
      description=""
    >
      {/* Breadcrumb & Actions */}
      <div className="detail-page-header">
        <Link href="/units" className="back-link">
          <ArrowLeft size={18} />
          Propiedades
        </Link>
        <div className="detail-page-actions">
          <button className="secondary-button" onClick={handleDelete}>
            <Trash2 size={14} />
            Eliminar
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="detail-hero">
        {unit.photoUrl && (
          <div className="detail-hero-image">
            <img src={unit.photoUrl} alt={unit.name} />
          </div>
        )}
        <div className="detail-hero-info">
          <div className="detail-hero-icon">
            <span>{getUnitTypeIcon(unit.unitType)}</span>
          </div>
          <div className="detail-hero-text">
            <h1>{unit.name}</h1>
            <div className="detail-hero-meta">
              <span className="unit-type-badge">{getUnitTypeLabel(unit.unitType)}</span>
              <span className={statusClass(unit.status)}>{unit.status}</span>
            </div>
            <p className="detail-hero-location">
              <MapPin size={14} />
              {unit.location}
            </p>
            <p className="detail-hero-price">{formatPrice(unit.price)}<span>/mes</span></p>
          </div>
        </div>
      </div>

      <div className="detail-page-grid">
        {/* Property Details */}
        <article className="card detail-section-card">
          <h3>Detalles de la propiedad</h3>
          <div className="detail-info-grid">
            {unit.tower && (
              <div className="detail-info-item">
                <Building size={16} />
                <div>
                  <span className="detail-info-label">Torre/Edificio</span>
                  <span className="detail-info-value">{unit.tower}</span>
                </div>
              </div>
            )}
            {unit.floor !== undefined && (
              <div className="detail-info-item">
                <Building size={16} />
                <div>
                  <span className="detail-info-label">Piso</span>
                  <span className="detail-info-value">{unit.floor}</span>
                </div>
              </div>
            )}
            {unit.apartmentNumber && (
              <div className="detail-info-item">
                <FileText size={16} />
                <div>
                  <span className="detail-info-label">Número</span>
                  <span className="detail-info-value">{unit.apartmentNumber}</span>
                </div>
              </div>
            )}
            {unit.bedrooms !== undefined && (
              <div className="detail-info-item">
                <Bed size={16} />
                <div>
                  <span className="detail-info-label">Recámaras</span>
                  <span className="detail-info-value">{unit.bedrooms}</span>
                </div>
              </div>
            )}
            {unit.bathrooms !== undefined && (
              <div className="detail-info-item">
                <Bath size={16} />
                <div>
                  <span className="detail-info-label">Baños</span>
                  <span className="detail-info-value">{unit.bathrooms}</span>
                </div>
              </div>
            )}
            {unit.parkingSpots !== undefined && (
              <div className="detail-info-item">
                <Car size={16} />
                <div>
                  <span className="detail-info-label">Estacionamientos</span>
                  <span className="detail-info-value">{unit.parkingSpots}</span>
                </div>
              </div>
            )}
            {unit.areaSqm !== undefined && (
              <div className="detail-info-item">
                <Ruler size={16} />
                <div>
                  <span className="detail-info-label">Área</span>
                  <span className="detail-info-value">{unit.areaSqm} m²</span>
                </div>
              </div>
            )}
            {unit.hasYard && (
              <div className="detail-info-item">
                <Trees size={16} />
                <div>
                  <span className="detail-info-label">Jardín</span>
                  <span className="detail-info-value">Sí</span>
                </div>
              </div>
            )}
            {unit.furnished && (
              <div className="detail-info-item">
                <Bed size={16} />
                <div>
                  <span className="detail-info-label">Amueblado</span>
                  <span className="detail-info-value">Sí</span>
                </div>
              </div>
            )}
          </div>
        </article>

        {/* Tenant Card */}
        <article className="card detail-section-card">
          <h3>Inquilino</h3>
          {tenant ? (
            <>
              <div className="tenant-card-preview">
                <div className="tenant-avatar">
                  <User size={24} />
                </div>
                <div className="tenant-info">
                  <Link href={`/tenants/${tenant.id}`} className="tenant-name-link">
                    {tenant.name}
                  </Link>
                  <span className={tenantStatusClass(tenant.status)}>{tenant.status}</span>
                </div>
              </div>
              <div className="detail-info-grid" style={{ marginTop: 16 }}>
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
                {tenant.contractMonths && (
                  <div className="detail-info-item">
                    <Calendar size={16} />
                    <div>
                      <span className="detail-info-label">Contrato</span>
                      <span className="detail-info-value">{tenant.contractMonths} meses</span>
                    </div>
                  </div>
                )}
                {tenant.contractStartDate && (
                  <div className="detail-info-item">
                    <Clock size={16} />
                    <div>
                      <span className="detail-info-label">Vencimiento</span>
                      <span className="detail-info-value">
                        {(() => {
                          const endDate = getContractEndDate(tenant);
                          const remaining = getContractMonthsRemaining(tenant);
                          if (!endDate) return "—";
                          const formatted = endDate.toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" });
                          if (remaining !== null && remaining <= 0) return `${formatted} (vencido)`;
                          if (remaining !== null && remaining <= 2) return `${formatted} (${remaining} mes${remaining === 1 ? "" : "es"})`;
                          return formatted;
                        })()}
                      </span>
                    </div>
                  </div>
                )}
              </div>
              <div className="detail-card-actions">
                <button className="secondary-button" onClick={handleUnassign}>
                  <Unlink size={14} />
                  Desasignar
                </button>
                <Link href={`/tenants/${tenant.id}`} className="primary-button">
                  Ver perfil completo
                </Link>
              </div>
            </>
          ) : (
            <div className="empty-tenant-state">
              <User size={32} />
              <p>Sin inquilino asignado</p>
              <Link href="/units" className="primary-button">
                <LinkIcon size={14} />
                Asignar inquilino
              </Link>
            </div>
          )}
        </article>

        {/* Payment History */}
        {tenant && (
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
                        <span className={p.status === "Pagado" ? "status-pill status-pill--success" : "status-pill status-pill--warning"}>
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

        {/* Quick Actions */}
        <article className="card detail-section-card">
          <h3>Acciones rápidas</h3>
          <div className="quick-actions-grid">
            <Link href="/maintenance" className="quick-action-btn">
              <Wrench size={18} />
              <span>Crear ticket de mantenimiento</span>
            </Link>
            <Link href="/chat" className="quick-action-btn">
              <MessageSquare size={18} />
              <span>Enviar mensaje al inquilino</span>
            </Link>
            <Link href="/payments" className="quick-action-btn">
              <CreditCard size={18} />
              <span>Registrar pago</span>
            </Link>
          </div>
        </article>
      </div>
    </BackofficeShell>
  );
}
