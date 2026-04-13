"use client";

import { useState } from "react";
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Smartphone, 
  Calendar, 
  CreditCard, 
  Wrench,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Save,
  Send,
  User
} from "lucide-react";
import { BackofficeShell } from "../../components/BackofficeShell";

type NotificationChannel = "email" | "whatsapp" | "push";
type NotificationStatus = "sent" | "pending" | "failed";
type NotificationType = "payment_reminder" | "contract_expiry" | "maintenance" | "general";

type NotificationLog = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  recipient: string;
  channel: NotificationChannel;
  status: NotificationStatus;
  date: string;
};

const demoNotifications: NotificationLog[] = [
  {
    id: "n1",
    type: "payment_reminder",
    title: "Recordatorio de pago",
    message: "Tu pago de $4,500 MXN vence el 15 de abril",
    recipient: "Carlos Perez",
    channel: "whatsapp",
    status: "sent",
    date: "12 Abr 2026, 09:00"
  },
  {
    id: "n2",
    type: "contract_expiry",
    title: "Contrato próximo a vencer",
    message: "Tu contrato vence en 30 días (12 de mayo)",
    recipient: "Maria Gutierrez",
    channel: "email",
    status: "sent",
    date: "11 Abr 2026, 10:00"
  },
  {
    id: "n3",
    type: "maintenance",
    title: "Mantenimiento programado",
    message: "Mantenimiento de elevadores el 15 de abril de 8:00 a 12:00",
    recipient: "Todos los inquilinos",
    channel: "whatsapp",
    status: "pending",
    date: "10 Abr 2026, 14:00"
  },
  {
    id: "n4",
    type: "payment_reminder",
    title: "Pago vencido",
    message: "Tu pago de $6,200 MXN está vencido desde el 1 de abril",
    recipient: "Jorge Medina",
    channel: "email",
    status: "failed",
    date: "5 Abr 2026, 08:00"
  },
];

function getStatusIcon(status: NotificationStatus) {
  switch (status) {
    case "sent": return <CheckCircle size={14} className="text-success" />;
    case "pending": return <Clock size={14} className="text-warning" />;
    case "failed": return <XCircle size={14} className="text-danger" />;
  }
}

function getStatusClass(status: NotificationStatus) {
  switch (status) {
    case "sent": return "status-pill status-pill--success";
    case "pending": return "status-pill status-pill--warning";
    case "failed": return "status-pill status-pill--danger";
  }
}

function getStatusLabel(status: NotificationStatus) {
  switch (status) {
    case "sent": return "Enviado";
    case "pending": return "Pendiente";
    case "failed": return "Fallido";
  }
}

function getTypeIcon(type: NotificationType) {
  switch (type) {
    case "payment_reminder": return <CreditCard size={14} />;
    case "contract_expiry": return <Calendar size={14} />;
    case "maintenance": return <Wrench size={14} />;
    case "general": return <Bell size={14} />;
  }
}

function getTypeLabel(type: NotificationType) {
  switch (type) {
    case "payment_reminder": return "Pago";
    case "contract_expiry": return "Contrato";
    case "maintenance": return "Mantenimiento";
    case "general": return "General";
  }
}

function getChannelIcon(channel: NotificationChannel) {
  switch (channel) {
    case "email": return <Mail size={14} />;
    case "whatsapp": return <MessageSquare size={14} />;
    case "push": return <Smartphone size={14} />;
  }
}

