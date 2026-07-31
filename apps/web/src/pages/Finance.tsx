import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { TrendingDown, TrendingUp, AlertTriangle, CheckCircle2, Send } from "lucide-react";

const REVENUE_DATA = [
  { month: "Янв", revenue: 4200, profit: 1176 },
  { month: "Фев", revenue: 3900, profit: 1092 },
  { month: "Мар", revenue: 4500, profit: 1260 },
  { month: "Апр", revenue: 4100, profit: 1148 },
  { month: "Май", revenue: 3600, profit: 864 },
  { month: "Июн", revenue: 3200, profit: 672 },
  { month: "Июл", revenue: 2900, profit: 493 },
];

const EXPENSE_DATA = [
  { cat: "Зарплаты", value: 1800, prev: 1400 },
  { cat: "Реклама", value: 900, prev: 600 },
  { cat: "Инфраструктура", value: 420, prev: 390 },
  { cat: "Офис", value: 280, prev: 270 },
  { cat: "Прочее", value: 340, prev: 210 },
];

const ISSUES = [
  {
    title: "CPL вырос ×2.3 в Meta",
    severity: "high",
    impact: "-₽480 000/мес",
    fix: "Пересмотреть таргетинг и креативы",
  },
  {
    title: "LTV упал на 18%",
    severity: "high",
    impact: "-₽320 000/мес",
    fix: "Запустить retention-программу",
  },
  {
    title: "Операционные расходы +31%",
    severity: "medium",
    impact: "-₽260 000/мес",
    fix: "Аудит подрядчиков и SaaS-подписок",
  },
];

const SEV_COLOR: Record<string, string> = {
  high: "#ef4444",
  medium: "#f59e0b",
  low: "#10b981",
};
const SEV_LABEL: Record<string, string> = {
  high: "Критично",
  medium: "Важно",
  low: "Низкое",
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;
  return (
    <div
      style={{
        background: "var(--color-bg-elevated)",
        border: "1px solid var(--color-border-default)",
        borderRadius: "var(--radius-md)",
        padding: "var(--space-3) var(--space-4)",
      }}
    >
      <p
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          color: "var(--color-text-muted)",
          margin: "0 0 4px 0",
        }}
      >
        {label}
      </p>
      {payload.map((p: any) => (
        <p
          key={p.name}
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "var(--text-sm)",
            fontWeight: 600,
            color: p.color,
            margin: 0,
          }}
        >
          ₽{p.value.toLocaleString()}к — {p.name}
        </p>
      ))}
    </div>
  );
};

