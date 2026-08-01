import { useState } from "react";
import { useNavigate } from "react-router";
import { Brain, Eye, EyeOff, ArrowRight, Zap } from "lucide-react";
import { useAuth } from "../context/AuthContext";

/** Better Auth отдаёт код и сообщение по-английски — переводим известные на русский. */
const ERROR_MESSAGES: Record<string, string> = {
  INVALID_EMAIL_OR_PASSWORD: "Неверный email или пароль",
  EMAIL_NOT_VERIFIED: "Подтвердите email — мы отправили письмо со ссылкой",
  PASSWORD_TOO_SHORT: "Пароль слишком короткий (минимум 8 символов)",
  PASSWORD_TOO_LONG: "Пароль слишком длинный",
  USER_ALREADY_EXISTS: "Этот email уже зарегистрирован",
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: "Этот email уже зарегистрирован",
};

function translateError(message: string): string {
  return ERROR_MESSAGES[message] ?? "Что-то пошло не так. Попробуйте ещё раз.";
}

export default function Auth() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [company, setCompany] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [signupDone, setSignupDone] = useState(false);

  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Заполните все поля");
      return;
    }
    if (mode === "signup" && !name) {
      setError("Введите имя");
      return;
    }
    setLoading(true);
    try {
      if (mode === "login") {
        await login(email, password);
        navigate("/");
      } else {
        await signup(name, email, password, company || "Моя компания");
        setSignupDone(true);
      }
    } catch (err) {
      setError(translateError(err instanceof Error ? err.message : ""));
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "var(--color-bg-elevated)",
    border: "1px solid var(--color-border-default)",
    borderRadius: "var(--radius-md)",
    padding: "var(--space-3) var(--space-4)",
    fontFamily: "var(--font-body)",
    fontSize: "var(--text-base)",
    color: "var(--color-text-primary)",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color var(--duration-fast)",
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: "var(--font-body)",
    fontSize: "var(--text-xs)",
    fontWeight: 600,
    color: "var(--color-text-secondary)",
    letterSpacing: "var(--tracking-wide)",
    textTransform: "uppercase",
    marginBottom: "var(--space-2)",
    display: "block",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--color-bg-base)",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
      }}
    >
      {/* Left — brand panel */}
      <div
        style={{
          background: "var(--color-bg-surface)",
          borderRight: "1px solid var(--color-border-subtle)",
          display: "flex",
          flexDirection: "column",
          padding: "var(--space-12)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Glow */}
        <div
          style={{
            position: "absolute",
            bottom: -120,
            left: -80,
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(91,110,245,0.12) 0%, transparent 65%)",
            pointerEvents: "none",
          }}
        />

        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-3)",
            marginBottom: "auto",
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "var(--radius-lg)",
              background:
                "linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-secondary))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Brain size={18} color="white" />
          </div>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-lg)",
              fontWeight: 800,
              color: "var(--color-text-primary)",
              letterSpacing: "var(--tracking-tight)",
            }}
          >
            Orbital
          </span>
        </div>

        {/* Main copy */}
        <div style={{ marginBottom: "var(--space-12)" }}>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2rem, 3.5vw, 3rem)",
              fontWeight: 800,
              lineHeight: "var(--leading-tight)",
              letterSpacing: "var(--tracking-tight)",
              color: "var(--color-text-primary)",
              margin: "0 0 var(--space-5) 0",
            }}
          >
            ИИ, который{" "}
            <span
              style={{
                background:
                  "linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-secondary))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              работает
            </span>{" "}
            за вас
          </h1>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "var(--text-base)",
              color: "var(--color-text-secondary)",
              lineHeight: "var(--leading-normal)",
              margin: 0,
            }}
          >
            Наём, финансы, маркетинг, операции — один запрос запускает полный цикл.
          </p>
        </div>

        {/* Feature pills */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-3)",
          }}
        >
          {[
            "Поиск и скрининг кандидатов",
            "Анализ причин падения прибыли",
            "Аудит рекламных кампаний",
            "Еженедельные операционные отчёты",
          ].map((f) => (
            <div
              key={f}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-3)",
              }}
            >
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: "var(--radius-full)",
                  background: "var(--color-accent-glow)",
                  border: "1px solid rgba(91,110,245,0.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Zap size={10} color="var(--color-accent-primary)" />
              </div>
              <span
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "var(--text-sm)",
                  color: "var(--color-text-secondary)",
                }}
              >
                {f}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Right — form */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "var(--space-12)",
        }}
      >
        <div style={{ width: "100%", maxWidth: 400 }}>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-2xl)",
              fontWeight: 800,
              letterSpacing: "var(--tracking-tight)",
              color: "var(--color-text-primary)",
              margin: "0 0 var(--space-2) 0",
            }}
          >
            {mode === "login" ? "С возвращением" : "Создать аккаунт"}
          </h2>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "var(--text-sm)",
              color: "var(--color-text-muted)",
              margin: "0 0 var(--space-8) 0",
            }}
          >
            {mode === "login"
              ? "Войдите, чтобы продолжить работу"
              : "Начните работу с Orbital бесплатно"}
          </p>

          {signupDone ? (
            <div
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "var(--text-sm)",
                color: "var(--color-text-primary)",
                padding: "var(--space-4)",
                background: "var(--color-accent-glow)",
                border: "1px solid rgba(91,110,245,0.25)",
                borderRadius: "var(--radius-md)",
              }}
            >
              Проверьте почту {email} и перейдите по ссылке, чтобы подтвердить регистрацию.
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-4)",
              }}
            >
              {mode === "signup" && (
                <div>
                  <label style={labelStyle}>Имя</label>
                  <input
                    style={inputStyle}
                    placeholder="Иван Петров"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onFocus={(e) => (e.target.style.borderColor = "var(--color-accent-primary)")}
                    onBlur={(e) => (e.target.style.borderColor = "var(--color-border-default)")}
                  />
                </div>
              )}

              {mode === "signup" && (
                <div>
                  <label style={labelStyle}>Компания</label>
                  <input
                    style={inputStyle}
                    placeholder="Acme Corp"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    onFocus={(e) => (e.target.style.borderColor = "var(--color-accent-primary)")}
                    onBlur={(e) => (e.target.style.borderColor = "var(--color-border-default)")}
                  />
                </div>
              )}

              <div>
                <label style={labelStyle}>Email</label>
                <input
                  type="email"
                  style={inputStyle}
                  placeholder="ivan@company.ru"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={(e) => (e.target.style.borderColor = "var(--color-accent-primary)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--color-border-default)")}
                />
              </div>

              <div>
                <label style={labelStyle}>Пароль</label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPw ? "text" : "password"}
                    style={{ ...inputStyle, paddingRight: 44 }}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={(e) => (e.target.style.borderColor = "var(--color-accent-primary)")}
                    onBlur={(e) => (e.target.style.borderColor = "var(--color-border-default)")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    style={{
                      position: "absolute",
                      right: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                      color: "var(--color-text-muted)",
                    }}
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && (
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "var(--text-sm)",
                    color: "var(--color-accent-danger)",
                    margin: 0,
                    padding: "var(--space-3)",
                    background: "rgba(239,68,68,0.08)",
                    border: "1px solid rgba(239,68,68,0.2)",
                    borderRadius: "var(--radius-md)",
                  }}
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "var(--text-base)",
                  fontWeight: 600,
                  color: "white",
                  background: loading
                    ? "rgba(91,110,245,0.5)"
                    : "linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-secondary))",
                  border: "none",
                  borderRadius: "var(--radius-lg)",
                  padding: "var(--space-4)",
                  cursor: loading ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "var(--space-2)",
                  width: "100%",
                  transition: "opacity var(--duration-fast)",
                  marginTop: "var(--space-2)",
                }}
              >
                {loading ? (
                  <span
                    style={{
                      width: 16,
                      height: 16,
                      border: "2px solid rgba(255,255,255,0.3)",
                      borderTopColor: "white",
                      borderRadius: "50%",
                      display: "inline-block",
                      animation: "spin 0.7s linear infinite",
                    }}
                  />
                ) : (
                  <>
                    {mode === "login" ? "Войти" : "Создать аккаунт"}
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          )}

          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "var(--text-sm)",
              color: "var(--color-text-muted)",
              textAlign: "center",
              marginTop: "var(--space-6)",
            }}
          >
            {mode === "login" ? "Нет аккаунта?" : "Уже есть аккаунт?"}{" "}
            <button
              type="button"
              onClick={() => {
                setMode(mode === "login" ? "signup" : "login");
                setError("");
                setSignupDone(false);
              }}
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "var(--text-sm)",
                fontWeight: 600,
                color: "var(--color-accent-primary)",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
              }}
            >
              {mode === "login" ? "Зарегистрироваться" : "Войти"}
            </button>
          </p>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
