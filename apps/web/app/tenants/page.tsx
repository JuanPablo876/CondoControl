"use client";

import { useState } from "react";
import { Plus, LinkIcon, X, Users, Home, Mail, Phone, Globe, Calendar, Clock } from "lucide-react";
import { BackofficeShell } from "../../components/BackofficeShell";
import { useData, Tenant, BotLanguage, LANGUAGES, getContractEndDate, getContractMonthsRemaining } from "../../context/DataContext";

function statusClass(status: string) {
  if (status === "Al dia") return "status-pill status-pill--success";
  if (status === "Pendiente") return "status-pill status-pill--warning";
  return "status-pill status-pill--danger";
}

export default function TenantsPage() {
  const { tenants, units, addTenant, getUnitName, getAvailableUnits, assignTenantToUnit, updateTenantLanguage } = useData();

  const [showAdd, setShowAdd] = useState(false);
  const [showAssign, setShowAssign] = useState<string | null>(null);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);

  // Add form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [language, setLanguage] = useState<BotLanguage>("es");
  const [contractMonths, setContractMonths] = useState("");
  const [contractStartDate, setContractStartDate] = useState("");

  // Assign form
  const [selectedUnit, setSelectedUnit] = useState("");

  const resetAddForm = () => { 
    setName(""); 
    setEmail(""); 
    setPhone(""); 
    setLanguage("es"); 
    setContractMonths("");
    setContractStartDate("");
  };

  const handleAdd = () => {
    if (!name.trim()) return;
    addTenant({ 
      name: name.trim(), 
      email: email.trim(), 
      phone: phone.trim(), 
      language,
      contractMonths: contractMonths ? Number(contractMonths) : null,
      contractStartDate: contractStartDate || null,
    });
    resetAddForm();
    setShowAdd(false);
  };

  const handleAssign = () => {
    if (!selectedUnit || !showAssign) return;
    assignTenantToUnit(showAssign, selectedUnit);
    setSelectedUnit("");
    setShowAssign(null);
  };

  const availableUnits = getAvailableUnits();

  // Get unit linked to selected tenant
  const linkedUnit = selectedTenant?.unitId
    ? units.find((u) => u.id === selectedTenant.unitId)
    : null;

  return (
    <BackofficeShell title="Inquilinos" description="Gestion de estado y contacto de residentes.">
      {/* Detail card */}
      {selectedTenant && (
        <article className="detail-card">
          <div className="detail-card-header">
            <div className="detail-card-title">
              <div className="detail-card-icon detail-card-icon--tenant">
                <Users size={20} />
              </div>
              <div>
                <h2>{selectedTenant.name}</h2>
                <span className={statusClass(selectedTenant.status)}>{selectedTenant.status}</span>
              </div>
            </div>
            <button className="close-button" type="button" onClick={() => setSelectedTenant(null)}>
              <X size={18} />
            </button>
          </div>

          <div className="detail-grid">
            <div className="detail-item">
              <span className="detail-label"><Mail size={12} style={{ verticalAlign: "middle", marginRight: 4 }} />Email</span>
              <span className="detail-value">{selectedTenant.email || "—"}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label"><Phone size={12} style={{ verticalAlign: "middle", marginRight: 4 }} />Teléfono</span>
              <span className="detail-value">{selectedTenant.phone || "—"}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label"><Globe size={12} style={{ verticalAlign: "middle", marginRight: 4 }} />Idioma del bot</span>
              <select
                className="field-select"
                value={selectedTenant.language}
                onChange={(e) => updateTenantLanguage(selectedTenant.id, e.target.value as BotLanguage)}
                style={{ marginTop: 2, padding: "6px 10px", fontSize: 14 }}
              >
                {LANGUAGES.map((l) => (
                  <option key={l.value} value={l.value}>{l.label}</option>
                ))}
              </select>
            </div>
            {selectedTenant.contractMonths && (
              <div className="detail-item">
                <span className="detail-label"><Calendar size={12} style={{ verticalAlign: "middle", marginRight: 4 }} />Contrato</span>
                <span className="detail-value">{selectedTenant.contractMonths} meses</span>
              </div>
            )}
            {selectedTenant.contractStartDate && (
              <div className="detail-item">
                <span className="detail-label"><Clock size={12} style={{ verticalAlign: "middle", marginRight: 4 }} />Fin de contrato</span>
                <span className="detail-value">
                  {(() => {
                    const endDate = getContractEndDate(selectedTenant);
                    const monthsRemaining = getContractMonthsRemaining(selectedTenant);
                    if (!endDate) return "—";
                    const formatted = endDate.toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" });
                    const statusText = monthsRemaining !== null && monthsRemaining <= 0 
                      ? " (vencido)" 
                      : monthsRemaining !== null && monthsRemaining <= 2 
                        ? ` (${monthsRemaining} mes${monthsRemaining === 1 ? "" : "es"} restantes)` 
                        : "";
                    return formatted + statusText;
                  })()}
                </span>
              </div>
            )}
          </div>

          {linkedUnit ? (
            <div className="detail-section">
              <p className="detail-section-title">Unidad asignada</p>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label"><Home size={12} style={{ verticalAlign: "middle", marginRight: 4 }} />Propiedad</span>
                  <span className="detail-value">{linkedUnit.name}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Ubicación</span>
                  <span className="detail-value">{linkedUnit.location}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Renta mensual</span>
                  <span className="detail-value">${linkedUnit.price.toLocaleString()} MXN</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="detail-section">
              <p className="muted">Sin unidad asignada.</p>
            </div>
          )}

          {!selectedTenant.unitId && (
            <div className="detail-actions">
              <button className="primary-button" type="button" onClick={() => { setSelectedUnit(""); setShowAssign(selectedTenant.id); setSelectedTenant(null); }}>
                <LinkIcon size={14} /> Asignar unidad
              </button>
            </div>
          )}
        </article>
      )}

      <article className="card">
        <div className="page-header-row">
          <h2>Listado</h2>
          <button className="primary-button" type="button" onClick={() => setShowAdd(true)}>
            <Plus size={16} /> Agregar inquilino
          </button>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Unidad</th>
                <th>Idioma</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((tenant) => (
                <tr key={tenant.id} className="clickable-row" onClick={() => setSelectedTenant(tenant)}>
                  <td>{tenant.name}</td>
                  <td>{tenant.email}</td>
                  <td>{tenant.phone}</td>
                  <td>{getUnitName(tenant.unitId)}</td>
                  <td>{LANGUAGES.find((l) => l.value === tenant.language)?.label ?? "Español"}</td>
                  <td><span className={statusClass(tenant.status)}>{tenant.status}</span></td>
                  <td>
                    {!tenant.unitId && (
                      <button className="table-action" type="button" onClick={(e) => { e.stopPropagation(); setSelectedUnit(""); setShowAssign(tenant.id); }}>
                        <LinkIcon size={13} style={{ verticalAlign: "middle", marginRight: 4 }} />
                        Asignar unidad
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>

      {/* Modal: Agregar inquilino */}
      {showAdd && (
        <div className="modal-backdrop" onClick={() => setShowAdd(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Nuevo inquilino</h2>
            <div className="form-grid">
              <label className="field">
                Nombre *
                <input placeholder="Nombre completo" value={name} onChange={(e) => setName(e.target.value)} />
              </label>
              <label className="field">
                Email
                <input type="email" placeholder="correo@ejemplo.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              </label>
              <label className="field">
                Teléfono
                <input placeholder="555-0000" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </label>
              <label className="field">
                Idioma del bot
                <select className="field-select" value={language} onChange={(e) => setLanguage(e.target.value as BotLanguage)}>
                  {LANGUAGES.map((l) => (
                    <option key={l.value} value={l.value}>{l.label}</option>
                  ))}
                </select>
              </label>
              <label className="field">
                Duración del contrato (meses)
                <input type="number" placeholder="12" min="1" max="60" value={contractMonths} onChange={(e) => setContractMonths(e.target.value)} />
              </label>
              <label className="field">
                Fecha de inicio del contrato
                <input type="date" value={contractStartDate} onChange={(e) => setContractStartDate(e.target.value)} />
              </label>
            </div>
            <div className="modal-actions">
              <button className="secondary-button" type="button" onClick={() => setShowAdd(false)}>Cancelar</button>
              <button className="primary-button" type="button" onClick={handleAdd}>Agregar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Asignar unidad */}
      {showAssign && (
        <div className="modal-backdrop" onClick={() => setShowAssign(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Asignar unidad</h2>
            {availableUnits.length === 0 ? (
              <p className="muted">No hay unidades disponibles para asignar.</p>
            ) : (
              <div className="form-grid">
                <label className="field">
                  Unidad
                  <select
                    className="field-select"
                    value={selectedUnit}
                    onChange={(e) => setSelectedUnit(e.target.value)}
                  >
                    <option value="">Seleccionar unidad...</option>
                    {availableUnits.map((u) => (
                      <option key={u.id} value={u.id}>{u.name} — {u.location}</option>
                    ))}
                  </select>
                </label>
              </div>
            )}
            <div className="modal-actions">
              <button className="secondary-button" type="button" onClick={() => setShowAssign(null)}>Cancelar</button>
              {availableUnits.length > 0 && (
                <button className="primary-button" type="button" onClick={handleAssign} disabled={!selectedUnit}>Asignar</button>
              )}
            </div>
          </div>
        </div>
      )}
    </BackofficeShell>
  );
}
