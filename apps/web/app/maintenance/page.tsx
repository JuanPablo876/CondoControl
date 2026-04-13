"use client";

import { useState } from "react";
import { 
  Wrench, 
  Plus, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  XCircle,
  ChevronDown,
  ChevronUp,
  User,
  Home,
  Calendar,
  MessageSquare,
  Filter,
  Search
} from "lucide-react";
import { BackofficeShell } from "../../components/BackofficeShell";
import { useData } from "../../context/DataContext";

type TicketPriority = "baja" | "media" | "alta" | "urgente";
type TicketStatus = "abierto" | "en_progreso" | "completado" | "cancelado";
type TicketCategory = "plomeria" | "electricidad" | "pintura" | "cerrajeria" | "limpieza" | "otro";

type MaintenanceTicket = {
  id: string;
  unitId: string;
  tenantId: string | null;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  notes: string[];
};

const categoryLabels: Record<TicketCategory, string> = {
  plomeria: "Plomería",
  electricidad: "Electricidad",
  pintura: "Pintura",
  cerrajeria: "Cerrajería",
  limpieza: "Limpieza",
  otro: "Otro"
};

const categoryIcons: Record<TicketCategory, string> = {
  plomeria: "🔧",
  electricidad: "⚡",
  pintura: "🎨",
  cerrajeria: "🔑",
  limpieza: "🧹",
  otro: "📦"
};

const priorityLabels: Record<TicketPriority, string> = {
  baja: "Baja",
  media: "Media",
  alta: "Alta",
  urgente: "Urgente"
};

const statusLabels: Record<TicketStatus, string> = {
  abierto: "Abierto",
  en_progreso: "En progreso",
  completado: "Completado",
  cancelado: "Cancelado"
};

// Demo data
const initialTickets: MaintenanceTicket[] = [
  {
    id: "MT-001",
    unitId: "u2",
    tenantId: "t2",
    category: "plomeria",
    priority: "urgente",
    status: "en_progreso",
    title: "Fuga de agua en baño",
    description: "Hay una fuga de agua en el baño principal, está goteando bastante desde la llave del lavabo.",
    createdAt: "2026-04-11T14:32:00",
    updatedAt: "2026-04-11T16:00:00",
    completedAt: null,
    notes: ["Plomero asignado: Juan Hernández", "Visita programada para mañana 9:00 AM"]
  },
  {
    id: "MT-002",
    unitId: "u1",
    tenantId: "t1",
    category: "electricidad",
    priority: "media",
    status: "abierto",
    title: "Falla en iluminación de cocina",
    description: "Las luces de la cocina parpadean intermitentemente. Ya cambiaron los focos pero sigue el problema.",
    createdAt: "2026-04-10T10:15:00",
    updatedAt: "2026-04-10T10:15:00",
    completedAt: null,
    notes: []
  },
  {
    id: "MT-003",
    unitId: "u3",
    tenantId: "t3",
    category: "cerrajeria",
    priority: "alta",
    status: "completado",
    title: "Cerradura de puerta principal dañada",
    description: "La cerradura no gira correctamente, a veces se atora y no pueden abrir.",
    createdAt: "2026-04-08T09:00:00",
    updatedAt: "2026-04-09T11:30:00",
    completedAt: "2026-04-09T11:30:00",
    notes: ["Se cambió la cerradura completa", "Costo: $850 MXN"]
  },
  {
    id: "MT-004",
    unitId: "u5",
    tenantId: null,
    category: "pintura",
    priority: "baja",
    status: "abierto",
    title: "Retoques de pintura para entrega",
    description: "Se necesitan retoques de pintura en paredes antes de entregar a nuevo inquilino.",
    createdAt: "2026-04-05T14:00:00",
    updatedAt: "2026-04-05T14:00:00",
    completedAt: null,
    notes: []
  },
];

function getPriorityClass(priority: TicketPriority) {
  switch (priority) {
    case "urgente": return "priority-badge priority-badge--urgent";
    case "alta": return "priority-badge priority-badge--high";
    case "media": return "priority-badge priority-badge--medium";
    case "baja": return "priority-badge priority-badge--low";
  }
}

function getStatusClass(status: TicketStatus) {
  switch (status) {
    case "abierto": return "status-pill status-pill--warning";
    case "en_progreso": return "status-pill status-pill--info";
    case "completado": return "status-pill status-pill--success";
    case "cancelado": return "status-pill status-pill--muted";
  }
}

