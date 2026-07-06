import { Menu, Bell, Flame, Clock, CalendarDays, GraduationCap } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import UserProfileSettings from './UserProfileSettings'

export default function Topbar({ onMenuClick }) {
  const [now, setNow] = useState(new Date())
  const [showProfile, setShowProfile] = useState(false)
  const [hasProfile, setHasProfile] = useState(false)
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    try {
      const stored = localStorage.getItem('smarttask24_profile')
      if (stored) {
        const p = JSON.parse(stored)
        setHasProfile(!!(p.university || p.course || p.stream))
      }
    } catch {}
  }, [showProfile])

  const formatTime = () => {
    const d = new Date()
    let h = d.getHours()
    const m = String(d.getMinutes()).padStart(2, '0')
    const s = String(d.getSeconds()).padStart(2, '0')
    const ampm = h >= 12 ? 'PM' : 'AM'
    h = h % 12 || 12
    return `${h}:${m}:${s} ${ampm}`
  }
  const formatDate = () => {
    const d = new Date()
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
  }
  const formatDay = () => {
    const d = new Date()
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    return days[d.getDay()]
  }

  const getStreak = () => {
    try {
      const data = JSON.parse(localStorage.getItem('smarttask24_streak') || '{}')
      const today = new Date().toDateString()
      const todayCount = data[today] || 0
      let streak = 0
      let checkDate = new Date()
      while (true) {
        const key = checkDate.toDateString()
        if (data[key] && data[key] > 0) {
          streak++
          checkDate = new Date(checkDate.getTime() - 86400000)
        } else if (key === today) {
          checkDate = new Date(checkDate.getTime() - 86400000)
        } else {
          break
        }
      }
      return { streak, todayCount }
    } catch { return { streak: 0, todayCount: 0 } }
  }

  const { streak, todayCount } = getStreak()

  return (
    <>
      <header className="h-[64px] bg-[#0d0d10]/80 backdrop-blur-xl border-b border-white/[0.04] flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 -ml-2 rounded-xl hover:bg-white/[0.06] text-white/40 transition-colors"
          >
            <Menu size={20} />
          </button>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 shrink-0">
          {/* Daily Streak */}
          <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-orange-500/10 to-amber-500/5 border border-orange-500/15 shrink-0">
            <Flame size={13} className="text-orange-400 shrink-0" style={{ filter: 'drop-shadow(0 0 4px rgba(249,115,22,0.5))' }} />
            <span className="text-[11px] sm:text-[12px] font-bold text-orange-400 tabular-nums">{streak}</span>
            <span className="text-[8px] sm:text-[9px] font-semibold text-orange-400/50 uppercase hidden sm:inline">streak</span>
            {todayCount > 0 && (
              <span className="text-[9px] sm:text-[10px] font-medium text-white/30 hidden sm:inline">| {todayCount} today</span>
            )}
          </div>

          {/* Live Clock */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.05] shrink-0">
            <Clock size={11} className="text-[#F97316] shrink-0" style={{ filter: 'drop-shadow(0 0 4px rgba(249,115,22,0.3))' }} />
            <span className="text-[11px] font-mono font-semibold text-white/50 tabular-nums">{formatTime()}</span>
          </div>

          {/* Live Date */}
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.05] shrink-0">
            <CalendarDays size={11} className="text-[#A78BFA] shrink-0" style={{ filter: 'drop-shadow(0 0 4px rgba(167,139,250,0.3))' }} />
            <div className="flex flex-col leading-none">
              <span className="text-[10px] font-semibold text-white/40">{formatDay()}</span>
              <span className="text-[9px] font-medium text-white/25">{formatDate()}</span>
            </div>
          </div>

          {/* Profile Button */}
          <button
            onClick={() => setShowProfile(true)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition-all duration-200 shrink-0 ${
              hasProfile
                ? 'bg-[#F97316]/[0.06] border-[#F97316]/15 text-[#F97316]/70 hover:bg-[#F97316]/[0.1]'
                : 'bg-white/[0.03] border-white/[0.05] text-white/30 hover:text-white/50 hover:bg-white/[0.06]'
            }`}
            title="Academic Profile"
          >
            <GraduationCap size={13} />
            <span className="text-[10px] font-semibold hidden sm:inline">{hasProfile ? 'Profile' : 'Set Profile'}</span>
          </button>

          {/* Bell */}
          <button className="p-1.5 sm:p-2 rounded-xl hover:bg-white/[0.06] text-white/30 hover:text-white/60 transition-colors relative shrink-0">
            <Bell size={17} />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#F97316] rounded-full border-1.5 sm:border-2 border-[#0d0d10]" />
          </button>

          {/* User Avatar */}
          <div className="hidden sm:flex items-center gap-3 ml-2 pl-3 border-l border-white/[0.06]">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#F97316] to-[#A78BFA] flex items-center justify-center text-white text-[11px] font-bold">
              {user?.avatar ? (
                <img src={user.avatar} alt="" className="w-full h-full rounded-xl object-cover" />
              ) : (
                user?.name?.charAt(0)?.toUpperCase() || '?'
              )}
            </div>
            <div className="hidden lg:block">
              <p className="text-[13px] font-semibold text-white/60 leading-tight">{user?.name}</p>
              <p className="text-[11px] text-white/25">{user?.role}</p>
            </div>
          </div>
        </div>
      </header>

      <UserProfileSettings open={showProfile} onClose={() => setShowProfile(false)} />
    </>
  )
}
