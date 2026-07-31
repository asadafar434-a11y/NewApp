import { Hono } from "hono";
import { prisma } from "../lib/prisma.js";

export const healthRoutes = new Hono().get("/health", async (c) => {
  let db = true;
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    db = false;
  }
  return c.json({ status: "ok", db });
});
