import { createContext, useContext, useState, type ReactNode } from 'react'

type User = { name: string; email: string; company: string; avatar: string }

type AuthCtx = {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string, company: string) => Promise<void>
  logout: () => void
}

const Ctx = createContext<AuthCtx | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  const login = async (email: string, _password: string) => {
    await new Promise((r) => setTimeout(r, 900))
    setUser({
      name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      email,
      company: 'Acme Corp',
      avatar: email[0].toUpperCase(),
    })
  }

  const signup = async (name: string, email: string, _password: string, company: string) => {
    await new Promise((r) => setTimeout(r, 900))
    setUser({ name, email, company, avatar: name[0].toUpperCase() })
  }

  const logout = () => setUser(null)

  return <Ctx.Provider value={{ user, login, signup, logout }}>{children}</Ctx.Provider>
}

export function useAuth() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
