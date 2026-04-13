"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import {
  BarChart3,
  Bell,
  Bot,
  Building2,
  CreditCard,
  Home,
  LayoutDashboard,
  LogOut,
  Moon,
  Settings,
  Sparkles,
  Sun,
  Users,
  Wrench
} from "lucide-react";

type Theme = "light" | "dark";

type UserSession = {
  email: string;
  name: string;
};

const SESSION_KEY = "condocontrol.session";
const THEME_KEY = "condocontrol.theme";

const menuOptions = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/units", label: "Propiedades", icon: Home },
  { href: "/tenants", label: "Inquilinos", icon: Users },
  { href: "/payments", label: "Pagos", icon: CreditCard },
  { href: "/maintenance", label: "Mantenimiento", icon: Wrench },
  { href: "/reports", label: "Reportes", icon: BarChart3 },
  { href: "/notifications", label: "Notificaciones", icon: Bell },
  { href: "/chat", label: "Asistente IA", icon: Sparkles },
  { href: "/bot", label: "Bot", icon: Bot },
  { href: "/settings", label: "Configuraciones", icon: Settings }
];

export function BackofficeShell({
  title,
  description,
  children
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [theme, setTheme] = useState<Theme>("light");
  const [session, setSession] = useState<UserSession | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const storedTheme = window.localStorage.getItem(THEME_KEY) as Theme | null;
    const storedSession = window.localStorage.getItem(SESSION_KEY);

    if (storedTheme === "dark" || storedTheme === "light") {
      setTheme(storedTheme);
      document.documentElement.dataset.theme = storedTheme;
    } else {
      setTheme("dark");
      document.documentElement.dataset.theme = "dark";
    }

    if (storedSession) {
      setSession(JSON.parse(storedSession) as UserSession);
    }

    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady) return;
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(THEME_KEY, theme);
  }, [theme, isReady]);

  const toggleTheme = () => {
    setTheme((current) => (current === "light" ? "dark" : "light"));
  };

  const onLogout = () => {
    window.localStorage.removeItem(SESSION_KEY);
    setSession(null);
    router.push("/");
  };

  if (!isReady) {
    return <main className="app-shell" />;
  }

  if (!session) {
    return (
      <main className="app-shell">
        <section className="card auth-card">
          <h1>Sesion requerida</h1>
          <p className="muted">Necesitas iniciar sesion para acceder a esta pagina.</p>
          <Link href="/" className="primary-button" style={{ textDecoration: "none" }}>
            Volver al login
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="workspace-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <Building2 size={20} />
          <strong>CondoControl</strong>
        </div>

        <nav className="sidebar-nav">
          {menuOptions.map((option) => {
            const isActive = pathname === option.href;
            return (
              <Link
                key={option.href}
                href={option.href}
                className={`sidebar-link ${isActive ? "active" : ""}`}
              >
                <option.icon size={16} />
                {option.label}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <p className="muted">Conectado como</p>
          <strong className="sidebar-user">{session.email}</strong>
        </div>
      </aside>

      <section className="workspace-content">
        <header className="topbar">
          <div>
            <h1>{title}</h1>
            <p className="muted">{description}</p>
          </div>

          <div className="topbar-actions">
            <button className="icon-button" onClick={toggleTheme} type="button" aria-label="Cambiar tema">
              {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <button className="secondary-button" type="button" onClick={onLogout}>
              <LogOut size={16} />
              Salir
            </button>
          </div>
        </header>

        <section className="content-grid">{children}</section>
      </section>
    </main>
  );
}
