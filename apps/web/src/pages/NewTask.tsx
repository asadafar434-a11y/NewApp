import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Sparkles,
  ArrowLeft,
  Send,
  Users,
  TrendingDown,
  Megaphone,
  Activity,
  ChevronRight,
} from "lucide-react";

const SUGGESTIONS = [
  { text: "Нанять frontend-разработчика", icon: Users, color: "#5b6ef5" },
  {
    text: "Почему упала прибыль в июле?",
    icon: TrendingDown,
    color: "#ef4444",
  },
  {
    text: "Запустить email-рассылку по базе",
    icon: Megaphone,
    color: "#7c3aed",
  },
  {
    text: "Подготовить операционный отчёт за квартал",
    icon: Activity,
    color: "#10b981",
  },
  {
    text: "Провести аудит рекламных расходов",
    icon: Megaphone,
    color: "#f59e0b",
  },
  { text: "Нанять менеджера по продажам", icon: Users, color: "#5b6ef5" },
];

type Msg = { role: "user" | "ai"; text: string };

const AI_REPLIES: Record<string, string> = {
  default: "Принято. Запускаю агента — ищу нужные данные, анализирую и скоро подготовлю отчёт.",
  найти: "Начинаю поиск кандидатов. Проверяю LinkedIn, HH.ru и Behance по вашим критериям.",
  нанять: "Запущен процесс найма. Ищу кандидатов, скоро пришлю список с рейтингом совпадения.",
  прибыль: "Анализирую финансовые данные. Проверяю CRM, расходы и рекламные каналы.",
  упала: "Запускаю финансовый анализ. Через несколько секунд дам полную картину.",
  реклама: "Аудит рекламных кампаний начат. Смотрю ROAS, CPL и конверсии по всем каналам.",
  отчёт: "Формирую отчёт. Собираю данные из всех источников.",
};

