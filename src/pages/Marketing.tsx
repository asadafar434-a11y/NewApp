import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { Megaphone, TrendingDown, TrendingUp, AlertTriangle, Send, Target, MousePointerClick, Eye } from 'lucide-react'

const CAMPAIGN_DATA = [
  { week: 'Н1', impressions: 42, clicks: 1260, conversions: 63 },
  { week: 'Н2', impressions: 38, clicks: 988, conversions: 44 },
  { week: 'Н3', impressions: 31, clicks: 775, conversions: 31 },
  { week: 'Н4', impressions: 27, clicks: 621, conversions: 22 },
]

const CAMPAIGNS = [
  { name: 'Meta — Осенняя акция', spend: '₽84 000', roas: 1.4, cpl: '₽1 820', status: 'bad' },
  { name: 'Google Search — Бренд', spend: '₽31 000', roas: 5.2, cpl: '₽380', status: 'good' },
  { name: 'VK — Look-alike', spend: '₽22 000', roas: 2.1, cpl: '₽980', status: 'ok' },
  { name: 'Telegram Ads', spend: '₽18 000', roas: 3.4, cpl: '₽540', status: 'ok' },
]

const STATUS_STYLE: Record<string, { color: string; label: string }> = {
  good: { color: '#10b981', label: 'Эффективно' },
  ok: { color: '#f59e0b', label: 'Нейтрально' },
  bad: { color: '#ef4444', label: 'Убыточно' },
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null
  return (
    <div style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-md)', padding: 'var(--space-3) var(--space-4)' }}>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-muted)', margin: '0 0 4px 0' }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', fontWeight: 600, color: p.color, margin: 0 }}>
          {p.value}{p.name === 'impressions' ? 'К' : ''} — {p.name}
        </p>
      ))}
    </div>
  )
}

export default function Marketing() {
  const [query, setQuery] = useState('')
  const [running, setRunning] = useState(false)

  const handleRun = () => {
    if (!query.trim()) return
    setRunning(true)
    setTimeout(() => setRunning(false), 1800)
  }

  return (
    <div style={{ padding: 'var(--space-8)', maxWidth: 1100 }}>
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', letterSpacing: 'var(--tracking-wider)', textTransform: 'uppercase', margin: '0 0 var(--space-2) 0' }}>
          Marketing
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 800, letterSpacing: 'var(--tracking-tight)', color: 'var(--color-text-primary)', margin: '0 0 var(--space-5) 0' }}>
          Маркетинг
        </h1>

        <div style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-4) var(--space-5)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)', maxWidth: 700 }}>
          <Megaphone size={16} color="var(--color-text-muted)" style={{ flexShrink: 0 }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleRun()}
            placeholder='"Почему упал ROAS?" или "Запустить ретаргетинг"'
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', color: 'var(--color-text-primary)' }}
          />
          <button
            onClick={handleRun}
            style={{ background: 'linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-secondary))', border: 'none', borderRadius: 'var(--radius-md)', padding: 'var(--space-2) var(--space-4)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}
          >
            {running ? (
              <div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
            ) : <Send size={14} color="white" />}
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'white' }}>{running ? 'Анализирую…' : 'Запустить'}</span>
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        {[
          { icon: Eye, label: 'Показы (нед)', value: '27К', delta: '-35% vs нед1', up: false },
          { icon: MousePointerClick, label: 'Клики', value: '621', delta: '-51% vs нед1', up: false },
          { icon: Target, label: 'Конверсии', value: '22', delta: '-65% vs нед1', up: false },
          { icon: TrendingDown, label: 'Ср. ROAS', value: '2.8×', delta: 'Цель: 4.0×', up: false },
        ].map((k) => {
          const Icon = k.icon
          return (
            <div key={k.label} style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-5)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
                <Icon size={14} color="var(--color-text-muted)" />
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: 0, fontWeight: 500 }}>{k.label}</p>
              </div>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: 800, letterSpacing: 'var(--tracking-tight)', color: 'var(--color-text-primary)', margin: '0 0 var(--space-1) 0' }}>{k.value}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <TrendingDown size={11} color="var(--color-accent-danger)" />
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-accent-danger)' }}>{k.delta}</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-5)', marginBottom: 'var(--space-6)' }}>
        <div style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-6)' }}>
          <h3 style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--color-text-primary)', margin: '0 0 var(--space-5) 0' }}>Динамика показов</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={CAMPAIGN_DATA}>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="week" tick={{ fontFamily: 'var(--font-mono)', fontSize: 11, fill: '#555a6b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontFamily: 'var(--font-mono)', fontSize: 11, fill: '#555a6b' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="impressions" name="impressions" fill="#5b6ef5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-6)' }}>
          <h3 style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--color-text-primary)', margin: '0 0 var(--space-5) 0' }}>Конверсии по неделям</h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={CAMPAIGN_DATA}>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
              <XAxis dataKey="week" tick={{ fontFamily: 'var(--font-mono)', fontSize: 11, fill: '#555a6b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontFamily: 'var(--font-mono)', fontSize: 11, fill: '#555a6b' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="conversions" name="conversions" stroke="#7c3aed" strokeWidth={2} dot={{ fill: '#7c3aed', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Campaigns table */}
      <div>
        <h3 style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--color-text-primary)', margin: '0 0 var(--space-4) 0' }}>Кампании</h3>
        <div style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                {['Кампания', 'Расход', 'ROAS', 'CPL', 'Статус'].map((h) => (
                  <th key={h} style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-muted)', letterSpacing: 'var(--tracking-wide)', textTransform: 'uppercase', padding: 'var(--space-4) var(--space-5)', textAlign: 'left', fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CAMPAIGNS.map((c, i) => {
                const s = STATUS_STYLE[c.status]
                return (
                  <tr key={c.name} style={{ borderBottom: i < CAMPAIGNS.length - 1 ? '1px solid var(--color-border-subtle)' : 'none', transition: 'background var(--duration-fast)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-bg-elevated)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: 'var(--space-4) var(--space-5)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)', fontWeight: 500 }}>{c.name}</td>
                    <td style={{ padding: 'var(--space-4) var(--space-5)', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>{c.spend}</td>
                    <td style={{ padding: 'var(--space-4) var(--space-5)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        {c.roas >= 3 ? <TrendingUp size={12} color="var(--color-accent-success)" /> : <TrendingDown size={12} color="var(--color-accent-danger)" />}
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', fontWeight: 600, color: c.roas >= 3 ? 'var(--color-accent-success)' : 'var(--color-accent-danger)' }}>{c.roas}×</span>
                      </div>
                    </td>
                    <td style={{ padding: 'var(--space-4) var(--space-5)', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>{c.cpl}</td>
                    <td style={{ padding: 'var(--space-4) var(--space-5)' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: s.color, background: `${s.color}15`, border: `1px solid ${s.color}25`, borderRadius: 'var(--radius-full)', padding: '2px 8px' }}>{s.label}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
