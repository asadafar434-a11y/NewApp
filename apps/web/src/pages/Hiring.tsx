import { useState, useRef, useEffect, type CSSProperties, type FocusEvent } from "react";
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
  Plus,
  Loader2,
  AlertCircle,
  UserPlus,
  ChevronUp,
  Trash2,
  Pencil,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import type {
  RequestDTO,
  RequestType,
  SpecialistDetailDTO,
  SpecialistDTO,
  SpecialistStatus,
} from "@orbital/shared";
import { useCreateRequest, useRequests } from "../api/requests";
import {
  useCreateSpecialist,
  useDeleteSpecialist,
  useSpecialist,
  useSpecialists,
  useUpdateSpecialist,
} from "../api/specialists";

// ─── Types ───────────────────────────────────────────────────────────────────

type Message = { from: "ai" | "user"; text: string };

type ScheduledCall = {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateRole: string;
  date: string;
  time: string;
  link: string;
};

// ─── Data ────────────────────────────────────────────────────────────────────

const STATUS_META: Record<SpecialistStatus, { label: string; color: string; bg: string }> = {
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
  consult_scheduled: {
    label: "Созвон назначен",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.12)",
  },
  consult_done: {
    label: "Консультация проведена",
    color: "#10b981",
    bg: "rgba(16,185,129,0.12)",
  },
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
  candidate: SpecialistDTO;
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
          {candidate.matchScore != null && (
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
                {candidate.matchScore}%
              </span>
            </div>
          )}
        </div>

        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "var(--text-xs)",
            color: "var(--color-text-secondary)",
            margin: "0 0 var(--space-2) 0",
          }}
        >
          {candidate.role}
          {candidate.exp ? ` · ${candidate.exp}` : ""}
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
            {candidate.location ?? ""}
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
  candidate: SpecialistDetailDTO;
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
  candidate: SpecialistDetailDTO;
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

type EditForm = {
  email: string;
  phone: string;
  location: string;
  exp: string;
  salary: string;
  source: string;
  availability: string;
  timezone: string;
  portfolioUrl: string;
  about: string;
  skillsText: string;
};

function toEditForm(candidate: SpecialistDetailDTO): EditForm {
  return {
    email: candidate.email,
    phone: candidate.phone ?? "",
    location: candidate.location ?? "",
    exp: candidate.exp ?? "",
    salary: candidate.salary ?? "",
    source: candidate.source ?? "",
    availability: candidate.availability ?? "",
    timezone: candidate.timezone ?? "",
    portfolioUrl: candidate.portfolioUrl ?? "",
    about: candidate.about ?? "",
    skillsText: candidate.skills.join(", "),
  };
}

