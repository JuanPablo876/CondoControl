"use client";

import { 
  Building2, 
  Wallet, 
  Users, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Home,
  Wrench,
  Calendar,
  MessageSquare,
  Mail,
  Phone
} from "lucide-react";
import { BackofficeShell } from "../../components/BackofficeShell";
import { useData, UNIT_TYPES } from "../../context/DataContext";

// Activity log demo
const recentActivity = [
  { id: 1, type: "payment", icon: Wallet, text: "Carlos Perez pagó $4,500 MXN", time: "Hace 2 horas", color: "#27a644" },
  { id: 2, type: "message", icon: MessageSquare, text: "Mensaje enviado a Maria Gutierrez", time: "Hace 3 horas", color: "#5e6ad2" },
  { id: 3, type: "maintenance", icon: Wrench, text: "Ticket MT-001 marcado como urgente", time: "Hace 5 horas", color: "#e5484d" },
  { id: 4, type: "contract", icon: Calendar, text: "Contrato de Jorge Medina vence en 30 días", time: "Ayer", color: "#e3aa00" },
  { id: 5, type: "email", icon: Mail, text: "Recordatorio de pago enviado a 3 inquilinos", time: "Ayer", color: "#5e6ad2" },
];

// Donut/Pie chart component
function DonutChart({ data, size = 160, strokeWidth = 24 }: { 
  data: { label: string; value: number; color: string }[];
  size?: number;
  strokeWidth?: number;
}) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  let currentOffset = 0;
  
  return (
    <div className="donut-chart-container">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {data.map((item, i) => {
          const percentage = total > 0 ? item.value / total : 0;
          const strokeDasharray = `${circumference * percentage} ${circumference * (1 - percentage)}`;
          const rotation = currentOffset * 360 - 90;
          currentOffset += percentage;
          
          return (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={item.color}
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDasharray}
              transform={`rotate(${rotation} ${size / 2} ${size / 2})`}
              className="donut-segment"
            />
          );
        })}
      </svg>
      <div className="donut-center">
        <span className="donut-total">${(total / 1000).toFixed(0)}k</span>
        <span className="donut-label">MXN</span>
      </div>
    </div>
  );
}

