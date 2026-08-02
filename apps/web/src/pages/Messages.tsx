import { useState, useRef, useEffect } from "react";
import {
  Search,
  Send,
  MoreHorizontal,
  Phone,
  Video,
  Paperclip,
  Smile,
  Check,
  CheckCheck,
  Users,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import type { ConversationListItemDTO, MessageDTO } from "@orbital/shared";
import {
  useConversations,
  useMarkConversationRead,
  useMessages,
  useSendMessage,
} from "../api/chat";
import { specialistFileUrl } from "../api/uploads";

const QUICK_REPLIES = [
  "Когда вам удобно созвониться?",
  "Отправил ссылку на встречу на email.",
  "Расскажите подробнее о вашем опыте с B2B продуктами.",
  "Готов ответить на все вопросы о позиции.",
];

// ─── Time formatting ───────────────────────────────────────────────────────────

function formatConversationTime(iso: string) {
  const date = new Date(iso);
  const now = new Date();
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  }
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return "Вчера";
  return date.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}

function formatMessageTime(iso: string) {
  const date = new Date(iso);
  const now = new Date();
  const time = date.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  if (date.toDateString() === now.toDateString()) return time;
  return `${date.toLocaleDateString("ru-RU", { day: "numeric", month: "long" })}, ${time}`;
}

// ─── Status icon ──────────────────────────────────────────────────────────────

function MsgStatusIcon({ status }: { status: MessageDTO["status"] }) {
  if (status === "sent") return <Check size={12} color="var(--color-text-muted)" />;
  if (status === "delivered") return <CheckCheck size={12} color="var(--color-text-muted)" />;
  return <CheckCheck size={12} color="var(--color-accent-primary)" />;
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({
  specialistId,
  avatarKey,
  name,
  size,
}: {
  specialistId: string;
  avatarKey: string | null;
  name: string;
  size: number;
}) {
  if (avatarKey) {
    return (
      <img
        src={specialistFileUrl(specialistId, "avatar")}
        alt={name}
        style={{
          width: size,
          height: size,
          borderRadius: "var(--radius-full)",
          objectFit: "cover",
          flexShrink: 0,
        }}
      />
    );
  }
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "var(--radius-full)",
        background:
          "linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-secondary))",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--font-display)",
        fontSize: size >= 36 ? "var(--text-base)" : 11,
        fontWeight: 800,
        color: "white",
        flexShrink: 0,
      }}
    >
      {name[0]}
    </div>
  );
}

// ─── Conversation Row ─────────────────────────────────────────────────────────

function ConversationRow({
  conv,
  active,
  onClick,
}: {
  conv: ConversationListItemDTO;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "var(--space-3)",
        padding: "var(--space-4) var(--space-5)",
        background: active ? "var(--color-bg-elevated)" : "transparent",
        border: "none",
        borderBottom: "1px solid var(--color-border-subtle)",
        borderLeft: active ? "2px solid var(--color-accent-primary)" : "2px solid transparent",
        cursor: "pointer",
        textAlign: "left",
        width: "100%",
        transition: "background var(--duration-fast)",
      }}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.02)";
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.background = "transparent";
      }}
    >
      <Avatar
        specialistId={conv.specialistId}
        avatarKey={conv.avatarKey}
        name={conv.specialistName}
        size={40}
      />

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
              fontWeight: conv.unreadCount > 0 ? 700 : 500,
              color: "var(--color-text-primary)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              flex: 1,
              marginRight: 8,
            }}
          >
            {conv.specialistName}
          </span>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              color:
                conv.unreadCount > 0 ? "var(--color-accent-primary)" : "var(--color-text-muted)",
              flexShrink: 0,
              fontWeight: conv.unreadCount > 0 ? 600 : 400,
            }}
          >
            {conv.lastMessage ? formatConversationTime(conv.lastMessage.createdAt) : ""}
          </span>
        </div>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "var(--text-xs)",
            color: "var(--color-text-muted)",
            margin: "0 0 var(--space-1) 0",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {conv.specialistRole}
        </p>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "var(--text-xs)",
              color:
                conv.unreadCount > 0 ? "var(--color-text-secondary)" : "var(--color-text-muted)",
              fontWeight: conv.unreadCount > 0 ? 500 : 400,
              margin: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              flex: 1,
              marginRight: 8,
            }}
          >
            {conv.lastMessage?.text ?? "Нет сообщений"}
          </p>
          {conv.unreadCount > 0 && (
            <div
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
                flexShrink: 0,
              }}
            >
              {conv.unreadCount}
            </div>
          )}
        </div>
      </div>
    </button>
  );
}

