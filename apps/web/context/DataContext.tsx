"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export type UnitStatus = "Ocupada" | "Vacante" | "Mantenimiento";

// Unit types with their required fields
export type UnitType = 
  | "departamento" 
  | "casa" 
  | "local_comercial" 
  | "oficina" 
  | "terreno" 
  | "bodega"
  | "cuarto";

export const UNIT_TYPES: { value: UnitType; label: string; icon: string }[] = [
  { value: "departamento", label: "Departamento", icon: "🏢" },
  { value: "casa", label: "Casa", icon: "🏠" },
  { value: "local_comercial", label: "Local comercial", icon: "🏪" },
  { value: "oficina", label: "Oficina", icon: "🏛️" },
  { value: "terreno", label: "Terreno", icon: "🌳" },
  { value: "bodega", label: "Bodega", icon: "📦" },
  { value: "cuarto", label: "Cuarto / Habitación", icon: "🛏️" },
];

export type Unit = {
  id: string;
  name: string;
  unitType: UnitType;
  price: number;
  location: string;
  photoUrl: string | null;
  tenantId: string | null;
  status: UnitStatus;
  // Type-specific fields (optional based on unitType)
  tower?: string;        // departamento, oficina
  floor?: number;        // departamento, oficina, local_comercial, bodega
  apartmentNumber?: string; // departamento
  bedrooms?: number;     // departamento, casa, cuarto
  bathrooms?: number;    // departamento, casa
  parkingSpots?: number; // departamento, casa, oficina
  hasYard?: boolean;     // casa
  areaSqm?: number;      // local_comercial, oficina, terreno, bodega
  furnished?: boolean;   // departamento, casa, oficina, cuarto
};

// Helper to get required fields per unit type
export function getRequiredFields(unitType: UnitType): string[] {
  const common = ["name", "price", "location"];
  switch (unitType) {
    case "departamento":
      return [...common, "tower", "floor", "apartmentNumber", "bedrooms"];
    case "casa":
      return [...common, "bedrooms", "bathrooms"];
    case "local_comercial":
      return [...common, "areaSqm"];
    case "oficina":
      return [...common, "floor", "areaSqm"];
    case "terreno":
      return [...common, "areaSqm"];
    case "bodega":
      return [...common, "areaSqm"];
    case "cuarto":
      return [...common];
    default:
      return common;
  }
}

// Helper to get optional fields per unit type
export function getOptionalFields(unitType: UnitType): string[] {
  switch (unitType) {
    case "departamento":
      return ["bathrooms", "parkingSpots", "furnished", "photoUrl"];
    case "casa":
      return ["parkingSpots", "hasYard", "furnished", "photoUrl"];
    case "local_comercial":
      return ["floor", "photoUrl"];
    case "oficina":
      return ["tower", "parkingSpots", "furnished", "photoUrl"];
    case "terreno":
      return ["photoUrl"];
    case "bodega":
      return ["floor", "photoUrl"];
    case "cuarto":
      return ["bedrooms", "furnished", "photoUrl"];
    default:
      return ["photoUrl"];
  }
}

export type TenantStatus = "Al dia" | "Pendiente" | "Mora";

export type BotLanguage = "es" | "en" | "pt";

export const LANGUAGES: { value: BotLanguage; label: string }[] = [
  { value: "es", label: "Español" },
  { value: "en", label: "English" },
  { value: "pt", label: "Português" },
];

export type Tenant = {
  id: string;
  name: string;
  email: string;
  phone: string;
  unitId: string | null;
  status: TenantStatus;
  language: BotLanguage;
  contractMonths: number | null; // Contract duration in months
  contractStartDate: string | null; // ISO date string YYYY-MM-DD
};

// Helper to calculate contract end date
export function getContractEndDate(tenant: Tenant): Date | null {
  if (!tenant.contractStartDate || !tenant.contractMonths) return null;
  const start = new Date(tenant.contractStartDate);
  start.setMonth(start.getMonth() + tenant.contractMonths);
  return start;
}

// Helper to get months remaining on contract
export function getContractMonthsRemaining(tenant: Tenant): number | null {
  const endDate = getContractEndDate(tenant);
  if (!endDate) return null;
  const now = new Date();
  const diffMs = endDate.getTime() - now.getTime();
  const months = Math.ceil(diffMs / (1000 * 60 * 60 * 24 * 30));
  return months;
}

type DataContextType = {
  units: Unit[];
  tenants: Tenant[];
  addUnit: (unit: Omit<Unit, "id" | "tenantId" | "status">) => void;
  addTenant: (tenant: Omit<Tenant, "id" | "unitId" | "status">) => void;
  deleteUnit: (unitId: string) => void;
  deleteTenant: (tenantId: string) => void;
  updateTenantLanguage: (tenantId: string, language: BotLanguage) => void;
  assignTenantToUnit: (tenantId: string, unitId: string) => void;
  unassignUnit: (unitId: string) => void;
  getTenantName: (tenantId: string | null) => string;
  getUnitName: (unitId: string | null) => string;
  getAvailableUnits: () => Unit[];
  getUnassignedTenants: () => Tenant[];
};

let nextId = 100;
function generateId() {
  return `id_${++nextId}`;
}

// Helper to format currency
function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(price);
}

