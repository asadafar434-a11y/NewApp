import { useState, useRef, useEffect } from 'react'
import { Search, Send, MoreHorizontal, Phone, Video, Paperclip, Smile, Check, CheckCheck, Circle, Users, Star } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

// ─── Types ────────────────────────────────────────────────────────────────────

type MsgStatus = 'sent' | 'delivered' | 'read'

type ChatMessage = {
  id: string
  from: 'me' | 'them'
  text: string
  time: string
  status?: MsgStatus
}

type Conversation = {
  id: string
  name: string
  role: string
  avatar: string
  avatarColor: string
  lastMessage: string
  lastTime: string
  unread: number
  online: boolean
  source: string
  messages: ChatMessage[]
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'anna',
    name: 'Анна Ковалёва',
    role: 'Senior UX Designer',
    avatar: 'А',
    avatarColor: 'linear-gradient(135deg, #5b6ef5, #7c3aed)',
    lastMessage: 'Буду рада пообщаться! Напишите, когда удобно.',
    lastTime: '10:24',
    unread: 2,
    online: true,
    source: 'LinkedIn',
    messages: [
      { id: '1', from: 'me', text: 'Привет, Анна! Меня зовут Алексей, я основатель Orbital. Видел ваше портфолио — очень впечатлило. У нас открыта позиция Senior UX Designer.', time: '09:15', status: 'read' },
      { id: '2', from: 'them', text: 'Добрый день, Алексей! Спасибо за интерес. Расскажите подробнее о проекте?', time: '09:48' },
      { id: '3', from: 'me', text: 'Orbital — это AI-платформа для бизнеса. Мы ищем дизайнера, который выстроит UX с нуля: исследования, дизайн-система, продуктовая работа.', time: '09:52', status: 'read' },
      { id: '4', from: 'them', text: 'Звучит интересно! Какой стек и какие ожидания по процессу?', time: '10:01' },
      { id: '5', from: 'me', text: 'Figma, тесное взаимодействие с разработкой. Процесс гибкий, без бюрократии. Готов рассказать детальнее на созвоне — удобно на этой неделе?', time: '10:18', status: 'read' },
      { id: '6', from: 'them', text: 'Буду рада пообщаться! Напишите, когда удобно.', time: '10:24' },
    ],
  },
  {
    id: 'dmitry',
    name: 'Дмитрий Орлов',
    role: 'Product Designer',
    avatar: 'Д',
    avatarColor: 'linear-gradient(135deg, #10b981, #059669)',
    lastMessage: 'Хорошо, жду приглашение на встречу.',
    lastTime: 'Вчера',
    unread: 0,
    online: true,
    source: 'Behance',
    messages: [
      { id: '1', from: 'me', text: 'Дмитрий, добрый день! Ваше Behance-портфолио — именно то, что мы ищем. Есть открытая позиция Product Designer.', time: 'Вчера 14:30', status: 'read' },
      { id: '2', from: 'them', text: 'Добрый! Интересно. Что за продукт?', time: 'Вчера 15:02' },
      { id: '3', from: 'me', text: 'AI-сервис для автоматизации бизнес-процессов. B2B, enterprise-уровень. Команда небольшая, но амбиции большие.', time: 'Вчера 15:10', status: 'read' },
      { id: '4', from: 'them', text: 'Хорошо, жду приглашение на встречу.', time: 'Вчера 15:45' },
    ],
  },
  {
    id: 'maria',
    name: 'Мария Смирнова',
    role: 'UX/UI Designer',
    avatar: 'М',
    avatarColor: 'linear-gradient(135deg, #f59e0b, #d97706)',
    lastMessage: 'Ок, в пятницу в 11:00 МСК — договорились!',
    lastTime: '2 дня назад',
    unread: 0,
    online: false,
    source: 'HH.ru',
    messages: [
      { id: '1', from: 'me', text: 'Мария, привет! Нашёл ваше резюме на HH.ru. Очень интересный опыт — работа на стыке дизайна и разработки это именно то, что нам нужно.', time: '3 дня назад', status: 'read' },
      { id: '2', from: 'them', text: 'Привет! Да, я обожаю работать с разработчиками напрямую. Расскажите о вашей команде?', time: '3 дня назад' },
      { id: '3', from: 'me', text: 'Команда 8 человек, 3 разработчика. Процесс: двухнедельные спринты, тесная синхронизация. Готовы к созвону на 30 минут?', time: '3 дня назад', status: 'read' },
      { id: '4', from: 'them', text: 'Конечно! Мне удобно в пятницу — с 10 до 13 МСК.', time: '2 дня назад' },
      { id: '5', from: 'me', text: 'Отлично, тогда в пятницу в 11:00 МСК. Пришлю ссылку на встречу.', time: '2 дня назад', status: 'read' },
      { id: '6', from: 'them', text: 'Ок, в пятницу в 11:00 МСК — договорились!', time: '2 дня назад' },
    ],
  },
  {
    id: 'ekaterina',
    name: 'Екатерина Белова',
    role: 'Senior Product Designer',
    avatar: 'Е',
    avatarColor: 'linear-gradient(135deg, #ec4899, #be185d)',
    lastMessage: 'Посмотрю вашу вакансию подробнее и вернусь с ответом.',
    lastTime: '3 дня назад',
    unread: 1,
    online: false,
    source: 'Dribbble',
    messages: [
      { id: '1', from: 'me', text: 'Екатерина, добрый день! Нашёл вас на Dribbble — работы впечатляют. Хотел бы обсудить возможность сотрудничества.', time: '3 дня назад', status: 'read' },
      { id: '2', from: 'them', text: 'Добрый день! Расскажите немного о компании и позиции?', time: '3 дня назад' },
      { id: '3', from: 'me', text: 'Orbital — AI Business OS. Ищем Lead Designer, который выстроит дизайн-процесс и команду. Рост — от специалиста к руководителю дизайна.', time: '3 дня назад', status: 'read' },
      { id: '4', from: 'them', text: 'Посмотрю вашу вакансию подробнее и вернусь с ответом.', time: '3 дня назад' },
    ],
  },
  {
    id: 'artem',
    name: 'Артём Новиков',
    role: 'Visual Designer',
    avatar: 'А',
    avatarColor: 'linear-gradient(135deg, #6366f1, #4f46e5)',
    lastMessage: 'Спасибо за интерес, но сейчас не готов рассматривать предложения.',
    lastTime: '5 дней назад',
    unread: 0,
    online: false,
    source: 'LinkedIn',
    messages: [
      { id: '1', from: 'me', text: 'Артём, привет! Ваш опыт в брендинге и айдентике — то, что нам нужно для нескольких проектов.', time: '5 дней назад', status: 'read' },
      { id: '2', from: 'them', text: 'Спасибо за интерес, но сейчас не готов рассматривать предложения.', time: '5 дней назад' },
    ],
  },
]

