import { useState, useRef, useEffect } from "react";
import {
  Search,
  Sparkles,
  Star,
  MapPin,
  Briefcase,
  Clock,
  Send,
  Video,
  MessageSquare,
  ChevronRight,
  X,
  Check,
  Calendar,
  Phone,
  Mail,
  ExternalLink,
  ArrowLeft,
  ChevronDown,
  Filter,
  SlidersHorizontal,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type Status = "new" | "contacted" | "scheduled" | "interviewed" | "hired" | "rejected";

type Candidate = {
  id: number;
  name: string;
  role: string;
  exp: string;
  match: number;
  location: string;
  salary: string;
  source: string;
  status: Status;
  skills: string[];
  about: string;
  email: string;
  phone: string;
  portfolio?: string;
  availability: string;
  timezone: string;
  lastActive: string;
};

type Message = { from: "ai" | "user"; text: string };

type ScheduledCall = {
  id: string;
  candidateId: number;
  candidateName: string;
  candidateRole: string;
  date: string;
  time: string;
  link: string;
};

// ─── Data ────────────────────────────────────────────────────────────────────

const ALL_CANDIDATES: Candidate[] = [
  {
    id: 1,
    name: "Анна Ковалёва",
    role: "Senior UX Designer",
    exp: "6 лет",
    match: 94,
    location: "Москва",
    salary: "180 000 ₽",
    source: "LinkedIn",
    status: "new",
    skills: ["Figma", "User Research", "Prototyping", "Design Systems", "Usability Testing"],
    about:
      "Специализируюсь на проектировании сложных SaaS-продуктов. Работала в Яндексе и нескольких стартапах. Обожаю находить баланс между метриками и пользовательским опытом.",
    email: "anna.kovaleva@mail.ru",
    phone: "+7 (916) 234-56-78",
    portfolio: "kovaleva.design",
    availability: "Через 2 недели",
    timezone: "UTC+3",
    lastActive: "2 часа назад",
  },
  {
    id: 2,
    name: "Дмитрий Орлов",
    role: "Product Designer",
    exp: "4 года",
    match: 87,
    location: "Санкт-Петербург",
    salary: "150 000 ₽",
    source: "Behance",
    status: "contacted",
    skills: ["Figma", "Motion Design", "Design Systems", "Prototyping"],
    about:
      "Дизайнер продуктов с фокусом на анимацию и микровзаимодействия. Создавал дизайн-систему для финтех-стартапа с нуля.",
    email: "dmitry.orlov@gmail.com",
    phone: "+7 (911) 345-67-89",
    portfolio: "orlov.work",
    availability: "Сразу",
    timezone: "UTC+3",
    lastActive: "5 минут назад",
  },
  {
    id: 3,
    name: "Мария Смирнова",
    role: "UX/UI Designer",
    exp: "5 лет",
    match: 82,
    location: "Казань",
    salary: "140 000 ₽",
    source: "HH.ru",
    status: "scheduled",
    skills: ["Figma", "Sketch", "HTML/CSS", "User Research", "Wireframing"],
    about: "Работаю на стыке дизайна и разработки. Умею говорить с разработчиками на одном языке.",
    email: "maria.smirnova@yandex.ru",
    phone: "+7 (843) 456-78-90",
    availability: "Через месяц",
    timezone: "UTC+3",
    lastActive: "1 день назад",
  },
  {
    id: 4,
    name: "Артём Новиков",
    role: "Visual Designer",
    exp: "3 года",
    match: 76,
    location: "Новосибирск",
    salary: "120 000 ₽",
    source: "LinkedIn",
    status: "new",
    skills: ["Illustrator", "Figma", "Branding", "After Effects"],
    about: "Специалист по визуальной айдентике и брендингу. Работал с 40+ компаниями.",
    email: "novikov.art@gmail.com",
    phone: "+7 (913) 567-89-01",
    portfolio: "novikov.design",
    availability: "Через 3 недели",
    timezone: "UTC+7",
    lastActive: "3 часа назад",
  },
  {
    id: 5,
    name: "Екатерина Белова",
    role: "Senior Product Designer",
    exp: "7 лет",
    match: 91,
    location: "Москва",
    salary: "200 000 ₽",
    source: "Dribbble",
    status: "new",
    skills: ["Figma", "Design Systems", "User Research", "A/B Testing", "Leadership"],
    about:
      "Lead designer в e-commerce. Выстраивала дизайн-процессы с нуля, управляла командой 5 человек.",
    email: "e.belova@design.ru",
    phone: "+7 (925) 678-90-12",
    portfolio: "belova.co",
    availability: "Через 2 месяца",
    timezone: "UTC+3",
    lastActive: "30 минут назад",
  },
];

const STATUS_META: Record<Status, { label: string; color: string; bg: string }> = {
  new: { label: "Новый", color: "#8b90a0", bg: "rgba(139,144,160,0.12)" },
  contacted: {
    label: "Написали",
    color: "#5b6ef5",
    bg: "rgba(91,110,245,0.12)",
  },
  scheduled: {
    label: "Запланирован",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.12)",
  },
  interviewed: {
    label: "Интервью",
    color: "#7c3aed",
    bg: "rgba(124,58,237,0.12)",
  },
  hired: { label: "Нанят", color: "#10b981", bg: "rgba(16,185,129,0.12)" },
  rejected: { label: "Отказ", color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
};

const AI_RESPONSES: Record<string, string> = {
  дизайнер:
    "Нашёл 5 UX/UI дизайнеров. Лучшее совпадение — Анна Ковалёва (94%) и Екатерина Белова (91%). Хотите, чтобы я написал им от вашего имени?",
  ux: "Отобрал специалистов с опытом UX-исследований. Рекомендую начать с Анны Ковалёвой — 6 лет, ex-Яндекс, доступна через 2 недели.",
  senior:
    "Нашёл 2 senior-специалистов: Анна Ковалёва (6 лет, 180к) и Екатерина Белова (7 лет, 200к). Обе с опытом в дизайн-системах.",
  созвон:
    "Могу организовать созвоны. У Дмитрия Орлова самое раннее окно — он доступен сразу. Назначить на завтра в 11:00?",
  написать:
    "Готов написать кандидатам. Выберите тон: формальный, дружелюбный или краткий. По умолчанию использую дружелюбный стиль.",
  default:
    "Обрабатываю запрос. Просматриваю профили, оцениваю соответствие вашим критериям. Список обновлён — рекомендую начать с кандидатов с match > 85%.",
};

const MESSAGE_TEMPLATES = [
  {
    id: "intro",
    label: "Первое знакомство",
    text: (name: string) =>
      `Привет, ${name.split(" ")[0]}! Меня зовут Алексей, я основатель компании Orbital. Видел ваше портфолио — очень впечатлило. У нас открыта позиция дизайнера, и мне кажется, вы могли бы отлично вписаться. Было бы здорово пообщаться — вам удобно созвониться на 30 минут?`,
  },
  {
    id: "schedule",
    label: "Назначить встречу",
    text: (name: string) =>
      `${name.split(" ")[0]}, добрый день! Хотел бы пригласить вас на видеозвонок, чтобы рассказать о позиции и ответить на ваши вопросы. Удобно в среду или четверг на следующей неделе, 11:00–12:00 МСК?`,
  },
  {
    id: "follow",
    label: "Фолло-ап",
    text: (name: string) =>
      `Привет, ${name.split(" ")[0]}! Хотел уточнить — успели ли посмотреть моё сообщение? Мы всё ещё ищем дизайнера, и ваш профиль нас очень заинтересовал.`,
  },
];

const TIME_SLOTS = [
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
];

// ─── Candidate Card ───────────────────────────────────────────────────────────

function CandidateCard({
  candidate,
  onClick,
  selected,
}: {
  candidate: Candidate;
  onClick: () => void;
  selected: boolean;
}) {
  const sm = STATUS_META[candidate.status];
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "var(--space-4)",
        padding: "var(--space-4) var(--space-5)",
        background: selected ? "var(--color-bg-elevated)" : "transparent",
        border: "none",
        borderBottom: "1px solid var(--color-border-subtle)",
        cursor: "pointer",
        textAlign: "left",
        width: "100%",
        transition: "background var(--duration-fast)",
        borderLeft: selected ? "2px solid var(--color-accent-primary)" : "2px solid transparent",
      }}
      onMouseEnter={(e) => {
        if (!selected) e.currentTarget.style.background = "rgba(255,255,255,0.02)";
      }}
      onMouseLeave={(e) => {
        if (!selected) e.currentTarget.style.background = "transparent";
      }}
    >
      {/* Avatar */}
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: "var(--radius-full)",
          background:
            "linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-secondary))",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "var(--font-display)",
          fontSize: "var(--text-base)",
          fontWeight: 800,
          color: "white",
          flexShrink: 0,
        }}
      >
        {candidate.name[0]}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 2,
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "var(--text-sm)",
              fontWeight: 600,
              color: "var(--color-text-primary)",
            }}
          >
            {candidate.name}
          </span>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 3,
              flexShrink: 0,
              marginLeft: 8,
            }}
          >
            <Star size={11} color="#f59e0b" fill="#f59e0b" />
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                fontWeight: 700,
                color: "var(--color-text-primary)",
              }}
            >
              {candidate.match}%
            </span>
          </div>
        </div>

        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "var(--text-xs)",
            color: "var(--color-text-secondary)",
            margin: "0 0 var(--space-2) 0",
          }}
        >
          {candidate.role} · {candidate.exp}
        </p>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              color: "var(--color-text-muted)",
            }}
          >
            {candidate.location}
          </span>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              color: sm.color,
              background: sm.bg,
              borderRadius: "var(--radius-full)",
              padding: "1px 7px",
            }}
          >
            {sm.label}
          </span>
        </div>
      </div>
    </button>
  );
}

