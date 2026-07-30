# Orbital — AI Business OS

React + Vite + Tailwind CSS v4 project running inside Figma Make.

## Development Server

A Vite development server is **already running** on `$PORT` (default 8443). You don't need to start it manually.

- Preview URL: accessible through the preview panel
- Hot reload: changes to source files are reflected immediately

---

## Project Overview

**Orbital** is an AI-powered business operating system. Owners describe tasks in plain language ("Need to hire a designer", "Profits are falling") and an AI agent automatically searches, analyzes, orchestrates workflows, and delivers a report.

The app has two top-level zones:
1. **Public** — `/auth` (login / signup)
2. **Protected** — all other routes, guarded by `AuthContext`; unauthenticated users are redirected to `/auth`

---

## File Structure

```
src/
  App.tsx                    # RouterProvider root — wraps AuthProvider + router
  routes.tsx                 # createBrowserRouter config (all routes)
  index.css                  # Design system tokens + Google Fonts imports + Tailwind v4

  context/
    AuthContext.tsx           # Auth state (user, login, signup, logout)

  pages/
    Auth.tsx                 # Login / signup split-panel page
    Root.tsx                 # Protected layout: sidebar + <Outlet />
    Dashboard.tsx            # Overview: stats, quick actions, recent tasks
    Hiring.tsx               # AI recruiting: 3-panel (AI chat | candidates | detail)
    Finance.tsx              # Financial analysis: KPIs, recharts, issues table
    Marketing.tsx            # Marketing audit: campaign table, recharts
    Operations.tsx           # Automation tasks list + KPI progress bars
    NewTask.tsx              # Free-form AI chat for any task
    Messages.tsx             # Full inbox: conversation list + chat thread
```

Key files to start from for any task:
- **Routing changes** → `src/routes.tsx`
- **Auth logic** → `src/context/AuthContext.tsx`
- **Sidebar / global nav** → `src/pages/Root.tsx`
- **Design tokens** → `src/index.css`

---

## Routing

Uses **react-router v7** in Data mode (`createBrowserRouter` + `RouterProvider`).

```
/auth          → Auth.tsx          (public)
/              → Root.tsx layout
  /            → Dashboard.tsx     (index)
  /hiring      → Hiring.tsx
  /finance     → Finance.tsx
  /marketing   → Marketing.tsx
  /operations  → Operations.tsx
  /new-task    → NewTask.tsx
  /messages    → Messages.tsx
```

`Root.tsx` redirects to `/auth` if `user` is null. Never add route guards anywhere else.

---

## Auth

`AuthContext` (in `src/context/AuthContext.tsx`) provides:

| Export | Type | Description |
|---|---|---|
| `AuthProvider` | Component | Wrap at app root — already wired in `App.tsx` |
| `useAuth()` | Hook | Returns `{ user, login, signup, logout }` |

`user` shape: `{ name, email, company, avatar }`. Currently simulated (no real backend). To add a real backend, replace the `login` / `signup` implementations only — the rest of the app consumes `useAuth()` and will not need changes.

---

## Design System Tokens

**All styling must use CSS custom properties from `src/index.css`.** Never use raw hex codes, hardcoded px values, or Tailwind utility classes for color, typography, spacing, radius, or shadow when a token exists.

### Colors
| Token | Usage |
|---|---|
| `--color-bg-base` | Page background (`#0a0b0f`) |
| `--color-bg-surface` | Cards, panels, sidebar |
| `--color-bg-elevated` | Inputs, hover states, secondary cards |
| `--color-bg-overlay` | Modals, popovers |
| `--color-border-subtle` | Dividers, section borders |
| `--color-border-default` | Input borders, card borders |
| `--color-border-strong` | Hover/focus borders |
| `--color-text-primary` | Headings, primary text |
| `--color-text-secondary` | Labels, descriptions |
| `--color-text-muted` | Placeholders, meta text |
| `--color-accent-primary` | `#5b6ef5` — buttons, links, active states |
| `--color-accent-secondary` | `#7c3aed` — gradients paired with primary |
| `--color-accent-glow` | `rgba(91,110,245,0.18)` — glow backgrounds |
| `--color-accent-success` | `#10b981` |
| `--color-accent-warning` | `#f59e0b` |
| `--color-accent-danger` | `#ef4444` |

### Typography
**Only use these three font families** (loaded via Google Fonts in `src/index.css`):

