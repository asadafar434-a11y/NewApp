import { randomUUID } from "node:crypto";
import { prisma } from "../src/lib/prisma.js";

/**
 * Демо-данные повторяют моки из apps/web (ALL_CANDIDATES, INITIAL_CONVERSATIONS,
 * REVENUE_DATA/EXPENSE_DATA, CAMPAIGNS, TASKS) — см. docs/06-frontend.md, последний абзац.
 * Идемпотентно: перед вставкой полностью удаляет демо-компанию прошлого запуска (Cascade).
 */

const DEMO_EMAIL = "demo@orbital.ru";
const RUB = 100; // копейки в рубле

function daysAgo(days: number, hours = 12, minutes = 0) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hours, minutes, 0, 0);
  return d;
}

function monthStart(monthsAgo: number) {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  d.setMonth(d.getMonth() - monthsAgo);
  return d;
}

const CANDIDATES = [
  {
    name: "Анна Ковалёва",
    role: "Senior UX Designer",
    exp: "6 лет",
    match: 94,
    location: "Москва",
    salary: "180 000 ₽",
    source: "LinkedIn",
    status: "new" as const,
    skills: ["Figma", "User Research", "Prototyping", "Design Systems", "Usability Testing"],
    about:
      "Специализируюсь на проектировании сложных SaaS-продуктов. Работала в Яндексе и нескольких стартапах. Обожаю находить баланс между метриками и пользовательским опытом.",
    email: "anna.kovaleva@mail.ru",
    phone: "+7 (916) 234-56-78",
    portfolioUrl: "https://kovaleva.design",
    availability: "Через 2 недели",
    timezone: "UTC+3",
  },
  {
    name: "Дмитрий Орлов",
    role: "Product Designer",
    exp: "4 года",
    match: 87,
    location: "Санкт-Петербург",
    salary: "150 000 ₽",
    source: "Behance",
    status: "contacted" as const,
    skills: ["Figma", "Motion Design", "Design Systems", "Prototyping"],
    about:
      "Дизайнер продуктов с фокусом на анимацию и микровзаимодействия. Создавал дизайн-систему для финтех-стартапа с нуля.",
    email: "dmitry.orlov@gmail.com",
    phone: "+7 (911) 345-67-89",
    portfolioUrl: "https://orlov.work",
    availability: "Сразу",
    timezone: "UTC+3",
  },
  {
    name: "Мария Смирнова",
    role: "UX/UI Designer",
    exp: "5 лет",
    match: 82,
    location: "Казань",
    salary: "140 000 ₽",
    source: "HH.ru",
    status: "scheduled" as const,
    skills: ["Figma", "Sketch", "HTML/CSS", "User Research", "Wireframing"],
    about: "Работаю на стыке дизайна и разработки. Умею говорить с разработчиками на одном языке.",
    email: "maria.smirnova@yandex.ru",
    phone: "+7 (843) 456-78-90",
    portfolioUrl: null,
    availability: "Через месяц",
    timezone: "UTC+3",
  },
  {
    name: "Артём Новиков",
    role: "Visual Designer",
    exp: "3 года",
    match: 76,
    location: "Новосибирск",
    salary: "120 000 ₽",
    source: "LinkedIn",
    status: "new" as const,
    skills: ["Illustrator", "Figma", "Branding", "After Effects"],
    about: "Специалист по визуальной айдентике и брендингу. Работал с 40+ компаниями.",
    email: "novikov.art@gmail.com",
    phone: "+7 (913) 567-89-01",
    portfolioUrl: "https://novikov.design",
    availability: "Через 3 недели",
    timezone: "UTC+7",
  },
  {
    name: "Екатерина Белова",
    role: "Senior Product Designer",
    exp: "7 лет",
    match: 91,
    location: "Москва",
    salary: "200 000 ₽",
    source: "Dribbble",
    status: "new" as const,
    skills: ["Figma", "Design Systems", "User Research", "A/B Testing", "Leadership"],
    about:
      "Lead designer в e-commerce. Выстраивала дизайн-процессы с нуля, управляла командой 5 человек.",
    email: "e.belova@design.ru",
    phone: "+7 (925) 678-90-12",
    portfolioUrl: "https://belova.co",
    availability: "Через 2 месяца",
    timezone: "UTC+3",
  },
];