function CandidateDetail({
  candidate,
  onBack,
  onDeleted,
  onSchedule,
  existingCall,
}: {
  candidate: SpecialistDetailDTO;
  onBack: () => void;
  onDeleted: () => void;
  onSchedule: (call: ScheduledCall) => void;
  existingCall?: ScheduledCall;
}) {
  const [showSchedule, setShowSchedule] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [messageSent, setMessageSent] = useState(false);
  const [inlineToast, setInlineToast] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<EditForm>(() => toEditForm(candidate));
  const updateSpecialist = useUpdateSpecialist(candidate.id);
  const deleteSpecialist = useDeleteSpecialist();
  const sm = STATUS_META[candidate.status];

  const showToast = (msg: string) => {
    setInlineToast(msg);
    setTimeout(() => setInlineToast(null), 3000);
  };

  const startEditing = () => {
    setEditForm(toEditForm(candidate));
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    try {
      await updateSpecialist.mutateAsync({
        email: editForm.email.trim(),
        phone: editForm.phone.trim() || undefined,
        location: editForm.location.trim() || undefined,
        exp: editForm.exp.trim() || undefined,
        salary: editForm.salary.trim() || undefined,
        source: editForm.source.trim() || undefined,
        availability: editForm.availability.trim() || undefined,
        timezone: editForm.timezone.trim() || undefined,
        portfolioUrl: editForm.portfolioUrl.trim() || undefined,
        about: editForm.about.trim() || undefined,
        skillsText: editForm.skillsText,
      });
      setIsEditing(false);
      toast.success("Профиль сохранён");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Не удалось сохранить профиль");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Удалить ${candidate.name} из заявки?`)) return;
    try {
      await deleteSpecialist.mutateAsync(candidate.id);
      toast.success(`${candidate.name} удалён`);
      onDeleted();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Не удалось удалить специалиста");
    }
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
    setShowSchedule(false);
    showToast(`✓ Созвон с ${candidate.name.split(" ")[0]} запланирован на ${label} в ${time}`);
  };

  const handleMessageSent = () => {
    setMessageSent(true);
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
      {inlineToast && (
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
          {inlineToast}
        </div>
      )}

      {/* Header */}
      <div
        style={{
          padding: "var(--space-5) var(--space-6)",
          borderBottom: "1px solid var(--color-border-subtle)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
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

        <div style={{ display: "flex", gap: "var(--space-2)" }}>
          {isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(false)}
                disabled={updateSpecialist.isPending}
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "var(--text-xs)",
                  color: "var(--color-text-secondary)",
                  background: "var(--color-bg-elevated)",
                  border: "1px solid var(--color-border-default)",
                  borderRadius: "var(--radius-md)",
                  padding: "var(--space-2) var(--space-3)",
                  cursor: "pointer",
                }}
              >
                Отмена
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={updateSpecialist.isPending}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-2)",
                  fontFamily: "var(--font-body)",
                  fontSize: "var(--text-xs)",
                  fontWeight: 600,
                  color: "white",
                  background:
                    "linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-secondary))",
                  border: "none",
                  borderRadius: "var(--radius-md)",
                  padding: "var(--space-2) var(--space-3)",
                  cursor: updateSpecialist.isPending ? "not-allowed" : "pointer",
                  opacity: updateSpecialist.isPending ? 0.7 : 1,
                }}
              >
                {updateSpecialist.isPending && <Loader2 size={12} className="spin" />}
                Сохранить
              </button>
            </>
          ) : (
            <>
              <button
                onClick={startEditing}
                title="Редактировать"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 30,
                  height: 30,
                  background: "var(--color-bg-elevated)",
                  border: "1px solid var(--color-border-default)",
                  borderRadius: "var(--radius-md)",
                  cursor: "pointer",
                  color: "var(--color-text-secondary)",
                }}
              >
                <Pencil size={13} />
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteSpecialist.isPending}
                title="Удалить"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 30,
                  height: 30,
                  background: "var(--color-bg-elevated)",
                  border: "1px solid var(--color-border-default)",
                  borderRadius: "var(--radius-md)",
                  cursor: deleteSpecialist.isPending ? "not-allowed" : "pointer",
                  color: "var(--color-accent-danger)",
                  opacity: deleteSpecialist.isPending ? 0.6 : 1,
                }}
              >
                {deleteSpecialist.isPending ? (
                  <Loader2 size={13} className="spin" />
                ) : (
                  <Trash2 size={13} />
                )}
              </button>
            </>
          )}
        </div>
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
              {candidate.matchScore != null && (
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
                    {candidate.matchScore}%
                  </span>
                </div>
              )}
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
              {candidate.exp && (
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
              )}
              {candidate.location && (
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
              )}
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
                <Clock size={11} /> Добавлен:{" "}
                {new Date(candidate.createdAt).toLocaleDateString("ru-RU", {
                  day: "numeric",
                  month: "long",
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Status — переходы статусов появятся в T-021, пока просто индикатор текущего */}
        <div
          style={{
            display: "flex",
            gap: "var(--space-2)",
            marginBottom: "var(--space-5)",
            flexWrap: "wrap",
          }}
        >
          {(Object.keys(STATUS_META) as SpecialistStatus[]).map((s) => (
            <span
              key={s}
              title="Смена статуса появится в T-021"
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
                letterSpacing: "var(--tracking-wide)",
                opacity: candidate.status === s ? 1 : 0.45,
              }}
            >
              {STATUS_META[s].label}
            </span>
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
          {(
            [
              { icon: Mail, label: "Email", field: "email" as const },
              { icon: Phone, label: "Телефон", field: "phone" as const },
              { icon: Clock, label: "Готов выйти", field: "availability" as const },
              { icon: MapPin, label: "Часовой пояс", field: "timezone" as const },
            ] as const
          ).map(({ icon: Icon, label, field }) => (
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
              {isEditing ? (
                <input
                  value={editForm[field]}
                  onChange={(e) => setEditForm((f) => ({ ...f, [field]: e.target.value }))}
                  style={{
                    width: "100%",
                    background: "var(--color-bg-surface)",
                    border: "1px solid var(--color-border-default)",
                    borderRadius: "var(--radius-md)",
                    padding: "var(--space-1) var(--space-2)",
                    fontFamily: "var(--font-body)",
                    fontSize: "var(--text-sm)",
                    color: "var(--color-text-primary)",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              ) : (
                <span
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "var(--text-sm)",
                    color: "var(--color-text-primary)",
                    fontWeight: 500,
                  }}
                >
                  {candidate[field] || "—"}
                </span>
              )}
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
              gap: "var(--space-3)",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "var(--text-sm)",
                color: "var(--color-text-muted)",
                flexShrink: 0,
              }}
            >
              Ожидания по зарплате
            </span>
            {isEditing ? (
              <input
                value={editForm.salary}
                onChange={(e) => setEditForm((f) => ({ ...f, salary: e.target.value }))}
                placeholder="180 000 ₽"
                style={{
                  flex: 1,
                  textAlign: "right",
                  background: "var(--color-bg-surface)",
                  border: "1px solid var(--color-border-default)",
                  borderRadius: "var(--radius-md)",
                  padding: "var(--space-2) var(--space-3)",
                  fontFamily: "var(--font-display)",
                  fontSize: "var(--text-base)",
                  fontWeight: 800,
                  color: "var(--color-text-primary)",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            ) : (
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "var(--text-lg)",
                  fontWeight: 800,
                  letterSpacing: "var(--tracking-tight)",
                  color: "var(--color-text-primary)",
                }}
              >
                {candidate.salary || "—"}
              </span>
            )}
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
          {isEditing ? (
            <textarea
              value={editForm.about}
              onChange={(e) => setEditForm((f) => ({ ...f, about: e.target.value }))}
              rows={4}
              style={{
                width: "100%",
                background: "var(--color-bg-elevated)",
                border: "1px solid var(--color-border-default)",
                borderRadius: "var(--radius-lg)",
                padding: "var(--space-3) var(--space-4)",
                fontFamily: "var(--font-body)",
                fontSize: "var(--text-sm)",
                color: "var(--color-text-primary)",
                lineHeight: "var(--leading-normal)",
                outline: "none",
                resize: "vertical",
                boxSizing: "border-box",
              }}
            />
          ) : (
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "var(--text-sm)",
                color: "var(--color-text-secondary)",
                lineHeight: "var(--leading-normal)",
                margin: 0,
              }}
            >
              {candidate.about || "—"}
            </p>
          )}
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
          {isEditing ? (
            <input
              value={editForm.skillsText}
              onChange={(e) => setEditForm((f) => ({ ...f, skillsText: e.target.value }))}
              placeholder="Figma, User Research, Prototyping"
              style={{
                width: "100%",
                background: "var(--color-bg-elevated)",
                border: "1px solid var(--color-border-default)",
                borderRadius: "var(--radius-lg)",
                padding: "var(--space-3) var(--space-4)",
                fontFamily: "var(--font-body)",
                fontSize: "var(--text-sm)",
                color: "var(--color-text-primary)",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)" }}>
              {candidate.skills.length === 0 ? (
                <span
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "var(--text-xs)",
                    color: "var(--color-text-muted)",
                  }}
                >
                  —
                </span>
              ) : (
                candidate.skills.map((s) => (
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
                ))
              )}
            </div>
          )}
        </div>

        {/* Portfolio */}
        {isEditing ? (
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
              Портфолио
            </p>
            <input
              value={editForm.portfolioUrl}
              onChange={(e) => setEditForm((f) => ({ ...f, portfolioUrl: e.target.value }))}
              placeholder="https://…"
              style={{
                width: "100%",
                background: "var(--color-bg-elevated)",
                border: "1px solid var(--color-border-default)",
                borderRadius: "var(--radius-lg)",
                padding: "var(--space-3) var(--space-4)",
                fontFamily: "var(--font-body)",
                fontSize: "var(--text-sm)",
                color: "var(--color-text-primary)",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
        ) : (
          candidate.portfolioUrl && (
            <a
              href={candidate.portfolioUrl}
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
              {candidate.portfolioUrl}
            </a>
          )
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

      <style>{`
        @keyframes slideUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 0.8s linear infinite; }
      `}</style>
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
  onSelectCandidate,
  onCancelCall,
}: {
  calls: ScheduledCall[];
  onSelectCandidate: (id: string) => void;
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
            <button
              onClick={() => onSelectCandidate(call.candidateId)}
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

// ─── New Request Modal ────────────────────────────────────────────────────────

function NewRequestModal({ onClose }: { onClose: () => void }) {
  const [type, setType] = useState<RequestType>("hire");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priceRubles, setPriceRubles] = useState("");
  const createRequest = useCreateRequest();

  const priceRequired = type === "consult";
  const priceValid = !priceRequired || (priceRubles.trim() !== "" && Number(priceRubles) > 0);
  const canSubmit = title.trim().length >= 3 && description.trim().length >= 10 && priceValid;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    await createRequest.mutateAsync({
      type,
      title: title.trim(),
      description: description.trim(),
      priceRubles: priceRubles.trim() === "" ? null : Number(priceRubles),
    });
    onClose();
  };

  const inputStyle: CSSProperties = {
    width: "100%",
    background: "var(--color-bg-elevated)",
    border: "1px solid var(--color-border-default)",
    borderRadius: "var(--radius-lg)",
    padding: "var(--space-3) var(--space-4)",
    fontFamily: "var(--font-body)",
    fontSize: "var(--text-sm)",
    color: "var(--color-text-primary)",
    outline: "none",
    boxSizing: "border-box",
  };

  const labelStyle: CSSProperties = {
    fontFamily: "var(--font-mono)",
    fontSize: 11,
    color: "var(--color-text-muted)",
    letterSpacing: "var(--tracking-wider)",
    textTransform: "uppercase",
    margin: "0 0 var(--space-2) 0",
    display: "block",
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
          <h3
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-lg)",
              fontWeight: 800,
              color: "var(--color-text-primary)",
              margin: 0,
              letterSpacing: "var(--tracking-tight)",
            }}
          >
            Новая заявка
          </h3>
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

        <div style={{ marginBottom: "var(--space-5)" }}>
          <span style={labelStyle}>Тип</span>
          <div style={{ display: "flex", gap: "var(--space-2)" }}>
            {(
              [
                { value: "hire", label: "Найм" },
                { value: "consult", label: "Консультация" },
              ] as const
            ).map((opt) => (
              <button
                key={opt.value}
                onClick={() => setType(opt.value)}
                style={{
                  flex: 1,
                  fontFamily: "var(--font-body)",
                  fontSize: "var(--text-sm)",
                  fontWeight: type === opt.value ? 600 : 400,
                  color: type === opt.value ? "white" : "var(--color-text-secondary)",
                  background:
                    type === opt.value
                      ? "linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-secondary))"
                      : "var(--color-bg-elevated)",
                  border: `1px solid ${
                    type === opt.value ? "transparent" : "var(--color-border-default)"
                  }`,
                  borderRadius: "var(--radius-lg)",
                  padding: "var(--space-3)",
                  cursor: "pointer",
                  transition: "all var(--duration-fast)",
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: "var(--space-5)" }}>
          <span style={labelStyle}>Название</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Например, Продуктовый дизайнер"
            style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = "var(--color-accent-primary)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--color-border-default)")}
          />
        </div>

        <div style={{ marginBottom: "var(--space-5)" }}>
          <span style={labelStyle}>Описание</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Опишите задачу подробнее…"
            style={{ ...inputStyle, resize: "vertical", lineHeight: "var(--leading-normal)" }}
            onFocus={(e) => (e.target.style.borderColor = "var(--color-accent-primary)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--color-border-default)")}
          />
        </div>

        {priceRequired && (
          <div style={{ marginBottom: "var(--space-5)" }}>
            <span style={labelStyle}>Цена, ₽</span>
            <input
              type="number"
              min={1}
              value={priceRubles}
              onChange={(e) => setPriceRubles(e.target.value)}
              placeholder="5000"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "var(--color-accent-primary)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--color-border-default)")}
            />
          </div>
        )}

        {createRequest.isError && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-2)",
              marginBottom: "var(--space-4)",
              color: "var(--color-accent-danger)",
            }}
          >
            <AlertCircle size={14} />
            <span style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-xs)" }}>
              {createRequest.error instanceof Error
                ? createRequest.error.message
                : "Не удалось создать заявку"}
            </span>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={!canSubmit || createRequest.isPending}
          style={{
            width: "100%",
            fontFamily: "var(--font-body)",
            fontSize: "var(--text-base)",
            fontWeight: 600,
            color: "white",
            background:
              canSubmit && !createRequest.isPending
                ? "linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-secondary))"
                : "var(--color-bg-elevated)",
            border: `1px solid ${
              canSubmit && !createRequest.isPending ? "transparent" : "var(--color-border-default)"
            }`,
            borderRadius: "var(--radius-lg)",
            padding: "var(--space-4)",
            cursor: canSubmit && !createRequest.isPending ? "pointer" : "not-allowed",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "var(--space-2)",
            transition: "all var(--duration-fast)",
          }}
        >
          {createRequest.isPending ? (
            <Loader2 size={16} className="spin" color="white" />
          ) : (
            <Plus size={16} color={canSubmit ? "white" : "var(--color-text-muted)"} />
          )}
          <span
            style={{
              color: canSubmit || createRequest.isPending ? "white" : "var(--color-text-muted)",
            }}
          >
            Создать заявку
          </span>
        </button>

        <style>{`@keyframes spin { to { transform: rotate(360deg); } } .spin { animation: spin 0.8s linear infinite; }`}</style>
      </div>
    </div>
  );
}

