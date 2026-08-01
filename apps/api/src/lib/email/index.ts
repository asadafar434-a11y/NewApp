import { env } from "../env.js";
import { logger } from "../logger.js";
import { EMAIL_TEMPLATES, type EmailTemplate } from "./templates.js";

type SendEmailVars = { url: string; name?: string };

/**
 * Единая точка отправки писем. В dev/test — только лог (docs/03-architecture.md: lib/email).
 * В production — Unisender Go transactional API.
 */
export async function sendEmail(template: EmailTemplate, to: string, vars: SendEmailVars) {
  const { subject, render } = EMAIL_TEMPLATES[template];

  if (env.NODE_ENV !== "production") {
    logger.info(
      { template, to, url: vars.url },
      "[email] (dev) письмо не отправлено, см. url выше",
    );
    return;
  }

  if (!env.UNISENDER_GO_API_KEY || !env.EMAIL_FROM) {
    throw new Error("UNISENDER_GO_API_KEY и EMAIL_FROM обязательны в production");
  }

  const res = await fetch("https://go1.unisender.ru/ru/transactional/api/v1/email/send.json", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: {
        recipients: [{ email: to, substitutions: {} }],
        body: { html: render(vars) },
        subject,
        from_email: env.EMAIL_FROM,
        from_name: "Orbital",
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    logger.error({ status: res.status, body }, "[email] Unisender Go: ошибка отправки");
    throw new Error(`Unisender Go: ${res.status}`);
  }
}