const QUICK_REPLIES = [
  'Когда вам удобно созвониться?',
  'Отправил ссылку на встречу на email.',
  'Расскажите подробнее о вашем опыте с B2B продуктами.',
  'Готов ответить на все вопросы о позиции.',
]

// ─── Status icon ──────────────────────────────────────────────────────────────

function MsgStatusIcon({ status }: { status?: MsgStatus }) {
  if (!status) return null
  if (status === 'sent') return <Check size={12} color="var(--color-text-muted)" />
  if (status === 'delivered') return <CheckCheck size={12} color="var(--color-text-muted)" />
  return <CheckCheck size={12} color="var(--color-accent-primary)" />
}

// ─── Conversation Row ─────────────────────────────────────────────────────────

function ConversationRow({
  conv,
  active,
  onClick,
}: {
  conv: Conversation
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 'var(--space-3)',
        padding: 'var(--space-4) var(--space-5)',
        background: active ? 'var(--color-bg-elevated)' : 'transparent',
        border: 'none',
        borderBottom: '1px solid var(--color-border-subtle)',
        borderLeft: active ? '2px solid var(--color-accent-primary)' : '2px solid transparent',
        cursor: 'pointer',
        textAlign: 'left',
        width: '100%',
        transition: 'background var(--duration-fast)',
      }}
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.02)' }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent' }}
    >
      {/* Avatar */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 'var(--radius-full)',
            background: conv.avatarColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-base)',
            fontWeight: 800,
            color: 'white',
          }}
        >
          {conv.avatar}
        </div>
        {conv.online && (
          <div
            style={{
              position: 'absolute',
              bottom: 1,
              right: 1,
              width: 9,
              height: 9,
              borderRadius: '50%',
              background: 'var(--color-accent-success)',
              border: '2px solid var(--color-bg-base)',
            }}
          />
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 2 }}>
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
              fontWeight: conv.unread > 0 ? 700 : 500,
              color: 'var(--color-text-primary)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              flex: 1,
              marginRight: 8,
            }}
          >
            {conv.name}
          </span>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              color: conv.unread > 0 ? 'var(--color-accent-primary)' : 'var(--color-text-muted)',
              flexShrink: 0,
              fontWeight: conv.unread > 0 ? 600 : 400,
            }}
          >
            {conv.lastTime}
          </span>
        </div>
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-muted)',
            margin: '0 0 var(--space-1) 0',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {conv.role}
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-xs)',
              color: conv.unread > 0 ? 'var(--color-text-secondary)' : 'var(--color-text-muted)',
              fontWeight: conv.unread > 0 ? 500 : 400,
              margin: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              flex: 1,
              marginRight: 8,
            }}
          >
            {conv.lastMessage}
          </p>
          {conv.unread > 0 && (
            <div
              style={{
                background: 'var(--color-accent-primary)',
                color: 'white',
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                fontWeight: 700,
                borderRadius: 'var(--radius-full)',
                minWidth: 18,
                height: 18,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 5px',
                flexShrink: 0,
              }}
            >
              {conv.unread}
            </div>
          )}
        </div>
      </div>
    </button>
  )
}