| Token | Family | Use for |
|---|---|---|
| `--font-display` | Syne 700/800 | Headings, numbers, brand marks |
| `--font-body` | Inter 300–700 | All body text, labels, buttons |
| `--font-mono` | JetBrains Mono 400/500 | Status tags, timestamps, code, section labels |

Font size tokens: `--text-xs` (11px) → `--text-sm` (13px) → `--text-base` (15px) → `--text-md` (17px) → `--text-lg` (20px) → `--text-xl` (24px) → `--text-2xl` (32px) → `--text-3xl` (44px) → `--text-4xl` (60px) → `--text-5xl` (80px).

Line-height tokens: `--leading-tight` (1.15) · `--leading-snug` (1.35) · `--leading-normal` (1.6).

Letter-spacing tokens: `--tracking-tight` (-0.03em) · `--tracking-snug` (-0.015em) · `--tracking-normal` · `--tracking-wide` (0.04em) · `--tracking-wider` (0.08em).

### Spacing
Tokens: `--space-1` (4px) · `--space-2` (8px) · `--space-3` (12px) · `--space-4` (16px) · `--space-5` (20px) · `--space-6` (24px) · `--space-8` (32px) · `--space-10` (40px) · `--space-12` (48px) · `--space-16` (64px) · `--space-20` (80px) · `--space-24` (96px).

### Radius
`--radius-sm` (4px) · `--radius-md` (8px) · `--radius-lg` (12px) · `--radius-xl` (16px) · `--radius-2xl` (20px) · `--radius-full` (9999px).

### Shadows / Elevation
`--shadow-sm` · `--shadow-md` · `--shadow-lg` · `--shadow-glow` (accent glow).

### Transitions
`--duration-fast` (120ms) · `--duration-normal` (220ms) · `--duration-slow` (380ms) · `--ease-out`.

### Styling pattern
All styling is done with **inline `style` objects** referencing `var(--token)`. No Tailwind utility classes are used for visual properties — only for layout (`flex`, `grid`) when necessary. Example:

```tsx
<div style={{
  background: 'var(--color-bg-surface)',
  border: '1px solid var(--color-border-default)',
  borderRadius: 'var(--radius-xl)',
  padding: 'var(--space-5)',
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--text-sm)',
  color: 'var(--color-text-primary)',
}} />
```

The standard gradient for buttons and accents:
```css
background: linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-secondary))
```

---

## Pages

### Auth (`/auth`)
Split layout: brand panel (left) + form (right). Supports login and signup mode toggle. Calls `useAuth().login` / `useAuth().signup`, then `navigate('/')`. Shows error state and loading spinner. No real email validation — any non-empty email + password works.

### Root (layout)
Fixed 240px sidebar with: logo, "Новая задача" CTA button, nav links (Dashboard, Hiring, Finance, Marketing, Operations, Messages), user info, settings + logout buttons. Main content area renders `<Outlet />`. Redirects to `/auth` when `user` is null.

NAV_ITEMS supports `badge` prop: `{ to: '/messages', icon: MessageSquare, label: 'Сообщения', badge: 3 }` — renders a pill count when not active.

Sidebar also has a Bell button with red dot and count "5" in the bottom section above the user card.

### Dashboard (`/`)
- **Header**: greeting with user name, company, date; quick-access buttons for Messages and Notifications
- **Notifications dropdown**: dismissable panel showing 5 items, per-item unread dot + X dismiss, "Прочитать все" batch action, navigates to relevant section on click
- **Stats row**: 4 KPI cards (tasks done, time saved, active agents, accuracy) with delta badges
- **Quick actions**: 4 buttons (Нанять/Финансы/Маркетинг/Операции) each with subtitle; hover → slide right 2px + accent border tint
- **Recent tasks**: clickable rows navigate to the relevant section; running task shows spinning dot + spinner icon; each row has an X dismiss button
- **Free task CTA**: dashed gradient border button → `/new-task`

Key state:
- `showNotifications` — toggles dropdown
- `notifications` — array with `unread` flag; supports per-item dismiss + mark-all-read
- `dismissedTasks` — IDs of tasks hidden from the list

### Hiring (`/hiring`)
Three-panel layout (fixed widths, full viewport height):

1. **Left — AI Chat** (300px): conversational interface, quick-prompt chips, AI responds based on keywords in the message
2. **Middle — Candidates / Calls** (320px): two tabs
   - *Candidates* tab: searchable + filterable list of `Candidate` objects; click to open detail
   - *Calls* tab: upcoming scheduled calls grouped by date, with join link + cancel