// ─── Schedule Modal ───────────────────────────────────────────────────────────

function ScheduleModal({
  candidate,
  onClose,
  onConfirm,
}: {
  candidate: Candidate;
  onClose: () => void;
  onConfirm: (date: string, time: string) => void;
}) {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  const today = new Date();
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i + 1);
    return d;
  });

  const fmt = (d: Date) =>
    d.toLocaleDateString("ru-RU", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backdropFilter: "blur(4px)",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "var(--color-bg-surface)",
          border: "1px solid var(--color-border-default)",
          borderRadius: "var(--radius-2xl)",
          padding: "var(--space-8)",
          width: 480,
          maxHeight: "85vh",
          overflowY: "auto",
          boxShadow: "var(--shadow-lg)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "var(--space-6)",
          }}
        >
          <div>
            <h3
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "var(--text-lg)",
                fontWeight: 800,
                color: "var(--color-text-primary)",
                margin: "0 0 4px 0",
                letterSpacing: "var(--tracking-tight)",
              }}
            >
              Назначить созвон
            </h3>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "var(--text-sm)",
                color: "var(--color-text-muted)",
                margin: 0,
              }}
            >
              с {candidate.name}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--color-text-muted)",
              padding: 4,
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Dates */}
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "var(--color-text-muted)",
            letterSpacing: "var(--tracking-wider)",
            textTransform: "uppercase",
            margin: "0 0 var(--space-3) 0",
          }}
        >
          Выберите дату
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "var(--space-2)",
            marginBottom: "var(--space-5)",
          }}
        >
          {days.slice(0, 8).map((d) => {
            const iso = d.toISOString().split("T")[0];
            const sel = selectedDate === iso;
            return (
              <button
                key={iso}
                onClick={() => setSelectedDate(iso)}
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "var(--text-xs)",
                  fontWeight: sel ? 600 : 400,
                  color: sel ? "white" : "var(--color-text-secondary)",
                  background: sel
                    ? "linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-secondary))"
                    : "var(--color-bg-elevated)",
                  border: `1px solid ${sel ? "transparent" : "var(--color-border-default)"}`,
                  borderRadius: "var(--radius-lg)",
                  padding: "var(--space-3)",
                  cursor: "pointer",
                  textAlign: "center",
                  transition: "all var(--duration-fast)",
                }}
              >
                {fmt(d)}
              </button>
            );
          })}
        </div>

        {/* Times */}
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "var(--color-text-muted)",
            letterSpacing: "var(--tracking-wider)",
            textTransform: "uppercase",
            margin: "0 0 var(--space-3) 0",
          }}
        >
          Время (МСК)
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "var(--space-2)",
            marginBottom: "var(--space-6)",
          }}
        >
          {TIME_SLOTS.map((t) => {
            const sel = selectedTime === t;
            return (
              <button
                key={t}
                onClick={() => setSelectedTime(t)}
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "var(--text-sm)",
                  fontWeight: sel ? 600 : 400,
                  color: sel ? "white" : "var(--color-text-secondary)",
                  background: sel
                    ? "linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-secondary))"
                    : "var(--color-bg-elevated)",
                  border: `1px solid ${sel ? "transparent" : "var(--color-border-default)"}`,
                  borderRadius: "var(--radius-md)",
                  padding: "var(--space-3)",
                  cursor: "pointer",
                  transition: "all var(--duration-fast)",
                }}
              >
                {t}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => selectedDate && selectedTime && onConfirm(selectedDate, selectedTime)}
          disabled={!selectedDate || !selectedTime}
          style={{
            width: "100%",
            fontFamily: "var(--font-body)",
            fontSize: "var(--text-base)",
            fontWeight: 600,
            color: "white",
            background:
              selectedDate && selectedTime
                ? "linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-secondary))"
                : "var(--color-bg-elevated)",
            border: `1px solid ${
              selectedDate && selectedTime ? "transparent" : "var(--color-border-default)"
            }`,
            borderRadius: "var(--radius-lg)",
            padding: "var(--space-4)",
            cursor: selectedDate && selectedTime ? "pointer" : "not-allowed",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "var(--space-2)",
            transition: "all var(--duration-fast)",
          }}
        >
          <Video
            size={16}
            color={selectedDate && selectedTime ? "white" : "var(--color-text-muted)"}
          />
          <span
            style={{
              color: selectedDate && selectedTime ? "white" : "var(--color-text-muted)",
            }}
          >
            Подтвердить созвон
          </span>
        </button>
      </div>
    </div>
  );
}

