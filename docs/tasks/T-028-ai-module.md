# T-028: lib/ai — модуль Claude с лимитами токенов

**Фаза:** 3 · **Оценка:** 4ч · **Зависит от:** T-016 · **Статус:** todo

## Цель
Единый AI-модуль: стриминг чата и структурные ответы; расход токенов учитывается, лимит блокирует.

## Контекст
[ADR-0004](../adr/ADR-0004-claude-ai-module.md). Ключ платформенный; модель и лимит — env.

## Что сделать
- [ ] deps: `@anthropic-ai/sdk`; env: ANTHROPIC_API_KEY, ANTHROPIC_BASE_URL, AI_MODEL, AI_MONTHLY_TOKEN_LIMIT
- [ ] `src/lib/ai/client.ts`: Anthropic-клиент
- [ ] `src/lib/ai/index.ts`: `streamChat({system, messages, onChunk}) → {text, tokensIn, tokensOut}`; `completeJson({system, prompt, schema}) → parsed` (tool-use или JSON-режим, retry 1 раз при невалидном JSON)
- [ ] `src/services/ai-usage.service.ts`: `checkLimit(companyId)` (429→422 TOKEN_LIMIT), `addUsage(companyId, tokens)` — upsert TokenUsage атомарным инкрементом
- [ ] `GET /ai/usage`: {month, tokensUsed, tokensLimit}
- [ ] Vitest: лимит блокирует (мок ai-клиента), инкремент конкурентно корректен (Promise.all 10 инкрементов)

## Затрагиваемые файлы
- `apps/api/src/lib/ai/**`, `src/services/ai-usage.service.ts`, `src/routes/ai.routes.ts` (usage) — создать

## Критерии приёмки
- [ ] Ручной smoke-скрипт (`tsx scripts/ai-smoke.ts`) получает стриминговый ответ от Claude
- [ ] TokenUsage растёт после вызова; при tokensUsed ≥ лимита `checkLimit` кидает TOKEN_LIMIT
- [ ] Тесты (с моками) зелёные

## Как проверить
```bash
pnpm --filter @orbital/api exec tsx scripts/ai-smoke.ts
```
и `curl .../ai/usage`.

## Подводные камни
Доступ к api.anthropic.com с локали/VPS РФ может требовать прокси — проверить сразу; при
проблемах выставить ANTHROPIC_BASE_URL (ADR-0004). Списывать фактические usage-токены из ответа
API, не оценку.