// ─── Chat Thread ──────────────────────────────────────────────────────────────

function ChatThread({ conv }: { conv: ConversationListItemDTO }) {
  const { user } = useAuth();
  const [input, setInput] = useState("");
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const messagesQuery = useMessages(conv.id);
  const sendMessage = useSendMessage(conv.id);

  // Сервер отдаёт от новых к старым — для треда переворачиваем в хронологический порядок.
  const messages = [...(messagesQuery.data?.items ?? [])].reverse();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    sendMessage.mutate(text.trim());
    setInput("");
    setShowQuickReplies(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header */}
      <div
        style={{
          padding: "var(--space-4) var(--space-6)",
          borderBottom: "1px solid var(--color-border-subtle)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "var(--color-bg-surface)",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-3)",
          }}
        >
          <Avatar
            specialistId={conv.specialistId}
            avatarKey={conv.avatarKey}
            name={conv.specialistName}
            size={40}
          />
          <div>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "var(--text-base)",
                fontWeight: 600,
                color: "var(--color-text-primary)",
                margin: 0,
              }}
            >
              {conv.specialistName}
            </p>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "var(--text-xs)",
                color: "var(--color-text-muted)",
                margin: 0,
              }}
            >
              {conv.specialistRole}
            </p>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-2)",
          }}
        >
          <button
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
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-accent-primary)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-muted)")}
          >
            <Phone size={15} />
          </button>
          <button
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
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-accent-primary)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-muted)")}
          >
            <Video size={15} />
          </button>
          <button
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--color-text-muted)",
              padding: "var(--space-1)",
              transition: "color var(--duration-fast)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-text-primary)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-muted)")}
          >
            <MoreHorizontal size={18} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "var(--space-6)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-3)",
        }}
      >
        {messagesQuery.isLoading ? (
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "var(--text-sm)",
              color: "var(--color-text-muted)",
              textAlign: "center",
            }}
          >
            Загрузка…
          </p>
        ) : messagesQuery.isError ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "var(--space-3)",
              margin: "auto",
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
              Не удалось загрузить сообщения
            </p>
            <button
              onClick={() => messagesQuery.refetch()}
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
        ) : (
          messages.map((msg, i) => {
            const isMe = msg.sender === "owner";
            const prevMsg = messages[i - 1];
            const showTime =
              !prevMsg || formatMessageTime(prevMsg.createdAt) !== formatMessageTime(msg.createdAt);

            return (
              <div key={msg.id}>
                {showTime && (
                  <div
                    style={{
                      textAlign: "center",
                      margin: "var(--space-3) 0 var(--space-2)",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 10,
                        color: "var(--color-text-muted)",
                        background: "var(--color-bg-elevated)",
                        padding: "2px 10px",
                        borderRadius: "var(--radius-full)",
                      }}
                    >
                      {formatMessageTime(msg.createdAt)}
                    </span>
                  </div>
                )}
                <div
                  style={{
                    display: "flex",
                    justifyContent: isMe ? "flex-end" : "flex-start",
                    gap: "var(--space-2)",
                    alignItems: "flex-end",
                    animation: "slideUp 0.25s var(--ease-out)",
                  }}
                >
                  {!isMe && (
                    <Avatar
                      specialistId={conv.specialistId}
                      avatarKey={conv.avatarKey}
                      name={conv.specialistName}
                      size={28}
                    />
                  )}
                  <div style={{ maxWidth: "68%" }}>
                    <div
                      style={{
                        padding: "var(--space-3) var(--space-4)",
                        borderRadius: isMe
                          ? "var(--radius-xl) var(--radius-sm) var(--radius-xl) var(--radius-xl)"
                          : "var(--radius-sm) var(--radius-xl) var(--radius-xl) var(--radius-xl)",
                        background: isMe
                          ? "linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-secondary))"
                          : "var(--color-bg-elevated)",
                        border: isMe ? "none" : "1px solid var(--color-border-subtle)",
                      }}
                    >
                      <p
                        style={{
                          fontFamily: "var(--font-body)",
                          fontSize: "var(--text-sm)",
                          color: isMe ? "white" : "var(--color-text-primary)",
                          margin: 0,
                          lineHeight: "var(--leading-normal)",
                        }}
                      >
                        {msg.text}
                      </p>
                    </div>
                    {isMe && (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "flex-end",
                          alignItems: "center",
                          gap: 3,
                          marginTop: 3,
                        }}
                      >
                        <MsgStatusIcon status={msg.status} />
                      </div>
                    )}
                  </div>
                  {isMe && (
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: "var(--radius-full)",
                        background:
                          "linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-secondary))",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontFamily: "var(--font-display)",
                        fontSize: 11,
                        fontWeight: 800,
                        color: "white",
                        flexShrink: 0,
                      }}
                    >
                      {user?.avatar ?? "Я"}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick replies */}
      {showQuickReplies && (
        <div
          style={{
            padding: "var(--space-3) var(--space-5)",
            borderTop: "1px solid var(--color-border-subtle)",
            display: "flex",
            flexWrap: "wrap",
            gap: "var(--space-2)",
            background: "var(--color-bg-surface)",
            animation: "slideUp 0.2s var(--ease-out)",
          }}
        >
          {QUICK_REPLIES.map((r) => (
            <button
              key={r}
              onClick={() => handleSend(r)}
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "var(--text-xs)",
                color: "var(--color-text-secondary)",
                background: "var(--color-bg-elevated)",
                border: "1px solid var(--color-border-default)",
                borderRadius: "var(--radius-full)",
                padding: "var(--space-2) var(--space-3)",
                cursor: "pointer",
                transition: "all var(--duration-fast)",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--color-accent-primary)";
                e.currentTarget.style.borderColor = "rgba(91,110,245,0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--color-text-secondary)";
                e.currentTarget.style.borderColor = "var(--color-border-default)";
              }}
            >
              {r}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div
        style={{
          padding: "var(--space-4) var(--space-5)",
          borderTop: "1px solid var(--color-border-subtle)",
          background: "var(--color-bg-surface)",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: "var(--space-3)",
            background: "var(--color-bg-elevated)",
            border: "1px solid var(--color-border-default)",
            borderRadius: "var(--radius-xl)",
            padding: "var(--space-3) var(--space-4)",
            transition: "border-color var(--duration-fast)",
          }}
          onFocusCapture={(e) =>
            ((e.currentTarget as HTMLDivElement).style.borderColor = "var(--color-accent-primary)")
          }
          onBlurCapture={(e) =>
            ((e.currentTarget as HTMLDivElement).style.borderColor = "var(--color-border-default)")
          }
        >
          <button
            onClick={() => setShowQuickReplies(!showQuickReplies)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              color: showQuickReplies ? "var(--color-accent-primary)" : "var(--color-text-muted)",
              display: "flex",
              flexShrink: 0,
              transition: "color var(--duration-fast)",
            }}
          >
            <Smile size={18} />
          </button>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend(input);
              }
            }}
            placeholder="Написать сообщение… (Enter — отправить)"
            rows={1}
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              fontFamily: "var(--font-body)",
              fontSize: "var(--text-sm)",
              color: "var(--color-text-primary)",
              resize: "none",
              lineHeight: "var(--leading-normal)",
              maxHeight: 120,
              overflowY: "auto",
            }}
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-2)",
              flexShrink: 0,
            }}
          >
            <button
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                color: "var(--color-text-muted)",
                display: "flex",
                transition: "color var(--duration-fast)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-accent-primary)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-muted)")}
            >
              <Paperclip size={16} />
            </button>
            <button
              onClick={() => handleSend(input)}
              disabled={!input.trim()}
              style={{
                background: input.trim()
                  ? "linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-secondary))"
                  : "var(--color-bg-overlay)",
                border: "none",
                borderRadius: "var(--radius-full)",
                width: 34,
                height: 34,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: input.trim() ? "pointer" : "not-allowed",
                transition: "all var(--duration-fast)",
              }}
            >
              <Send size={14} color={input.trim() ? "white" : "var(--color-text-muted)"} />
            </button>
          </div>
        </div>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 10,
            color: "var(--color-text-muted)",
            margin: "var(--space-2) 0 0 var(--space-2)",
          }}
        >
          Shift+Enter — новая строка · Enter — отправить
        </p>
      </div>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ text }: { text: string }) {
  return (
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
        <Users size={26} color="var(--color-text-muted)" />
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
        Выберите диалог
      </h2>
      <p
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "var(--text-base)",
          color: "var(--color-text-muted)",
          margin: 0,
          maxWidth: 320,
          lineHeight: "var(--leading-normal)",
        }}
      >
        {text}
      </p>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Messages() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const conversationsQuery = useConversations();
  const markRead = useMarkConversationRead();

  const conversations = conversationsQuery.data?.items ?? [];
  const activeConv = conversations.find((c) => c.id === activeId) ?? null;

  const handleSelect = (id: string) => {
    setActiveId(id);
    markRead.mutate(id);
  };

  const filtered = conversations.filter(
    (c) =>
      c.specialistName.toLowerCase().includes(search.toLowerCase()) ||
      c.specialistRole.toLowerCase().includes(search.toLowerCase()),
  );

  const totalUnread = conversations.reduce((s, c) => s + c.unreadCount, 0);

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/* Left — conversation list */}
      <div
        style={{
          width: 320,
          borderRight: "1px solid var(--color-border-subtle)",
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          background: "var(--color-bg-surface)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "var(--space-5) var(--space-5) var(--space-4)",
            borderBottom: "1px solid var(--color-border-subtle)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "var(--space-4)",
            }}
          >
            <div>
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
                Inbox
              </p>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-3)",
                }}
              >
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
                  Сообщения
                </h1>
                {totalUnread > 0 && (
                  <span
                    style={{
                      background: "var(--color-accent-primary)",
                      color: "white",
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      fontWeight: 700,
                      borderRadius: "var(--radius-full)",
                      minWidth: 20,
                      height: 20,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "0 6px",
                    }}
                  >
                    {totalUnread}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Search */}
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
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск по диалогам…"
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
        </div>

        {/* Conversations */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {conversationsQuery.isLoading ? (
            <div style={{ padding: "var(--space-8)", textAlign: "center" }}>
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "var(--text-sm)",
                  color: "var(--color-text-muted)",
                }}
              >
                Загрузка…
              </p>
            </div>
          ) : conversationsQuery.isError ? (
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
                Не удалось загрузить диалоги
              </p>
              <button
                onClick={() => conversationsQuery.refetch()}
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
          ) : filtered.length === 0 ? (
            <div style={{ padding: "var(--space-8)", textAlign: "center" }}>
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "var(--text-sm)",
                  color: "var(--color-text-muted)",
                }}
              >
                {conversations.length === 0
                  ? "Диалогов пока нет — добавьте специалиста в Найме"
                  : "Диалоги не найдены"}
              </p>
            </div>
          ) : (
            filtered.map((c) => (
              <ConversationRow
                key={c.id}
                conv={c}
                active={activeId === c.id}
                onClick={() => handleSelect(c.id)}
              />
            ))
          )}
        </div>

        {/* Footer stat */}
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
            {conversations.length} диалогов · {totalUnread} непрочитанных
          </span>
        </div>
      </div>

      {/* Right — chat */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          background: "var(--color-bg-base)",
        }}
      >
        {activeConv ? (
          <ChatThread key={activeConv.id} conv={activeConv} />
        ) : (
          <EmptyState text="Выберите переписку из списка слева, чтобы начать общение" />
        )}
      </div>

      <style>{`
        @keyframes slideUp { from { opacity:0; transform:translateY(5px); } to { opacity:1; transform:translateY(0); } }
      `}</style>
    </div>
  );
}