// Mini bar chart
function MiniBarChart({ data }: { data: { month: string; value: number }[] }) {
  const max = Math.max(...data.map(d => d.value));
  
  return (
    <div className="mini-bar-chart">
      {data.map((item, i) => (
        <div key={i} className="mini-bar-wrapper">
          <div 
            className="mini-bar"
            style={{ height: `${(item.value / max) * 100}%` }}
            title={`$${item.value.toLocaleString()}`}
          />
          <span className="mini-bar-label">{item.month}</span>
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const { units, tenants } = useData();
  
  // Calculate real metrics
  const totalUnits = units.length;
  const occupiedUnits = units.filter(u => u.status === "Ocupada").length;
  const vacantUnits = units.filter(u => u.status === "Vacante").length;
  const maintenanceUnits = units.filter(u => u.status === "Mantenimiento").length;
  const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;
  
  const totalTenants = tenants.length;
  const tenantsOnTime = tenants.filter(t => t.status === "Al dia").length;
  const tenantsPending = tenants.filter(t => t.status === "Pendiente").length;
  const tenantsOverdue = tenants.filter(t => t.status === "Mora").length;
  
  const monthlyIncome = units.filter(u => u.status === "Ocupada").reduce((sum, u) => sum + u.price, 0);
  const expectedIncome = units.reduce((sum, u) => sum + u.price, 0);
  const pendingAmount = tenants.filter(t => t.status === "Pendiente" || t.status === "Mora")
    .reduce((sum, t) => {
      const unit = units.find(u => u.tenantId === t.id);
      return sum + (unit?.price || 0);
    }, 0);
  
  // Income by property type
  const incomeByType = UNIT_TYPES.map(type => {
    const typeUnits = units.filter(u => u.unitType === type.value && u.status === "Ocupada");
    const income = typeUnits.reduce((sum, u) => sum + u.price, 0);
    return { label: type.label, value: income, icon: type.icon };
  }).filter(d => d.value > 0);

  const typeColors = ["#5e6ad2", "#27a644", "#e3aa00", "#e5484d", "#10b981", "#8b5cf6"];
  const pieData = incomeByType.map((d, i) => ({
    ...d,
    color: typeColors[i % typeColors.length]
  }));

  // Monthly data (demo)
  const monthlyData = [
    { month: "Ene", value: 14500 },
    { month: "Feb", value: 14500 },
    { month: "Mar", value: 12700 },
    { month: "Abr", value: monthlyIncome },
  ];

  // Compare with last month
  const lastMonth = monthlyData[monthlyData.length - 2]?.value || monthlyIncome;
  const incomeChange = lastMonth > 0 ? Math.round(((monthlyIncome - lastMonth) / lastMonth) * 100) : 0;

  return (
    <BackofficeShell title="Dashboard" description="Resumen operativo del cobro y seguimiento de rentas.">
      {/* KPI Cards */}
      <div className="dashboard-kpi-grid">
        <article className="dashboard-kpi-card dashboard-kpi-card--primary">
          <div className="dashboard-kpi-header">
            <div className="dashboard-kpi-icon">
              <Wallet size={20} />
            </div>
            <div className={`dashboard-kpi-change ${incomeChange >= 0 ? 'dashboard-kpi-change--up' : 'dashboard-kpi-change--down'}`}>
              {incomeChange >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              {Math.abs(incomeChange)}%
            </div>
          </div>
          <div className="dashboard-kpi-value">${monthlyIncome.toLocaleString()}</div>
          <div className="dashboard-kpi-label">Ingresos este mes</div>
        </article>

        <article className="dashboard-kpi-card">
          <div className="dashboard-kpi-header">
            <div className="dashboard-kpi-icon dashboard-kpi-icon--success">
              <Building2 size={20} />
            </div>
            <span className="dashboard-kpi-badge">{occupiedUnits}/{totalUnits}</span>
          </div>
          <div className="dashboard-kpi-value">{occupancyRate}%</div>
          <div className="dashboard-kpi-label">Ocupación</div>
        </article>

        <article className="dashboard-kpi-card">
          <div className="dashboard-kpi-header">
            <div className="dashboard-kpi-icon dashboard-kpi-icon--warning">
              <Clock size={20} />
            </div>
          </div>
          <div className="dashboard-kpi-value">${pendingAmount.toLocaleString()}</div>
          <div className="dashboard-kpi-label">Por cobrar</div>
        </article>

        <article className="dashboard-kpi-card">
          <div className="dashboard-kpi-header">
            <div className="dashboard-kpi-icon dashboard-kpi-icon--danger">
              <AlertTriangle size={20} />
            </div>
          </div>
          <div className="dashboard-kpi-value">{tenantsOverdue}</div>
          <div className="dashboard-kpi-label">En mora</div>
        </article>
      </div>

      {/* Charts Row */}
      <div className="dashboard-charts-row">
        {/* Income by Property Type */}
        <article className="card dashboard-chart-card">
          <h3>Ingresos por tipo de propiedad</h3>
          <div className="dashboard-pie-section">
            <DonutChart data={pieData} />
            <div className="dashboard-pie-legend">
              {pieData.map((item, i) => (
                <div key={i} className="dashboard-legend-item">
                  <span className="dashboard-legend-dot" style={{ background: item.color }} />
                  <span className="dashboard-legend-label">{item.label}</span>
                  <span className="dashboard-legend-value">${item.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </article>

        {/* Monthly Trend */}
        <article className="card dashboard-chart-card">
          <h3>Tendencia mensual</h3>
          <div className="dashboard-trend-section">
            <MiniBarChart data={monthlyData} />
            <div className="dashboard-trend-summary">
              <div className="dashboard-trend-item">
                <span className="dashboard-trend-label">Promedio</span>
                <span className="dashboard-trend-value">
                  ${Math.round(monthlyData.reduce((s, d) => s + d.value, 0) / monthlyData.length).toLocaleString()}
                </span>
              </div>
              <div className="dashboard-trend-item">
                <span className="dashboard-trend-label">Mejor mes</span>
                <span className="dashboard-trend-value">
                  ${Math.max(...monthlyData.map(d => d.value)).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </article>
      </div>

      {/* Bottom Row */}
      <div className="dashboard-bottom-row">
        {/* Status Overview */}
        <article className="card dashboard-status-card">
          <h3>Estado del portafolio</h3>
          
          <div className="dashboard-status-section">
            <h4>Propiedades</h4>
            <div className="dashboard-status-bars">
              <div className="dashboard-status-bar">
                <div className="dashboard-status-bar-info">
                  <span><Home size={14} /> Ocupadas</span>
                  <span>{occupiedUnits}</span>
                </div>
                <div className="dashboard-status-bar-track">
                  <div 
                    className="dashboard-status-bar-fill dashboard-status-bar-fill--success"
                    style={{ width: `${(occupiedUnits / totalUnits) * 100}%` }}
                  />
                </div>
              </div>
              <div className="dashboard-status-bar">
                <div className="dashboard-status-bar-info">
                  <span><Building2 size={14} /> Vacantes</span>
                  <span>{vacantUnits}</span>
                </div>
                <div className="dashboard-status-bar-track">
                  <div 
                    className="dashboard-status-bar-fill dashboard-status-bar-fill--warning"
                    style={{ width: `${(vacantUnits / totalUnits) * 100}%` }}
                  />
                </div>
              </div>
              <div className="dashboard-status-bar">
                <div className="dashboard-status-bar-info">
                  <span><Wrench size={14} /> Mantenimiento</span>
                  <span>{maintenanceUnits}</span>
                </div>
                <div className="dashboard-status-bar-track">
                  <div 
                    className="dashboard-status-bar-fill dashboard-status-bar-fill--muted"
                    style={{ width: `${(maintenanceUnits / totalUnits) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="dashboard-status-section">
            <h4>Pagos de inquilinos</h4>
            <div className="dashboard-status-bars">
              <div className="dashboard-status-bar">
                <div className="dashboard-status-bar-info">
                  <span><CheckCircle size={14} /> Al día</span>
                  <span>{tenantsOnTime}</span>
                </div>
                <div className="dashboard-status-bar-track">
                  <div 
                    className="dashboard-status-bar-fill dashboard-status-bar-fill--success"
                    style={{ width: `${(tenantsOnTime / totalTenants) * 100}%` }}
                  />
                </div>
              </div>
              <div className="dashboard-status-bar">
                <div className="dashboard-status-bar-info">
                  <span><Clock size={14} /> Pendiente</span>
                  <span>{tenantsPending}</span>
                </div>
                <div className="dashboard-status-bar-track">
                  <div 
                    className="dashboard-status-bar-fill dashboard-status-bar-fill--warning"
                    style={{ width: `${(tenantsPending / totalTenants) * 100}%` }}
                  />
                </div>
              </div>
              <div className="dashboard-status-bar">
                <div className="dashboard-status-bar-info">
                  <span><AlertTriangle size={14} /> En mora</span>
                  <span>{tenantsOverdue}</span>
                </div>
                <div className="dashboard-status-bar-track">
                  <div 
                    className="dashboard-status-bar-fill dashboard-status-bar-fill--danger"
                    style={{ width: `${(tenantsOverdue / totalTenants) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </article>

        {/* Recent Activity */}
        <article className="card dashboard-activity-card">
          <h3>Actividad reciente</h3>
          <div className="dashboard-activity-list">
            {recentActivity.map((item) => (
              <div key={item.id} className="dashboard-activity-item">
                <div className="dashboard-activity-icon" style={{ color: item.color }}>
                  <item.icon size={16} />
                </div>
                <div className="dashboard-activity-content">
                  <span className="dashboard-activity-text">{item.text}</span>
                  <span className="dashboard-activity-time">{item.time}</span>
                </div>
              </div>
            ))}
          </div>
        </article>
      </div>
    </BackofficeShell>
  );
}
