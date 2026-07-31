import { useState } from "react";
import { Activity, CheckCircle2, Clock, AlertCircle, RefreshCw, Send, Play } from "lucide-react";

const TASKS = [
  {
    id: 1,
    title: "KPI-дайджест за неделю",
    schedule: "Каждый понедельник 09:00",
    last: "28 июл",
    status: "done",
    category: "Отчёты",
  },
  {
    id: 2,
    title: "Мониторинг SLA поддержки",
    schedule: "Каждый день 10:00",
    last: "30 июл",
    status: "done",
    category: "Контроль",
  },
  {
    id: 3,
    title: "Сверка финансовых данных",
    schedule: "Каждую пятницу",
    last: "26 июл",
    status: "pending",
    category: "Финансы",
  },
  {
    id: 4,
    title: "Обновление базы клиентов",
    schedule: "Каждую среду",
    last: "24 июл",
    status: "error",
    category: "CRM",
  },
  {
    id: 5,
    title: "Еженедельный отчёт продаж",
    schedule: "Каждый понедельник 10:00",
    last: "28 июл",
    status: "done",
    category: "Продажи",
  },
  {
    id: 6,
    title: "Аудит подписок SaaS",
    schedule: "1-го числа каждого месяца",
    last: "1 июл",
    status: "pending",
    category: "Расходы",
  },
];

const KPI_ITEMS = [
  { label: "NPS", value: 62, target: 70, unit: "" },
  { label: "Тикеты закрыты", value: 84, target: 90, unit: "%" },
  { label: "Время отклика", value: 2.4, target: 2.0, unit: "ч" },
  { label: "Uptime", value: 99.7, target: 99.9, unit: "%" },
];

const STATUS_ICON: Record<string, React.ReactNode> = {
  done: <CheckCircle2 size={14} color="var(--color-accent-success)" />,
  pending: <Clock size={14} color="var(--color-accent-warning)" />,
  error: <AlertCircle size={14} color="var(--color-accent-danger)" />,
};

const STATUS_COLOR: Record<string, string> = {
  done: "var(--color-accent-success)",
  pending: "var(--color-accent-warning)",
  error: "var(--color-accent-danger)",
};

const STATUS_LABEL: Record<string, string> = {
  done: "Выполнено",
  pending: "Ожидает",
  error: "Ошибка",
};