const CONVERSATIONS: Record<
  string,
  {
    daysAgo: number;
    unread: number;
    messages: { from: "me" | "them"; text: string; hour: number; minute: number }[];
  }
> = {
  "Анна Ковалёва": {
    daysAgo: 0,
    unread: 2,
    messages: [
      {
        from: "me",
        text: "Привет, Анна! Меня зовут Алексей, я основатель Orbital. Видел ваше портфолио — очень впечатлило. У нас открыта позиция Senior UX Designer.",
        hour: 9,
        minute: 15,
      },
      {
        from: "them",
        text: "Добрый день, Алексей! Спасибо за интерес. Расскажите подробнее о проекте?",
        hour: 9,
        minute: 48,
      },
      {
        from: "me",
        text: "Orbital — это AI-платформа для бизнеса. Мы ищем дизайнера, который выстроит UX с нуля: исследования, дизайн-система, продуктовая работа.",
        hour: 9,
        minute: 52,
      },
      {
        from: "them",
        text: "Звучит интересно! Какой стек и какие ожидания по процессу?",
        hour: 10,
        minute: 1,
      },
      {
        from: "me",
        text: "Figma, тесное взаимодействие с разработкой. Процесс гибкий, без бюрократии. Готов рассказать детальнее на созвоне — удобно на этой неделе?",
        hour: 10,
        minute: 18,
      },
      { from: "them", text: "Буду рада пообщаться! Напишите, когда удобно.", hour: 10, minute: 24 },
    ],
  },
  "Дмитрий Орлов": {
    daysAgo: 1,
    unread: 0,
    messages: [
      {
        from: "me",
        text: "Дмитрий, добрый день! Ваше Behance-портфолио — именно то, что мы ищем. Есть открытая позиция Product Designer.",
        hour: 14,
        minute: 30,
      },
      { from: "them", text: "Добрый! Интересно. Что за продукт?", hour: 15, minute: 2 },
      {
        from: "me",
        text: "AI-сервис для автоматизации бизнес-процессов. B2B, enterprise-уровень. Команда небольшая, но амбиции большие.",
        hour: 15,
        minute: 10,
      },
      { from: "them", text: "Хорошо, жду приглашение на встречу.", hour: 15, minute: 45 },
    ],
  },
  "Мария Смирнова": {
    daysAgo: 2,
    unread: 0,
    messages: [
      {
        from: "me",
        text: "Мария, привет! Нашёл ваше резюме на HH.ru. Очень интересный опыт — работа на стыке дизайна и разработки это именно то, что нам нужно.",
        hour: 11,
        minute: 0,
      },
      {
        from: "them",
        text: "Привет! Да, я обожаю работать с разработчиками напрямую. Расскажите о вашей команде?",
        hour: 11,
        minute: 20,
      },
      {
        from: "me",
        text: "Команда 8 человек, 3 разработчика. Процесс: двухнедельные спринты, тесная синхронизация. Готовы к созвону на 30 минут?",
        hour: 11,
        minute: 35,
      },
      {
        from: "them",
        text: "Конечно! Мне удобно в пятницу — с 10 до 13 МСК.",
        hour: 12,
        minute: 0,
      },
      {
        from: "me",
        text: "Отлично, тогда в пятницу в 11:00 МСК. Пришлю ссылку на встречу.",
        hour: 12,
        minute: 10,
      },
      { from: "them", text: "Ок, в пятницу в 11:00 МСК — договорились!", hour: 12, minute: 15 },
    ],
  },
  "Екатерина Белова": {
    daysAgo: 3,
    unread: 1,
    messages: [
      {
        from: "me",
        text: "Екатерина, добрый день! Нашёл вас на Dribbble — работы впечатляют. Хотел бы обсудить возможность сотрудничества.",
        hour: 10,
        minute: 0,
      },
      {
        from: "them",
        text: "Добрый день! Расскажите немного о компании и позиции?",
        hour: 10,
        minute: 30,
      },
      {
        from: "me",
        text: "Orbital — AI Business OS. Ищем Lead Designer, который выстроит дизайн-процесс и команду. Рост — от специалиста к руководителю дизайна.",
        hour: 10,
        minute: 45,
      },
      {
        from: "them",
        text: "Посмотрю вашу вакансию подробнее и вернусь с ответом.",
        hour: 11,
        minute: 5,
      },
    ],
  },
  "Артём Новиков": {
    daysAgo: 5,
    unread: 0,
    messages: [
      {
        from: "me",
        text: "Артём, привет! Ваш опыт в брендинге и айдентике — то, что нам нужно для нескольких проектов.",
        hour: 9,
        minute: 0,
      },
      {
        from: "them",
        text: "Спасибо за интерес, но сейчас не готов рассматривать предложения.",
        hour: 9,
        minute: 40,
      },
    ],
  },
};

