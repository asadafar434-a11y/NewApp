import { useState } from "react";
import { Mail } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { authClient } from "../lib/authClient";

export default function VerifyEmail() {
  const { user, logout } = useAuth();
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const resend = async () => {
    if (!user) return;
    setStatus("sending");
    const { error } = await authClient.sendVerificationEmail({
      email: user.email,
      callbackURL: `${window.location.origin}/`,
    });
    setStatus(error ? "error" : "sent");
  };

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
      <div style={{ width: "100%", maxWidth: 420, textAlign: "center" }}>
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
          <Mail size={26} color="white" />
        </div>

        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--text-xl)",
            fontWeight: 800,
            letterSpacing: "var(--tracking-tight)",
            color: "var(--color-text-primary)",
            margin: "0 0 var(--space-3) 0",
          }}
        >
          Подтвердите email
        </h1>

        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "var(--text-base)",
            color: "var(--color-text-secondary)",
            lineHeight: "var(--leading-normal)",
            margin: "0 0 var(--space-8) 0",
          }}
        >
          Мы отправили письмо со ссылкой на{" "}
          <span style={{ color: "var(--color-text-primary)", fontWeight: 600 }}>{user?.email}</span>
          . Перейдите по ней, чтобы начать работу с Orbital.
        </p>

        {status === "sent" && (
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "var(--text-sm)",
              color: "var(--color-accent-success)",
              margin: "0 0 var(--space-5) 0",
            }}
          >
            Письмо отправлено повторно.
          </p>
        )}
        {status === "error" && (
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "var(--text-sm)",
              color: "var(--color-accent-danger)",
              margin: "0 0 var(--space-5) 0",
            }}
          >
            Не удалось отправить письмо. Попробуйте ещё раз.
          </p>
        )}

        <button
          type="button"
          onClick={resend}
          disabled={status === "sending"}
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "var(--text-base)",
            fontWeight: 600,
            color: "white",
            background:
              status === "sending"
                ? "rgba(91,110,245,0.5)"
                : "linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-secondary))",
            border: "none",
            borderRadius: "var(--radius-lg)",
            padding: "var(--space-4)",
            cursor: status === "sending" ? "not-allowed" : "pointer",
            width: "100%",
            marginBottom: "var(--space-4)",
          }}
        >
          {status === "sending" ? "Отправляем…" : "Отправить письмо повторно"}
        </button>

        <button
          type="button"
          onClick={() => logout()}
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "var(--text-sm)",
            color: "var(--color-text-muted)",
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
        >
          Выйти
        </button>
      </div>
    </div>
  );
}