// ─── Add Specialist Modal ─────────────────────────────────────────────────────

function AddSpecialistModal({ requestId, onClose }: { requestId: string; onClose: () => void }) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [showMore, setShowMore] = useState(false);
  const [phone, setPhone] = useState("");
  const [exp, setExp] = useState("");
  const [location, setLocation] = useState("");
  const [salary, setSalary] = useState("");
  const [source, setSource] = useState("");
  const [skillsText, setSkillsText] = useState("");
  const [about, setAbout] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [availability, setAvailability] = useState("");
  const [timezone, setTimezone] = useState("");
  const createSpecialist = useCreateSpecialist();

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const canSubmit = name.trim().length >= 2 && role.trim().length >= 2 && emailValid;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    await createSpecialist.mutateAsync({
      requestId,
      name: name.trim(),
      role: role.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      exp: exp.trim() || undefined,
      location: location.trim() || undefined,
      salary: salary.trim() || undefined,
      source: source.trim() || undefined,
      skillsText,
      about: about.trim() || undefined,
      portfolioUrl: portfolioUrl.trim() || undefined,
      availability: availability.trim() || undefined,
      timezone: timezone.trim() || undefined,
    });
    onClose();
  };

  const inputStyle: CSSProperties = {
    width: "100%",
    background: "var(--color-bg-elevated)",
    border: "1px solid var(--color-border-default)",
    borderRadius: "var(--radius-lg)",
    padding: "var(--space-3) var(--space-4)",
    fontFamily: "var(--font-body)",
    fontSize: "var(--text-sm)",
    color: "var(--color-text-primary)",
    outline: "none",
    boxSizing: "border-box",
  };

  const labelStyle: CSSProperties = {
    fontFamily: "var(--font-mono)",
    fontSize: 11,
    color: "var(--color-text-muted)",
    letterSpacing: "var(--tracking-wider)",
    textTransform: "uppercase",
    margin: "0 0 var(--space-2) 0",
    display: "block",
  };

  const focusHandlers = {
    onFocus: (e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      (e.target.style.borderColor = "var(--color-accent-primary)"),
    onBlur: (e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      (e.target.style.borderColor = "var(--color-border-default)"),
  };

  const Field = ({
    label,
    value,
    onChange,
    placeholder,
  }: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
  }) => (
    <div style={{ marginBottom: "var(--space-4)" }}>
      <span style={labelStyle}>{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={inputStyle}
        {...focusHandlers}
      />
    </div>
  );

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
          <h3
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-lg)",
              fontWeight: 800,
              color: "var(--color-text-primary)",
              margin: 0,
              letterSpacing: "var(--tracking-tight)",
            }}
          >
            Добавить специалиста
          </h3>
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

        <Field label="Имя" value={name} onChange={setName} placeholder="Анна Ковалёва" />
        <Field label="Роль" value={role} onChange={setRole} placeholder="Senior UX Designer" />

        <div style={{ marginBottom: "var(--space-4)" }}>
          <span style={labelStyle}>Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="anna@example.com"
            style={{
              ...inputStyle,
              borderColor:
                email.length > 0 && !emailValid
                  ? "var(--color-accent-danger)"
                  : "var(--color-border-default)",
            }}
            {...focusHandlers}
          />
          {email.length > 0 && !emailValid && (
            <span
              style={{
                display: "block",
                marginTop: 4,
                fontFamily: "var(--font-body)",
                fontSize: "var(--text-xs)",
                color: "var(--color-accent-danger)",
              }}
            >
              Введите корректный email
            </span>
          )}
        </div>

        <button
          onClick={() => setShowMore((v) => !v)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-2)",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--color-text-secondary)",
            fontFamily: "var(--font-body)",
            fontSize: "var(--text-sm)",
            padding: 0,
            marginBottom: "var(--space-4)",
          }}
        >
          {showMore ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          Дополнительно
        </button>

        {showMore && (
          <div>
            <Field
              label="Телефон"
              value={phone}
              onChange={setPhone}
              placeholder="+7 900 000-00-00"
            />
            <Field label="Опыт" value={exp} onChange={setExp} placeholder="6 лет" />
            <Field label="Локация" value={location} onChange={setLocation} placeholder="Москва" />
            <Field label="Зарплата" value={salary} onChange={setSalary} placeholder="180 000 ₽" />
            <Field label="Источник" value={source} onChange={setSource} placeholder="LinkedIn" />
            <Field
              label="Навыки (через запятую)"
              value={skillsText}
              onChange={setSkillsText}
              placeholder="Figma, User Research, Prototyping"
            />
            <div style={{ marginBottom: "var(--space-4)" }}>
              <span style={labelStyle}>О себе</span>
              <textarea
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                rows={3}
                style={{ ...inputStyle, resize: "vertical", lineHeight: "var(--leading-normal)" }}
                {...focusHandlers}
              />
            </div>
            <Field
              label="Портфолио (URL)"
              value={portfolioUrl}
              onChange={setPortfolioUrl}
              placeholder="https://…"
            />
            <Field
              label="Доступность"
              value={availability}
              onChange={setAvailability}
              placeholder="Через 2 недели"
            />
            <Field
              label="Часовой пояс"
              value={timezone}
              onChange={setTimezone}
              placeholder="UTC+3"
            />
          </div>
        )}

        {createSpecialist.isError && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-2)",
              marginBottom: "var(--space-4)",
              color: "var(--color-accent-danger)",
            }}
          >
            <AlertCircle size={14} />
            <span style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-xs)" }}>
              {createSpecialist.error instanceof Error
                ? createSpecialist.error.message
                : "Не удалось добавить специалиста"}
            </span>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={!canSubmit || createSpecialist.isPending}
          style={{
            width: "100%",
            fontFamily: "var(--font-body)",
            fontSize: "var(--text-base)",
            fontWeight: 600,
            color: "white",
            background:
              canSubmit && !createSpecialist.isPending
                ? "linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-secondary))"
                : "var(--color-bg-elevated)",
            border: `1px solid ${
              canSubmit && !createSpecialist.isPending
                ? "transparent"
                : "var(--color-border-default)"
            }`,
            borderRadius: "var(--radius-lg)",
            padding: "var(--space-4)",
            cursor: canSubmit && !createSpecialist.isPending ? "pointer" : "not-allowed",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "var(--space-2)",
            transition: "all var(--duration-fast)",
          }}
        >
          {createSpecialist.isPending ? (
            <Loader2 size={16} className="spin" color="white" />
          ) : (
            <UserPlus size={16} color={canSubmit ? "white" : "var(--color-text-muted)"} />
          )}
          <span
            style={{
              color: canSubmit || createSpecialist.isPending ? "white" : "var(--color-text-muted)",
            }}
          >
            Добавить специалиста
          </span>
        </button>

        <style>{`@keyframes spin { to { transform: rotate(360deg); } } .spin { animation: spin 0.8s linear infinite; }`}</style>
      </div>
    </div>
  );
}

