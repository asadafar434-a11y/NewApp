import { useEffect } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router";
import {
  Brain,
  LayoutDashboard,
  Users,
  TrendingDown,
  Megaphone,
  Settings,
  LogOut,
  Plus,
  Building2,
  Activity,
  MessageSquare,
  Bell,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const NAV_ITEMS = [
  { to: "/", icon: LayoutDashboard, label: "Дашборд", exact: true },
  { to: "/hiring", icon: Users, label: "Найм" },
  { to: "/finance", icon: TrendingDown, label: "Финансы" },
  { to: "/marketing", icon: Megaphone, label: "Маркетинг" },
  { to: "/operations", icon: Activity, label: "Операции" },
  { to: "/messages", icon: MessageSquare, label: "Сообщения", badge: 3 },
];

export default function Root() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!user) navigate("/auth", { replace: true });
  }, [user, navigate]);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "var(--color-bg-base)",
      }}
    >
      {/* Sidebar */}
      <aside
        style={{
          width: 240,
          background: "var(--color-bg-surface)",
          borderRight: "1px solid var(--color-border-subtle)",
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 50,
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: "var(--space-5)",
            borderBottom: "1px solid var(--color-border-subtle)",
            display: "flex",
            alignItems: "center",
            gap: "var(--space-3)",
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "var(--radius-md)",
              background:
                "linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-secondary))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Brain size={16} color="white" />
          </div>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-md)",
              fontWeight: 800,
              color: "var(--color-text-primary)",
              letterSpacing: "var(--tracking-tight)",
            }}
          >
            Orbital
          </span>
        </div>

        {/* New task CTA */}
        <div style={{ padding: "var(--space-4)" }}>
          <button
            onClick={() => navigate("/new-task")}
            style={{
              width: "100%",
              fontFamily: "var(--font-body)",
              fontSize: "var(--text-sm)",
              fontWeight: 600,
              color: "white",
              background:
                "linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-secondary))",
              border: "none",
              borderRadius: "var(--radius-lg)",
              padding: "var(--space-3)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "var(--space-2)",
              transition: "opacity var(--duration-fast)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            <Plus size={14} />
            Новая задача
          </button>
        </div>

        {/* Nav */}
        <nav
          style={{
            flex: 1,
            padding: "0 var(--space-3)",
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              color: "var(--color-text-muted)",
              letterSpacing: "var(--tracking-wider)",
              textTransform: "uppercase",
              padding: "var(--space-3) var(--space-3) var(--space-2)",
              margin: 0,
            }}
          >
            Разделы
          </p>
          {NAV_ITEMS.map(({ to, icon: Icon, label, exact, badge }) => {
            const isActive = exact ? location.pathname === to : location.pathname.startsWith(to);
            return (
              <NavLink
                key={to}
                to={to}
                end={exact}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-3)",
                  padding: "var(--space-3)",
                  borderRadius: "var(--radius-md)",
                  textDecoration: "none",
                  fontFamily: "var(--font-body)",
                  fontSize: "var(--text-sm)",
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? "var(--color-text-primary)" : "var(--color-text-secondary)",
                  background: isActive ? "var(--color-bg-elevated)" : "transparent",
                  transition: "all var(--duration-fast) var(--ease-out)",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "var(--color-bg-elevated)";
                    e.currentTarget.style.color = "var(--color-text-primary)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "var(--color-text-secondary)";
                  }
                }}
              >
                <Icon size={16} color={isActive ? "var(--color-accent-primary)" : "currentColor"} />
                <span style={{ flex: 1 }}>{label}</span>
                {badge && badge > 0 && !isActive && (
                  <span
                    style={{
                      background: "var(--color-accent-primary)",
                      color: "white",
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      fontWeight: 700,
                      borderRadius: "var(--radius-full)",
                      minWidth: 18,
                      height: 18,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "0 5px",
                    }}
                  >
                    {badge}
                  </span>
                )}
                {isActive && (
                  <div
                    style={{
                      width: 4,
                      height: 4,
                      borderRadius: "var(--radius-full)",
                      background: "var(--color-accent-primary)",
                    }}
                  />
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Notification bell */}
        <div style={{ padding: "var(--space-3) var(--space-4)" }}>
          <button
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: "var(--space-3)",
              padding: "var(--space-3)",
              background: "transparent",
              border: "none",
              borderRadius: "var(--radius-md)",
              cursor: "pointer",
              color: "var(--color-text-secondary)",
              fontFamily: "var(--font-body)",
              fontSize: "var(--text-sm)",
              transition: "all var(--duration-fast)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--color-bg-elevated)";
              e.currentTarget.style.color = "var(--color-text-primary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "var(--color-text-secondary)";
            }}
          >
            <div style={{ position: "relative" }}>
              <Bell size={16} />
              <div
                style={{
                  position: "absolute",
                  top: -3,
                  right: -3,
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: "var(--color-accent-danger)",
                  border: "1.5px solid var(--color-bg-surface)",
                }}
              />
            </div>
            <span>Уведомления</span>
            <span
              style={{
                marginLeft: "auto",
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                background: "rgba(239,68,68,0.15)",
                color: "var(--color-accent-danger)",
                borderRadius: "var(--radius-full)",
                padding: "1px 6px",
                fontWeight: 600,
              }}
            >
              5
            </span>
          </button>
        </div>

        {/* User */}
        <div
          style={{
            padding: "var(--space-4)",
            borderTop: "1px solid var(--color-border-subtle)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-3)",
              padding: "var(--space-3)",
              borderRadius: "var(--radius-md)",
              marginBottom: "var(--space-2)",
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "var(--radius-full)",
                background:
                  "linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-secondary))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "var(--font-display)",
                fontSize: "var(--text-sm)",
                fontWeight: 800,
                color: "white",
                flexShrink: 0,
              }}
            >
              {user.avatar}
            </div>
            <div style={{ minWidth: 0 }}>
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "var(--text-sm)",
                  fontWeight: 600,
                  color: "var(--color-text-primary)",
                  margin: 0,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {user.name}
              </p>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-1)",
                }}
              >
                <Building2 size={10} color="var(--color-text-muted)" />
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "var(--text-xs)",
                    color: "var(--color-text-muted)",
                    margin: 0,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {user.company}
                </p>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "var(--space-2)" }}>
            <button
              style={{
                flex: 1,
                background: "var(--color-bg-elevated)",
                border: "1px solid var(--color-border-subtle)",
                borderRadius: "var(--radius-md)",
                padding: "var(--space-2)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--color-text-muted)",
                transition: "color var(--duration-fast)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-text-primary)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-muted)")}
            >
              <Settings size={14} />
            </button>
            <button
              onClick={handleLogout}
              style={{
                flex: 1,
                background: "var(--color-bg-elevated)",
                border: "1px solid var(--color-border-subtle)",
                borderRadius: "var(--radius-md)",
                padding: "var(--space-2)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--color-text-muted)",
                transition: "color var(--duration-fast)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-accent-danger)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-muted)")}
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main
        style={{
          flex: 1,
          marginLeft: 240,
          minHeight: "100vh",
          background: "var(--color-bg-base)",
        }}
      >
        <Outlet />
      </main>
    </div>
  );
}