export default function Finance() {
  const [query, setQuery] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(true);

  const runAnalysis = () => {
    if (!query.trim()) return;
    setAnalyzing(true);
    setAnalyzed(false);
    setTimeout(() => {
      setAnalyzing(false);
      setAnalyzed(true);
    }, 2200);
  };

  return (
    <div style={{ padding: "var(--space-8)", maxWidth: 1100 }}>
      {/* Header */}
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
          Finance / Analytics
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
          Финансовый анализ
        </h1>

        {/* Query input */}
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
          <TrendingDown size={16} color="var(--color-text-muted)" style={{ flexShrink: 0 }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && runAnalysis()}
            placeholder='"Падает прибыль" или "Почему вырос CAC?"'
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
            onClick={runAnalysis}
            disabled={analyzing}
            style={{
              background:
                "linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-secondary))",
              border: "none",
              borderRadius: "var(--radius-md)",
              padding: "var(--space-2) var(--space-4)",
              cursor: analyzing ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "var(--space-2)",
              opacity: analyzing ? 0.6 : 1,
            }}
          >
            {analyzing ? (
              <div
                style={{
                  width: 14,
                  height: 14,
                  border: "2px solid rgba(255,255,255,0.3)",
                  borderTopColor: "white",
                  borderRadius: "50%",
                  animation: "spin 0.7s linear infinite",
                }}
              />
            ) : (
              <Send size={14} color="white" />
            )}
            <span
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "var(--text-sm)",
                fontWeight: 600,
                color: "white",
              }}
            >
              {analyzing ? "Анализирую…" : "Анализировать"}
            </span>
          </button>
        </div>
      </div>

      {analyzed && (
        <>
          {/* KPI row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "var(--space-4)",
              marginBottom: "var(--space-6)",
            }}
          >
            {[
              {
                label: "Выручка (июл)",
                value: "₽2.9М",
                delta: "-₽310К vs июн",
                up: false,
              },
              {
                label: "Прибыль",
                value: "₽493К",
                delta: "-26% vs июн",
                up: false,
              },
              {
                label: "Маржа",
                value: "17%",
                delta: "Was 28% в Q1",
                up: false,
              },
              {
                label: "CAC",
                value: "₽4 200",
                delta: "+82% за квартал",
                up: false,
              },
            ].map((k) => (
              <div
                key={k.label}
                style={{
                  background: "var(--color-bg-surface)",
                  border: "1px solid var(--color-border-subtle)",
                  borderRadius: "var(--radius-xl)",
                  padding: "var(--space-5)",
                }}
              >
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "var(--text-xs)",
                    color: "var(--color-text-muted)",
                    margin: "0 0 var(--space-2) 0",
                    fontWeight: 500,
                  }}
                >
                  {k.label}
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "var(--text-xl)",
                    fontWeight: 800,
                    letterSpacing: "var(--tracking-tight)",
                    color: "var(--color-text-primary)",
                    margin: "0 0 var(--space-1) 0",
                  }}
                >
                  {k.value}
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  {k.up ? (
                    <TrendingUp size={12} color="var(--color-accent-success)" />
                  ) : (
                    <TrendingDown size={12} color="var(--color-accent-danger)" />
                  )}
                  <span
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "var(--text-xs)",
                      color: k.up ? "var(--color-accent-success)" : "var(--color-accent-danger)",
                    }}
                  >
                    {k.delta}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.6fr 1fr",
              gap: "var(--space-5)",
              marginBottom: "var(--space-6)",
            }}
          >
            {/* Revenue chart */}
            <div
              style={{
                background: "var(--color-bg-surface)",
                border: "1px solid var(--color-border-subtle)",
                borderRadius: "var(--radius-xl)",
                padding: "var(--space-6)",
              }}
            >
              <h3
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "var(--text-base)",
                  fontWeight: 600,
                  color: "var(--color-text-primary)",
                  margin: "0 0 var(--space-5) 0",
                }}
              >
                Выручка и прибыль, ₽тыс
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={REVENUE_DATA}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#5b6ef5" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#5b6ef5" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
                  <XAxis
                    dataKey="month"
                    tick={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      fill: "#555a6b",
                    }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      fill: "#555a6b",
                    }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    name="Выручка"
                    stroke="#5b6ef5"
                    fill="url(#revGrad)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="profit"
                    name="Прибыль"
                    stroke="#ef4444"
                    fill="url(#profitGrad)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Expenses chart */}
            <div
              style={{
                background: "var(--color-bg-surface)",
                border: "1px solid var(--color-border-subtle)",
                borderRadius: "var(--radius-xl)",
                padding: "var(--space-6)",
              }}
            >
              <h3
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "var(--text-base)",
                  fontWeight: 600,
                  color: "var(--color-text-primary)",
                  margin: "0 0 var(--space-5) 0",
                }}
              >
                Расходы по категориям
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={EXPENSE_DATA} barGap={4}>
                  <CartesianGrid
                    stroke="rgba(255,255,255,0.05)"
                    strokeDasharray="4 4"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="cat"
                    tick={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      fill: "#555a6b",
                    }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      fill: "#555a6b",
                    }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="prev"
                    name="Прошлый"
                    fill="rgba(91,110,245,0.2)"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar dataKey="value" name="Текущий" fill="#5b6ef5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Issues */}
          <div>
            <h3
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "var(--text-base)",
                fontWeight: 600,
                color: "var(--color-text-primary)",
                margin: "0 0 var(--space-4) 0",
              }}
            >
              Выявленные проблемы
            </h3>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-3)",
              }}
            >
              {ISSUES.map((issue) => (
                <div
                  key={issue.title}
                  style={{
                    background: "var(--color-bg-surface)",
                    border: `1px solid ${SEV_COLOR[issue.severity]}25`,
                    borderLeft: `3px solid ${SEV_COLOR[issue.severity]}`,
                    borderRadius: "var(--radius-lg)",
                    padding: "var(--space-4) var(--space-5)",
                    display: "grid",
                    gridTemplateColumns: "1fr auto auto",
                    gap: "var(--space-5)",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "var(--space-3)",
                    }}
                  >
                    <AlertTriangle size={16} color={SEV_COLOR[issue.severity]} />
                    <div>
                      <p
                        style={{
                          fontFamily: "var(--font-body)",
                          fontSize: "var(--text-sm)",
                          fontWeight: 600,
                          color: "var(--color-text-primary)",
                          margin: "0 0 2px 0",
                        }}
                      >
                        {issue.title}
                      </p>
                      <p
                        style={{
                          fontFamily: "var(--font-body)",
                          fontSize: "var(--text-xs)",
                          color: "var(--color-text-muted)",
                          margin: 0,
                        }}
                      >
                        {issue.fix}
                      </p>
                    </div>
                  </div>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "var(--text-sm)",
                      fontWeight: 600,
                      color: SEV_COLOR[issue.severity],
                      whiteSpace: "nowrap",
                    }}
                  >
                    {issue.impact}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      color: SEV_COLOR[issue.severity],
                      background: `${SEV_COLOR[issue.severity]}15`,
                      border: `1px solid ${SEV_COLOR[issue.severity]}25`,
                      borderRadius: "var(--radius-full)",
                      padding: "2px 8px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {SEV_LABEL[issue.severity]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