// ─── Request Selector ─────────────────────────────────────────────────────────

const REQUEST_TYPE_LABEL: Record<RequestType, string> = { hire: "Найм", consult: "Консультация" };

function RequestSelector({
  activeId,
  onSelect,
  onNew,
}: {
  activeId: string | null;
  onSelect: (id: string | null) => void;
  onNew: () => void;
}) {
  const [open, setOpen] = useState(false);
  const { data, isLoading } = useRequests();
  const items = data?.items ?? [];
  const active = items.find((r) => r.id === activeId) ?? null;

  return (
    <div
      style={{
        padding: "var(--space-3) var(--space-4)",
        borderBottom: "1px solid var(--color-border-subtle)",
        position: "relative",
      }}
    >
      <div style={{ display: "flex", gap: "var(--space-2)" }}>
        <button
          onClick={() => setOpen((o) => !o)}
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "var(--space-2)",
            fontFamily: "var(--font-body)",
            fontSize: "var(--text-xs)",
            color: active ? "var(--color-text-primary)" : "var(--color-text-muted)",
            background: "var(--color-bg-elevated)",
            border: "1px solid var(--color-border-default)",
            borderRadius: "var(--radius-lg)",
            padding: "var(--space-2) var(--space-3)",
            cursor: "pointer",
            minWidth: 0,
          }}
        >
          <span
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {isLoading
              ? "Загрузка заявок…"
              : active
                ? `${REQUEST_TYPE_LABEL[active.type]}: ${active.title}`
                : items.length === 0
                  ? "Заявок пока нет"
                  : "Все заявки"}
          </span>
          <ChevronDown
            size={13}
            color="var(--color-text-muted)"
            style={{
              flexShrink: 0,
              transform: open ? "rotate(180deg)" : "none",
              transition: "transform var(--duration-fast)",
            }}
          />
        </button>
        <button
          onClick={onNew}
          title="Новая заявка"
          style={{
            flexShrink: 0,
            width: 32,
            height: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background:
              "linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-secondary))",
            border: "none",
            borderRadius: "var(--radius-lg)",
            cursor: "pointer",
          }}
        >
          <Plus size={14} color="white" />
        </button>
      </div>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: "var(--space-4)",
            right: "var(--space-4)",
            marginTop: 4,
            background: "var(--color-bg-overlay)",
            border: "1px solid var(--color-border-default)",
            borderRadius: "var(--radius-lg)",
            boxShadow: "var(--shadow-lg)",
            zIndex: 10,
            maxHeight: 260,
            overflowY: "auto",
          }}
        >
          <button
            onClick={() => {
              onSelect(null);
              setOpen(false);
            }}
            style={{
              width: "100%",
              textAlign: "left",
              fontFamily: "var(--font-body)",
              fontSize: "var(--text-xs)",
              color:
                activeId === null ? "var(--color-accent-primary)" : "var(--color-text-secondary)",
              background: "none",
              border: "none",
              borderBottom: "1px solid var(--color-border-subtle)",
              padding: "var(--space-3)",
              cursor: "pointer",
            }}
          >
            Все заявки
          </button>
          {items.length === 0 ? (
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "var(--text-xs)",
                color: "var(--color-text-muted)",
                padding: "var(--space-3)",
                margin: 0,
              }}
            >
              Пока нет ни одной заявки — создайте первую
            </p>
          ) : (
            items.map((r: RequestDTO) => (
              <button
                key={r.id}
                onClick={() => {
                  onSelect(r.id);
                  setOpen(false);
                }}
                style={{
                  width: "100%",
                  textAlign: "left",
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  fontFamily: "var(--font-body)",
                  fontSize: "var(--text-xs)",
                  color:
                    activeId === r.id ? "var(--color-accent-primary)" : "var(--color-text-primary)",
                  background: "none",
                  border: "none",
                  borderBottom: "1px solid var(--color-border-subtle)",
                  padding: "var(--space-3)",
                  cursor: "pointer",
                }}
              >
                <span style={{ fontWeight: 600 }}>{r.title}</span>
                <span
                  style={{
                    color: "var(--color-text-muted)",
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                  }}
                >
                  {REQUEST_TYPE_LABEL[r.type]}
                  {r.priceKopecks != null
                    ? ` · ${(r.priceKopecks / 100).toLocaleString("ru-RU")} ₽`
                    : ""}
                  {" · "}
                  {r.specialistCount} кандидат.
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

function CandidateListSkeleton() {
  return (
    <div>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            display: "flex",
            gap: "var(--space-4)",
            padding: "var(--space-4) var(--space-5)",
            borderBottom: "1px solid var(--color-border-subtle)",
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "var(--radius-full)",
              background: "var(--color-bg-elevated)",
              animation: "pulse 1.5s ease-in-out infinite",
              flexShrink: 0,
            }}
          />
          <div style={{ flex: 1 }}>
            <div
              style={{
                width: "60%",
                height: 12,
                borderRadius: "var(--radius-sm)",
                background: "var(--color-bg-elevated)",
                animation: "pulse 1.5s ease-in-out infinite",
                marginBottom: "var(--space-2)",
              }}
            />
            <div
              style={{
                width: "40%",
                height: 10,
                borderRadius: "var(--radius-sm)",
                background: "var(--color-bg-elevated)",
                animation: "pulse 1.5s ease-in-out infinite",
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div style={{ padding: "var(--space-6)" }}>
      <div
        style={{
          display: "flex",
          gap: "var(--space-5)",
          marginBottom: "var(--space-6)",
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "var(--radius-full)",
            background: "var(--color-bg-elevated)",
            animation: "pulse 1.5s ease-in-out infinite",
            flexShrink: 0,
          }}
        />
        <div style={{ flex: 1 }}>
          <div
            style={{
              width: "50%",
              height: 20,
              borderRadius: "var(--radius-sm)",
              background: "var(--color-bg-elevated)",
              animation: "pulse 1.5s ease-in-out infinite",
              marginBottom: "var(--space-3)",
            }}
          />
          <div
            style={{
              width: "35%",
              height: 14,
              borderRadius: "var(--radius-sm)",
              background: "var(--color-bg-elevated)",
              animation: "pulse 1.5s ease-in-out infinite",
            }}
          />
        </div>
      </div>
      {[0, 1].map((i) => (
        <div
          key={i}
          style={{
            height: 60,
            borderRadius: "var(--radius-lg)",
            background: "var(--color-bg-elevated)",
            animation: "pulse 1.5s ease-in-out infinite",
            marginBottom: "var(--space-4)",
          }}
        />
      ))}
    </div>
  );
}

function InlineError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div
      style={{
        padding: "var(--space-8)",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "var(--space-3)",
      }}
    >
      <AlertCircle size={20} color="var(--color-accent-danger)" />
      <p
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "var(--text-sm)",
          color: "var(--color-text-secondary)",
          margin: 0,
        }}
      >
        {message}
      </p>
      <button
        onClick={onRetry}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space-2)",
          fontFamily: "var(--font-body)",
          fontSize: "var(--text-xs)",
          fontWeight: 600,
          color: "var(--color-accent-primary)",
          background: "var(--color-accent-glow)",
          border: "1px solid rgba(91,110,245,0.3)",
          borderRadius: "var(--radius-md)",
          padding: "var(--space-2) var(--space-3)",
          cursor: "pointer",
        }}
      >
        <RefreshCw size={12} />
        Повторить
      </button>
    </div>
  );
}

