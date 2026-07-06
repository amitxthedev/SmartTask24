import { createContext, useContext, useState, useEffect } from 'react'
import { googleLogin, githubLogin, getMe } from '../api/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const saved = localStorage.getItem('user')
    if (token && saved) {
      setUser(JSON.parse(saved))
      setLoading(false)
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (credential) => {
    const res = await googleLogin(credential)
    const data = res.data.data
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    setUser(data.user)
    return data
  }

  const loginWithGithub = async (code, redirectUri) => {
    const res = await githubLogin(code, redirectUri)
    const data = res.data.data
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    setUser(data.user)
    return data
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    sessionStorage.clear()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithGithub, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