// ─── Chat Thread ──────────────────────────────────────────────────────────────

function ChatThread({
  conv,
  onSend,
}: {
  conv: Conversation
  onSend: (convId: string, text: string) => void
}) {
  const { user } = useAuth()
  const [input, setInput] = useState('')
  const [showQuickReplies, setShowQuickReplies] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conv.messages])

  const handleSend = (text: string) => {
    if (!text.trim()) return
    onSend(conv.id, text)
    setInput('')
    setShowQuickReplies(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div
        style={{
          padding: 'var(--space-4) var(--space-6)',
          borderBottom: '1px solid var(--color-border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--color-bg-surface)',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <div style={{ position: 'relative' }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 'var(--radius-full)',
                background: conv.avatarColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--text-base)',
                fontWeight: 800,
                color: 'white',
              }}
            >
              {conv.avatar}
            </div>
            {conv.online && (
              <div style={{ position: 'absolute', bottom: 1, right: 1, width: 9, height: 9, borderRadius: '50%', background: 'var(--color-accent-success)', border: '2px solid var(--color-bg-surface)' }} />
            )}
          </div>
          <div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>
              {conv.name}
            </p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: conv.online ? 'var(--color-accent-success)' : 'var(--color-text-muted)', margin: 0 }}>
              {conv.online ? 'В сети' : 'Был(а) недавно'} · {conv.role}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <button
            style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-md)', padding: 'var(--space-2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', transition: 'color var(--duration-fast)' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-accent-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-muted)')}
          >
            <Phone size={15} />
          </button>
          <button
            style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-md)', padding: 'var(--space-2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', transition: 'color var(--duration-fast)' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-accent-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-muted)')}
          >
            <Video size={15} />
          </button>
          <button
            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', padding: 'var(--space-1)', transition: 'color var(--duration-fast)' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-text-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-muted)')}
          >
            <MoreHorizontal size={18} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: 'var(--space-6)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-3)',
        }}
      >
        {conv.messages.map((msg, i) => {
          const isMe = msg.from === 'me'
          const prevMsg = conv.messages[i - 1]
          const showTime = !prevMsg || prevMsg.time !== msg.time

          return (
            <div key={msg.id}>
              {showTime && (
                <div style={{ textAlign: 'center', margin: 'var(--space-3) 0 var(--space-2)' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-muted)', background: 'var(--color-bg-elevated)', padding: '2px 10px', borderRadius: 'var(--radius-full)' }}>
                    {msg.time}
                  </span>
                </div>
              )}
              <div
                style={{
                  display: 'flex',
                  justifyContent: isMe ? 'flex-end' : 'flex-start',
                  gap: 'var(--space-2)',
                  alignItems: 'flex-end',
                  animation: 'slideUp 0.25s var(--ease-out)',
                }}
              >
                {!isMe && (
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 'var(--radius-full)',
                      background: conv.avatarColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: 'var(--font-display)',
                      fontSize: 11,
                      fontWeight: 800,
                      color: 'white',
                      flexShrink: 0,
                    }}
                  >
                    {conv.avatar}
                  </div>
                )}
                <div style={{ maxWidth: '68%' }}>
                  <div
                    style={{
                      padding: 'var(--space-3) var(--space-4)',
                      borderRadius: isMe
                        ? 'var(--radius-xl) var(--radius-sm) var(--radius-xl) var(--radius-xl)'
                        : 'var(--radius-sm) var(--radius-xl) var(--radius-xl) var(--radius-xl)',
                      background: isMe
                        ? 'linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-secondary))'
                        : 'var(--color-bg-elevated)',
                      border: isMe ? 'none' : '1px solid var(--color-border-subtle)',
                    }}
                  >
                    <p
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: 'var(--text-sm)',
                        color: isMe ? 'white' : 'var(--color-text-primary)',
                        margin: 0,
                        lineHeight: 'var(--leading-normal)',
                      }}
                    >
                      {msg.text}
                    </p>
                  </div>
                  {isMe && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 3, marginTop: 3 }}>
                      <MsgStatusIcon status={msg.status} />
                    </div>
                  )}
                </div>
                {isMe && (
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 'var(--radius-full)',
                      background: 'linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-secondary))',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: 'var(--font-display)',
                      fontSize: 11,
                      fontWeight: 800,
                      color: 'white',
                      flexShrink: 0,
                    }}
                  >
                    {user?.avatar ?? 'Я'}
                  </div>
                )}
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Quick replies */}
      {showQuickReplies && (
        <div
          style={{
            padding: 'var(--space-3) var(--space-5)',
            borderTop: '1px solid var(--color-border-subtle)',
            display: 'flex',
            flexWrap: 'wrap',
            gap: 'var(--space-2)',
            background: 'var(--color-bg-surface)',
            animation: 'slideUp 0.2s var(--ease-out)',
          }}
        >
          {QUICK_REPLIES.map((r) => (
            <button
              key={r}
              onClick={() => handleSend(r)}
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-xs)',
                color: 'var(--color-text-secondary)',
                background: 'var(--color-bg-elevated)',
                border: '1px solid var(--color-border-default)',
                borderRadius: 'var(--radius-full)',
                padding: 'var(--space-2) var(--space-3)',
                cursor: 'pointer',
                transition: 'all var(--duration-fast)',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--color-accent-primary)'
                e.currentTarget.style.borderColor = 'rgba(91,110,245,0.3)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--color-text-secondary)'
                e.currentTarget.style.borderColor = 'var(--color-border-default)'
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
          padding: 'var(--space-4) var(--space-5)',
          borderTop: '1px solid var(--color-border-subtle)',
          background: 'var(--color-bg-surface)',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: 'var(--space-3)',
            background: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border-default)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-3) var(--space-4)',
            transition: 'border-color var(--duration-fast)',
          }}
          onFocusCapture={(e) => ((e.currentTarget as HTMLDivElement).style.borderColor = 'var(--color-accent-primary)')}
          onBlurCapture={(e) => ((e.currentTarget as HTMLDivElement).style.borderColor = 'var(--color-border-default)')}
        >
          <button
            onClick={() => setShowQuickReplies(!showQuickReplies)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: showQuickReplies ? 'var(--color-accent-primary)' : 'var(--color-text-muted)', display: 'flex', flexShrink: 0, transition: 'color var(--duration-fast)' }}
          >
            <Smile size={18} />
          </button>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(input) }
            }}
            placeholder="Написать сообщение… (Enter — отправить)"
            rows={1}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-primary)',
              resize: 'none',
              lineHeight: 'var(--leading-normal)',
              maxHeight: 120,
              overflowY: 'auto',
            }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexShrink: 0 }}>
            <button
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--color-text-muted)', display: 'flex', transition: 'color var(--duration-fast)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-accent-primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-muted)')}
            >
              <Paperclip size={16} />
            </button>
            <button
              onClick={() => handleSend(input)}
              disabled={!input.trim()}
              style={{
                background: input.trim() ? 'linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-secondary))' : 'var(--color-bg-overlay)',
                border: 'none',
                borderRadius: 'var(--radius-full)',
                width: 34,
                height: 34,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: input.trim() ? 'pointer' : 'not-allowed',
                transition: 'all var(--duration-fast)',
              }}
            >
              <Send size={14} color={input.trim() ? 'white' : 'var(--color-text-muted)'} />
            </button>
          </div>
        </div>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--color-text-muted)', margin: 'var(--space-2) 0 0 var(--space-2)' }}>
          Shift+Enter — новая строка · Enter — отправить
        </p>
      </div>
    </div>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-12)', textAlign: 'center' }}>
      <div style={{ width: 64, height: 64, borderRadius: 'var(--radius-xl)', background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border-default)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 'var(--space-5)' }}>
        <Users size={26} color="var(--color-text-muted)" />
      </div>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: 800, letterSpacing: 'var(--tracking-tight)', color: 'var(--color-text-primary)', margin: '0 0 var(--space-3) 0' }}>
        Выберите диалог
      </h2>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', color: 'var(--color-text-muted)', margin: 0, maxWidth: 320, lineHeight: 'var(--leading-normal)' }}>
        Выберите переписку из списка слева, чтобы начать общение
      </p>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Messages() {
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const activeConv = conversations.find((c) => c.id === activeId) ?? null

  const handleSelect = (id: string) => {
    setActiveId(id)
    // Mark as read
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unread: 0 } : c))
    )
  }

  const handleSend = (convId: string, text: string) => {
    const now = new Date()
    const timeStr = now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
    const newMsg: ChatMessage = {
      id: `${Date.now()}`,
      from: 'me',
      text,
      time: timeStr,
      status: 'sent',
    }
    setConversations((prev) =>
      prev.map((c) =>
        c.id === convId
          ? { ...c, messages: [...c.messages, newMsg], lastMessage: text, lastTime: timeStr }
          : c
      )
    )

    // Simulate "delivered" after 600ms
    setTimeout(() => {
      setConversations((prev) =>
        prev.map((c) =>
          c.id === convId
            ? {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === newMsg.id ? { ...m, status: 'delivered' as MsgStatus } : m
                ),
              }
            : c
        )
      )
    }, 600)

    // Simulate "read" + auto-reply after 2s
    setTimeout(() => {
      setConversations((prev) =>
        prev.map((c) =>
          c.id === convId
            ? {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === newMsg.id ? { ...m, status: 'read' as MsgStatus } : m
                ),
              }
            : c
        )
      )
    }, 1500)
  }

  const filtered = conversations.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.role.toLowerCase().includes(search.toLowerCase())
  )

  const totalUnread = conversations.reduce((s, c) => s + c.unread, 0)

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Left — conversation list */}
      <div
        style={{
          width: 320,
          borderRight: '1px solid var(--color-border-subtle)',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--color-bg-surface)',
        }}
      >
        {/* Header */}
        <div style={{ padding: 'var(--space-5) var(--space-5) var(--space-4)', borderBottom: '1px solid var(--color-border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
            <div>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-muted)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', margin: '0 0 4px 0' }}>
                Inbox
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', fontWeight: 800, letterSpacing: 'var(--tracking-tight)', color: 'var(--color-text-primary)', margin: 0 }}>
                  Сообщения
                </h1>
                {totalUnread > 0 && (
                  <span style={{ background: 'var(--color-accent-primary)', color: 'white', fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, borderRadius: 'var(--radius-full)', minWidth: 20, height: 20, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0 6px' }}>
                    {totalUnread}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-2) var(--space-3)' }}>
            <Search size={13} color="var(--color-text-muted)" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск по диалогам…"
              style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-text-primary)' }}
            />
          </div>
        </div>

        {/* Conversations */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                Диалоги не найдены
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
        <div style={{ padding: 'var(--space-3) var(--space-5)', borderTop: '1px solid var(--color-border-subtle)' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-muted)', letterSpacing: 'var(--tracking-wide)' }}>
            {conversations.length} диалогов · {totalUnread} непрочитанных
          </span>
        </div>
      </div>

      {/* Right — chat */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--color-bg-base)' }}>
        {activeConv ? (
          <ChatThread conv={activeConv} onSend={handleSend} />
        ) : (
          <EmptyState />
        )}
      </div>

      <style>{`
        @keyframes slideUp { from { opacity:0; transform:translateY(5px); } to { opacity:1; transform:translateY(0); } }
      `}</style>
    </div>
  )
}
