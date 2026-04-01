import { createContext, useContext, useState, useEffect } from 'react'
const Ctx = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]   = useState(null)
  const [token, setToken] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const t = localStorage.getItem('fs_token')
    const u = localStorage.getItem('fs_user')
    if (t && u) { setToken(t); setUser(JSON.parse(u)) }
    setReady(true)
  }, [])

  const login = (t, u) => {
    setToken(t); setUser(u)
    localStorage.setItem('fs_token', t)
    localStorage.setItem('fs_user', JSON.stringify(u))
  }
  const logout = () => {
    setToken(null); setUser(null)
    localStorage.removeItem('fs_token')
    localStorage.removeItem('fs_user')
  }
  const updateUser = (updates) => {
    const u = { ...user, ...updates }
    setUser(u); localStorage.setItem('fs_user', JSON.stringify(u))
  }
  const authFetch = (url, opts = {}) => fetch(url, {
    ...opts,
    headers: { 'Content-Type':'application/json', ...(token ? { Authorization:`Bearer ${token}` } : {}), ...opts.headers }
  })

  return <Ctx.Provider value={{ user, token, ready, login, logout, updateUser, authFetch }}>{children}</Ctx.Provider>
}

export const useAuth = () => useContext(Ctx)
