import { useState } from 'react'
import { useNavigate } from 'react-router'
import {
  Users,
  TrendingDown,
  Megaphone,
  Activity,
  ArrowRight,
  CheckCircle2,
  Clock,
  Zap,
  ChevronRight,
  MessageSquare,
  Bell,
  X,
  RefreshCw,
  Calendar,
  Sparkles,
  TrendingUp,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

// ─── Data ─────────────────────────────────────────────────────────────────────

const QUICK_ACTIONS = [
  { icon: Users, label: 'Нанять сотрудника', sub: '5 кандидатов ждут', color: '#5b6ef5', to: '/hiring' },
  { icon: TrendingDown, label: 'Анализ финансов', sub: 'Прибыль -26% за июль', color: '#ef4444', to: '/finance' },
  { icon: Megaphone, label: 'Запустить кампанию', sub: 'ROAS 2.8× — ниже цели', color: '#7c3aed', to: '/marketing' },
  { icon: Activity, label: 'Операционный отчёт', sub: 'Новый KPI-дайджест', color: '#10b981', to: '/operations' },
]

const TASKS = [
  { id: 1, title: 'Поиск UX-дизайнера', section: 'Найм', status: 'done', result: '5 кандидатов найдено', time: '2 часа назад', color: '#5b6ef5', to: '/hiring' },
  { id: 2, title: 'Анализ падения выручки Q3', section: 'Финансы', status: 'done', result: '3 точки потерь выявлено', time: '5 часов назад', color: '#ef4444', to: '/finance' },
  { id: 3, title: 'Аудит Meta-кампаний', section: 'Маркетинг', status: 'running', result: 'Выполняется…', time: 'Сейчас', color: '#7c3aed', to: '/marketing' },
  { id: 4, title: 'Еженедельный KPI-дайджест', section: 'Операции', status: 'done', result: 'Отчёт за неделю готов', time: 'Вчера', color: '#10b981', to: '/operations' },
  { id: 5, title: 'Анализ конкурентов', section: 'Маркетинг', status: 'done', result: '12 инсайтов выгружено', time: '2 дня назад', color: '#7c3aed', to: '/marketing' },
]

const NOTIFICATIONS = [
  { id: 1, icon: Users, text: 'Анна Ковалёва ответила на ваше сообщение', time: '10 мин', color: '#5b6ef5', unread: true, to: '/messages' },
  { id: 2, icon: Calendar, text: 'Созвон с Марией Смирновой через 2 дня', time: '1 ч', color: '#f59e0b', unread: true, to: '/hiring' },
  { id: 3, icon: TrendingDown, text: 'Финансовый отчёт готов — найдено 3 проблемы', time: '3 ч', color: '#ef4444', unread: true, to: '/finance' },
  { id: 4, icon: Activity, text: 'Задача "Сверка данных" завершилась с ошибкой', time: '5 ч', color: '#ef4444', unread: true, to: '/operations' },
  { id: 5, icon: CheckCircle2, text: 'KPI-дайджест за неделю сформирован', time: 'Вчера', color: '#10b981', unread: false, to: '/operations' },
]

const STATS = [
  { value: '24', label: 'Задач выполнено', delta: '+8 за неделю', up: true, icon: CheckCircle2 },
  { value: '6.2ч', label: 'Сэкономлено сегодня', delta: 'vs ручная работа', up: true, icon: Clock },
  { value: '3', label: 'Активных агентов', delta: '1 завершается', up: null, icon: Zap },
  { value: '94%', label: 'Точность', delta: 'за 30 дней', up: true, icon: TrendingUp },
]

// ─── Component ────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState(NOTIFICATIONS)
  const [dismissedTasks, setDismissedTasks] = useState<number[]>([])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Доброе утро' : hour < 18 ? 'Добрый день' : 'Добрый вечер'
  const unreadCount = notifications.filter((n) => n.unread).length
  const activeTasks = TASKS.filter((t) => !dismissedTasks.includes(t.id))

  const markAllRead = () => setNotifications((p) => p.map((n) => ({ ...n, unread: false })))
  const dismissNotification = (id: number) => setNotifications((p) => p.filter((n) => n.id !== id))

  return (
    <div style={{ padding: 'var(--space-8)', maxWidth: 1100, position: 'relative' }}>

      {/* Notifications dropdown */}
      {showNotifications && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setShowNotifications(false)} />
          <div
            style={{
              position: 'absolute',
              top: 'var(--space-8)',
              right: 'var(--space-8)',
              width: 360,
              background: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border-default)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-lg)',
              zIndex: 50,
              animation: 'slideDown 0.2s var(--ease-out)',
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: 'var(--space-4) var(--space-5)', borderBottom: '1px solid var(--color-border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                Уведомления
              </span>
              <button onClick={markAllRead} style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-accent-primary)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                Прочитать все
              </button>
            </div>
            {notifications.map((n) => {
              const Icon = n.icon
              return (
                <div
                  key={n.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 'var(--space-3)',
                    padding: 'var(--space-4) var(--space-5)',
                    borderBottom: '1px solid var(--color-border-subtle)',
                    background: n.unread ? 'rgba(91,110,245,0.04)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'background var(--duration-fast)',
                  }}
                  onClick={() => { navigate(n.to); setShowNotifications(false) }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = n.unread ? 'rgba(91,110,245,0.04)' : 'transparent')}
                >
                  <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-md)', background: `${n.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={15} color={n.color} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', fontWeight: n.unread ? 600 : 400, color: 'var(--color-text-primary)', margin: '0 0 2px 0', lineHeight: 1.4 }}>
                      {n.text}
                    </p>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-muted)' }}>{n.time}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', flexShrink: 0 }}>
                    {n.unread && <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-accent-primary)' }} />}
                    <button
                      onClick={(e) => { e.stopPropagation(); dismissNotification(n.id) }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: 2, display: 'flex', opacity: 0.5 }}
                      onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                      onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.5')}
                    >
                      <X size={12} />
                    </button>
                  </div>
                </div>
              )
            })}
            {notifications.length === 0 && (
              <div style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', margin: 0 }}>Всё прочитано</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Header */}
      <div style={{ marginBottom: 'var(--space-8)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', margin: '0 0 var(--space-2) 0' }}>
            {greeting}
          </p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 800, letterSpacing: 'var(--tracking-tight)', color: 'var(--color-text-primary)', margin: '0 0 var(--space-2) 0' }}>
            {user?.name}
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', color: 'var(--color-text-secondary)', margin: 0 }}>
            {user?.company} · Сегодня {new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
          </p>
        </div>

        {/* Header actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <button
            onClick={() => navigate('/messages')}
            style={{ position: 'relative', background: 'var(--color-bg-surface)', border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-md)', padding: 'var(--space-3)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', transition: 'color var(--duration-fast)' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-accent-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-muted)')}
          >
            <MessageSquare size={18} />
            <div style={{ position: 'absolute', top: 6, right: 6, width: 7, height: 7, borderRadius: '50%', background: 'var(--color-accent-primary)', border: '1.5px solid var(--color-bg-base)' }} />
          </button>

          <button
            onClick={() => setShowNotifications(!showNotifications)}
            style={{ position: 'relative', background: showNotifications ? 'var(--color-bg-elevated)' : 'var(--color-bg-surface)', border: `1px solid ${showNotifications ? 'var(--color-border-strong)' : 'var(--color-border-default)'}`, borderRadius: 'var(--radius-md)', padding: 'var(--space-3)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: showNotifications ? 'var(--color-accent-primary)' : 'var(--color-text-muted)', transition: 'all var(--duration-fast)' }}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <div style={{ position: 'absolute', top: 5, right: 5, background: 'var(--color-accent-danger)', color: 'white', fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700, borderRadius: 'var(--radius-full)', minWidth: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px', border: '1.5px solid var(--color-bg-base)' }}>
                {unreadCount}
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
        {STATS.map((s) => {
          const Icon = s.icon
          return (
            <div
              key={s.value}
              style={{
                background: 'var(--color-bg-surface)',
                border: '1px solid var(--color-border-subtle)',
                borderRadius: 'var(--radius-xl)',
                padding: 'var(--space-5)',
                transition: 'border-color var(--duration-normal), box-shadow var(--duration-normal)',
                cursor: 'default',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-border-default)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)' }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border-subtle)'; e.currentTarget.style.boxShadow = 'none' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
                <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-md)', background: 'var(--color-bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={15} color="var(--color-text-muted)" />
                </div>
                {s.up !== null && (
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: s.up ? 'var(--color-accent-success)' : 'var(--color-text-muted)', background: s.up ? 'rgba(16,185,129,0.1)' : 'var(--color-bg-elevated)', borderRadius: 'var(--radius-full)', padding: '2px 7px' }}>
                    {s.up ? '↑' : '●'} {s.delta}
                  </span>
                )}
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 800, letterSpacing: 'var(--tracking-tight)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-1)' }}>
                {s.value}
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--color-text-secondary)' }}>
                {s.label}
              </div>
            </div>
          )
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 'var(--space-6)' }}>
        {/* Quick actions */}
        <div>
          <h2 style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--color-text-primary)', margin: '0 0 var(--space-4) 0' }}>
            Быстрые действия
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {QUICK_ACTIONS.map((a) => {
              const Icon = a.icon
              return (
                <button
                  key={a.label}
                  onClick={() => navigate(a.to)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-4)',
                    padding: 'var(--space-4) var(--space-5)',
                    background: 'var(--color-bg-surface)',
                    border: '1px solid var(--color-border-default)',
                    borderRadius: 'var(--radius-xl)',
                    cursor: 'pointer',
                    transition: 'all var(--duration-normal) var(--ease-out)',
                    textAlign: 'left',
                    width: '100%',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = `${a.color}44`
                    e.currentTarget.style.background = 'var(--color-bg-elevated)'
                    e.currentTarget.style.transform = 'translateX(2px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-border-default)'
                    e.currentTarget.style.background = 'var(--color-bg-surface)'
                    e.currentTarget.style.transform = 'none'
                  }}
                >
                  <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-lg)', background: `${a.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={18} color={a.color} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--color-text-primary)', display: 'block' }}>
                      {a.label}
                    </span>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                      {a.sub}
                    </span>
                  </div>
                  <ChevronRight size={16} color="var(--color-text-muted)" />
                </button>
              )
            })}
          </div>

          {/* Free task CTA */}
          <button
            onClick={() => navigate('/new-task')}
            style={{ width: '100%', marginTop: 'var(--space-4)', padding: 'var(--space-4)', background: 'var(--color-accent-glow)', border: '1px dashed rgba(91,110,245,0.3)', borderRadius: 'var(--radius-xl)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-2)', transition: 'all var(--duration-fast)' }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(91,110,245,0.6)')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(91,110,245,0.3)')}
          >
            <Sparkles size={14} color="var(--color-accent-primary)" />
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-accent-primary)' }}>
              Свободный запрос к ИИ
            </span>
            <ArrowRight size={14} color="var(--color-accent-primary)" />
          </button>
        </div>

        {/* Recent tasks */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
            <h2 style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>
              Последние задачи
            </h2>
            <button
              onClick={() => navigate('/new-task')}
              style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-accent-primary)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, padding: 0 }}
            >
              Все задачи <ChevronRight size={12} />
            </button>
          </div>

          <div style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
            {activeTasks.map((task, i) => (
              <div
                key={task.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-4)',
                  padding: 'var(--space-4) var(--space-5)',
                  borderBottom: i < activeTasks.length - 1 ? '1px solid var(--color-border-subtle)' : 'none',
                  cursor: 'pointer',
                  transition: 'background var(--duration-fast)',
                }}
                onClick={() => navigate(task.to)}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-bg-elevated)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <div style={{ width: 8, height: 8, borderRadius: 'var(--radius-full)', background: task.color, flexShrink: 0, boxShadow: task.status === 'running' ? `0 0 8px ${task.color}` : 'none', animation: task.status === 'running' ? 'pulse 1.5s ease-in-out infinite' : 'none' }} />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--color-text-primary)', margin: '0 0 2px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {task.title}
                  </p>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: 0 }}>
                    {task.result}
                  </p>
                </div>

                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 3 }}>
                    {task.status === 'done' ? (
                      <CheckCircle2 size={12} color="var(--color-accent-success)" />
                    ) : (
                      <div style={{ width: 12, height: 12, border: '2px solid var(--color-accent-primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                    )}
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: task.status === 'done' ? 'var(--color-accent-success)' : 'var(--color-accent-primary)' }}>
                      {task.status === 'done' ? 'Готово' : 'Идёт'}
                    </span>
                  </div>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: 0 }}>{task.time}</p>
                </div>

                <button
                  onClick={(e) => { e.stopPropagation(); setDismissedTasks((p) => [...p, task.id]) }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: 2, display: 'flex', opacity: 0, transition: 'opacity var(--duration-fast)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        @keyframes slideDown { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
      `}</style>
    </div>
  )
}