export default function Hiring() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<SpecialistStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebouncedValue(searchQuery, 300);
  const [scheduledCalls, setScheduledCalls] = useState<ScheduledCall[]>([]);
  const [middleTab, setMiddleTab] = useState<"candidates" | "calls">("candidates");
  const [activeRequestId, setActiveRequestId] = useState<string | null>(null);
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [showAddSpecialist, setShowAddSpecialist] = useState(false);

  const listQuery = useSpecialists(
    {
      requestId: activeRequestId ?? undefined,
      status: filter !== "all" ? filter : undefined,
      search: debouncedSearch || undefined,
      limit: 100,
    },
    { enabled: !!activeRequestId },
  );
  const specialists = listQuery.data?.items ?? [];

  const detailQuery = useSpecialist(selectedId ?? "");

  const handleSchedule = (call: ScheduledCall) => {
    setScheduledCalls((prev) => {
      const without = prev.filter((c) => c.candidateId !== call.candidateId);
      return [...without, call];
    });
  };

  const handleCancelCall = (id: string) => {
    setScheduledCalls((prev) => prev.filter((c) => c.id !== id));
  };

  const handleSearch = (q: string) => setSearchQuery(q);

  const handleSelectRequest = (id: string | null) => {
    setActiveRequestId(id);
    setSelectedId(null);
  };

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
          {TAB_BTN("candidates", "Кандидаты", specialists.length)}
          {TAB_BTN(
            "calls",
            "Созвоны",
            scheduledCalls.filter((c) => new Date(`${c.date}T${c.time}`) >= new Date()).length,
          )}
        </div>

        <RequestSelector
          activeId={activeRequestId}
          onSelect={handleSelectRequest}
          onNew={() => setShowNewRequest(true)}
        />

        {middleTab === "candidates" && (
          <div style={{ padding: "var(--space-3) var(--space-4) 0" }}>
            <button
              onClick={() => setShowAddSpecialist(true)}
              disabled={!activeRequestId}
              title={activeRequestId ? undefined : "Сначала выберите заявку"}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "var(--space-2)",
                fontFamily: "var(--font-body)",
                fontSize: "var(--text-xs)",
                fontWeight: 600,
                color: activeRequestId ? "var(--color-accent-primary)" : "var(--color-text-muted)",
                background: activeRequestId
                  ? "var(--color-accent-glow)"
                  : "var(--color-bg-elevated)",
                border: `1px solid ${
                  activeRequestId ? "rgba(91,110,245,0.3)" : "var(--color-border-default)"
                }`,
                borderRadius: "var(--radius-lg)",
                padding: "var(--space-2) var(--space-3)",
                cursor: activeRequestId ? "pointer" : "not-allowed",
                transition: "all var(--duration-fast)",
              }}
            >
              <UserPlus size={13} />
              Добавить специалиста
            </button>
          </div>
        )}

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
                  Все ({specialists.length})
                </button>
                {(Object.keys(STATUS_META) as SpecialistStatus[]).map((s) => (
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
                    {STATUS_META[s].label}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ flex: 1, overflowY: "auto" }}>
              {!activeRequestId ? (
                <div style={{ padding: "var(--space-8)", textAlign: "center" }}>
                  <p
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "var(--text-sm)",
                      color: "var(--color-text-muted)",
                      margin: 0,
                    }}
                  >
                    Сначала выберите или создайте заявку
                  </p>
                </div>
              ) : listQuery.isLoading ? (
                <CandidateListSkeleton />
              ) : listQuery.isError ? (
                <InlineError
                  message="Не удалось загрузить специалистов"
                  onRetry={() => listQuery.refetch()}
                />
              ) : specialists.length === 0 ? (
                <div style={{ padding: "var(--space-8)", textAlign: "center" }}>
                  <p
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "var(--text-sm)",
                      color: "var(--color-text-muted)",
                      margin: 0,
                    }}
                  >
                    {filter !== "all" || debouncedSearch
                      ? "Ничего не найдено по текущему фильтру"
                      : "Специалистов пока нет — добавьте первого"}
                  </p>
                </div>
              ) : (
                specialists.map((c) => (
                  <CandidateCard
                    key={c.id}
                    candidate={c}
                    onClick={() => setSelectedId(c.id)}
                    selected={selectedId === c.id}
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
                {specialists.length} специалистов
              </span>
            </div>
          </>
        ) : (
          <CallsPanel
            calls={scheduledCalls}
            onSelectCandidate={(id) => {
              setSelectedId(id);
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
        {selectedId ? (
          detailQuery.isLoading ? (
            <DetailSkeleton />
          ) : detailQuery.isError ? (
            <InlineError
              message="Не удалось загрузить профиль специалиста"
              onRetry={() => detailQuery.refetch()}
            />
          ) : detailQuery.data ? (
            <CandidateDetail
              key={detailQuery.data.id}
              candidate={detailQuery.data}
              onBack={() => setSelectedId(null)}
              onDeleted={() => setSelectedId(null)}
              onSchedule={handleSchedule}
              existingCall={scheduledCalls.find((c) => c.candidateId === selectedId)}
            />
          ) : null
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

      {showNewRequest && <NewRequestModal onClose={() => setShowNewRequest(false)} />}
      {showAddSpecialist && activeRequestId && (
        <AddSpecialistModal
          requestId={activeRequestId}
          onClose={() => setShowAddSpecialist(false)}
        />
      )}

      <style>{`
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        @keyframes bounce { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-4px); } }
        @keyframes slideUp { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
      `}</style>
    </div>
  );
}