export default function NewTask() {
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const send = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Msg = { role: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    setTimeout(() => {
      const lower = text.toLowerCase();
      const replyKey = Object.keys(AI_REPLIES).find((k) => lower.includes(k)) || "default";
      const aiMsg: Msg = { role: "ai", text: AI_REPLIES[replyKey] };
      setMessages((prev) => [...prev, aiMsg]);
      setTyping(false);
    }, 1400);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        maxWidth: 800,
        margin: "0 auto",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "var(--space-5) var(--space-8)",
          borderBottom: "1px solid var(--color-border-subtle)",
          display: "flex",
          alignItems: "center",
          gap: "var(--space-4)",
        }}
      >
        <button
          onClick={() => navigate(-1)}
          style={{
            background: "var(--color-bg-elevated)",
            border: "1px solid var(--color-border-default)",
            borderRadius: "var(--radius-md)",
            padding: "var(--space-2)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--color-text-muted)",
            transition: "color var(--duration-fast)",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-text-primary)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-muted)")}
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-lg)",
              fontWeight: 800,
              letterSpacing: "var(--tracking-tight)",
              color: "var(--color-text-primary)",
              margin: 0,
            }}
          >
            Новая задача
          </h1>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "var(--text-xs)",
              color: "var(--color-text-muted)",
              margin: 0,
            }}
          >
            Опишите задачу на обычном языке
          </p>
        </div>
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "var(--space-8)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-5)",
        }}
      >
        {messages.length === 0 && (
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: "var(--radius-xl)",
                background:
                  "linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-secondary))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "var(--space-5)",
              }}
            >
              <Sparkles size={26} color="white" />
            </div>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "var(--text-xl)",
                fontWeight: 800,
                letterSpacing: "var(--tracking-tight)",
                color: "var(--color-text-primary)",
                margin: "0 0 var(--space-3) 0",
              }}
            >
              Что нужно сделать?
            </h2>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "var(--text-base)",
                color: "var(--color-text-secondary)",
                margin: "0 0 var(--space-8) 0",
                maxWidth: 380,
                lineHeight: "var(--leading-normal)",
              }}
            >
              Напишите задачу свободным текстом или выберите пример:
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "var(--space-3)",
                width: "100%",
                maxWidth: 560,
              }}
            >
              {SUGGESTIONS.map((s) => {
                const Icon = s.icon;
                return (
                  <button
                    key={s.text}
                    onClick={() => send(s.text)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "var(--space-3)",
                      padding: "var(--space-4)",
                      background: "var(--color-bg-surface)",
                      border: "1px solid var(--color-border-default)",
                      borderRadius: "var(--radius-lg)",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "all var(--duration-fast)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = `${s.color}44`;
                      e.currentTarget.style.background = "var(--color-bg-elevated)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "var(--color-border-default)";
                      e.currentTarget.style.background = "var(--color-bg-surface)";
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "var(--radius-md)",
                        background: `${s.color}18`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={15} color={s.color} />
                    </div>
                    <span
                      style={{
                        fontFamily: "var(--font-body)",
                        fontSize: "var(--text-sm)",
                        color: "var(--color-text-secondary)",
                        lineHeight: 1.4,
                      }}
                    >
                      {s.text}
                    </span>
                    <ChevronRight
                      size={12}
                      color="var(--color-text-muted)"
                      style={{ marginLeft: "auto", flexShrink: 0 }}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
              animation: "slideUp 0.3s var(--ease-out)",
            }}
          >
            {msg.role === "ai" && (
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: "var(--radius-md)",
                  background:
                    "linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-secondary))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  marginRight: "var(--space-3)",
                  marginTop: 4,
                }}
              >
                <Sparkles size={14} color="white" />
              </div>
            )}
            <div
              style={{
                maxWidth: "72%",
                padding: "var(--space-4) var(--space-5)",
                borderRadius:
                  msg.role === "user"
                    ? "var(--radius-xl) var(--radius-md) var(--radius-md) var(--radius-xl)"
                    : "var(--radius-md) var(--radius-xl) var(--radius-xl) var(--radius-md)",
                background:
                  msg.role === "user"
                    ? "linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-secondary))"
                    : "var(--color-bg-surface)",
                border: msg.role === "user" ? "none" : "1px solid var(--color-border-default)",
              }}
            >
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "var(--text-base)",
                  color: msg.role === "user" ? "white" : "var(--color-text-primary)",
                  margin: 0,
                  lineHeight: "var(--leading-normal)",
                }}
              >
                {msg.text}
              </p>
            </div>
          </div>
        ))}

        {typing && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-3)",
              animation: "slideUp 0.3s var(--ease-out)",
            }}
          >
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: "var(--radius-md)",
                background:
                  "linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-secondary))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Sparkles size={14} color="white" />
            </div>
            <div
              style={{
                padding: "var(--space-4) var(--space-5)",
                background: "var(--color-bg-surface)",
                border: "1px solid var(--color-border-default)",
                borderRadius: "var(--radius-md) var(--radius-xl) var(--radius-xl) var(--radius-md)",
                display: "flex",
                gap: 6,
                alignItems: "center",
              }}
            >
              {[0, 1, 2].map((n) => (
                <div
                  key={n}
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "var(--color-accent-primary)",
                    animation: `bounce 1s ease-in-out ${n * 0.15}s infinite`,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div
        style={{
          padding: "var(--space-5) var(--space-8)",
          borderTop: "1px solid var(--color-border-subtle)",
        }}
      >
        <div
          style={{
            background: "var(--color-bg-surface)",
            border: "1px solid var(--color-border-default)",
            borderRadius: "var(--radius-xl)",
            padding: "var(--space-4) var(--space-5)",
            display: "flex",
            alignItems: "center",
            gap: "var(--space-3)",
            boxShadow: "var(--shadow-glow)",
          }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send(input))}
            placeholder="Опишите задачу…"
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              fontFamily: "var(--font-body)",
              fontSize: "var(--text-base)",
              color: "var(--color-text-primary)",
            }}
          />
          <button
            onClick={() => send(input)}
            disabled={!input.trim() || typing}
            style={{
              background:
                input.trim() && !typing
                  ? "linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-secondary))"
                  : "var(--color-bg-elevated)",
              border: "1px solid var(--color-border-default)",
              borderRadius: "var(--radius-md)",
              padding: "var(--space-2) var(--space-4)",
              cursor: input.trim() && !typing ? "pointer" : "not-allowed",
              display: "flex",
              alignItems: "center",
              gap: "var(--space-2)",
              transition: "all var(--duration-fast)",
              flexShrink: 0,
            }}
          >
            <Send size={14} color={input.trim() && !typing ? "white" : "var(--color-text-muted)"} />
            <span
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "var(--text-sm)",
                fontWeight: 600,
                color: input.trim() && !typing ? "white" : "var(--color-text-muted)",
              }}
            >
              Отправить
            </span>
          </button>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        @keyframes slideUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