export default function NotificationsPage() {
  // Channel settings
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [whatsappEnabled, setWhatsappEnabled] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(false);

  // Payment reminders
  const [paymentReminderEnabled, setPaymentReminderEnabled] = useState(true);
  const [paymentReminderDays, setPaymentReminderDays] = useState("3");
  const [paymentOverdueEnabled, setPaymentOverdueEnabled] = useState(true);
  const [paymentOverdueDays, setPaymentOverdueDays] = useState("1");

  // Contract expiry
  const [contractExpiryEnabled, setContractExpiryEnabled] = useState(true);
  const [contractExpiryDays, setContractExpiryDays] = useState("30");
  const [contractExpirySecondReminder, setContractExpirySecondReminder] = useState("7");

  // Maintenance
  const [maintenanceEnabled, setMaintenanceEnabled] = useState(true);

  // General
  const [savedAt, setSavedAt] = useState("");
  const [expandedNotif, setExpandedNotif] = useState<string | null>(null);

  const onSave = () => {
    setSavedAt(new Date().toLocaleTimeString("es-MX"));
  };

  const stats = {
    sent: demoNotifications.filter(n => n.status === "sent").length,
    pending: demoNotifications.filter(n => n.status === "pending").length,
    failed: demoNotifications.filter(n => n.status === "failed").length,
  };

  return (
    <BackofficeShell title="Notificaciones" description="Configura recordatorios automaticos y revisa el historial de notificaciones.">
      {/* Stats row */}
      <div className="notif-stats-row">
        <div className="notif-stat-card">
          <div className="notif-stat-icon notif-stat-icon--success">
            <CheckCircle size={20} />
          </div>
          <div className="notif-stat-content">
            <span className="notif-stat-value">{stats.sent}</span>
            <span className="notif-stat-label">Enviadas</span>
          </div>
        </div>
        <div className="notif-stat-card">
          <div className="notif-stat-icon notif-stat-icon--warning">
            <Clock size={20} />
          </div>
          <div className="notif-stat-content">
            <span className="notif-stat-value">{stats.pending}</span>
            <span className="notif-stat-label">Pendientes</span>
          </div>
        </div>
        <div className="notif-stat-card">
          <div className="notif-stat-icon notif-stat-icon--danger">
            <XCircle size={20} />
          </div>
          <div className="notif-stat-content">
            <span className="notif-stat-value">{stats.failed}</span>
            <span className="notif-stat-label">Fallidas</span>
          </div>
        </div>
      </div>

      {/* Channels */}
      <article className="card">
        <h2><Send size={16} style={{ verticalAlign: "middle", marginRight: 6 }} />Canales de notificación</h2>
        <p className="muted" style={{ marginBottom: 12 }}>Selecciona los canales por los que deseas enviar notificaciones.</p>
        
        <div className="channel-grid">
          <label className={`channel-card ${emailEnabled ? "channel-card--active" : ""}`}>
            <input 
              type="checkbox" 
              checked={emailEnabled} 
              onChange={(e) => setEmailEnabled(e.target.checked)} 
            />
            <div className="channel-icon"><Mail size={24} /></div>
            <div className="channel-info">
              <span className="channel-name">Email</span>
              <span className="channel-desc">Correos electrónicos</span>
            </div>
          </label>

          <label className={`channel-card ${whatsappEnabled ? "channel-card--active" : ""}`}>
            <input 
              type="checkbox" 
              checked={whatsappEnabled} 
              onChange={(e) => setWhatsappEnabled(e.target.checked)} 
            />
            <div className="channel-icon channel-icon--whatsapp"><MessageSquare size={24} /></div>
            <div className="channel-info">
              <span className="channel-name">WhatsApp</span>
              <span className="channel-desc">Mensajes directos</span>
            </div>
          </label>

          <label className={`channel-card ${pushEnabled ? "channel-card--active" : ""}`}>
            <input 
              type="checkbox" 
              checked={pushEnabled} 
              onChange={(e) => setPushEnabled(e.target.checked)} 
            />
            <div className="channel-icon channel-icon--push"><Smartphone size={24} /></div>
            <div className="channel-info">
              <span className="channel-name">Push</span>
              <span className="channel-desc">Notificaciones en app</span>
            </div>
          </label>
        </div>
      </article>

      {/* Reminder Rules */}
      <article className="card">
        <h2><Clock size={16} style={{ verticalAlign: "middle", marginRight: 6 }} />Reglas de recordatorios</h2>
        <p className="muted" style={{ marginBottom: 16 }}>Configura cuándo enviar recordatorios automáticos.</p>

        {/* Payment reminders */}
        <div className="reminder-section">
          <div className="reminder-header">
            <div className="reminder-title">
              <CreditCard size={16} />
              <span>Recordatorios de pago</span>
            </div>
            <label className="toggle-switch">
              <input 
                type="checkbox" 
                checked={paymentReminderEnabled} 
                onChange={(e) => setPaymentReminderEnabled(e.target.checked)} 
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
          
          {paymentReminderEnabled && (
            <div className="reminder-options">
              <div className="reminder-option">
                <span>Recordar</span>
                <input 
                  type="number" 
                  className="reminder-input" 
                  value={paymentReminderDays} 
                  onChange={(e) => setPaymentReminderDays(e.target.value)}
                  min="1"
                  max="30"
                />
                <span>días antes del vencimiento</span>
              </div>
              
              <label className="reminder-checkbox">
                <input 
                  type="checkbox" 
                  checked={paymentOverdueEnabled} 
                  onChange={(e) => setPaymentOverdueEnabled(e.target.checked)} 
                />
                <span>Notificar pagos vencidos después de</span>
                <input 
                  type="number" 
                  className="reminder-input" 
                  value={paymentOverdueDays} 
                  onChange={(e) => setPaymentOverdueDays(e.target.value)}
                  min="1"
                  max="30"
                  disabled={!paymentOverdueEnabled}
                />
                <span>día(s)</span>
              </label>
            </div>
          )}
        </div>

        {/* Contract expiry */}
        <div className="reminder-section">
          <div className="reminder-header">
            <div className="reminder-title">
              <Calendar size={16} />
              <span>Vencimiento de contratos</span>
            </div>
            <label className="toggle-switch">
              <input 
                type="checkbox" 
                checked={contractExpiryEnabled} 
                onChange={(e) => setContractExpiryEnabled(e.target.checked)} 
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
          
          {contractExpiryEnabled && (
            <div className="reminder-options">
              <div className="reminder-option">
                <span>Primer recordatorio</span>
                <input 
                  type="number" 
                  className="reminder-input" 
                  value={contractExpiryDays} 
                  onChange={(e) => setContractExpiryDays(e.target.value)}
                  min="1"
                  max="90"
                />
                <span>días antes</span>
              </div>
              
              <div className="reminder-option">
                <span>Segundo recordatorio</span>
                <input 
                  type="number" 
                  className="reminder-input" 
                  value={contractExpirySecondReminder} 
                  onChange={(e) => setContractExpirySecondReminder(e.target.value)}
                  min="1"
                  max="30"
                />
                <span>días antes</span>
              </div>
            </div>
          )}
        </div>

        {/* Maintenance */}
        <div className="reminder-section">
          <div className="reminder-header">
            <div className="reminder-title">
              <Wrench size={16} />
              <span>Avisos de mantenimiento</span>
            </div>
            <label className="toggle-switch">
              <input 
                type="checkbox" 
                checked={maintenanceEnabled} 
                onChange={(e) => setMaintenanceEnabled(e.target.checked)} 
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
          
          {maintenanceEnabled && (
            <div className="reminder-options">
              <p className="muted">Los avisos de mantenimiento se enviarán automáticamente a todos los inquilinos afectados cuando se programe una actividad.</p>
            </div>
          )}
        </div>

        <div className="settings-footer">
          <button className="primary-button" type="button" onClick={onSave}>
            <Save size={16} />
            Guardar configuración
          </button>
          {savedAt && <p className="muted">Guardado a las {savedAt}</p>}
        </div>
      </article>

      {/* Notification History */}
      <article className="card">
        <div className="page-header-row">
          <h2>Historial de notificaciones</h2>
          <span className="muted">{demoNotifications.length} notificaciones</span>
        </div>

        <div className="notif-list">
          {demoNotifications.map((notif) => {
            const isExpanded = expandedNotif === notif.id;
            return (
              <div key={notif.id} className="notif-item">
                <button
                  className="notif-header"
                  type="button"
                  onClick={() => setExpandedNotif(isExpanded ? null : notif.id)}
                >
                  <div className="notif-header-left">
                    <div className="notif-type-icon">{getTypeIcon(notif.type)}</div>
                    <div className="notif-meta">
                      <span className="notif-title">{notif.title}</span>
                      <span className="notif-recipient">
                        <User size={12} style={{ marginRight: 4 }} />
                        {notif.recipient}
                      </span>
                    </div>
                  </div>
                  <div className="notif-header-right">
                    <div className="notif-channel">{getChannelIcon(notif.channel)}</div>
                    <span className={getStatusClass(notif.status)}>{getStatusLabel(notif.status)}</span>
                    <span className="notif-date">{notif.date}</span>
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="notif-body">
                    <div className="notif-message">
                      <span className="notif-message-label">Mensaje:</span>
                      <p>{notif.message}</p>
                    </div>
                    <div className="notif-details">
                      <span><strong>Tipo:</strong> {getTypeLabel(notif.type)}</span>
                      <span><strong>Canal:</strong> {notif.channel === "email" ? "Email" : notif.channel === "whatsapp" ? "WhatsApp" : "Push"}</span>
                    </div>
                    {notif.status === "failed" && (
                      <button className="secondary-button" style={{ marginTop: 12 }}>
                        <Send size={14} /> Reintentar envío
                      </button>
                    )}
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