const REVENUE_DATA = [
  { monthsAgo: 6, revenue: 4200, profit: 1176 },
  { monthsAgo: 5, revenue: 3900, profit: 1092 },
  { monthsAgo: 4, revenue: 4500, profit: 1260 },
  { monthsAgo: 3, revenue: 4100, profit: 1148 },
  { monthsAgo: 2, revenue: 3600, profit: 864 },
  { monthsAgo: 1, revenue: 3200, profit: 672 },
  { monthsAgo: 0, revenue: 2900, profit: 493 },
];

const EXPENSE_CATEGORIES = [
  { cat: "Зарплаты", value: 1800, prev: 1400 },
  { cat: "Реклама", value: 900, prev: 600 },
  { cat: "Инфраструктура", value: 420, prev: 390 },
  { cat: "Офис", value: 280, prev: 270 },
  { cat: "Прочее", value: 340, prev: 210 },
];

const CAMPAIGNS = [
  {
    name: "Meta — Осенняя акция",
    channel: "Meta",
    spend: 84000,
    cpl: 1820,
    status: "active" as const,
  },
  {
    name: "Google Search — Бренд",
    channel: "Google Search",
    spend: 31000,
    cpl: 380,
    status: "active" as const,
  },
  { name: "VK — Look-alike", channel: "VK", spend: 22000, cpl: 980, status: "active" as const },
  { name: "Telegram Ads", channel: "Telegram", spend: 18000, cpl: 540, status: "paused" as const },
];

const OPS_TASKS = [
  {
    title: "KPI-дайджест за неделю",
    schedule: "Каждый понедельник 09:00",
    lastRunDaysAgo: 3,
    status: "done" as const,
  },
  {
    title: "Мониторинг SLA поддержки",
    schedule: "Каждый день 10:00",
    lastRunDaysAgo: 1,
    status: "done" as const,
  },
  {
    title: "Сверка финансовых данных",
    schedule: "Каждую пятницу",
    lastRunDaysAgo: 5,
    status: "idle" as const,
  },
  {
    title: "Обновление базы клиентов",
    schedule: "Каждую среду",
    lastRunDaysAgo: 7,
    status: "failed" as const,
  },
  {
    title: "Еженедельный отчёт продаж",
    schedule: "Каждый понедельник 10:00",
    lastRunDaysAgo: 3,
    status: "done" as const,
  },
  {
    title: "Аудит подписок SaaS",
    schedule: "1-го числа каждого месяца",
    lastRunDaysAgo: 30,
    status: "idle" as const,
  },
];

