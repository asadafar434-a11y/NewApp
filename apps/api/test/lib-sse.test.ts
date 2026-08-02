import { describe, expect, it, vi } from "vitest";
import { publish, subscribe, unsubscribe, type SseSubscriber } from "../src/lib/sse/index.js";

function createFakeSubscriber() {
  const received: { event?: string; data: string }[] = [];
  const subscriber: SseSubscriber = {
    writeSSE: vi.fn(async (message) => {
      received.push(message);
    }),
  };
  return { subscriber, received };
}

describe("lib/sse", () => {
  it("publish доходит подписчику своей компании", async () => {
    const { subscriber, received } = createFakeSubscriber();
    subscribe("company-a", subscriber);

    await publish("company-a", "message:new", { text: "привет" });

    expect(received).toHaveLength(1);
    expect(received[0]).toMatchObject({ event: "message:new" });
    expect(JSON.parse(received[0].data)).toEqual({ text: "привет" });

    unsubscribe("company-a", subscriber);
  });

  it("publish не доходит подписчику чужой компании", async () => {
    const { subscriber: ownerSub, received: ownerReceived } = createFakeSubscriber();
    const { subscriber: strangerSub, received: strangerReceived } = createFakeSubscriber();
    subscribe("company-owner", ownerSub);
    subscribe("company-stranger", strangerSub);

    await publish("company-owner", "message:new", { text: "секрет" });

    expect(ownerReceived).toHaveLength(1);
    expect(strangerReceived).toHaveLength(0);

    unsubscribe("company-owner", ownerSub);
    unsubscribe("company-stranger", strangerSub);
  });

  it("после unsubscribe подписчик больше не получает события", async () => {
    const { subscriber, received } = createFakeSubscriber();
    subscribe("company-b", subscriber);
    unsubscribe("company-b", subscriber);

    await publish("company-b", "message:new", { text: "после отписки" });

    expect(received).toHaveLength(0);
  });

  it("publish без подписчиков не падает", async () => {
    await expect(publish("company-empty", "message:new", {})).resolves.toBeUndefined();
  });

  it("несколько подписчиков одной компании получают одно и то же событие", async () => {
    const first = createFakeSubscriber();
    const second = createFakeSubscriber();
    subscribe("company-c", first.subscriber);
    subscribe("company-c", second.subscriber);

    await publish("company-c", "message:status", { status: "read" });

    expect(first.received).toHaveLength(1);
    expect(second.received).toHaveLength(1);

    unsubscribe("company-c", first.subscriber);
    unsubscribe("company-c", second.subscriber);
  });
});
