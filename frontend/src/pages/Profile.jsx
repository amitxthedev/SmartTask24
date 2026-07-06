import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { User, Mail, Shield, Calendar, LogOut, ChevronRight, Settings, Bell, Palette, ShieldCheck, Key } from 'lucide-react'

export default function Profile() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  if (!user) return null

  return (
    <div className="max-w-lg mx-auto space-y-5 animate-slide-up">
      {/* Profile Hero Card */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#111114] to-[#0d0d10]">
        {/* Background gradient mesh */}
        <div className="absolute inset-0">
          <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-[#F97316]/[0.06] blur-[80px]" />
          <div className="absolute -bottom-16 -left-16 w-32 h-32 rounded-full bg-purple-500/[0.04] blur-[60px]" />
        </div>
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#F97316]/30 to-transparent" />

        <div className="relative z-10 flex flex-col items-center pt-8 pb-6 px-6">
          <div className="relative mb-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#F97316] via-[#EA580C] to-purple-500 flex items-center justify-center text-white font-heading font-extrabold text-3xl shadow-xl shadow-[#F97316]/20">
              {user.avatar ? (
                <img src={user.avatar} alt="" className="w-full h-full rounded-2xl object-cover" />
              ) : (
                user.name?.charAt(0)?.toUpperCase() || '?'
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#10B981] border-[3px] border-[#0d0d10] flex items-center justify-center">
              <svg width="8" height="8" viewBox="0 0 10 10" fill="none"><path d="M2 5L4 7L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
          </div>
          <h2 className="font-heading font-extrabold text-lg text-white tracking-tight">{user.name}</h2>
          <p className="text-[13px] text-white/30 mt-1">{user.email}</p>
          <span className="mt-2 badge-orange">{user.role}</span>
        </div>
      </div>

      {/* Info Cards */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#111114] to-[#0d0d10]">
        <div className="divide-y divide-white/[0.04]">
          {[
            { icon: User, label: 'Name', value: user.name, color: '#F97316' },
            { icon: Mail, label: 'Email', value: user.email, color: '#8B5CF6' },
            { icon: Shield, label: 'Role', value: user.role, color: '#10B981' },
            { icon: Calendar, label: 'User ID', value: `#${user.id}`, color: '#F59E0B' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="flex items-center gap-3.5 px-5 py-3.5 hover:bg-white/[0.02] transition-colors">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}10` }}>
                <Icon size={16} style={{ color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-white/25 font-semibold uppercase tracking-wider">{label}</p>
                <p className="text-[13px] font-semibold text-white/60 mt-0.5 truncate">{value}</p>
              </div>
              <ChevronRight size={13} className="text-white/10" />
            </div>
          ))}
        </div>
      </div>

      {/* Quick Settings */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#111114] to-[#0d0d10]">
        <div className="px-5 py-3 border-b border-white/[0.04]">
          <h3 className="font-heading font-bold text-[13px] text-white/40 uppercase tracking-wider">Settings</h3>
        </div>
        <div className="divide-y divide-white/[0.04]">
          {[
            { icon: Bell, label: 'Notifications', desc: 'Manage notification preferences', color: '#3B82F6' },
            { icon: Palette, label: 'Appearance', desc: 'Theme and display settings', color: '#8B5CF6' },
            { icon: Key, label: 'Security', desc: 'Password and 2FA settings', color: '#10B981' },
            { icon: Settings, label: 'Preferences', desc: 'Language, timezone, and more', color: '#F59E0B' },
          ].map(({ icon: Icon, label, desc, color }) => (
            <div key={label} className="flex items-center gap-3.5 px-5 py-3.5 hover:bg-white/[0.02] transition-colors cursor-pointer">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}10` }}>
                <Icon size={16} style={{ color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-white/60">{label}</p>
                <p className="text-[11px] text-white/25 mt-0.5">{desc}</p>
              </div>
              <ChevronRight size={13} className="text-white/10" />
            </div>
          ))}
        </div>
      </div>

      <button onClick={logout} className="btn-danger w-full">
        <LogOut size={15} />
        Sign Out
      </button>
    </div>
  )
}
