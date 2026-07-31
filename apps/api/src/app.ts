import { Hono } from "hono";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";
import { env } from "./lib/env.js";
import { logger } from "./lib/logger.js";
import { errorHandler, notFoundHandler } from "./middleware/error-handler.js";
import { healthRoutes } from "./routes/health.routes.js";

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

app.route("/api/v1", healthRoutes);