3. **Right — Detail panel** (flex 1): full candidate profile when selected, empty state otherwise

Key state in `Hiring`:
- `candidates` — array of `Candidate` with `status: Status`
- `scheduledCalls` — array of `ScheduledCall` (lifted to page level, shared across panels)
- `selected` — currently open candidate
- `middleTab` — `'candidates' | 'calls'`

`CandidateDetail` props: `candidate`, `onBack`, `onStatusChange`, `onSchedule`, `existingCall`.

Modals (rendered inside `CandidateDetail`): `ScheduleModal` (date + time picker), `MessageModal` (template selector + editable textarea).

`Status` values: `new | contacted | scheduled | interviewed | hired | rejected`.

### Finance (`/finance`)
- Query input → triggers mock 2-second analysis
- KPI row: revenue, profit, margin, CAC
- Two recharts: `AreaChart` (revenue + profit over months), `BarChart` (expense categories prev vs current)
- Issues list with severity levels and impact amounts

### Marketing (`/marketing`)
- Query input
- KPI cards: impressions, clicks, conversions, ROAS
- Two recharts: `BarChart` (weekly impressions), `LineChart` (weekly conversions)
- Campaign table: spend, ROAS, CPL, status badge

### Operations (`/operations`)
- Query input
- Automated tasks list: each has a ▶ run button (2-second mock execution), status badge, schedule description
- KPI panel: 4 items with progress bars and target comparison

### NewTask (`/new-task`)
- Full-height chat interface
- Empty state with 6 suggestion cards that auto-send on click
- AI replies based on keyword matching in `AI_REPLIES` map
- Typing indicator (bouncing dots)
- Back button → `navigate(-1)`

### Messages (`/messages`)
Two-panel layout (sidebar + thread):

**Types**: `MsgStatus` (`sent | delivered | read`), `ChatMessage`, `Conversation`

**Left sidebar (320px)**:
- Search bar filters by name/role
- `ConversationRow`: avatar with online dot, unread count badge, last message preview, timestamp
- `INITIAL_CONVERSATIONS`: 5 pre-seeded conversations (Анна Ковалёва, Дмитрий Орлов, Мария Смирнова, Екатерина Белова, Артём Новиков)
- Footer: `{n} диалогов · {n} непрочитанных`

**Right thread panel (flex 1)**:
- `ChatThread`: message bubbles (me=gradient, them=elevated bg), avatar on each side
- `MsgStatusIcon`: Check / CheckCheck / CheckCheck(blue) by status
- Quick replies panel toggled by emoji button (`QUICK_REPLIES`: 4 options)
- Textarea: Enter=send, Shift+Enter=newline; Phone/Video/MoreHorizontal action buttons in header

**Key interactions**:
- `handleSend`: appends message, simulates `delivered` at 600ms → `read` at 1500ms
- `handleSelect`: sets selected conversation + clears its unread count
- `EmptyState`: shown when no conversation is selected

---

## Dependencies

Runtime:
- `react` 19, `react-dom` 19
- `react-router` 7.13.0 — routing
- `lucide-react` 0.487.0 — icons (verify each icon name before use)
- `recharts` 2.15.2 — charts (Finance, Marketing pages)
- `motion` 12.23.24 — available but not yet used

Build:
- Vite 8, TypeScript 5.7, `@vitejs/plugin-react`
- Tailwind CSS v4 via `@tailwindcss/vite`
- `oxfmt` — formatting

Kit: `@make-kits/design-system-eugnene` 0.0.2 — installed but has **no extracted components**. Treat as a no-component kit; use underlying dependencies directly.

---

## Conventions

- All components use **inline `style` objects** with design token `var()` references — not Tailwind utility classes for visual properties
- Hover/focus effects are applied with `onMouseEnter` / `onMouseLeave` mutating `e.currentTarget.style`
- Animations defined as `<style>` tag `@keyframes` blocks inside each component
- No external state manager — page-level `useState` only
- Mock data is defined as constants at the top of each page file
- All Russian UI copy; English only for technical labels (status tags, timestamps in mono font)
- Icons: always import from `lucide-react`, verify name exists before using

## Code Quality

- Double quotes for strings with apostrophes
- JSX tags must be closed; braces balanced
- Default exports for all page/component files
- No `console.log` left in production code
