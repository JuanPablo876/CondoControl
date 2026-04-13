"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BadgeCheck, Building2, LockKeyhole, LogIn, Mail, X, ArrowLeft, CheckCircle } from "lucide-react";

type UserSession = {
  email: string;
  name: string;
};

const SESSION_KEY = "condocontrol.session";
const ADMIN_EMAIL = "admin@condocontrol.com";
const ADMIN_PASSWORD = "123456";

export default function HomePage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@condocontrol.com");
  const [password, setPassword] = useState("123456");
  const [loginError, setLoginError] = useState<string>("");
  
  // Forgot password state
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoverySent, setRecoverySent] = useState(false);
  const [recoveryError, setRecoveryError] = useState("");

  useEffect(() => {
    const storedSession = window.localStorage.getItem(SESSION_KEY);

    if (storedSession) {
      router.push("/dashboard");
    }

    // Default to dark theme (Linear is dark-first)
    if (!window.localStorage.getItem("condocontrol.theme")) {
      document.documentElement.dataset.theme = "dark";
    }
  }, [router]);

  const onLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      setLoginError("Credenciales invalidas. Usa el acceso de administrador o corrige tus datos.");
      return;
    }

    const newSession: UserSession = {
      email,
      name: "Administrador"
    };

    setLoginError("");
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
    router.push("/dashboard");
  };

  const onBypassAdmin = () => {
    const newSession: UserSession = {
      email: ADMIN_EMAIL,
      name: "Administrador"
    };

    setEmail(ADMIN_EMAIL);
    setPassword(ADMIN_PASSWORD);
    setLoginError("");
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
    router.push("/dashboard");
  };

  const onForgotPassword = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setRecoveryError("");
    
    if (!recoveryEmail || !recoveryEmail.includes("@")) {
      setRecoveryError("Ingresa un correo válido");
      return;
    }
    
    // Simulate sending recovery email
    setTimeout(() => {
      setRecoverySent(true);
    }, 800);
  };

  const closeForgotPassword = () => {
    setShowForgotPassword(false);
    setRecoveryEmail("");
    setRecoverySent(false);
    setRecoveryError("");
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <Building2 size={22} />
          <strong>CondoControl</strong>
        </div>
      </header>

      <section className="card login-card">
        <div className="section-title">
          <LogIn size={20} />
          <h1>Iniciar sesion</h1>
        </div>

        <p className="muted">Accede al panel administrativo para gestionar propiedades, pagos y recordatorios.</p>
        <p className="admin-hint">
          <LockKeyhole size={15} />
          Admin: {ADMIN_EMAIL} / {ADMIN_PASSWORD}
        </p>

        <form className="form-grid" onSubmit={onLogin}>
          <label className="field">
            <span>Correo</span>
            <input
              type="email"
              placeholder="admin@condocontrol.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          <label className="field">
            <span>Contraseña</span>
            <input
              type="password"
              placeholder="********"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>

          <button 
            type="button" 
            className="forgot-password-link"
            onClick={() => setShowForgotPassword(true)}
          >
            ¿Olvidaste tu contraseña?
          </button>

          <button className="primary-button" type="submit">
            <LogIn size={16} />
            Entrar al panel
          </button>

          <button className="secondary-button" type="button" onClick={onBypassAdmin}>
            <BadgeCheck size={16} />
            Entrar como admin (bypass)
          </button>

          {loginError ? <p className="error-text">{loginError}</p> : null}
        </form>
      </section>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="modal-overlay" onClick={closeForgotPassword}>
          <div className="modal-content forgot-password-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeForgotPassword}>
              <X size={20} />
            </button>
            
            {!recoverySent ? (
              <>
                <div className="modal-header">
                  <Mail size={24} />
                  <h2>Recuperar contraseña</h2>
                </div>
                <p className="muted">
                  Ingresa tu correo electrónico y te enviaremos instrucciones para restablecer tu contraseña.
                </p>
                
                <form className="form-grid" onSubmit={onForgotPassword}>
                  <label className="field">
                    <span>Correo electrónico</span>
                    <input
                      type="email"
                      placeholder="tu@correo.com"
                      value={recoveryEmail}
                      onChange={(e) => setRecoveryEmail(e.target.value)}
                      autoFocus
                      required
                    />
                  </label>
                  
                  {recoveryError && <p className="error-text">{recoveryError}</p>}
                  
                  <button className="primary-button" type="submit">
                    <Mail size={16} />
                    Enviar instrucciones
                  </button>
                  
                  <button 
                    className="secondary-button" 
                    type="button" 
                    onClick={closeForgotPassword}
                  >
                    <ArrowLeft size={16} />
                    Volver al login
                  </button>
                </form>
              </>
            ) : (
              <div className="recovery-success">
                <div className="success-icon">
                  <CheckCircle size={48} />
                </div>
                <h2>¡Correo enviado!</h2>
                <p className="muted">
                  Hemos enviado las instrucciones de recuperación a <strong>{recoveryEmail}</strong>. 
                  Revisa tu bandeja de entrada y sigue los pasos indicados.
                </p>
                <button 
                  className="primary-button" 
                  type="button" 
                  onClick={closeForgotPassword}
                >
                  Volver al login
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
