import { createContext, useContext, type ReactNode } from "react";
import { authClient } from "../lib/authClient";

type User = { name: string; email: string; company: string; avatar: string };

type AuthCtx = {
  user: User | null;
  isPending: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, company: string) => Promise<void>;
  logout: () => void;
};

const Ctx = createContext<AuthCtx | null>(null);

function toUser(sessionUser: { name: string; email: string; company?: string | null }): User {
  return {
    name: sessionUser.name,
    email: sessionUser.email,
    company: sessionUser.company || "",
    avatar: sessionUser.name[0]?.toUpperCase() || "?",
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, isPending } = authClient.useSession();

  const login = async (email: string, password: string) => {
    const { error } = await authClient.signIn.email({ email, password });
    if (error) throw new Error(error.message || "Неверный email или пароль");
  };

  const signup = async (name: string, email: string, password: string, company: string) => {
    const { error } = await authClient.signUp.email({
      name,
      email,
      password,
      company,
    } as Parameters<typeof authClient.signUp.email>[0]);
    if (error) throw new Error(error.message || "Не удалось зарегистрироваться");
  };

  const logout = () => {
    authClient.signOut();
  };

  const user = session?.user ? toUser(session.user) : null;

  return <Ctx.Provider value={{ user, isPending, login, signup, logout }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
