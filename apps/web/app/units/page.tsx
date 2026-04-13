"use client";

import { useState, useRef } from "react";
import { Plus, LinkIcon, Unlink, Home, X, Mail, Phone, User, MapPin, DollarSign, Image, Building, Bed, Bath, Car, Trees, Ruler, Upload, Trash2 } from "lucide-react";
import { BackofficeShell } from "../../components/BackofficeShell";
import { useData, Unit, UnitType, UNIT_TYPES, getRequiredFields, getOptionalFields } from "../../context/DataContext";

function statusClass(status: string) {
  if (status === "Ocupada") return "status-pill status-pill--success";
  if (status === "Vacante") return "status-pill status-pill--warning";
  return "status-pill status-pill--danger";
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(price);
}

function getUnitTypeLabel(unitType: UnitType): string {
  return UNIT_TYPES.find(t => t.value === unitType)?.label ?? unitType;
}

function getUnitTypeIcon(unitType: UnitType): string {
  return UNIT_TYPES.find(t => t.value === unitType)?.icon ?? "🏠";
}

export default function UnitsPage() {
  const { units, tenants, addUnit, getTenantName, getUnassignedTenants, assignTenantToUnit, unassignUnit } = useData();

  const [showAdd, setShowAdd] = useState(false);
  const [showAssign, setShowAssign] = useState<string | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);

  // Add form state
  const [unitType, setUnitType] = useState<UnitType>("departamento");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tower, setTower] = useState("");
  const [floor, setFloor] = useState("");
  const [apartmentNumber, setApartmentNumber] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [parkingSpots, setParkingSpots] = useState("");
  const [hasYard, setHasYard] = useState(false);
  const [areaSqm, setAreaSqm] = useState("");
  const [furnished, setFurnished] = useState(false);

  // Assign form state
  const [selectedTenant, setSelectedTenant] = useState("");

  // File upload handler
  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPhotoPreview(result);
      setPhotoUrl(result); // Store base64 as photoUrl
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const clearPhoto = () => {
    setPhotoUrl("");
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const resetAddForm = () => {
    setUnitType("departamento");
    setName("");
    setPrice("");
    setLocation("");
    setPhotoUrl("");
    setPhotoPreview(null);
    setTower("");
    setFloor("");
    setApartmentNumber("");
    setBedrooms("");
    setBathrooms("");
    setParkingSpots("");
    setHasYard(false);
    setAreaSqm("");
    setFurnished(false);
  };

  const handleAdd = () => {
    const requiredFields = getRequiredFields(unitType);
    
    // Check common required fields
    if (!name.trim() || !price.trim() || !location.trim()) return;
    
    // Check type-specific required fields
    if (requiredFields.includes("tower") && !tower.trim()) return;
    if (requiredFields.includes("floor") && !floor.trim()) return;
    if (requiredFields.includes("apartmentNumber") && !apartmentNumber.trim()) return;
    if (requiredFields.includes("bedrooms") && !bedrooms.trim()) return;
    if (requiredFields.includes("bathrooms") && !bathrooms.trim()) return;
    if (requiredFields.includes("areaSqm") && !areaSqm.trim()) return;

    const newUnit: Omit<Unit, "id" | "tenantId" | "status"> = {
      name: name.trim(),
      unitType,
      price: Number(price),
      location: location.trim(),
      photoUrl: photoUrl.trim() || null,
      ...(tower && { tower: tower.trim() }),
      ...(floor && { floor: Number(floor) }),
      ...(apartmentNumber && { apartmentNumber: apartmentNumber.trim() }),
      ...(bedrooms && { bedrooms: Number(bedrooms) }),
      ...(bathrooms && { bathrooms: Number(bathrooms) }),
      ...(parkingSpots && { parkingSpots: Number(parkingSpots) }),
      ...(hasYard && { hasYard }),
      ...(areaSqm && { areaSqm: Number(areaSqm) }),
      ...(furnished && { furnished }),
    };

    addUnit(newUnit);
    resetAddForm();
    setShowAdd(false);
  };

  const handleAssign = () => {
    if (!selectedTenant || !showAssign) return;
    assignTenantToUnit(selectedTenant, showAssign);
    setSelectedTenant("");
    setShowAssign(null);
  };

  const unassignedTenants = getUnassignedTenants();
  const requiredFields = getRequiredFields(unitType);
  const optionalFields = getOptionalFields(unitType);

  // Get tenant linked to selected unit
  const linkedTenant = selectedUnit?.tenantId
    ? tenants.find((t) => t.id === selectedUnit.tenantId)
    : null;

  return (
    <BackofficeShell title="Propiedades" description="Inventario de propiedades y estado de ocupacion.">
      {/* Detail card */}
      {selectedUnit && (
        <article className="detail-card">
          <div className="detail-card-header">
            <div className="detail-card-title">
              <div className="detail-card-icon detail-card-icon--unit">
                <span style={{ fontSize: 24 }}>{getUnitTypeIcon(selectedUnit.unitType)}</span>
              </div>
              <div>
                <h2>{selectedUnit.name}</h2>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                  <span className="unit-type-badge">{getUnitTypeLabel(selectedUnit.unitType)}</span>
                  <span className={statusClass(selectedUnit.status)}>{selectedUnit.status}</span>
                </div>
              </div>
            </div>
            <button className="close-button" type="button" onClick={() => setSelectedUnit(null)}>
              <X size={18} />
            </button>
          </div>

          {selectedUnit.photoUrl && (
            <div className="detail-photo">
              <img src={selectedUnit.photoUrl} alt={selectedUnit.name} />
            </div>
          )}

          <div className="detail-grid">
            <div className="detail-item">
              <span className="detail-label"><DollarSign size={12} style={{ verticalAlign: "middle", marginRight: 4 }} />Renta mensual</span>
              <span className="detail-value detail-value--highlight">{formatPrice(selectedUnit.price)}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label"><MapPin size={12} style={{ verticalAlign: "middle", marginRight: 4 }} />Ubicación</span>
              <span className="detail-value">{selectedUnit.location}</span>
            </div>

            {selectedUnit.tower && (
              <div className="detail-item">
                <span className="detail-label"><Building size={12} style={{ verticalAlign: "middle", marginRight: 4 }} />Torre/Edificio</span>
                <span className="detail-value">{selectedUnit.tower}</span>
              </div>
            )}
            {selectedUnit.floor !== undefined && (
              <div className="detail-item">
                <span className="detail-label">Piso</span>
                <span className="detail-value">{selectedUnit.floor}</span>
              </div>
            )}
            {selectedUnit.apartmentNumber && (
              <div className="detail-item">
                <span className="detail-label">Número</span>
                <span className="detail-value">{selectedUnit.apartmentNumber}</span>
              </div>
            )}
            {selectedUnit.bedrooms !== undefined && (
              <div className="detail-item">
                <span className="detail-label"><Bed size={12} style={{ verticalAlign: "middle", marginRight: 4 }} />Recámaras</span>
                <span className="detail-value">{selectedUnit.bedrooms}</span>
              </div>
            )}
            {selectedUnit.bathrooms !== undefined && (
              <div className="detail-item">
                <span className="detail-label"><Bath size={12} style={{ verticalAlign: "middle", marginRight: 4 }} />Baños</span>
                <span className="detail-value">{selectedUnit.bathrooms}</span>
              </div>
            )}
            {selectedUnit.parkingSpots !== undefined && (
              <div className="detail-item">
                <span className="detail-label"><Car size={12} style={{ verticalAlign: "middle", marginRight: 4 }} />Estacionamientos</span>
                <span className="detail-value">{selectedUnit.parkingSpots}</span>
              </div>
            )}
            {selectedUnit.areaSqm !== undefined && (
              <div className="detail-item">
                <span className="detail-label"><Ruler size={12} style={{ verticalAlign: "middle", marginRight: 4 }} />Área</span>
                <span className="detail-value">{selectedUnit.areaSqm} m²</span>
              </div>
            )}
            {selectedUnit.hasYard && (
              <div className="detail-item">
                <span className="detail-label"><Trees size={12} style={{ verticalAlign: "middle", marginRight: 4 }} />Jardín</span>
                <span className="detail-value">Sí</span>
              </div>
            )}
            {selectedUnit.furnished && (
              <div className="detail-item">
                <span className="detail-label">Amueblado</span>
                <span className="detail-value">Sí</span>
              </div>
            )}
          </div>

          {linkedTenant ? (
            <div className="detail-section">
              <p className="detail-section-title">Inquilino asignado</p>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label"><User size={12} style={{ verticalAlign: "middle", marginRight: 4 }} />Nombre</span>
                  <span className="detail-value">{linkedTenant.name}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label"><Mail size={12} style={{ verticalAlign: "middle", marginRight: 4 }} />Email</span>
                  <span className="detail-value">{linkedTenant.email}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label"><Phone size={12} style={{ verticalAlign: "middle", marginRight: 4 }} />Teléfono</span>
                  <span className="detail-value">{linkedTenant.phone}</span>
                </div>
              </div>
            </div>
          ) : selectedUnit.status !== "Mantenimiento" ? (
            <div className="detail-section">
              <p className="muted">Sin inquilino asignado.</p>
            </div>
          ) : null}

          <div className="detail-actions">
            {selectedUnit.tenantId ? (
              <button className="secondary-button" type="button" onClick={() => { unassignUnit(selectedUnit.id); setSelectedUnit(null); }}>
                <Unlink size={14} /> Desasignar inquilino
              </button>
            ) : selectedUnit.status !== "Mantenimiento" ? (
              <button className="primary-button" type="button" onClick={() => { setSelectedTenant(""); setShowAssign(selectedUnit.id); setSelectedUnit(null); }}>
                <LinkIcon size={14} /> Asignar inquilino
              </button>
            ) : null}
          </div>
        </article>
      )}

      <article className="card">
        <div className="page-header-row">
          <h2>Listado de propiedades</h2>
          <button className="primary-button" type="button" onClick={() => setShowAdd(true)}>
            <Plus size={16} /> Agregar propiedad
          </button>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Propiedad</th>
                <th>Tipo</th>
                <th>Ubicación</th>
                <th>Renta</th>
                <th>Inquilino</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {units.map((unit) => (
                <tr key={unit.id} className="clickable-row" onClick={() => setSelectedUnit(unit)}>
                  <td style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span>{getUnitTypeIcon(unit.unitType)}</span>
                    <span>{unit.name}</span>
                  </td>
                  <td>{getUnitTypeLabel(unit.unitType)}</td>
                  <td>{unit.location}</td>
                  <td>{formatPrice(unit.price)}</td>
                  <td>{getTenantName(unit.tenantId)}</td>
                  <td><span className={statusClass(unit.status)}>{unit.status}</span></td>
                  <td>
                    {unit.tenantId ? (
                      <button className="table-action" type="button" onClick={(e) => { e.stopPropagation(); unassignUnit(unit.id); }}>
                        <Unlink size={13} style={{ verticalAlign: "middle", marginRight: 4 }} />
                        Desasignar
                      </button>
                    ) : unit.status !== "Mantenimiento" ? (
                      <button className="table-action" type="button" onClick={(e) => { e.stopPropagation(); setSelectedTenant(""); setShowAssign(unit.id); }}>
                        <LinkIcon size={13} style={{ verticalAlign: "middle", marginRight: 4 }} />
                        Asignar
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>

      {/* Modal: Agregar propiedad */}
      {showAdd && (
        <div className="modal-backdrop" onClick={() => setShowAdd(false)}>
          <div className="modal modal--large" onClick={(e) => e.stopPropagation()}>
            <h2>Nueva propiedad</h2>
            
            {/* Unit type selector */}
            <div className="unit-type-grid">
              {UNIT_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  className={`unit-type-option ${unitType === t.value ? "unit-type-option--selected" : ""}`}
                  onClick={() => setUnitType(t.value)}
                >
                  <span className="unit-type-icon">{t.icon}</span>
                  <span className="unit-type-label">{t.label}</span>
                </button>
              ))}
            </div>

            <div className="form-grid">
              {/* Common required fields */}
              <label className="field field--full">
                Nombre de la propiedad *
                <input placeholder="Ej: Departamento Vista al Mar" value={name} onChange={(e) => setName(e.target.value)} />
              </label>
              
              <label className="field">
                Renta mensual (MXN) *
                <input type="number" placeholder="Ej: 4500" value={price} onChange={(e) => setPrice(e.target.value)} />
              </label>
              
              <label className="field">
                Ubicación *
                <input placeholder="Ej: Col. Roma Norte, CDMX" value={location} onChange={(e) => setLocation(e.target.value)} />
              </label>

              {/* Type-specific required fields */}
              {requiredFields.includes("tower") && (
                <label className="field">
                  Torre / Edificio *
                  <input placeholder="Ej: Torre A" value={tower} onChange={(e) => setTower(e.target.value)} />
                </label>
              )}
              
              {requiredFields.includes("floor") && (
                <label className="field">
                  Piso *
                  <input type="number" placeholder="Ej: 5" value={floor} onChange={(e) => setFloor(e.target.value)} />
                </label>
              )}
              
              {requiredFields.includes("apartmentNumber") && (
                <label className="field">
                  Número de departamento *
                  <input placeholder="Ej: 301" value={apartmentNumber} onChange={(e) => setApartmentNumber(e.target.value)} />
                </label>
              )}
              
              {requiredFields.includes("bedrooms") && (
                <label className="field">
                  Recámaras *
                  <input type="number" placeholder="Ej: 2" value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} />
                </label>
              )}
              
              {requiredFields.includes("bathrooms") && (
                <label className="field">
                  Baños *
                  <input type="number" placeholder="Ej: 1" value={bathrooms} onChange={(e) => setBathrooms(e.target.value)} />
                </label>
              )}
              
              {requiredFields.includes("areaSqm") && (
                <label className="field">
                  Área (m²) *
                  <input type="number" placeholder="Ej: 85" value={areaSqm} onChange={(e) => setAreaSqm(e.target.value)} />
                </label>
              )}

              {/* Optional fields based on type */}
              {optionalFields.includes("tower") && !requiredFields.includes("tower") && (
                <label className="field">
                  Torre / Edificio
                  <input placeholder="Ej: Torre A" value={tower} onChange={(e) => setTower(e.target.value)} />
                </label>
              )}

              {optionalFields.includes("floor") && !requiredFields.includes("floor") && (
                <label className="field">
                  Piso
                  <input type="number" placeholder="Ej: 5" value={floor} onChange={(e) => setFloor(e.target.value)} />
                </label>
              )}

              {optionalFields.includes("bedrooms") && !requiredFields.includes("bedrooms") && (
                <label className="field">
                  Recámaras
                  <input type="number" placeholder="Ej: 2" value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} />
                </label>
              )}
              
              {optionalFields.includes("bathrooms") && !requiredFields.includes("bathrooms") && (
                <label className="field">
                  Baños
                  <input type="number" placeholder="Ej: 1" value={bathrooms} onChange={(e) => setBathrooms(e.target.value)} />
                </label>
              )}

              {optionalFields.includes("parkingSpots") && (
                <label className="field">
                  Estacionamientos
                  <input type="number" placeholder="Ej: 1" value={parkingSpots} onChange={(e) => setParkingSpots(e.target.value)} />
                </label>
              )}

              {optionalFields.includes("hasYard") && (
                <label className="field field--checkbox">
                  <input type="checkbox" checked={hasYard} onChange={(e) => setHasYard(e.target.checked)} />
                  <span>Tiene jardín</span>
                </label>
              )}

              {optionalFields.includes("furnished") && (
                <label className="field field--checkbox">
                  <input type="checkbox" checked={furnished} onChange={(e) => setFurnished(e.target.checked)} />
                  <span>Amueblado</span>
                </label>
              )}

              {/* Photo upload section */}
              <div className="field field--full">
                <span>Foto de la propiedad (opcional)</span>
                
                {photoPreview || photoUrl ? (
                  <div className="photo-preview-container">
                    <img src={photoPreview || photoUrl} alt="Vista previa" className="photo-preview-img" />
                    <button type="button" className="photo-remove-btn" onClick={clearPhoto}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                ) : (
                  <div
                    className={`photo-upload-zone ${isDragging ? "photo-upload-zone--dragging" : ""}`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload size={24} className="photo-upload-icon" />
                    <p className="photo-upload-text">Arrastra una imagen o haz clic para seleccionar</p>
                    <p className="photo-upload-hint">JPG, PNG o WebP (máx. 5MB)</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="photo-upload-input"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file);
                      }}
                    />
                  </div>
                )}

                <div className="photo-url-fallback">
                  <span className="photo-url-divider">o pega una URL</span>
                  <input 
                    placeholder="https://ejemplo.com/foto.jpg" 
                    value={photoPreview ? "" : photoUrl} 
                    onChange={(e) => { setPhotoUrl(e.target.value); setPhotoPreview(null); }}
                    disabled={!!photoPreview}
                  />
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button className="secondary-button" type="button" onClick={() => { resetAddForm(); setShowAdd(false); }}>Cancelar</button>
              <button className="primary-button" type="button" onClick={handleAdd}>Agregar propiedad</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Asignar inquilino */}
      {showAssign && (
        <div className="modal-backdrop" onClick={() => setShowAssign(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Asignar inquilino</h2>
            {unassignedTenants.length === 0 ? (
              <p className="muted">No hay inquilinos disponibles sin unidad asignada.</p>
            ) : (
              <div className="form-grid">
                <label className="field">
                  Inquilino
                  <select
                    className="field-select"
                    value={selectedTenant}
                    onChange={(e) => setSelectedTenant(e.target.value)}
                  >
                    <option value="">Seleccionar inquilino...</option>
                    {unassignedTenants.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </label>
              </div>
            )}
            <div className="modal-actions">
              <button className="secondary-button" type="button" onClick={() => setShowAssign(null)}>Cancelar</button>
              {unassignedTenants.length > 0 && (
                <button className="primary-button" type="button" onClick={handleAssign} disabled={!selectedTenant}>Asignar</button>
              )}
            </div>
          </div>
        </div>
      )}
    </BackofficeShell>
  );
}
