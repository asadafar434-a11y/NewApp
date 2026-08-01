import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";

// createAuthClient требует абсолютный URL (валидирует через `new URL()`), поэтому
// достраиваем от текущего origin — в dev это тот же порт, что и фронт (проксируется Vite),
// в prod Caddy тоже проксирует /api на том же домене (docs/08-infrastructure.md).
export const authClient = createAuthClient({
  baseURL: `${window.location.origin}/api/v1/auth`,
  plugins: [inferAdditionalFields({ user: { company: { type: "string" } } })],
});