export default function Operations() {
  const [query, setQuery] = useState("");
  const [runningId, setRunningId] = useState<number | null>(null);
  const [doneTasks, setDoneTasks] = useState<number[]>([]);

  const handleRun = (id: number) => {
    setRunningId(id);
    setTimeout(() => {
      setRunningId(null);
      setDoneTasks((prev) => [...prev, id]);
    }, 2000);
  };

  const handleQuery = () => {
    if (!query.trim()) return;
    setQuery("");
  };

  return (
    <div style={{ padding: "var(--space-8)", maxWidth: 1100 }}>
      <div style={{ marginBottom: "var(--space-8)" }}>
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "var(--text-xs)",
            color: "var(--color-text-muted)",
            letterSpacing: "var(--tracking-wider)",
            textTransform: "uppercase",
            margin: "0 0 var(--space-2) 0",
          }}
        >
          Operations
        </p>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--text-2xl)",
            fontWeight: 800,
            letterSpacing: "var(--tracking-tight)",
            color: "var(--color-text-primary)",
            margin: "0 0 var(--space-5) 0",
          }}
        >
          Операции
        </h1>
        <div
          style={{
            background: "var(--color-bg-surface)",
            border: "1px solid var(--color-border-default)",
            borderRadius: "var(--radius-xl)",
            padding: "var(--space-4) var(--space-5)",
            display: "flex",
            alignItems: "center",
            gap: "var(--space-3)",
            maxWidth: 700,
          }}
        >
          <Activity size={16} color="var(--color-text-muted)" style={{ flexShrink: 0 }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleQuery()}
            placeholder='"Создать еженедельный отчёт" или "Проверить SLA"'
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
            onClick={handleQuery}
            style={{
              background:
                "linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-secondary))",
              border: "none",
              borderRadius: "var(--radius-md)",
              padding: "var(--space-2) var(--space-4)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "var(--space-2)",
            }}
          >
            <Send size={14} color="white" />
            <span
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "var(--text-sm)",
                fontWeight: 600,
                color: "white",
              }}
            >
              Запустить
            </span>
          </button>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.5fr 1fr",
          gap: "var(--space-6)",
        }}
      >
        {/* Automated tasks */}
        <div>
          <h2
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "var(--text-base)",
              fontWeight: 600,
              color: "var(--color-text-primary)",
              margin: "0 0 var(--space-4) 0",
            }}
          >
            Автоматизированные задачи
          </h2>
          <div
            style={{
              background: "var(--color-bg-surface)",
              border: "1px solid var(--color-border-subtle)",
              borderRadius: "var(--radius-xl)",
              overflow: "hidden",
            }}
          >
            {TASKS.map((task, i) => {
              const isRunning = runningId === task.id;
              const isDone = doneTasks.includes(task.id);
              const effectiveStatus = isDone ? "done" : task.status;
              return (
                <div
                  key={task.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--space-4)",
                    padding: "var(--space-4) var(--space-5)",
                    borderBottom:
                      i < TASKS.length - 1 ? "1px solid var(--color-border-subtle)" : "none",
                    transition: "background var(--duration-fast)",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "var(--color-bg-elevated)")
                  }
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <div style={{ flexShrink: 0 }}>
                    {isRunning ? (
                      <RefreshCw
                        size={14}
                        color="var(--color-accent-primary)"
                        style={{ animation: "spin 1s linear infinite" }}
                      />
                    ) : (
                      STATUS_ICON[effectiveStatus]
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontFamily: "var(--font-body)",
                        fontSize: "var(--text-sm)",
                        fontWeight: 500,
                        color: "var(--color-text-primary)",
                        margin: "0 0 2px 0",
                      }}
                    >
                      {task.title}
                    </p>
                    <p
                      style={{
                        fontFamily: "var(--font-body)",
                        fontSize: "var(--text-xs)",
                        color: "var(--color-text-muted)",
                        margin: 0,
                      }}
                    >
                      {task.schedule}
                    </p>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 10,
                        color: STATUS_COLOR[effectiveStatus],
                        background: `${STATUS_COLOR[effectiveStatus]}15`,
                        border: `1px solid ${STATUS_COLOR[effectiveStatus]}25`,
                        borderRadius: "var(--radius-full)",
                        padding: "2px 8px",
                        display: "block",
                        marginBottom: 4,
                      }}
                    >
                      {isRunning ? "Идёт…" : STATUS_LABEL[effectiveStatus]}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-body)",
                        fontSize: "var(--text-xs)",
                        color: "var(--color-text-muted)",
                      }}
                    >
                      {task.last}
                    </span>
                  </div>
                  <button
                    onClick={() => handleRun(task.id)}
                    disabled={isRunning}
                    style={{
                      background: "var(--color-bg-elevated)",
                      border: "1px solid var(--color-border-default)",
                      borderRadius: "var(--radius-md)",
                      padding: "var(--space-2)",
                      cursor: isRunning ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--color-text-muted)",
                      transition: "all var(--duration-fast)",
                      flexShrink: 0,
                    }}
                    onMouseEnter={(e) => {
                      if (!isRunning) e.currentTarget.style.color = "var(--color-accent-primary)";
                    }}
                    onMouseLeave={(e) => {
                      if (!isRunning) e.currentTarget.style.color = "var(--color-text-muted)";
                    }}
                  >
                    <Play size={12} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* KPI panel */}
        <div>
          <h2
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "var(--text-base)",
              fontWeight: 600,
              color: "var(--color-text-primary)",
              margin: "0 0 var(--space-4) 0",
            }}
          >
            KPI недели
          </h2>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-3)",
            }}
          >
            {KPI_ITEMS.map((kpi) => {
              const pct = Math.min((kpi.value / kpi.target) * 100, 100);
              const onTarget = kpi.value >= kpi.target;
              return (
                <div
                  key={kpi.label}
                  style={{
                    background: "var(--color-bg-surface)",
                    border: "1px solid var(--color-border-subtle)",
                    borderRadius: "var(--radius-xl)",
                    padding: "var(--space-5)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "var(--space-3)",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-body)",
                        fontSize: "var(--text-sm)",
                        fontWeight: 500,
                        color: "var(--color-text-secondary)",
                      }}
                    >
                      {kpi.label}
                    </span>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "baseline",
                        gap: 4,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "var(--font-display)",
                          fontSize: "var(--text-lg)",
                          fontWeight: 800,
                          letterSpacing: "var(--tracking-tight)",
                          color: "var(--color-text-primary)",
                        }}
                      >
                        {kpi.value}
                        {kpi.unit}
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--font-body)",
                          fontSize: "var(--text-xs)",
                          color: "var(--color-text-muted)",
                        }}
                      >
                        / {kpi.target}
                        {kpi.unit}
                      </span>
                    </div>
                  </div>
                  <div
                    style={{
                      height: 6,
                      background: "var(--color-bg-elevated)",
                      borderRadius: "var(--radius-full)",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${pct}%`,
                        background: onTarget
                          ? "var(--color-accent-success)"
                          : "var(--color-accent-warning)",
                        borderRadius: "var(--radius-full)",
                        transition: "width 0.8s var(--ease-out)",
                      }}
                    />
                  </div>
                  <p
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "var(--text-xs)",
                      color: onTarget
                        ? "var(--color-accent-success)"
                        : "var(--color-accent-warning)",
                      margin: "var(--space-2) 0 0 0",
                    }}
                  >
                    {onTarget
                      ? "✓ Цель достигнута"
                      : `Отставание: ${(kpi.target - kpi.value).toFixed(1)}${kpi.unit}`}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
