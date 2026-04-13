import { BellRing, Building2, Wallet } from "lucide-react";
import { BackofficeShell } from "../../components/BackofficeShell";

const stats = [
  { label: "Propiedades activas", value: "12", icon: Building2, color: "#5e6ad2" },
  { label: "Pagos pendientes", value: "8", icon: Wallet, color: "#e6930a" },
  { label: "Recordatorios hoy", value: "23", icon: BellRing, color: "#10b981" }
];

export default function DashboardPage() {
  return (
    <BackofficeShell title="Dashboard" description="Resumen operativo del cobro y seguimiento de rentas.">
      <div className="stats-grid">
        {stats.map((item) => (
          <article className="card stat-card" key={item.label}>
            <div style={{ color: item.color }}>
              <item.icon size={20} />
            </div>
            <div>
              <p className="muted">{item.label}</p>
              <h2>{item.value}</h2>
            </div>
          </article>
        ))}
      </div>

      <article className="card">
        <h2>Actividad reciente</h2>
        <p className="muted" style={{ marginTop: 8 }}>
          Hoy se enviaron 16 mensajes por WhatsApp y 7 por correo.
        </p>
      </article>
    </BackofficeShell>
  );
}