// ─── Message Modal ────────────────────────────────────────────────────────────

function MessageModal({
  candidate,
  onClose,
  onSend,
}: {
  candidate: Candidate;
  onClose: () => void;
  onSend: () => void;
}) {
  const [text, setText] = useState(MESSAGE_TEMPLATES[0].text(candidate.name));
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    setSent(true);
    setTimeout(() => {
      onSend();
      onClose();
    }, 1200);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backdropFilter: "blur(4px)",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "var(--color-bg-surface)",
          border: "1px solid var(--color-border-default)",
          borderRadius: "var(--radius-2xl)",
          padding: "var(--space-8)",
          width: 520,
          boxShadow: "var(--shadow-lg)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "var(--space-5)",
          }}
        >
          <div>
            <h3
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "var(--text-lg)",
                fontWeight: 800,
                color: "var(--color-text-primary)",
                margin: "0 0 4px 0",
                letterSpacing: "var(--tracking-tight)",
              }}
            >
              Написать кандидату
            </h3>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "var(--text-sm)",
                color: "var(--color-text-muted)",
                margin: 0,
              }}
            >
              → {candidate.email}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--color-text-muted)",
              padding: 4,
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Templates */}
        <div
          style={{
            display: "flex",
            gap: "var(--space-2)",
            marginBottom: "var(--space-4)",
            flexWrap: "wrap",
          }}
        >
          {MESSAGE_TEMPLATES.map((tpl) => (
            <button
              key={tpl.id}
              onClick={() => setText(tpl.text(candidate.name))}
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "var(--text-xs)",
                fontWeight: 500,
                color:
                  text === tpl.text(candidate.name)
                    ? "var(--color-accent-primary)"
                    : "var(--color-text-muted)",
                background:
                  text === tpl.text(candidate.name)
                    ? "var(--color-accent-glow)"
                    : "var(--color-bg-elevated)",
                border: `1px solid ${
                  text === tpl.text(candidate.name)
                    ? "rgba(91,110,245,0.3)"
                    : "var(--color-border-default)"
                }`,
                borderRadius: "var(--radius-full)",
                padding: "var(--space-1) var(--space-3)",
                cursor: "pointer",
                transition: "all var(--duration-fast)",
              }}
            >
              {tpl.label}
            </button>
          ))}
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
          style={{
            width: "100%",
            background: "var(--color-bg-elevated)",
            border: "1px solid var(--color-border-default)",
            borderRadius: "var(--radius-lg)",
            padding: "var(--space-4)",
            fontFamily: "var(--font-body)",
            fontSize: "var(--text-sm)",
            color: "var(--color-text-primary)",
            lineHeight: "var(--leading-normal)",
            outline: "none",
            resize: "vertical",
            boxSizing: "border-box",
            marginBottom: "var(--space-4)",
          }}
        />

        <button
          onClick={handleSend}
          disabled={sent}
          style={{
            width: "100%",
            fontFamily: "var(--font-body)",
            fontSize: "var(--text-base)",
            fontWeight: 600,
            color: "white",
            background:
              "linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-secondary))",
            border: "none",
            borderRadius: "var(--radius-lg)",
            padding: "var(--space-4)",
            cursor: sent ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "var(--space-2)",
            opacity: sent ? 0.7 : 1,
          }}
        >
          {sent ? <Check size={16} /> : <Send size={16} />}
          {sent ? "Отправлено!" : "Отправить сообщение"}
        </button>
      </div>
    </div>
  );
}

// ─── Candidate Detail ─────────────────────────────────────────────────────────

