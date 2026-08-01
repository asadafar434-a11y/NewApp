import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { KeyRound } from "lucide-react";
import { authClient } from "../lib/authClient";

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

const buttonStyle = (disabled: boolean): React.CSSProperties => ({
  fontFamily: "var(--font-body)",
  fontSize: "var(--text-base)",
  fontWeight: 600,
  color: "white",
  background: disabled
    ? "rgba(91,110,245,0.5)"
    : "linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-secondary))",
  border: "none",
  borderRadius: "var(--radius-lg)",
  padding: "var(--space-4)",
  cursor: disabled ? "not-allowed" : "pointer",
  width: "100%",
});

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--color-bg-base)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "var(--space-8)",
      }}
    >
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div
          style={{
            width: 56,
            height: 56,
            margin: "0 auto var(--space-6)",
            borderRadius: "var(--radius-xl)",
            background:
              "linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-secondary))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <KeyRound size={26} color="white" />
        </div>
        {children}
      </div>
    </div>
  );
}

function RequestStep() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    await authClient.requestPasswordReset({
      email,
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    setDone(true);
  };

  if (done) {
    return (
      <p
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "var(--text-base)",
          color: "var(--color-text-secondary)",
          textAlign: "center",
          lineHeight: "var(--leading-normal)",
        }}
      >
        Если такой email зарегистрирован — на него отправлена ссылка для сброса пароля.
      </p>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}
    >
      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "var(--text-xl)",
          fontWeight: 800,
          color: "var(--color-text-primary)",
          textAlign: "center",
          margin: "0 0 var(--space-2) 0",
        }}
      >
        Восстановление пароля
      </h1>
      <p
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "var(--text-sm)",
          color: "var(--color-text-muted)",
          textAlign: "center",
          margin: "0 0 var(--space-4) 0",
        }}
      >
        Введите email — пришлём ссылку для сброса пароля.
      </p>
      <div>
        <label style={labelStyle}>Email</label>
        <input
          type="email"
          style={inputStyle}
          placeholder="ivan@company.ru"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <button type="submit" disabled={loading} style={buttonStyle(loading)}>
        {loading ? "Отправляем…" : "Прислать ссылку"}
      </button>
    </form>
  );
}

function ConfirmStep({ token }: { token: string }) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Пароль должен быть не короче 8 символов");
      return;
    }
    setLoading(true);
    const { error: resetError } = await authClient.resetPassword({ newPassword: password, token });
    setLoading(false);
    if (resetError) {
      setError(resetError.message || "Ссылка недействительна или устарела");
      return;
    }
    setDone(true);
    setTimeout(() => navigate("/auth"), 2000);
  };

  if (done) {
    return (
      <p
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "var(--text-base)",
          color: "var(--color-accent-success)",
          textAlign: "center",
        }}
      >
        Пароль изменён. Сейчас перенаправим на вход…
      </p>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}
    >
      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "var(--text-xl)",
          fontWeight: 800,
          color: "var(--color-text-primary)",
          textAlign: "center",
          margin: "0 0 var(--space-6) 0",
        }}
      >
        Новый пароль
      </h1>
      <div>
        <label style={labelStyle}>Пароль</label>
        <input
          type="password"
          style={inputStyle}
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
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
      <button type="submit" disabled={loading} style={buttonStyle(loading)}>
        {loading ? "Сохраняем…" : "Сохранить новый пароль"}
      </button>
    </form>
  );
}

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token");

  return <Shell>{token ? <ConfirmStep token={token} /> : <RequestStep />}</Shell>;
}
