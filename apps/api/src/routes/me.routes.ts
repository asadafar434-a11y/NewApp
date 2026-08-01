import { Hono } from "hono";
import { requireAuth } from "../middleware/auth.js";
import { prisma } from "../lib/prisma.js";

export const meRoutes = new Hono().get("/me", requireAuth, async (c) => {
  const { userId, companyId, role } = c.get("auth");

  const [user, company] = await Promise.all([
    prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { id: true, name: true, email: true, emailVerified: true, image: true },
    }),
    prisma.company.findUniqueOrThrow({
      where: { id: companyId },
      select: { id: true, name: true },
    }),
  ]);

  return c.json({ user: { ...user, role }, company });
});
