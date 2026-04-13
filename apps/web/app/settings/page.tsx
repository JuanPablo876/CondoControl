"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import { BackofficeShell } from "../../components/BackofficeShell";

export default function SettingsPage() {
  const [notificationsEmail, setNotificationsEmail] = useState(true);
  const [notificationsWhatsapp, setNotificationsWhatsapp] = useState(true);
  const [autoCallForLatePayments, setAutoCallForLatePayments] = useState(true);
  const [defaultReminderDays, setDefaultReminderDays] = useState(3);
  const [savedAt, setSavedAt] = useState("");

  const onSave = () => {
    setSavedAt(new Date().toLocaleTimeString("es-MX"));
  };

  return (
    <BackofficeShell title="Configuraciones" description="Canales de aviso y reglas de recordatorio.">
      <article className="card settings-card">
        <div className="settings-grid">
          <label className="toggle-row">
            <input
              type="checkbox"
              checked={notificationsEmail}
              onChange={(event) => setNotificationsEmail(event.target.checked)}
            />
            <span>Recordatorios por correo</span>
          </label>

          <label className="toggle-row">
            <input
              type="checkbox"
              checked={notificationsWhatsapp}
              onChange={(event) => setNotificationsWhatsapp(event.target.checked)}
            />
            <span>Recordatorios por WhatsApp</span>
          </label>

          <label className="toggle-row">
            <input
              type="checkbox"
              checked={autoCallForLatePayments}
              onChange={(event) => setAutoCallForLatePayments(event.target.checked)}
            />
            <span>Llamada automatica en mora</span>
          </label>

          <label className="field">
            <span>Dias previos para recordatorio</span>
            <input
              type="number"
              min={1}
              max={15}
              value={defaultReminderDays}
              onChange={(event) => setDefaultReminderDays(Number(event.target.value))}
            />
          </label>
        </div>

        <div className="settings-footer">
          <button className="primary-button" type="button" onClick={onSave}>
            <Save size={16} />
            Guardar ajustes
          </button>
          {savedAt ? <p className="muted">Guardado a las {savedAt}</p> : null}
        </div>
      </article>
    </BackofficeShell>
  );
}
