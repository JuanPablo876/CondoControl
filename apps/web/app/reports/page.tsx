"use client";

import { useState } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Home, 
  Users, 
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Percent,
  AlertTriangle
} from "lucide-react";
import { BackofficeShell } from "../../components/BackofficeShell";
import { useData } from "../../context/DataContext";

type TimeRange = "6m" | "12m" | "all";

// Demo monthly data
const monthlyData = [
  { month: "Nov 2025", income: 14500, expected: 14500, occupancy: 100, collected: 100 },
  { month: "Dic 2025", income: 14500, expected: 14500, occupancy: 100, collected: 100 },
  { month: "Ene 2026", income: 14500, expected: 14500, occupancy: 100, collected: 100 },
  { month: "Feb 2026", income: 14500, expected: 14500, occupancy: 100, collected: 100 },
  { month: "Mar 2026", income: 12700, expected: 14500, occupancy: 100, collected: 87.6 },
  { month: "Abr 2026", income: 4500, expected: 14500, occupancy: 60, collected: 31 },
];

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-MX", { 
    style: "currency", 
    currency: "MXN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

// Simple bar chart component
function BarChart({ data, dataKey, color, maxValue }: { 
  data: typeof monthlyData; 
  dataKey: "income" | "occupancy" | "collected";
  color: string;
  maxValue: number;
}) {
  return (
    <div className="chart-bars">
      {data.map((item, i) => {
        const value = item[dataKey];
        const height = (value / maxValue) * 100;
        return (
          <div key={i} className="chart-bar-wrapper">
            <div 
              className="chart-bar" 
              style={{ 
                height: `${height}%`,
                backgroundColor: color
              }}
              title={dataKey === "income" ? formatCurrency(value) : `${value}%`}
            />
            <span className="chart-bar-label">{item.month.split(" ")[0]}</span>
          </div>
        );
      })}
    </div>
  );
}

// Trend line component  
function TrendLine({ data, dataKey, color }: {
  data: typeof monthlyData;
  dataKey: "income" | "collected";
  color: string;
}) {
  const values = data.map(d => d[dataKey]);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  
  const points = values.map((v, i) => {
    const x = (i / (values.length - 1)) * 100;
    const y = 100 - ((v - min) / range) * 80 - 10;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg className="trend-line-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {values.map((v, i) => {
        const x = (i / (values.length - 1)) * 100;
        const y = 100 - ((v - min) / range) * 80 - 10;
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r="3"
            fill={color}
          />
        );
      })}
    </svg>
  );
}

