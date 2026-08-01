export type EmailTemplate = "verify" | "reset" | "chat-invite";

type TemplateVars = { url: string; name?: string };

function shell(title: string, bodyHtml: string) {
  return `<!doctype html>
<html lang="ru">
  <body style="font-family: sans-serif; background: #0a0b0f; color: #e5e7eb; padding: 32px;">
    <div style="max-width: 480px; margin: 0 auto; background: #14161d; border-radius: 12px; padding: 32px;">
      <h1 style="font-size: 20px; margin: 0 0 16px;">Orbital</h1>
      <h2 style="font-size: 16px; margin: 0 0 12px;">${title}</h2>
      ${bodyHtml}
    </div>
  </body>
</html>`;
}

function button(url: string, label: string) {
  return `<a href="${url}" style="display:inline-block;margin-top:16px;padding:12px 20px;background:#5b6ef5;color:#fff;text-decoration:none;border-radius:8px;">${label}</a>`;
}

export const EMAIL_TEMPLATES: Record<
  EmailTemplate,
  { subject: string; render: (vars: TemplateVars) => string }
> = {
  verify: {
    subject: "Подтвердите email — Orbital",
    render: ({ url, name }) =>
      shell(
        "Подтвердите email",
        `<p>${name ? `${name}, здравствуйте!` : "Здравствуйте!"} Подтвердите почту, чтобы начать работу с Orbital.</p>${button(url, "Подтвердить email")}`,
      ),
  },
  reset: {
    subject: "Сброс пароля — Orbital",
    render: ({ url, name }) =>
      shell(
        "Сброс пароля",
        `<p>${name ? `${name}, вы` : "Вы"} запросили сброс пароля. Если это были не вы — просто игнорируйте письмо.</p>${button(url, "Задать новый пароль")}`,
      ),
  },
  "chat-invite": {
    subject: "Новое сообщение — Orbital",
    render: ({ url, name }) =>
      shell(
        "У вас новое сообщение",
        `<p>${name ? `${name}, вам` : "Вам"} написали в Orbital по вашей заявке.</p>${button(url, "Открыть чат")}`,
      ),
  },
};
