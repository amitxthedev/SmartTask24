import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, useSearchParams } from 'react-router-dom'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID
const GITHUB_REDIRECT_URI = import.meta.env.VITE_GITHUB_REDIRECT_URI || `${window.location.origin}/login`

export default function Login() {
  const { login, loginWithGithub } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const buttonRef = useRef(null)

  // Handle GitHub OAuth callback
  useEffect(() => {
    const code = searchParams.get('code')
    if (code) {
      setLoading(true)
      setError('')
      loginWithGithub(code, GITHUB_REDIRECT_URI)
        .then(() => navigate('/dashboard'))
        .catch((err) => {
          setError(err.response?.data?.message || 'GitHub login failed')
          setLoading(false)
          window.history.replaceState({}, '', '/login')
        })
    }
  }, [searchParams, loginWithGithub, navigate])

  // Handle Google Sign-In
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return

    const handleCredential = async (response) => {
      setError('')
      try {
        await login(response.credential)
        navigate('/dashboard')
      } catch (err) {
        setError(err.response?.data?.message || 'Login failed')
      }
    }

    const renderButton = () => {
      if (!window.google?.accounts?.id || !buttonRef.current) return false
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredential,
      })
      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: 'filled_black',
        size: 'large',
        shape: 'pill',
        text: 'continue_with',
        logo_alignment: 'center',
        width: 320,
      })
      return true
    }

    if (renderButton()) return
    const interval = setInterval(() => {
      if (renderButton()) clearInterval(interval)
    }, 100)
    return () => clearInterval(interval)
  }, [login, navigate])

  const handleGitHubLogin = () => {
    if (!GITHUB_CLIENT_ID) {
      setError('GitHub sign-in is not configured. Set VITE_GITHUB_CLIENT_ID in the frontend .env file.')
      return
    }
    const params = new URLSearchParams({
      client_id: GITHUB_CLIENT_ID,
      redirect_uri: GITHUB_REDIRECT_URI,
      scope: 'read:user user:email',
    })
    window.location.href = `https://github.com/login/oauth/authorize?${params.toString()}`
  }

  // Already handling GitHub callback
  const isCallback = searchParams.has('code')
  if (isCallback || loading) {
    return (
      <div className="min-h-screen bg-[#09090B] flex flex-col items-center justify-center px-6">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-[#F97316] border-t-transparent rounded-full animate-spin" />
          <p className="text-white/40 text-sm">Signing you in with GitHub...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#09090B] flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)',
        backgroundSize: '60px 60px'
      }} />

      {/* Subtle glow */}
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-[#F97316]/[0.03] blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-[420px]">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-12">
          <img src="/logo.png" alt="SmartTask24" className="w-12 h-12 rounded-xl object-cover shadow-lg shadow-[#F97316]/15" />
          <div className="flex items-baseline gap-0.5">
            <span className="font-heading font-bold text-[22px] tracking-tight text-white">SmartTask</span>
            <span className="text-[13px] font-mono font-bold text-[#F97316]">24</span>
          </div>
        </div>

        {/* Heading */}
        <div className="mb-8 text-center">
          <h1 className="font-heading font-extrabold text-[2rem] text-white tracking-tight leading-tight">
            Sign in
          </h1>
          <p className="text-white/30 text-[15px] mt-2">
            Continue with your account to access your workspace
          </p>
        </div>

        {/* Login Buttons */}
        <div className="flex flex-col items-center gap-3">
          {/* Google Sign-In */}
          <div ref={buttonRef} className="flex justify-center min-h-[44px]" />

          {/* Divider */}
          <div className="flex items-center gap-3 w-full my-1">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-white/20 text-xs uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* GitHub Sign-In */}
          <button
            onClick={handleGitHubLogin}
            className="flex items-center justify-center gap-3 w-full max-w-[320px] h-[44px] rounded-full bg-[#1a1a1a] hover:bg-[#242424] border border-white/10 hover:border-white/20 transition-all duration-200 group cursor-pointer"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white" className="group-hover:scale-110 transition-transform">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            <span className="text-white text-sm font-medium">Continue with GitHub</span>
          </button>

          {error && (
            <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[13px] font-medium w-full max-w-[320px]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-[11px] text-white/15 text-center mt-8">
          By signing in, you agree to our Terms and Privacy Policy.
        </p>
      </div>
    </div>
  )
}