const initialUnits: Unit[] = [
  { 
    id: "u1", 
    name: "Departamento A-301", 
    unitType: "departamento", 
    price: 4500,
    location: "Col. Roma Norte, CDMX",
    photoUrl: null,
    tenantId: "t1", 
    status: "Ocupada",
    tower: "Torre A",
    floor: 3,
    apartmentNumber: "301",
    bedrooms: 2,
    bathrooms: 1,
    parkingSpots: 1,
  },
  { 
    id: "u2", 
    name: "Departamento C-205", 
    unitType: "departamento", 
    price: 3800,
    location: "Col. Condesa, CDMX",
    photoUrl: null,
    tenantId: "t2", 
    status: "Ocupada",
    tower: "Torre C",
    floor: 2,
    apartmentNumber: "205",
    bedrooms: 1,
    bathrooms: 1,
  },
  { 
    id: "u3", 
    name: "Casa Jardines #45", 
    unitType: "casa", 
    price: 6200,
    location: "Jardines del Valle, Monterrey",
    photoUrl: null,
    tenantId: "t3", 
    status: "Ocupada",
    bedrooms: 3,
    bathrooms: 2,
    parkingSpots: 2,
    hasYard: true,
  },
  { 
    id: "u4", 
    name: "Local Plaza Centro #12", 
    unitType: "local_comercial", 
    price: 8500,
    location: "Plaza Centro, Guadalajara",
    photoUrl: null,
    tenantId: null, 
    status: "Vacante",
    floor: 1,
    areaSqm: 85,
  },
  { 
    id: "u5", 
    name: "Oficina Torre Ejecutiva", 
    unitType: "oficina", 
    price: 12000,
    location: "Av. Reforma 222, CDMX",
    photoUrl: null,
    tenantId: null, 
    status: "Mantenimiento",
    tower: "Torre B",
    floor: 4,
    areaSqm: 120,
    parkingSpots: 2,
    furnished: true,
  },
];

const initialTenants: Tenant[] = [
  { id: "t1", name: "Carlos Perez", email: "carlos@email.com", phone: "555-0101", unitId: "u1", status: "Al dia", language: "es", contractMonths: 12, contractStartDate: "2026-01-15" },
  { id: "t2", name: "Maria Gutierrez", email: "maria@email.com", phone: "555-0102", unitId: "u2", status: "Pendiente", language: "es", contractMonths: 6, contractStartDate: "2026-03-01" },
  { id: "t3", name: "Jorge Medina", email: "jorge@email.com", phone: "555-0103", unitId: "u3", status: "Mora", language: "en", contractMonths: 24, contractStartDate: "2025-06-01" },
];

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [units, setUnits] = useState<Unit[]>(initialUnits);
  const [tenants, setTenants] = useState<Tenant[]>(initialTenants);

  const addUnit = (data: Omit<Unit, "id" | "tenantId" | "status">) => {
    const newUnit: Unit = { ...data, id: generateId(), tenantId: null, status: "Vacante" };
    setUnits((prev) => [...prev, newUnit]);
  };

  const addTenant = (data: Omit<Tenant, "id" | "unitId" | "status">) => {
    const newTenant: Tenant = { ...data, id: generateId(), unitId: null, status: "Al dia" };
    setTenants((prev) => [...prev, newTenant]);
  };

  const updateTenantLanguage = (tenantId: string, language: BotLanguage) => {
    setTenants((prev) =>
      prev.map((t) => (t.id === tenantId ? { ...t, language } : t))
    );
  };

  const assignTenantToUnit = (tenantId: string, unitId: string) => {
    // Unlink previous assignments
    setUnits((prev) =>
      prev.map((u) => {
        if (u.id === unitId) return { ...u, tenantId, status: "Ocupada" as UnitStatus };
        if (u.tenantId === tenantId) return { ...u, tenantId: null, status: "Vacante" as UnitStatus };
        return u;
      })
    );
    setTenants((prev) =>
      prev.map((t) => {
        if (t.id === tenantId) return { ...t, unitId };
        if (t.unitId === unitId) return { ...t, unitId: null };
        return t;
      })
    );
  };

  const unassignUnit = (unitId: string) => {
    setUnits((prev) =>
      prev.map((u) => (u.id === unitId ? { ...u, tenantId: null, status: "Vacante" as UnitStatus } : u))
    );
    setTenants((prev) =>
      prev.map((t) => (t.unitId === unitId ? { ...t, unitId: null } : t))
    );
  };

  const deleteUnit = (unitId: string) => {
    // First unassign any tenant from this unit
    const unit = units.find(u => u.id === unitId);
    if (unit?.tenantId) {
      setTenants((prev) =>
        prev.map((t) => (t.unitId === unitId ? { ...t, unitId: null } : t))
      );
    }
    // Then delete the unit
    setUnits((prev) => prev.filter((u) => u.id !== unitId));
  };

  const deleteTenant = (tenantId: string) => {
    // First unassign from any unit
    const tenant = tenants.find(t => t.id === tenantId);
    if (tenant?.unitId) {
      setUnits((prev) =>
        prev.map((u) => (u.id === tenant.unitId ? { ...u, tenantId: null, status: "Vacante" as UnitStatus } : u))
      );
    }
    // Then delete the tenant
    setTenants((prev) => prev.filter((t) => t.id !== tenantId));
  };

  const getTenantName = (tenantId: string | null) => {
    if (!tenantId) return "—";
    return tenants.find((t) => t.id === tenantId)?.name ?? "—";
  };

  const getUnitName = (unitId: string | null) => {
    if (!unitId) return "Sin asignar";
    const unit = units.find((u) => u.id === unitId);
    return unit ? unit.name : "Sin asignar";
  };

  const getAvailableUnits = () => units.filter((u) => u.tenantId === null && u.status !== "Mantenimiento");

  const getUnassignedTenants = () => tenants.filter((t) => t.unitId === null);

  return (
    <DataContext.Provider
      value={{
        units,
        tenants,
        addUnit,
        addTenant,
        deleteUnit,
        deleteTenant,
        updateTenantLanguage,
        assignTenantToUnit,
        unassignUnit,
        getTenantName,
        getUnitName,
        getAvailableUnits,
        getUnassignedTenants,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
