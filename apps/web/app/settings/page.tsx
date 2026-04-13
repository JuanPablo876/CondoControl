"use client";

import { useState, useEffect, FormEvent } from "react";
import { 
  Save, 
  User, 
  Settings, 
  Bell, 
  Shield, 
  Mail, 
  Phone,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  AlertTriangle,
  Globe,
  Clock,
  Palette
} from "lucide-react";
import { BackofficeShell } from "../../components/BackofficeShell";

type TabId = "general" | "account";

type UserProfile = {
  name: string;
  email: string;
  phone: string;
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("general");
  
  // General settings
  const [notificationsEmail, setNotificationsEmail] = useState(true);
  const [notificationsWhatsapp, setNotificationsWhatsapp] = useState(true);
  const [notificationsPush, setNotificationsPush] = useState(false);
  const [autoCallForLatePayments, setAutoCallForLatePayments] = useState(true);
  const [defaultReminderDays, setDefaultReminderDays] = useState(3);
  const [language, setLanguage] = useState("es");
  const [timezone, setTimezone] = useState("America/Mexico_City");
  const [theme, setTheme] = useState("dark");
  const [savedAt, setSavedAt] = useState("");
  
  // Account settings
  const [profile, setProfile] = useState<UserProfile>({
    name: "Administrador",
    email: "admin@condocontrol.com",
    phone: "+52 55 1234 5678"
  });
  const [profileSaved, setProfileSaved] = useState(false);
  
  // Password change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  useEffect(() => {
    // Load theme from localStorage
    const savedTheme = localStorage.getItem("condocontrol.theme");
    if (savedTheme) setTheme(savedTheme);
  }, []);

  const onSaveGeneral = () => {
    // Apply theme
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("condocontrol.theme", theme);
    
    setSavedAt(new Date().toLocaleTimeString("es-MX"));
  };

  const onSaveProfile = (e: FormEvent) => {
    e.preventDefault();
    // Simulate save
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  const onChangePassword = (e: FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess(false);
    
    // Validate current password (demo: 123456)
    if (currentPassword !== "123456") {
      setPasswordError("La contraseña actual es incorrecta");
      return;
    }
    
    if (newPassword.length < 6) {
      setPasswordError("La nueva contraseña debe tener al menos 6 caracteres");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError("Las contraseñas no coinciden");
      return;
    }
    
    // Simulate password change
    setPasswordSuccess(true);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const tabs = [
    { id: "general" as TabId, label: "General", icon: Settings },
    { id: "account" as TabId, label: "Cuenta", icon: User },
  ];

  return (
    <BackofficeShell title="Configuración" description="Personaliza tu experiencia y gestiona tu cuenta.">
      {/* Tab Navigation */}
      <div className="settings-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`settings-tab ${activeTab === tab.id ? "settings-tab--active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* General Settings */}
      {activeTab === "general" && (
        <div className="settings-sections">
          {/* Appearance */}
          <article className="card settings-section">
            <div className="settings-section-header">
              <Palette size={18} />
              <h3>Apariencia</h3>
            </div>
            <div className="settings-grid">
              <label className="field">
                <span>Tema</span>
                <select value={theme} onChange={(e) => setTheme(e.target.value)}>
                  <option value="dark">Oscuro</option>
                  <option value="light">Claro</option>
                </select>
              </label>
              
              <label className="field">
                <span>Idioma</span>
                <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                  <option value="es">Español</option>
                  <option value="en">English</option>
                </select>
              </label>
            </div>
          </article>

          {/* Regional */}
          <article className="card settings-section">
            <div className="settings-section-header">
              <Globe size={18} />
              <h3>Regional</h3>
            </div>
            <div className="settings-grid">
              <label className="field">
                <span>Zona horaria</span>
                <select value={timezone} onChange={(e) => setTimezone(e.target.value)}>
                  <option value="America/Mexico_City">Ciudad de México (GMT-6)</option>
                  <option value="America/Monterrey">Monterrey (GMT-6)</option>
                  <option value="America/Cancun">Cancún (GMT-5)</option>
                  <option value="America/Tijuana">Tijuana (GMT-8)</option>
                </select>
              </label>
            </div>
          </article>

          {/* Notifications */}
          <article className="card settings-section">
            <div className="settings-section-header">
              <Bell size={18} />
              <h3>Notificaciones</h3>
            </div>
            <div className="settings-grid">
              <label className="toggle-row">
                <input
                  type="checkbox"
                  checked={notificationsEmail}
                  onChange={(e) => setNotificationsEmail(e.target.checked)}
                />
                <div className="toggle-content">
                  <Mail size={16} />
                  <div>
                    <span>Correo electrónico</span>
                    <small>Recibe recordatorios y alertas por email</small>
                  </div>
                </div>
              </label>

              <label className="toggle-row">
                <input
                  type="checkbox"
                  checked={notificationsWhatsapp}
                  onChange={(e) => setNotificationsWhatsapp(e.target.checked)}
                />
                <div className="toggle-content">
                  <Phone size={16} />
                  <div>
                    <span>WhatsApp</span>
                    <small>Mensajes directos a tu WhatsApp</small>
                  </div>
                </div>
              </label>

              <label className="toggle-row">
                <input
                  type="checkbox"
                  checked={notificationsPush}
                  onChange={(e) => setNotificationsPush(e.target.checked)}
                />
                <div className="toggle-content">
                  <Bell size={16} />
                  <div>
                    <span>Notificaciones push</span>
                    <small>Alertas en tiempo real en el navegador</small>
                  </div>
                </div>
              </label>

              <label className="toggle-row">
                <input
                  type="checkbox"
                  checked={autoCallForLatePayments}
                  onChange={(e) => setAutoCallForLatePayments(e.target.checked)}
                />
                <div className="toggle-content">
                  <Phone size={16} />
                  <div>
                    <span>Llamada automática en mora</span>
                    <small>Contactar inquilinos con pagos vencidos</small>
                  </div>
                </div>
              </label>

              <label className="field">
                <span>Días previos para recordatorio</span>
                <input
                  type="number"
                  min={1}
                  max={15}
                  value={defaultReminderDays}
                  onChange={(e) => setDefaultReminderDays(Number(e.target.value))}
                />
              </label>
            </div>
          </article>

          <div className="settings-footer">
            <button className="primary-button" type="button" onClick={onSaveGeneral}>
              <Save size={16} />
              Guardar cambios
            </button>
            {savedAt && <p className="muted">Guardado a las {savedAt}</p>}
          </div>
        </div>
      )}

      {/* Account Settings */}
      {activeTab === "account" && (
        <div className="settings-sections">
          {/* Profile Info */}
          <article className="card settings-section">
            <div className="settings-section-header">
              <User size={18} />
              <h3>Información personal</h3>
            </div>
            <form className="settings-grid" onSubmit={onSaveProfile}>
              <label className="field">
                <span>Nombre completo</span>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  placeholder="Tu nombre"
                />
              </label>

              <label className="field">
                <span>Correo electrónico</span>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  placeholder="tu@correo.com"
                />
              </label>

              <label className="field">
                <span>Teléfono</span>
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  placeholder="+52 55 1234 5678"
                />
              </label>

              <div className="settings-actions">
                <button className="primary-button" type="submit">
                  <Save size={16} />
                  Guardar perfil
                </button>
                {profileSaved && (
                  <span className="success-message">
                    <CheckCircle size={16} />
                    Perfil actualizado
                  </span>
                )}
              </div>
            </form>
          </article>

          {/* Change Password */}
          <article className="card settings-section">
            <div className="settings-section-header">
              <Shield size={18} />
              <h3>Cambiar contraseña</h3>
            </div>
            <form className="settings-grid" onSubmit={onChangePassword}>
              <label className="field">
                <span>Contraseña actual</span>
                <div className="password-input-wrapper">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </label>

              <label className="field">
                <span>Nueva contraseña</span>
                <div className="password-input-wrapper">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </label>

              <label className="field">
                <span>Confirmar nueva contraseña</span>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite la nueva contraseña"
                />
              </label>

              {passwordError && (
                <div className="error-message">
                  <AlertTriangle size={16} />
                  {passwordError}
                </div>
              )}

              {passwordSuccess && (
                <div className="success-message-block">
                  <CheckCircle size={16} />
                  Contraseña actualizada correctamente
                </div>
              )}

              <div className="settings-actions">
                <button className="primary-button" type="submit">
                  <Lock size={16} />
                  Cambiar contraseña
                </button>
              </div>
            </form>
          </article>

          {/* Security Info */}
          <article className="card settings-section settings-section--info">
            <div className="settings-section-header">
              <Clock size={18} />
              <h3>Actividad de la cuenta</h3>
            </div>
            <div className="security-info">
              <div className="security-info-item">
                <span className="security-label">Último acceso</span>
                <span className="security-value">Hoy, {new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}</span>
              </div>
              <div className="security-info-item">
                <span className="security-label">Dispositivo</span>
                <span className="security-value">Windows • Chrome</span>
              </div>
              <div className="security-info-item">
                <span className="security-label">IP</span>
                <span className="security-value">192.168.1.xxx</span>
              </div>
            </div>
          </article>
        </div>
      )}
    </BackofficeShell>
  );
}
