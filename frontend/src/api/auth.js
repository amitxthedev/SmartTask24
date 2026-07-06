import api from './axios'

export const googleLogin = (credential) =>
  api.post('/auth/google', { credential })

export const githubLogin = (code, redirectUri) =>
  api.post('/auth/github', { code, redirectUri })

export const getMe = () => api.get('/auth/me')
