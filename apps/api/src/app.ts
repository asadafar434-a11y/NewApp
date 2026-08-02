import { Hono } from "hono";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";
import { auth } from "./lib/auth.js";
import { env } from "./lib/env.js";
import { logger } from "./lib/logger.js";
import { errorHandler, notFoundHandler } from "./middleware/error-handler.js";
import { healthRoutes } from "./routes/health.routes.js";
import { meRoutes } from "./routes/me.routes.js";
import { requestsRoutes } from "./routes/requests.routes.js";
import { specialistsRoutes } from "./routes/specialists.routes.js";
import { uploadsRoutes } from "./routes/uploads.routes.js";

export const app = new Hono();

app.use(secureHeaders());
app.use(cors({ origin: env.WEB_ORIGIN, credentials: true }));
app.use(async (c, next) => {
  const start = Date.now();
  await next();
  logger.info(
    {
      method: c.req.method,
      path: c.req.path,
      status: c.res.status,
      ms: Date.now() - start,
    },
    "request",
  );
});

app.onError(errorHandler);
app.notFound(notFoundHandler);

app.on(["GET", "POST"], "/api/v1/auth/*", (c) => auth.handler(c.req.raw));
app.route("/api/v1", healthRoutes);
app.route("/api/v1", meRoutes);
app.route("/api/v1", requestsRoutes);
app.route("/api/v1", specialistsRoutes);
app.route("/api/v1", uploadsRoutes);
