/** Минимальный интерфейс, который нужен от подписчика — не привязываемся к конкретному
 * классу Hono (SSEStreamingApi), чтобы юнит-тесты могли подставить фейковый объект. */
export type SseSubscriber = {
  writeSSE(message: { event?: string; data: string }): Promise<void>;
};

const subscribers = new Map<string, Set<SseSubscriber>>();

/** Реестр подписчиков по companyId — in-memory, не переживает рестарт и не масштабируется
 * на несколько инстансов (осознанно, см. docs/adr/ADR-0005-sse-chat.md). */
export function subscribe(companyId: string, subscriber: SseSubscriber) {
  let set = subscribers.get(companyId);
  if (!set) {
    set = new Set();
    subscribers.set(companyId, set);
  }
  set.add(subscriber);
}

export function unsubscribe(companyId: string, subscriber: SseSubscriber) {
  const set = subscribers.get(companyId);
  if (!set) return;
  set.delete(subscriber);
  if (set.size === 0) subscribers.delete(companyId);
}

/** Рассылает событие всем подписчикам компании; чужим компаниям недоступно структурно —
 * рассылка идёт только по Set, зарегистрированному под конкретным companyId. */
export async function publish(companyId: string, event: string, data: unknown) {
  const set = subscribers.get(companyId);
  if (!set || set.size === 0) return;

  const payload = JSON.stringify(data);
  await Promise.all(
    [...set].map((subscriber) =>
      subscriber.writeSSE({ event, data: payload }).catch(() => {
        // Соединение уже разорвано — onAbort на роуте сам вычистит подписчика через unsubscribe.
      }),
    ),
  );
}