async function main() {
  const existing = await prisma.user.findUnique({ where: { email: DEMO_EMAIL } });
  if (existing) {
    await prisma.company.deleteMany({ where: { ownerId: existing.id } });
    await prisma.user.delete({ where: { id: existing.id } });
  }

  const user = await prisma.user.create({
    data: { id: randomUUID(), name: "Алексей Демо", email: DEMO_EMAIL, emailVerified: true },
  });
  const company = await prisma.company.create({ data: { ownerId: user.id, name: "Acme Corp" } });

  const hireRequest = await prisma.request.create({
    data: {
      companyId: company.id,
      type: "hire",
      title: "Продуктовый дизайнер",
      description: "Ищем сильного продуктового дизайнера в команду Orbital.",
    },
  });
  const consultRequest = await prisma.request.create({
    data: {
      companyId: company.id,
      type: "consult",
      title: "Консультация по налогам",
      description: "Нужна консультация по оптимизации налогообложения для ИП.",
      priceKopecks: 500_000 * RUB,
    },
  });
  void consultRequest;

  for (const c of CANDIDATES) {
    const specialist = await prisma.specialist.create({
      data: {
        companyId: company.id,
        requestId: hireRequest.id,
        name: c.name,
        role: c.role,
        exp: c.exp,
        matchScore: c.match,
        matchReason: `Совпадение по навыкам (${c.skills.slice(0, 2).join(", ")}) и опыту (${c.exp}).`,
        location: c.location,
        salary: c.salary,
        source: c.source,
        status: c.status,
        skills: c.skills,
        about: c.about,
        email: c.email,
        phone: c.phone,
        portfolioUrl: c.portfolioUrl,
        availability: c.availability,
        timezone: c.timezone,
      },
    });

    const convo = CONVERSATIONS[c.name];
    if (!convo) continue;

    const conversation = await prisma.conversation.create({
      data: { companyId: company.id, specialistId: specialist.id },
    });

    const themMessages = convo.messages.filter((m) => m.from === "them");
    const unreadFromEnd = new Set(
      themMessages.slice(themMessages.length - convo.unread).map((m) => m.text),
    );

    for (const m of convo.messages) {
      const createdAt = daysAgo(convo.daysAgo, m.hour, m.minute);
      const isUnread = m.from === "them" && unreadFromEnd.has(m.text);
      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          sender: m.from === "me" ? "owner" : "specialist",
          text: m.text,
          status: isUnread ? "delivered" : "read",
          createdAt,
        },
      });
    }
  }

  for (const r of REVENUE_DATA) {
    const period = monthStart(r.monthsAgo);
    await prisma.financeRecord.create({
      data: {
        companyId: company.id,
        kind: "income",
        category: "Выручка",
        amountKopecks: r.revenue * 1000 * RUB,
        period,
      },
    });
    if (r.monthsAgo >= 2) {
      await prisma.financeRecord.create({
        data: {
          companyId: company.id,
          kind: "expense",
          category: "Общие расходы",
          amountKopecks: (r.revenue - r.profit) * 1000 * RUB,
          period,
        },
      });
    }
  }
  // последние два месяца — расходы по категориям (EXPENSE_DATA: value=текущий, prev=предыдущий)
  const currentMonth = monthStart(0);
  const prevMonth = monthStart(1);
  for (const e of EXPENSE_CATEGORIES) {
    await prisma.financeRecord.create({
      data: {
        companyId: company.id,
        kind: "expense",
        category: e.cat,
        amountKopecks: e.value * 1000 * RUB,
        period: currentMonth,
      },
    });
    await prisma.financeRecord.create({
      data: {
        companyId: company.id,
        kind: "expense",
        category: e.cat,
        amountKopecks: e.prev * 1000 * RUB,
        period: prevMonth,
      },
    });
  }

  const periodEnd = new Date();
  const periodStart = daysAgo(28);
  for (const camp of CAMPAIGNS) {
    const conversions = Math.round((camp.spend / camp.cpl) * 100) / 100;
    const clicks = Math.round(conversions * 10);
    const impressions = clicks * 20;
    await prisma.campaign.create({
      data: {
        companyId: company.id,
        name: camp.name,
        channel: camp.channel,
        spendKopecks: camp.spend * RUB,
        impressions,
        clicks,
        conversions: Math.round(conversions),
        status: camp.status,
        periodStart,
        periodEnd,
      },
    });
  }

  const opsStatusMap = { done: "done", idle: "idle", failed: "failed" } as const;
  for (const t of OPS_TASKS) {
    const lastRunAt = daysAgo(t.lastRunDaysAgo);
    const task = await prisma.opsTask.create({
      data: {
        companyId: company.id,
        title: t.title,
        schedule: t.schedule,
        status: opsStatusMap[t.status],
        lastRunAt,
      },
    });
    await prisma.opsRun.create({
      data: {
        opsTaskId: task.id,
        status: t.status === "idle" ? "done" : t.status,
        report:
          t.status === "failed"
            ? "Ошибка выполнения: не удалось получить данные из источника."
            : "Задача выполнена успешно.",
        startedAt: lastRunAt,
        finishedAt: lastRunAt,
      },
    });
  }

  console.log("Сид готов:", {
    company: company.name,
    specialists: CANDIDATES.length,
    conversations: Object.keys(CONVERSATIONS).length,
    financeRecords: REVENUE_DATA.length * 2 - 4 + EXPENSE_CATEGORIES.length * 2,
    campaigns: CAMPAIGNS.length,
    opsTasks: OPS_TASKS.length,
  });
}

main().finally(() => prisma.$disconnect());
