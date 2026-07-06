import api from './axios'

export const googleLogin = (credential) =>
  api.post('/auth/google', { credential })

export const githubLogin = (code) =>
  api.post('/auth/github', { code })

export const getMe = () => api.get('/auth/me')