function CandidateDetail({
  candidate,
  onBack,
  onStatusChange,
  onSchedule,
  existingCall,
}: {
  candidate: Candidate;
  onBack: () => void;
  onStatusChange: (id: number, status: Status) => void;
  onSchedule: (call: ScheduledCall) => void;
  existingCall?: ScheduledCall;
}) {
  const [showSchedule, setShowSchedule] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [messageSent, setMessageSent] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const sm = STATUS_META[candidate.status];

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleScheduleConfirm = (date: string, time: string) => {
    const d = new Date(date);
    const label = d.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
    });
    const call: ScheduledCall = {
      id: `${candidate.id}-${date}-${time}`,
      candidateId: candidate.id,
      candidateName: candidate.name,
      candidateRole: candidate.role,
      date,
      time,
      link: `https://meet.orbital.ai/${candidate.id}-${Math.random().toString(36).slice(2, 8)}`,
    };
    onSchedule(call);
    onStatusChange(candidate.id, "scheduled");
    setShowSchedule(false);
    showToast(`✓ Созвон с ${candidate.name.split(" ")[0]} запланирован на ${label} в ${time}`);
  };

  const handleMessageSent = () => {
    setMessageSent(true);
    onStatusChange(candidate.id, "contacted");
    showToast(`✓ Сообщение отправлено ${candidate.name.split(" ")[0]}`);
  };

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
      }}
    >
      {/* Toast */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 32,
            right: 32,
            zIndex: 300,
            background: "var(--color-bg-elevated)",
            border: "1px solid rgba(16,185,129,0.3)",
            borderRadius: "var(--radius-lg)",
            padding: "var(--space-4) var(--space-5)",
            fontFamily: "var(--font-body)",
            fontSize: "var(--text-sm)",
            fontWeight: 500,
            color: "var(--color-accent-success)",
            boxShadow: "var(--shadow-lg)",
            animation: "slideUp 0.3s var(--ease-out)",
          }}
        >
          {toast}
        </div>
      )}

      {/* Header */}
      <div
        style={{
          padding: "var(--space-5) var(--space-6)",
          borderBottom: "1px solid var(--color-border-subtle)",
          display: "flex",
          alignItems: "center",
          gap: "var(--space-4)",
          flexShrink: 0,
        }}
      >
        <button
          onClick={onBack}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--color-text-muted)",
            display: "flex",
            alignItems: "center",
            gap: "var(--space-2)",
            padding: 0,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-text-primary)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-muted)")}
        >
          <ArrowLeft size={14} />
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "var(--text-sm)",
            }}
          >
            Назад
          </span>
        </button>
      </div>

      <div style={{ padding: "var(--space-6)", flex: 1 }}>
        {/* Profile header */}
        <div
          style={{
            display: "flex",
            gap: "var(--space-5)",
            marginBottom: "var(--space-6)",
            alignItems: "flex-start",
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "var(--radius-full)",
              background:
                "linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-secondary))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-xl)",
              fontWeight: 800,
              color: "white",
              flexShrink: 0,
            }}
          >
            {candidate.name[0]}
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-3)",
                marginBottom: 4,
              }}
            >
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "var(--text-xl)",
                  fontWeight: 800,
                  letterSpacing: "var(--tracking-tight)",
                  color: "var(--color-text-primary)",
                  margin: 0,
                }}
              >
                {candidate.name}
              </h2>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <Star size={14} color="#f59e0b" fill="#f59e0b" />
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "var(--text-sm)",
                    fontWeight: 700,
                    color: "var(--color-text-primary)",
                  }}
                >
                  {candidate.match}%
                </span>
              </div>
            </div>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "var(--text-base)",
                color: "var(--color-text-secondary)",
                margin: "0 0 var(--space-3) 0",
              }}
            >
              {candidate.role}
            </p>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "var(--space-3)",
              }}
            >
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  fontFamily: "var(--font-body)",
                  fontSize: "var(--text-xs)",
                  color: "var(--color-text-muted)",
                }}
              >
                <Briefcase size={11} /> {candidate.exp}
              </span>
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  fontFamily: "var(--font-body)",
                  fontSize: "var(--text-xs)",
                  color: "var(--color-text-muted)",
                }}
              >
                <MapPin size={11} /> {candidate.location}
              </span>
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  fontFamily: "var(--font-body)",
                  fontSize: "var(--text-xs)",
                  color: "var(--color-text-muted)",
                }}
              >
                <Clock size={11} /> Активен: {candidate.lastActive}
              </span>
            </div>
          </div>
        </div>

        {/* Status */}
        <div
          style={{
            display: "flex",
            gap: "var(--space-2)",
            marginBottom: "var(--space-5)",
            flexWrap: "wrap",
          }}
        >
          {(Object.keys(STATUS_META) as Status[]).map((s) => (
            <button
              key={s}
              onClick={() => onStatusChange(candidate.id, s)}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                color: candidate.status === s ? STATUS_META[s].color : "var(--color-text-muted)",
                background: candidate.status === s ? STATUS_META[s].bg : "transparent",
                border: `1px solid ${
                  candidate.status === s
                    ? STATUS_META[s].color + "40"
                    : "var(--color-border-subtle)"
                }`,
                borderRadius: "var(--radius-full)",
                padding: "3px 10px",
                cursor: "pointer",
                transition: "all var(--duration-fast)",
                letterSpacing: "var(--tracking-wide)",
              }}
            >
              {STATUS_META[s].label}
            </button>
          ))}
        </div>

        {/* Action buttons */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "var(--space-3)",
            marginBottom: "var(--space-6)",
          }}
        >
          <button
            onClick={() => setShowSchedule(true)}
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "var(--text-sm)",
              fontWeight: 600,
              color: "white",
              background:
                "linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-secondary))",
              border: "none",
              borderRadius: "var(--radius-lg)",
              padding: "var(--space-3) var(--space-4)",
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
            <Video size={14} />
            Назначить созвон
          </button>
          <button
            onClick={() => setShowMessage(true)}
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "var(--text-sm)",
              fontWeight: 600,
              color: messageSent ? "var(--color-accent-success)" : "var(--color-text-primary)",
              background: "var(--color-bg-elevated)",
              border: `1px solid ${
                messageSent ? "rgba(16,185,129,0.3)" : "var(--color-border-default)"
              }`,
              borderRadius: "var(--radius-lg)",
              padding: "var(--space-3) var(--space-4)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "var(--space-2)",
              transition: "all var(--duration-fast)",
            }}
          >
            {messageSent ? <Check size={14} /> : <MessageSquare size={14} />}
            {messageSent ? "Написано" : "Написать"}
          </button>
        </div>

        {/* Scheduled badge */}
        {existingCall && (
          <div
            style={{
              marginBottom: "var(--space-5)",
              padding: "var(--space-3) var(--space-4)",
              background: "rgba(91,110,245,0.08)",
              border: "1px solid rgba(91,110,245,0.2)",
              borderRadius: "var(--radius-lg)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "var(--space-2)",
              animation: "slideUp 0.3s var(--ease-out)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-2)",
              }}
            >
              <Video size={14} color="var(--color-accent-primary)" />
              <span
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "var(--text-sm)",
                  color: "var(--color-accent-primary)",
                  fontWeight: 500,
                }}
              >
                {new Date(existingCall.date).toLocaleDateString("ru-RU", {
                  day: "numeric",
                  month: "long",
                })}
                , {existingCall.time} МСК
              </span>
            </div>
            <a
              href={existingCall.link}
              target="_blank"
              rel="noreferrer"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                color: "var(--color-accent-primary)",
                background: "rgba(91,110,245,0.15)",
                border: "1px solid rgba(91,110,245,0.3)",
                borderRadius: "var(--radius-full)",
                padding: "2px 8px",
                textDecoration: "none",
                whiteSpace: "nowrap",
              }}
            >
              Открыть ссылку
            </a>
          </div>
        )}

        {/* Info grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "var(--space-3)",
            marginBottom: "var(--space-5)",
          }}
        >
          {[
            { icon: Mail, label: "Email", value: candidate.email },
            { icon: Phone, label: "Телефон", value: candidate.phone },
            {
              icon: Clock,
              label: "Готов выйти",
              value: candidate.availability,
            },
            { icon: MapPin, label: "Часовой пояс", value: candidate.timezone },
          ].map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              style={{
                background: "var(--color-bg-elevated)",
                border: "1px solid var(--color-border-subtle)",
                borderRadius: "var(--radius-lg)",
                padding: "var(--space-3) var(--space-4)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-2)",
                  marginBottom: 4,
                }}
              >
                <Icon size={12} color="var(--color-text-muted)" />
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    color: "var(--color-text-muted)",
                    letterSpacing: "var(--tracking-wide)",
                    textTransform: "uppercase",
                  }}
                >
                  {label}
                </span>
              </div>
              <span
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "var(--text-sm)",
                  color: "var(--color-text-primary)",
                  fontWeight: 500,
                }}
              >
                {value}
              </span>
            </div>
          ))}
        </div>

        {/* Salary */}
        <div
          style={{
            background: "var(--color-bg-elevated)",
            border: "1px solid var(--color-border-subtle)",
            borderRadius: "var(--radius-lg)",
            padding: "var(--space-4)",
            marginBottom: "var(--space-5)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "var(--text-sm)",
                color: "var(--color-text-muted)",
              }}
            >
              Ожидания по зарплате
            </span>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "var(--text-lg)",
                fontWeight: 800,
                letterSpacing: "var(--tracking-tight)",
                color: "var(--color-text-primary)",
              }}
            >
              {candidate.salary}
            </span>
          </div>
        </div>

        {/* About */}
        <div style={{ marginBottom: "var(--space-5)" }}>
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: "var(--color-text-muted)",
              letterSpacing: "var(--tracking-wider)",
              textTransform: "uppercase",
              margin: "0 0 var(--space-3) 0",
            }}
          >
            О себе
          </p>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "var(--text-sm)",
              color: "var(--color-text-secondary)",
              lineHeight: "var(--leading-normal)",
              margin: 0,
            }}
          >
            {candidate.about}
          </p>
        </div>

        {/* Skills */}
        <div style={{ marginBottom: "var(--space-5)" }}>
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: "var(--color-text-muted)",
              letterSpacing: "var(--tracking-wider)",
              textTransform: "uppercase",
              margin: "0 0 var(--space-3) 0",
            }}
          >
            Навыки
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)" }}>
            {candidate.skills.map((s) => (
              <span
                key={s}
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "var(--text-xs)",
                  fontWeight: 500,
                  color: "var(--color-text-secondary)",
                  background: "var(--color-bg-elevated)",
                  border: "1px solid var(--color-border-default)",
                  borderRadius: "var(--radius-full)",
                  padding: "3px 10px",
                }}
              >
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* Source + portfolio */}
        {candidate.portfolio && (
          <a
            href={`https://${candidate.portfolio}`}
            target="_blank"
            rel="noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-2)",
              fontFamily: "var(--font-body)",
              fontSize: "var(--text-sm)",
              color: "var(--color-accent-primary)",
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            <ExternalLink size={14} />
            {candidate.portfolio}
          </a>
        )}
      </div>

      {showSchedule && (
        <ScheduleModal
          candidate={candidate}
          onClose={() => setShowSchedule(false)}
          onConfirm={handleScheduleConfirm}
        />
      )}
      {showMessage && (
        <MessageModal
          candidate={candidate}
          onClose={() => setShowMessage(false)}
          onSend={handleMessageSent}
        />
      )}

      <style>{`@keyframes slideUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  );
}

// ─── AI Chat Panel ────────────────────────────────────────────────────────────

function AIChat({ onSearch }: { onSearch: (q: string) => void }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      from: "ai",
      text: "Привет! Опишите, какого специалиста вы ищете — я найду подходящих кандидатов и помогу с коммуникацией.",
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const send = (text: string) => {
    if (!text.trim()) return;
    setMessages((p) => [...p, { from: "user", text }]);
    setInput("");
    onSearch(text);
    setTyping(true);
    setTimeout(() => {
      const lower = text.toLowerCase();
      const key = Object.keys(AI_RESPONSES).find((k) => lower.includes(k)) || "default";
      setMessages((p) => [...p, { from: "ai", text: AI_RESPONSES[key] }]);
      setTyping(false);
    }, 1300);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div
        style={{
          padding: "var(--space-4) var(--space-5)",
          borderBottom: "1px solid var(--color-border-subtle)",
          display: "flex",
          alignItems: "center",
          gap: "var(--space-3)",
        }}
      >
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "var(--color-accent-success)",
            boxShadow: "0 0 6px var(--color-accent-success)",
            animation: "pulse 1.5s ease-in-out infinite",
          }}
        />
        <span
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "var(--text-sm)",
            fontWeight: 600,
            color: "var(--color-text-primary)",
          }}
        >
          Orbital AI
        </span>
      </div>

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "var(--space-4)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-3)",
        }}
      >
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: m.from === "user" ? "flex-end" : "flex-start",
              animation: "slideUp 0.3s var(--ease-out)",
            }}
          >
            {m.from === "ai" && (
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: "var(--radius-md)",
                  background:
                    "linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-secondary))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  marginRight: "var(--space-2)",
                  marginTop: 2,
                }}
              >
                <Sparkles size={12} color="white" />
              </div>
            )}
            <div
              style={{
                maxWidth: "80%",
                padding: "var(--space-3) var(--space-4)",
                background:
                  m.from === "user"
                    ? "linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-secondary))"
                    : "var(--color-bg-elevated)",
                border: m.from === "user" ? "none" : "1px solid var(--color-border-subtle)",
                borderRadius:
                  m.from === "user"
                    ? "var(--radius-lg) var(--radius-sm) var(--radius-lg) var(--radius-lg)"
                    : "var(--radius-sm) var(--radius-lg) var(--radius-lg) var(--radius-lg)",
              }}
            >
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "var(--text-xs)",
                  color: m.from === "user" ? "white" : "var(--color-text-secondary)",
                  margin: 0,
                  lineHeight: "var(--leading-normal)",
                }}
              >
                {m.text}
              </p>
            </div>
          </div>
        ))}
        {typing && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-2)",
            }}
          >
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: "var(--radius-md)",
                background:
                  "linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-secondary))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Sparkles size={12} color="white" />
            </div>
            <div
              style={{
                padding: "var(--space-3) var(--space-4)",
                background: "var(--color-bg-elevated)",
                border: "1px solid var(--color-border-subtle)",
                borderRadius: "var(--radius-lg)",
                display: "flex",
                gap: 4,
                alignItems: "center",
              }}
            >
              {[0, 1, 2].map((n) => (
                <div
                  key={n}
                  style={{
                    width: 5,
                    height: 5,
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

      {/* Quick prompts */}
      <div
        style={{
          padding: "0 var(--space-4) var(--space-3)",
          display: "flex",
          flexWrap: "wrap",
          gap: "var(--space-2)",
        }}
      >
        {["Senior дизайнер", "Доступен сразу", "Написать всем", "Назначить созвон"].map((p) => (
          <button
            key={p}
            onClick={() => send(p)}
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "var(--text-xs)",
              color: "var(--color-text-muted)",
              background: "var(--color-bg-elevated)",
              border: "1px solid var(--color-border-subtle)",
              borderRadius: "var(--radius-full)",
              padding: "var(--space-1) var(--space-3)",
              cursor: "pointer",
              transition: "all var(--duration-fast)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--color-accent-primary)";
              e.currentTarget.style.borderColor = "rgba(91,110,245,0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--color-text-muted)";
              e.currentTarget.style.borderColor = "var(--color-border-subtle)";
            }}
          >
            {p}
          </button>
        ))}
      </div>

      <div
        style={{
          padding: "var(--space-3) var(--space-4)",
          borderTop: "1px solid var(--color-border-subtle)",
          display: "flex",
          gap: "var(--space-2)",
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send(input)}
          placeholder="Опишите специалиста…"
          style={{
            flex: 1,
            background: "var(--color-bg-elevated)",
            border: "1px solid var(--color-border-default)",
            borderRadius: "var(--radius-lg)",
            padding: "var(--space-3) var(--space-4)",
            fontFamily: "var(--font-body)",
            fontSize: "var(--text-sm)",
            color: "var(--color-text-primary)",
            outline: "none",
          }}
          onFocus={(e) => (e.target.style.borderColor = "var(--color-accent-primary)")}
          onBlur={(e) => (e.target.style.borderColor = "var(--color-border-default)")}
        />
        <button
          onClick={() => send(input)}
          disabled={!input.trim()}
          style={{
            background: input.trim()
              ? "linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-secondary))"
              : "var(--color-bg-elevated)",
            border: "1px solid var(--color-border-default)",
            borderRadius: "var(--radius-lg)",
            width: 40,
            height: 40,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: input.trim() ? "pointer" : "not-allowed",
            flexShrink: 0,
            transition: "all var(--duration-fast)",
          }}
        >
          <Send size={14} color={input.trim() ? "white" : "var(--color-text-muted)"} />
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

// ─── Calls Schedule Panel ─────────────────────────────────────────────────────

function CallsPanel({
  calls,
  candidates,
  onSelectCandidate,
  onCancelCall,
}: {
  calls: ScheduledCall[];
  candidates: Candidate[];
  onSelectCandidate: (c: Candidate) => void;
  onCancelCall: (id: string) => void;
}) {
  const sorted = [...calls].sort((a, b) => {
    const da = new Date(`${a.date}T${a.time}`);
    const db = new Date(`${b.date}T${b.time}`);
    return da.getTime() - db.getTime();
  });

  const now = new Date();
  const upcoming = sorted.filter((c) => new Date(`${c.date}T${c.time}`) >= now);
  const past = sorted.filter((c) => new Date(`${c.date}T${c.time}`) < now);

  const fmtDate = (date: string) =>
    new Date(date).toLocaleDateString("ru-RU", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });

  const CallRow = ({ call, isPast }: { call: ScheduledCall; isPast?: boolean }) => {
    const candidate = candidates.find((c) => c.id === call.candidateId);
    return (
      <div
        style={{
          padding: "var(--space-4) var(--space-5)",
          borderBottom: "1px solid var(--color-border-subtle)",
          opacity: isPast ? 0.5 : 1,
          transition: "background var(--duration-fast)",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      >
        {/* Date + time */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "var(--space-3)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-2)",
            }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: isPast ? "var(--color-text-muted)" : "var(--color-accent-primary)",
                boxShadow: isPast ? "none" : "0 0 6px var(--color-accent-primary)",
                animation: isPast ? "none" : "pulse 2s ease-in-out infinite",
              }}
            />
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "var(--text-sm)",
                fontWeight: 700,
                letterSpacing: "var(--tracking-tight)",
                color: isPast ? "var(--color-text-muted)" : "var(--color-text-primary)",
              }}
            >
              {call.time} МСК
            </span>
          </div>
          {!isPast && (
            <button
              onClick={() => onCancelCall(call.id)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--color-text-muted)",
                padding: 2,
                display: "flex",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-accent-danger)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-muted)")}
              title="Отменить"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Candidate info */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-3)",
            marginBottom: "var(--space-3)",
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
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
              opacity: isPast ? 0.6 : 1,
            }}
          >
            {call.candidateName[0]}
          </div>
          <div>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "var(--text-sm)",
                fontWeight: 600,
                color: isPast ? "var(--color-text-muted)" : "var(--color-text-primary)",
                margin: 0,
              }}
            >
              {call.candidateName}
            </p>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "var(--text-xs)",
                color: "var(--color-text-muted)",
                margin: 0,
              }}
            >
              {call.candidateRole}
            </p>
          </div>
        </div>

        {/* Actions */}
        {!isPast && (
          <div style={{ display: "flex", gap: "var(--space-2)" }}>
            <a
              href={call.link}
              target="_blank"
              rel="noreferrer"
              style={{
                flex: 1,
                fontFamily: "var(--font-body)",
                fontSize: "var(--text-xs)",
                fontWeight: 600,
                color: "white",
                background:
                  "linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-secondary))",
                borderRadius: "var(--radius-md)",
                padding: "var(--space-2) var(--space-3)",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "var(--space-2)",
              }}
            >
              <Video size={12} />
              Открыть звонок
            </a>
            {candidate && (
              <button
                onClick={() => onSelectCandidate(candidate)}
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "var(--text-xs)",
                  fontWeight: 500,
                  color: "var(--color-text-secondary)",
                  background: "var(--color-bg-elevated)",
                  border: "1px solid var(--color-border-default)",
                  borderRadius: "var(--radius-md)",
                  padding: "var(--space-2) var(--space-3)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-1)",
                  transition: "all var(--duration-fast)",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-text-primary)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-secondary)")}
              >
                Профиль
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  // Group upcoming calls by date
  const byDate: Record<string, ScheduledCall[]> = {};
  upcoming.forEach((c) => {
    if (!byDate[c.date]) byDate[c.date] = [];
    byDate[c.date].push(c);
  });

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
      }}
    >
      {calls.length === 0 ? (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "var(--space-8)",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: "var(--radius-xl)",
              background: "var(--color-bg-elevated)",
              border: "1px solid var(--color-border-default)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "var(--space-4)",
            }}
          >
            <Calendar size={22} color="var(--color-text-muted)" />
          </div>
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-lg)",
              fontWeight: 700,
              color: "var(--color-text-primary)",
              margin: "0 0 var(--space-2) 0",
              letterSpacing: "var(--tracking-tight)",
            }}
          >
            Созвонов пока нет
          </p>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "var(--text-sm)",
              color: "var(--color-text-muted)",
              margin: 0,
              lineHeight: "var(--leading-normal)",
            }}
          >
            Откройте профиль кандидата и назначьте встречу
          </p>
        </div>
      ) : (
        <div>
          {Object.entries(byDate).map(([date, dayCalls]) => (
            <div key={date}>
              <div
                style={{
                  padding: "var(--space-3) var(--space-5)",
                  background: "var(--color-bg-elevated)",
                  borderBottom: "1px solid var(--color-border-subtle)",
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-2)",
                  position: "sticky",
                  top: 0,
                  zIndex: 1,
                }}
              >
                <Calendar size={12} color="var(--color-accent-primary)" />
                <span
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "var(--text-xs)",
                    fontWeight: 600,
                    color: "var(--color-text-secondary)",
                    textTransform: "capitalize",
                  }}
                >
                  {fmtDate(date)}
                </span>
              </div>
              {dayCalls.map((c) => (
                <CallRow key={c.id} call={c} />
              ))}
            </div>
          ))}

          {past.length > 0 && (
            <div>
              <div
                style={{
                  padding: "var(--space-3) var(--space-5)",
                  background: "var(--color-bg-elevated)",
                  borderBottom: "1px solid var(--color-border-subtle)",
                  borderTop: "1px solid var(--color-border-subtle)",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    color: "var(--color-text-muted)",
                    letterSpacing: "var(--tracking-wider)",
                    textTransform: "uppercase",
                  }}
                >
                  Прошедшие
                </span>
              </div>
              {past.map((c) => (
                <CallRow key={c.id} call={c} isPast />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Hiring() {
  const [candidates, setCandidates] = useState<Candidate[]>(ALL_CANDIDATES);
  const [selected, setSelected] = useState<Candidate | null>(null);
  const [filter, setFilter] = useState<Status | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [scheduledCalls, setScheduledCalls] = useState<ScheduledCall[]>([
    // pre-seeded so user can see the panel right away
    {
      id: "seed-1",
      candidateId: 3,
      candidateName: "Мария Смирнова",
      candidateRole: "UX/UI Designer",
      date: (() => {
        const d = new Date();
        d.setDate(d.getDate() + 2);
        return d.toISOString().split("T")[0];
      })(),
      time: "11:00",
      link: "https://meet.orbital.ai/seed-abc123",
    },
  ]);
  const [middleTab, setMiddleTab] = useState<"candidates" | "calls">("candidates");

  const handleStatusChange = (id: number, status: Status) => {
    setCandidates((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
  };

  const handleSchedule = (call: ScheduledCall) => {
    setScheduledCalls((prev) => {
      const without = prev.filter((c) => c.candidateId !== call.candidateId);
      return [...without, call];
    });
  };

  const handleCancelCall = (id: string) => {
    setScheduledCalls((prev) => prev.filter((c) => c.id !== id));
    const call = scheduledCalls.find((c) => c.id === id);
    if (call) handleStatusChange(call.candidateId, "contacted");
  };

  const handleSearch = (q: string) => setSearchQuery(q);

  const filtered = candidates.filter((c) => {
    if (filter !== "all" && c.status !== filter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.role.toLowerCase().includes(q) ||
        c.skills.some((s) => s.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const counts = Object.fromEntries(
    (Object.keys(STATUS_META) as Status[]).map((s) => [
      s,
      candidates.filter((c) => c.status === s).length,
    ]),
  );

  const TAB_BTN = (tab: "candidates" | "calls", label: string, badge?: number) => (
    <button
      onClick={() => setMiddleTab(tab)}
      style={{
        flex: 1,
        fontFamily: "var(--font-body)",
        fontSize: "var(--text-sm)",
        fontWeight: middleTab === tab ? 600 : 400,
        color: middleTab === tab ? "var(--color-text-primary)" : "var(--color-text-muted)",
        background: "none",
        border: "none",
        borderBottom:
          middleTab === tab ? `2px solid var(--color-accent-primary)` : "2px solid transparent",
        padding: "var(--space-3) var(--space-2)",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "var(--space-2)",
        transition: "color var(--duration-fast)",
      }}
    >
      {label}
      {badge !== undefined && badge > 0 && (
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
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 5px",
          }}
        >
          {badge}
        </span>
      )}
    </button>
  );

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/* AI Chat — left */}
      <div
        style={{
          width: 300,
          borderRight: "1px solid var(--color-border-subtle)",
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          background: "var(--color-bg-surface)",
        }}
      >
        <div
          style={{
            padding: "var(--space-5)",
            borderBottom: "1px solid var(--color-border-subtle)",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              color: "var(--color-text-muted)",
              letterSpacing: "var(--tracking-wider)",
              textTransform: "uppercase",
              margin: "0 0 4px 0",
            }}
          >
            HR / Recruiting
          </p>
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
            Найм
          </h1>
        </div>
        <AIChat onSearch={handleSearch} />
      </div>

      {/* Middle panel — candidates or calls */}
      <div
        style={{
          width: 320,
          borderRight: "1px solid var(--color-border-subtle)",
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          background: "var(--color-bg-base)",
        }}
      >
        {/* Tabs */}
        <div
          style={{
            display: "flex",
            borderBottom: "1px solid var(--color-border-subtle)",
            padding: "0 var(--space-4)",
          }}
        >
          {TAB_BTN("candidates", "Кандидаты", candidates.length)}
          {TAB_BTN(
            "calls",
            "Созвоны",
            scheduledCalls.filter((c) => new Date(`${c.date}T${c.time}`) >= new Date()).length,
          )}
        </div>

        {middleTab === "candidates" ? (
          <>
            {/* Filters */}
            <div
              style={{
                padding: "var(--space-3) var(--space-4)",
                borderBottom: "1px solid var(--color-border-subtle)",
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-3)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-2)",
                  background: "var(--color-bg-elevated)",
                  border: "1px solid var(--color-border-default)",
                  borderRadius: "var(--radius-lg)",
                  padding: "var(--space-2) var(--space-3)",
                }}
              >
                <Search size={13} color="var(--color-text-muted)" />
                <input
                  placeholder="Поиск…"
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    flex: 1,
                    background: "transparent",
                    border: "none",
                    outline: "none",
                    fontFamily: "var(--font-body)",
                    fontSize: "var(--text-xs)",
                    color: "var(--color-text-primary)",
                  }}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "var(--space-1)",
                  flexWrap: "wrap",
                }}
              >
                <button
                  onClick={() => setFilter("all")}
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    letterSpacing: "var(--tracking-wide)",
                    color:
                      filter === "all" ? "var(--color-accent-primary)" : "var(--color-text-muted)",
                    background: filter === "all" ? "var(--color-accent-glow)" : "transparent",
                    border: `1px solid ${
                      filter === "all" ? "rgba(91,110,245,0.3)" : "transparent"
                    }`,
                    borderRadius: "var(--radius-full)",
                    padding: "2px 8px",
                    cursor: "pointer",
                    transition: "all var(--duration-fast)",
                  }}
                >
                  Все ({candidates.length})
                </button>
                {(Object.keys(STATUS_META) as Status[])
                  .filter((s) => counts[s] > 0)
                  .map((s) => (
                    <button
                      key={s}
                      onClick={() => setFilter(s)}
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 10,
                        letterSpacing: "var(--tracking-wide)",
                        color: filter === s ? STATUS_META[s].color : "var(--color-text-muted)",
                        background: filter === s ? STATUS_META[s].bg : "transparent",
                        border: `1px solid ${
                          filter === s ? STATUS_META[s].color + "40" : "transparent"
                        }`,
                        borderRadius: "var(--radius-full)",
                        padding: "2px 8px",
                        cursor: "pointer",
                        transition: "all var(--duration-fast)",
                      }}
                    >
                      {STATUS_META[s].label} ({counts[s]})
                    </button>
                  ))}
              </div>
            </div>
            <div style={{ flex: 1, overflowY: "auto" }}>
              {filtered.length === 0 ? (
                <div style={{ padding: "var(--space-8)", textAlign: "center" }}>
                  <p
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "var(--text-sm)",
                      color: "var(--color-text-muted)",
                    }}
                  >
                    Нет кандидатов
                  </p>
                </div>
              ) : (
                filtered.map((c) => (
                  <CandidateCard
                    key={c.id}
                    candidate={c}
                    onClick={() => setSelected(c)}
                    selected={selected?.id === c.id}
                  />
                ))
              )}
            </div>
            <div
              style={{
                padding: "var(--space-3) var(--space-5)",
                borderTop: "1px solid var(--color-border-subtle)",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  color: "var(--color-text-muted)",
                  letterSpacing: "var(--tracking-wide)",
                }}
              >
                {filtered.length} из {candidates.length} кандидатов
              </span>
            </div>
          </>
        ) : (
          <CallsPanel
            calls={scheduledCalls}
            candidates={candidates}
            onSelectCandidate={(c) => {
              setSelected(c);
              setMiddleTab("candidates");
            }}
            onCancelCall={handleCancelCall}
          />
        )}
      </div>

      {/* Detail panel — right */}
      <div
        style={{
          flex: 1,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {selected ? (
          <CandidateDetail
            key={selected.id}
            candidate={candidates.find((c) => c.id === selected.id)!}
            onBack={() => setSelected(null)}
            onStatusChange={handleStatusChange}
            onSchedule={handleSchedule}
            existingCall={scheduledCalls.find((c) => c.candidateId === selected.id)}
          />
        ) : (
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "var(--space-12)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "var(--radius-xl)",
                background: "var(--color-bg-elevated)",
                border: "1px solid var(--color-border-default)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "var(--space-5)",
              }}
            >
              <Search size={24} color="var(--color-text-muted)" />
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
              Выберите кандидата
            </h2>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "var(--text-base)",
                color: "var(--color-text-muted)",
                margin: 0,
                maxWidth: 360,
                lineHeight: "var(--leading-normal)",
              }}
            >
              Нажмите на кандидата в списке, чтобы открыть профиль, написать или назначить созвон
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        @keyframes bounce { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-4px); } }
        @keyframes slideUp { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
      `}</style>
    </div>
  );
}