export default function ReportsPage() {
  const { units, tenants } = useData();
  const [timeRange, setTimeRange] = useState<TimeRange>("6m");

  // Calculate real stats
  const totalUnits = units.length;
  const occupiedUnits = units.filter(u => u.status === "Ocupada").length;
  const vacantUnits = units.filter(u => u.status === "Vacante").length;
  const maintenanceUnits = units.filter(u => u.status === "Mantenimiento").length;
  const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;
  
  const monthlyExpected = units.reduce((sum, u) => sum + u.price, 0);
  const monthlyCollected = units.filter(u => u.status === "Ocupada").reduce((sum, u) => sum + u.price, 0);
  const collectionRate = monthlyExpected > 0 ? Math.round((monthlyCollected / monthlyExpected) * 100) : 0;
  
  const tenantsOnTime = tenants.filter(t => t.status === "Al dia").length;
  const tenantsPending = tenants.filter(t => t.status === "Pendiente").length;
  const tenantsOverdue = tenants.filter(t => t.status === "Mora").length;

  // Calculate trends (comparing last month to previous)
  const lastMonthIncome = monthlyData[monthlyData.length - 1].income;
  const prevMonthIncome = monthlyData[monthlyData.length - 2].income;
  const incomeTrend = prevMonthIncome > 0 
    ? Math.round(((lastMonthIncome - prevMonthIncome) / prevMonthIncome) * 100) 
    : 0;

  const displayData = timeRange === "6m" 
    ? monthlyData 
    : timeRange === "12m" 
      ? monthlyData 
      : monthlyData;

  return (
    <BackofficeShell title="Reportes" description="Visualiza el rendimiento de tu portafolio de propiedades.">
      {/* Time range selector */}
      <div className="report-controls">
        <div className="report-tabs">
          <button
            className={`report-tab ${timeRange === "6m" ? "report-tab--active" : ""}`}
            onClick={() => setTimeRange("6m")}
          >
            6 meses
          </button>
          <button
            className={`report-tab ${timeRange === "12m" ? "report-tab--active" : ""}`}
            onClick={() => setTimeRange("12m")}
          >
            12 meses
          </button>
          <button
            className={`report-tab ${timeRange === "all" ? "report-tab--active" : ""}`}
            onClick={() => setTimeRange("all")}
          >
            Todo
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="report-kpi-grid">
        <article className="report-kpi-card">
          <div className="report-kpi-header">
            <div className="report-kpi-icon report-kpi-icon--primary">
              <DollarSign size={20} />
            </div>
            <div className={`report-kpi-trend ${incomeTrend >= 0 ? "report-kpi-trend--up" : "report-kpi-trend--down"}`}>
              {incomeTrend >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              {Math.abs(incomeTrend)}%
            </div>
          </div>
          <div className="report-kpi-value">{formatCurrency(monthlyCollected)}</div>
          <div className="report-kpi-label">Ingresos este mes</div>
          <div className="report-kpi-sub">Esperado: {formatCurrency(monthlyExpected)}</div>
        </article>

        <article className="report-kpi-card">
          <div className="report-kpi-header">
            <div className="report-kpi-icon report-kpi-icon--success">
              <Home size={20} />
            </div>
            <span className="report-kpi-badge">{occupiedUnits}/{totalUnits}</span>
          </div>
          <div className="report-kpi-value">{occupancyRate}%</div>
          <div className="report-kpi-label">Tasa de ocupación</div>
          <div className="report-kpi-sub">{vacantUnits} vacantes, {maintenanceUnits} en mantenimiento</div>
        </article>

        <article className="report-kpi-card">
          <div className="report-kpi-header">
            <div className="report-kpi-icon report-kpi-icon--warning">
              <Percent size={20} />
            </div>
          </div>
          <div className="report-kpi-value">{collectionRate}%</div>
          <div className="report-kpi-label">Tasa de cobranza</div>
          <div className="report-kpi-sub">{tenantsOnTime} al día, {tenantsPending} pendientes</div>
        </article>

        <article className="report-kpi-card">
          <div className="report-kpi-header">
            <div className="report-kpi-icon report-kpi-icon--danger">
              <AlertTriangle size={20} />
            </div>
          </div>
          <div className="report-kpi-value">{tenantsOverdue}</div>
          <div className="report-kpi-label">Inquilinos en mora</div>
          <div className="report-kpi-sub">Requieren seguimiento</div>
        </article>
      </div>

      {/* Charts Row */}
      <div className="report-charts-grid">
        {/* Income Chart */}
        <article className="card report-chart-card">
          <div className="report-chart-header">
            <h3>Ingresos mensuales</h3>
            <span className="report-chart-legend">
              <span className="report-legend-dot" style={{ background: "var(--brand)" }}></span>
              Cobrado
            </span>
          </div>
          <div className="report-chart-container">
            <BarChart 
              data={displayData} 
              dataKey="income" 
              color="var(--brand)"
              maxValue={Math.max(...displayData.map(d => d.expected))}
            />
          </div>
          <div className="report-chart-footer">
            <span>Total período: {formatCurrency(displayData.reduce((s, d) => s + d.income, 0))}</span>
          </div>
        </article>

        {/* Collection Rate Chart */}
        <article className="card report-chart-card">
          <div className="report-chart-header">
            <h3>Tasa de cobranza</h3>
            <span className="report-chart-legend">
              <span className="report-legend-dot" style={{ background: "var(--success)" }}></span>
              % Cobrado
            </span>
          </div>
          <div className="report-chart-container">
            <BarChart 
              data={displayData} 
              dataKey="collected" 
              color="var(--success)"
              maxValue={100}
            />
          </div>
          <div className="report-chart-footer">
            <span>Promedio: {Math.round(displayData.reduce((s, d) => s + d.collected, 0) / displayData.length)}%</span>
          </div>
        </article>
      </div>

      {/* Occupancy Trend */}
      <article className="card">
        <div className="report-chart-header">
          <h3>Tendencia de ocupación</h3>
        </div>
        <div className="report-trend-container">
          <TrendLine data={displayData} dataKey="collected" color="var(--brand)" />
        </div>
        <div className="report-trend-labels">
          {displayData.map((d, i) => (
            <span key={i}>{d.month}</span>
          ))}
        </div>
      </article>

      {/* Payment Status Breakdown */}
      <article className="card">
        <h3 style={{ marginBottom: 16 }}>Desglose de pagos</h3>
        <div className="report-breakdown">
          <div className="report-breakdown-item">
            <div className="report-breakdown-bar">
              <div 
                className="report-breakdown-fill report-breakdown-fill--success"
                style={{ width: `${(tenantsOnTime / tenants.length) * 100}%` }}
              />
            </div>
            <div className="report-breakdown-info">
              <span className="report-breakdown-label">Al día</span>
              <span className="report-breakdown-value">{tenantsOnTime} inquilinos</span>
            </div>
          </div>
          <div className="report-breakdown-item">
            <div className="report-breakdown-bar">
              <div 
                className="report-breakdown-fill report-breakdown-fill--warning"
                style={{ width: `${(tenantsPending / tenants.length) * 100}%` }}
              />
            </div>
            <div className="report-breakdown-info">
              <span className="report-breakdown-label">Pendiente</span>
              <span className="report-breakdown-value">{tenantsPending} inquilinos</span>
            </div>
          </div>
          <div className="report-breakdown-item">
            <div className="report-breakdown-bar">
              <div 
                className="report-breakdown-fill report-breakdown-fill--danger"
                style={{ width: `${(tenantsOverdue / tenants.length) * 100}%` }}
              />
            </div>
            <div className="report-breakdown-info">
              <span className="report-breakdown-label">En mora</span>
              <span className="report-breakdown-value">{tenantsOverdue} inquilinos</span>
            </div>
          </div>
        </div>
      </article>
    </BackofficeShell>
  );
}