function getStatusIcon(status: TicketStatus) {
  switch (status) {
    case "abierto": return <Clock size={14} />;
    case "en_progreso": return <Wrench size={14} />;
    case "completado": return <CheckCircle size={14} />;
    case "cancelado": return <XCircle size={14} />;
  }
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("es-MX", { 
    day: "numeric", 
    month: "short", 
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

export default function MaintenancePage() {
  const { units, tenants, getUnitName, getTenantName } = useData();
  const [tickets, setTickets] = useState<MaintenanceTicket[]>(initialTickets);
  const [expandedTicket, setExpandedTicket] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<TicketStatus | "all">("all");
  const [filterPriority, setFilterPriority] = useState<TicketPriority | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewModal, setShowNewModal] = useState(false);
  
  // New ticket form
  const [newTicket, setNewTicket] = useState({
    unitId: "",
    category: "otro" as TicketCategory,
    priority: "media" as TicketPriority,
    title: "",
    description: ""
  });

  // Stats
  const openCount = tickets.filter(t => t.status === "abierto").length;
  const inProgressCount = tickets.filter(t => t.status === "en_progreso").length;
  const urgentCount = tickets.filter(t => t.priority === "urgente" && t.status !== "completado" && t.status !== "cancelado").length;
  const completedCount = tickets.filter(t => t.status === "completado").length;

  // Filter tickets
  const filteredTickets = tickets.filter(t => {
    if (filterStatus !== "all" && t.status !== filterStatus) return false;
    if (filterPriority !== "all" && t.priority !== filterPriority) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const unitName = getUnitName(t.unitId).toLowerCase();
      const tenantName = t.tenantId ? getTenantName(t.tenantId).toLowerCase() : "";
      if (!t.title.toLowerCase().includes(query) && 
          !t.description.toLowerCase().includes(query) &&
          !unitName.includes(query) &&
          !tenantName.includes(query) &&
          !t.id.toLowerCase().includes(query)) {
        return false;
      }
    }
    return true;
  });

  const handleCreateTicket = () => {
    if (!newTicket.unitId || !newTicket.title) return;
    
    const unit = units.find(u => u.id === newTicket.unitId);
    const ticket: MaintenanceTicket = {
      id: `MT-${String(tickets.length + 1).padStart(3, "0")}`,
      unitId: newTicket.unitId,
      tenantId: unit?.tenantId || null,
      category: newTicket.category,
      priority: newTicket.priority,
      status: "abierto",
      title: newTicket.title,
      description: newTicket.description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completedAt: null,
      notes: []
    };
    
    setTickets([ticket, ...tickets]);
    setShowNewModal(false);
    setNewTicket({ unitId: "", category: "otro", priority: "media", title: "", description: "" });
  };

  const updateTicketStatus = (ticketId: string, newStatus: TicketStatus) => {
    setTickets(tickets.map(t => {
      if (t.id === ticketId) {
        return {
          ...t,
          status: newStatus,
          updatedAt: new Date().toISOString(),
          completedAt: newStatus === "completado" ? new Date().toISOString() : t.completedAt
        };
      }
      return t;
    }));
  };

  return (
    <BackofficeShell title="Mantenimiento" description="Gestiona tickets de reparaciones y solicitudes de mantenimiento.">
      {/* Stats Row */}
      <div className="maint-stats-row">
        <div className="maint-stat-card">
          <div className="maint-stat-icon maint-stat-icon--warning">
            <Clock size={20} />
          </div>
          <div className="maint-stat-content">
            <span className="maint-stat-value">{openCount}</span>
            <span className="maint-stat-label">Abiertos</span>
          </div>
        </div>
        <div className="maint-stat-card">
          <div className="maint-stat-icon maint-stat-icon--info">
            <Wrench size={20} />
          </div>
          <div className="maint-stat-content">
            <span className="maint-stat-value">{inProgressCount}</span>
            <span className="maint-stat-label">En progreso</span>
          </div>
        </div>
        <div className="maint-stat-card">
          <div className="maint-stat-icon maint-stat-icon--danger">
            <AlertTriangle size={20} />
          </div>
          <div className="maint-stat-content">
            <span className="maint-stat-value">{urgentCount}</span>
            <span className="maint-stat-label">Urgentes</span>
          </div>
        </div>
        <div className="maint-stat-card">
          <div className="maint-stat-icon maint-stat-icon--success">
            <CheckCircle size={20} />
          </div>
          <div className="maint-stat-content">
            <span className="maint-stat-value">{completedCount}</span>
            <span className="maint-stat-label">Completados</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="maint-controls">
        <div className="maint-search">
          <Search size={16} />
          <input 
            type="text"
            placeholder="Buscar tickets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="maint-filters">
          <div className="maint-filter">
            <Filter size={14} />
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value as TicketStatus | "all")}
            >
              <option value="all">Todos los estados</option>
              <option value="abierto">Abiertos</option>
              <option value="en_progreso">En progreso</option>
              <option value="completado">Completados</option>
              <option value="cancelado">Cancelados</option>
            </select>
          </div>
          
          <div className="maint-filter">
            <select 
              value={filterPriority} 
              onChange={(e) => setFilterPriority(e.target.value as TicketPriority | "all")}
            >
              <option value="all">Todas las prioridades</option>
              <option value="urgente">Urgente</option>
              <option value="alta">Alta</option>
              <option value="media">Media</option>
              <option value="baja">Baja</option>
            </select>
          </div>
        </div>

        <button className="primary-button" onClick={() => setShowNewModal(true)}>
          <Plus size={16} />
          Nuevo ticket
        </button>
      </div>

      {/* Tickets List */}
      <div className="maint-tickets-list">
        {filteredTickets.length === 0 ? (
          <div className="maint-empty">
            <Wrench size={48} />
            <p>No hay tickets que mostrar</p>
          </div>
        ) : (
          filteredTickets.map((ticket) => {
            const isExpanded = expandedTicket === ticket.id;
            return (
              <article key={ticket.id} className="maint-ticket">
                <button
                  className="maint-ticket-header"
                  onClick={() => setExpandedTicket(isExpanded ? null : ticket.id)}
                  type="button"
                >
                  <div className="maint-ticket-left">
                    <span className="maint-ticket-category">{categoryIcons[ticket.category]}</span>
                    <div className="maint-ticket-info">
                      <div className="maint-ticket-title-row">
                        <span className="maint-ticket-id">{ticket.id}</span>
                        <span className="maint-ticket-title">{ticket.title}</span>
                      </div>
                      <div className="maint-ticket-meta">
                        <span><Home size={12} /> {getUnitName(ticket.unitId)}</span>
                        {ticket.tenantId && (
                          <span><User size={12} /> {getTenantName(ticket.tenantId)}</span>
                        )}
                        <span><Calendar size={12} /> {formatDate(ticket.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="maint-ticket-right">
                    <span className={getPriorityClass(ticket.priority)}>{priorityLabels[ticket.priority]}</span>
                    <span className={getStatusClass(ticket.status)}>{statusLabels[ticket.status]}</span>
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="maint-ticket-body">
                    <div className="maint-ticket-description">
                      <h4>Descripción</h4>
                      <p>{ticket.description}</p>
                    </div>

                    {ticket.notes.length > 0 && (
                      <div className="maint-ticket-notes">
                        <h4><MessageSquare size={14} /> Notas ({ticket.notes.length})</h4>
                        <ul>
                          {ticket.notes.map((note, i) => (
                            <li key={i}>{note}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="maint-ticket-actions">
                      <span className="maint-ticket-updated">
                        Actualizado: {formatDate(ticket.updatedAt)}
                      </span>
                      
                      {ticket.status !== "completado" && ticket.status !== "cancelado" && (
                        <div className="maint-ticket-btns">
                          {ticket.status === "abierto" && (
                            <button 
                              className="secondary-button"
                              onClick={() => updateTicketStatus(ticket.id, "en_progreso")}
                            >
                              <Wrench size={14} />
                              Iniciar trabajo
                            </button>
                          )}
                          {ticket.status === "en_progreso" && (
                            <button 
                              className="primary-button"
                              onClick={() => updateTicketStatus(ticket.id, "completado")}
                            >
                              <CheckCircle size={14} />
                              Marcar completado
                            </button>
                          )}
                          <button 
                            className="ghost-button"
                            onClick={() => updateTicketStatus(ticket.id, "cancelado")}
                          >
                            <XCircle size={14} />
                            Cancelar
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </article>
            );
          })
        )}
      </div>

      {/* New Ticket Modal */}
      {showNewModal && (
        <div className="modal-overlay" onClick={() => setShowNewModal(false)}>
          <div className="modal modal--large" onClick={e => e.stopPropagation()}>
            <h2><Wrench size={18} /> Nuevo ticket de mantenimiento</h2>
            
            <div className="form-grid">
              <label className="field">
                <span>Propiedad *</span>
                <select 
                  value={newTicket.unitId}
                  onChange={(e) => setNewTicket({ ...newTicket, unitId: e.target.value })}
                >
                  <option value="">Seleccionar propiedad</option>
                  {units.map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span>Categoría</span>
                <select 
                  value={newTicket.category}
                  onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value as TicketCategory })}
                >
                  {Object.entries(categoryLabels).map(([key, label]) => (
                    <option key={key} value={key}>{categoryIcons[key as TicketCategory]} {label}</option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span>Prioridad</span>
                <select 
                  value={newTicket.priority}
                  onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value as TicketPriority })}
                >
                  {Object.entries(priorityLabels).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </label>

              <label className="field field--full">
                <span>Título del problema *</span>
                <input 
                  type="text"
                  placeholder="Ej: Fuga de agua en baño"
                  value={newTicket.title}
                  onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                />
              </label>

              <label className="field field--full">
                <span>Descripción</span>
                <textarea 
                  placeholder="Describe el problema con más detalle..."
                  rows={4}
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                />
              </label>
            </div>

            <div className="modal-actions">
              <button className="secondary-button" onClick={() => setShowNewModal(false)}>
                Cancelar
              </button>
              <button 
                className="primary-button" 
                onClick={handleCreateTicket}
                disabled={!newTicket.unitId || !newTicket.title}
              >
                <Plus size={16} />
                Crear ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </BackofficeShell>
  );
}
