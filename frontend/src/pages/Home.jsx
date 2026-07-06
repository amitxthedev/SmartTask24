import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Home() {
  const { user } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="h-screen bg-[#09090B] text-white overflow-hidden relative">
      {/* ===== NAVBAR ===== */}
      <nav className="absolute top-0 left-0 right-0 z-50 px-6 lg:px-14">
        <div className="max-w-[1500px] mx-auto flex items-center justify-between h-[72px]">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="SmartTask24" className="w-11 h-11 rounded-xl object-cover shadow-lg shadow-[#F97316]/20" />
            <div className="flex items-baseline gap-0.5">
              <span className="font-heading font-bold text-[19px] tracking-tight text-white">SmartTask</span>
              <span className="text-[12px] font-mono font-bold text-[#F97316]">24</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(user ? '/dashboard' : '/login')}
              className="hidden sm:block h-10 px-5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-[13px] font-medium text-white/50 hover:bg-white/[0.08] hover:text-white/80 hover:border-white/[0.1] transition-all"
            >
              {user ? 'Open App' : 'Sign In'}
            </button>
            <button
              onClick={() => navigate(user ? '/dashboard' : '/login')}
              className="h-10 px-6 rounded-xl bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white text-[13px] font-bold hover:from-[#EA580C] hover:to-[#DC2626] transition-all shadow-lg shadow-[#F97316]/20 hover:shadow-[#F97316]/30 active:scale-[0.97]"
            >
              {user ? 'Dashboard' : 'Get Started'}
            </button>
          </div>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <section className="absolute inset-0 overflow-hidden">
        {/* Background layers */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-[250px] right-[8%] w-[700px] h-[700px] rounded-full bg-[#F97316]/[0.04] blur-[120px]" />
          <div className="absolute -bottom-[200px] left-[15%] w-[500px] h-[500px] rounded-full bg-[#F97316]/[0.025] blur-[100px]" />
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
            backgroundSize: '80px 80px'
          }} />
          <svg className="absolute bottom-[8%] left-[2%] w-[600px] h-[350px] opacity-[0.04]" viewBox="0 0 600 350" fill="none">
            <path d="M0 300 Q150 80 300 240 T600 180" stroke="#F97316" strokeWidth="1"/>
            <circle cx="300" cy="180" r="140" stroke="#F97316" strokeWidth="0.3" fill="none"/>
          </svg>
          <svg className="absolute top-[12%] left-[45%] w-[200px] h-[200px] opacity-[0.03]" viewBox="0 0 200 200" fill="none">
            <rect x="20" y="20" width="160" height="160" rx="20" stroke="#F97316" strokeWidth="0.5"/>
            <rect x="50" y="50" width="100" height="100" rx="12" stroke="#F97316" strokeWidth="0.3"/>
          </svg>
        </div>

        {/* ===== LEFT — CTA (centered vertically) ===== */}
        <div className="absolute inset-0 flex items-center z-10">
          <div className="max-w-[1500px] mx-auto w-full px-6 lg:px-14">
            <div className="max-w-[620px]">
              {/* Giant headline */}
              <h1 className="animate-slide-up">
                <span className="block font-heading font-extrabold text-[clamp(3.5rem,7vw,6rem)] leading-[0.88] tracking-[-0.045em] mb-3">
                  Work smarter,
                </span>
                <span className="block font-heading font-extrabold text-[clamp(3.5rem,7vw,6rem)] leading-[0.88] tracking-[-0.045em] relative">
                  <span className="relative z-10">not</span>
                  <span className="relative inline-block ml-4 lg:ml-5">
                    <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-[#F97316] via-[#FB923C] to-[#FDBA74]">harder.</span>
                    <svg className="absolute -bottom-2 left-0 w-full h-3.5 opacity-50" viewBox="0 0 200 12" fill="none">
                      <path d="M2 8 Q50 2 100 7 T198 4" stroke="#F97316" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
                    </svg>
                  </span>
                </span>
              </h1>

              {/* Description */}
              <p className="text-white/35 text-lg lg:text-xl leading-relaxed max-w-[500px] mt-8 mb-10 animate-slide-up" style={{ animationDelay: '80ms' }}>
                A task manager that actually thinks. AI prioritizes your day, tracks progress, and keeps you shipping.
              </p>

              {/* CTA */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 animate-slide-up" style={{ animationDelay: '160ms' }}>
                <button
                  onClick={() => navigate(user ? '/dashboard' : '/login')}
                  className="group h-14 px-9 rounded-2xl bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white text-[16px] font-bold hover:from-[#EA580C] hover:to-[#DC2626] transition-all duration-300 shadow-xl shadow-[#F97316]/25 hover:shadow-2xl hover:shadow-[#F97316]/35 active:scale-[0.97] flex items-center gap-2.5"
                >
                  Start building
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="group-hover:translate-x-1 transition-transform"><path d="M3 8h10m0 0L9 4m4 4L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
                <button className="group h-14 px-7 rounded-2xl border border-white/[0.08] bg-white/[0.03] text-white/50 text-[15px] font-medium hover:bg-white/[0.06] hover:text-white/70 hover:border-white/[0.12] transition-all flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center group-hover:bg-white/[0.1] transition-colors">
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M6.5 3.5v9l6-4.5-6-4.5z"/></svg>
                  </div>
                  See demo
                </button>
              </div>

              {/* Trust + Rating */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 mt-12 animate-fade-in" style={{ animationDelay: '300ms' }}>
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-3">
                    {[
                      'https://i.pravatar.cc/80?img=11',
                      'https://i.pravatar.cc/80?img=32',
                      'https://i.pravatar.cc/80?img=47',
                      'https://i.pravatar.cc/80?img=56',
                      'https://i.pravatar.cc/80?img=68',
                    ].map((src, i) => (
                      <img
                        key={i}
                        src={src}
                        alt=""
                        className="w-9 h-9 rounded-full border-2 border-[#09090B] object-cover"
                        style={{ zIndex: 5 - i }}
                      />
                    ))}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[14px] text-white/70 font-heading font-bold">2,400+</span>
                    <span className="text-[12px] text-white/25 font-medium -mt-0.5">productive humans</span>
                  </div>
                </div>
                <div className="hidden sm:block w-px h-8 bg-white/[0.06]" />
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(s => (
                      <svg key={s} width="14" height="14" viewBox="0 0 24 24" fill={s <= 4 ? '#F97316' : 'none'} stroke={s <= 4 ? '#F97316' : 'rgba(255,255,255,0.15)'} strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    ))}
                  </div>
                  <span className="text-[12px] text-white/30 font-medium">4.8/5</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===== LAPTOP — right side, bottom touches hero bottom ===== */}
        <div className="hidden lg:block absolute bottom-0 right-0 z-20">
          <DashboardPreview />
        </div>
      </section>
    </div>
  )
}

/* ===== 3D LAPTOP — peeking from right, bottom touches hero ===== */
function DashboardPreview() {
  return (
    <div style={{ perspective: '2000px' }}>
      {/* Glow */}
      <div className="absolute -inset-24 bg-gradient-to-bl from-[#F97316]/[0.07] to-transparent blur-[120px] rounded-full pointer-events-none" />

      {/* 3D wrapper */}
      <div
        className="transition-transform duration-600 ease-out"
        style={{ transform: 'rotateY(-10deg) rotateX(3deg)', transformStyle: 'preserve-3d' }}
        onMouseEnter={e => e.currentTarget.style.transform = 'rotateY(-4deg) rotateX(1deg)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'rotateY(-10deg) rotateX(3deg)'}
      >
        {/* Screen */}
        <div
          className="bg-[#1C1C20] rounded-[14px] border border-white/[0.08] shadow-[0_30px_100px_-10px_rgba(0,0,0,0.85)] overflow-hidden"
          style={{ width: '820px', height: '650px' }}
        >
          {/* Browser topbar */}
          <div className="flex items-center gap-3 px-5 h-10 bg-[#1A1A1E] border-b border-white/[0.04]">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
              <div className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
              <div className="w-3 h-3 rounded-full bg-[#28C840]" />
            </div>
            <div className="flex-1 flex justify-center">
              <div className="flex items-center gap-2 bg-white/[0.03] rounded-lg px-4 py-1.5 border border-white/[0.03]">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <span className="text-[11px] text-white/20 font-mono">smarttask24.app/dashboard</span>
              </div>
            </div>
            <div className="w-16" />
          </div>

          {/* App body */}
          <div className="flex" style={{ height: 'calc(650px - 40px)' }}>
            {/* Sidebar */}
                <div className="w-[210px] bg-[#0C0C0E] border-r border-white/[0.04] p-5 hidden md:flex flex-col">
              <div className="flex items-center gap-3 mb-8">
                <img src="/logo.png" alt="SmartTask24" className="w-8 h-8 rounded-xl object-cover" />
                <span className="text-white/70 text-[13px] font-heading font-bold">SmartTask24</span>
              </div>
              <div className="space-y-1 flex-1">
                {[
                  { label: 'Dashboard', active: true },
                  { label: 'Tasks', active: false },
                  { label: 'Categories', active: false },
                  { label: 'Tags', active: false },
                  { label: 'AI Chat', active: false },
                  { label: 'Notes', active: false },
                ].map((item, i) => (
                  <div key={i} className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[12px] font-medium ${item.active ? 'bg-[#F97316]/10 text-[#F97316]' : 'text-white/30'}`}>
                    <div className={`w-2 h-2 rounded-full ${item.active ? 'bg-[#F97316]/60' : 'bg-white/6'}`} />
                    {item.label}
                  </div>
                ))}
              </div>
              <div className="border-t border-white/[0.04] pt-4 mt-2">
                <div className="flex items-center gap-2.5 px-1">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#F97316] to-[#A78BFA] flex items-center justify-center text-[10px] font-bold text-white">A</div>
                  <div>
                    <div className="text-[11px] text-white/50 font-medium">Amit</div>
                    <div className="text-[9px] text-white/20">amit@mail.com</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main */}
            <div className="flex-1 p-4 lg:p-5 overflow-hidden" style={{ background: '#0d0d10' }}>
              {/* Greeting */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#F59E0B]/20 flex items-center justify-center">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2"><path d="M12 2v4m0 12v4m10-10h-4M6 12H2m15.07-7.07-2.83 2.83M9.76 14.24l-2.83 2.83"/></svg>
                    </div>
                    <span className="text-[13px] text-white/80 font-heading font-bold">Good morning, Amit</span>
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-white/[0.02] border border-white/[0.06] ml-1">
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2"><circle cx="12" cy="14" r="10"/><path d="M12 6v8l4 2"/></svg>
                      <span className="text-[8px] text-white/20">8:45 AM</span>
                    </div>
                  </div>
                  <div className="text-[10px] text-white/25 mt-0.5">Welcome back, Amit. Here's your productivity overview.</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/15">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2"><path d="M8 21h8M12 17v4"/><path d="M17 9a5 5 0 0 0-10 0c0 7-3 9-3 9h16s-3-2-3-9"/></svg>
                    <span className="text-[9px] text-amber-300 font-bold">5 day streak</span>
                  </div>
                </div>
              </div>

              {/* Charts Row 1 - Weekly Activity + Status Position */}
              <div className="grid grid-cols-5 gap-3 mb-3 items-start">
                {/* Weekly Activity */}
                <div className="col-span-3 bg-[#111114] rounded-xl p-4 border border-white/[0.06]">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-[#F97316]/15 flex items-center justify-center">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                      </div>
                      <div>
                        <span className="text-[10px] text-white/50 font-heading font-bold">Weekly Activity</span>
                        <span className="text-[7px] text-white/15 block">Tasks created vs completed</span>
                      </div>
                    </div>
                    <div className="flex gap-2 text-[7px]">
                      <span className="flex items-center gap-1 text-white/20"><span className="w-2 h-1 rounded bg-[#F97316]" /> Created</span>
                      <span className="flex items-center gap-1 text-white/20"><span className="w-2 h-1 rounded bg-[#10B981]" /> Done</span>
                    </div>
                  </div>
                  {/* SVG Area Chart */}
                  <svg width="100%" height="80" viewBox="0 0 340 80" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="wc" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#F97316" stopOpacity="0.3"/>
                        <stop offset="100%" stopColor="#F97316" stopOpacity="0"/>
                      </linearGradient>
                      <linearGradient id="wd" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10B981" stopOpacity="0.3"/>
                        <stop offset="100%" stopColor="#10B981" stopOpacity="0"/>
                      </linearGradient>
                    </defs>
                    {/* Created area */}
                    <path d="M0,60 Q28,50 56,55 Q84,65 112,40 Q140,20 168,35 Q196,50 224,25 Q252,5 280,30 Q308,45 340,15 L340,80 L0,80Z" fill="url(#wc)" opacity="0.6"/>
                    <path d="M0,60 Q28,50 56,55 Q84,65 112,40 Q140,20 168,35 Q196,50 224,25 Q252,5 280,30 Q308,45 340,15" fill="none" stroke="#F97316" strokeWidth="1.5"/>
                    {/* Done area */}
                    <path d="M0,70 Q28,62 56,68 Q84,72 112,55 Q140,40 168,50 Q196,60 224,40 Q252,25 280,45 Q308,60 340,35 L340,80 L0,80Z" fill="url(#wd)" opacity="0.6"/>
                    <path d="M0,70 Q28,62 56,68 Q84,72 112,55 Q140,40 168,50 Q196,60 224,40 Q252,25 280,45 Q308,60 340,35" fill="none" stroke="#10B981" strokeWidth="1.5"/>
                  </svg>
                  <div className="flex justify-between mt-1.5 px-0.5">
                    {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d,i) => (
                      <span key={i} className={`text-[6px] font-medium ${i === 5 ? 'text-[#F97316]/40' : 'text-white/12'}`}>{d}</span>
                    ))}
                  </div>
                </div>

                {/* Status Position */}
                <div className="col-span-2 bg-[#111114] rounded-xl p-4 border border-white/[0.06]">
                  <div className="flex items-center gap-1.5 mb-3">
                    <div className="w-6 h-6 rounded-lg bg-[#F97316]/15 flex items-center justify-center">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                    </div>
                    <span className="text-[10px] text-white/50 font-heading font-bold">Status Position</span>
                  </div>
                  {/* Progress Ring */}
                  <div className="flex items-center gap-3 mb-2">
                    <svg width="44" height="44" viewBox="0 0 44 44" className="-rotate-90 shrink-0">
                      <circle fill="none" stroke="rgba(255,255,255,0.04)" cx="22" cy="22" r="18" strokeWidth="3.5" />
                      <circle fill="none" stroke="#F97316" strokeLinecap="round" cx="22" cy="22" r="18" strokeWidth="3.5" strokeDasharray={113.1} strokeDashoffset={31.7} style={{ filter: 'drop-shadow(0 0 4px #F9731640)' }} />
                    </svg>
                    <div>
                      <span className="text-[9px] font-bold text-white/60">On Fire!</span>
                      <span className="text-[7px] text-white/25 block">12 of 24 tasks done</span>
                    </div>
                  </div>
                  {/* Task Status Grid */}
                  <div className="grid grid-cols-3 gap-1 mb-2">
                    {[{v:12,l:'Done',c:'#10B981'},{v:8,l:'Active',c:'#3B82F6'},{v:4,l:'Overdue',c:'#EF4444'}].map(s => (
                      <div key={s.l} className="p-1.5 rounded text-center" style={{ background: `${s.c}0A`, borderColor: `${s.c}15`, borderWidth: 1 }}>
                        <span className="text-[10px] font-heading font-bold block" style={{ color: s.c }}>{s.v}</span>
                        <span className="text-[6px] text-white/20 uppercase">{s.l}</span>
                      </div>
                    ))}
                  </div>
                  {/* Streak + Weekly */}
                  <div className="flex gap-1.5 mt-2">
                    <div className="flex-1 p-1.5 rounded-lg bg-amber-500/[0.06] border border-amber-500/10 flex items-center gap-1">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2"><path d="M8 21h8M12 17v4"/><path d="M17 9a5 5 0 0 0-10 0c0 7-3 9-3 9h16s-3-2-3-9"/></svg>
                      <span className="text-[8px] font-bold text-amber-400">5 day streak</span>
                    </div>
                    <div className="flex-1 p-1.5 rounded-lg bg-white/[0.02] border border-white/[0.04] flex items-center gap-1">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                      <span className="text-[8px] font-bold text-white/50">72% weekly</span>
                    </div>
                  </div>
                  {/* AI Button */}
                  <button className="w-full mt-2 flex items-center justify-center gap-1.5 h-7 rounded-lg bg-gradient-to-r from-[#F97316] to-[#EA580C] text-[8px] font-bold text-white shadow-lg shadow-[#F97316]/15">
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 8v4m0 4h.01M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10z"/></svg>
                    Open AI Chat
                  </button>
                </div>
              </div>

              {/* Motivation Card */}
              <div className="bg-[#111114] rounded-xl p-2 border border-white/[0.06] mb-1.5">
                <div className="grid grid-cols-4 gap-2 items-center">
                  <div className="relative h-14 rounded-lg overflow-hidden">
                    <img
                      src="https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/3848d39f-cd35-4797-8ec4-2cafb9dac87f/dfkdy7u-1202eb04-4d6d-4f18-92ea-a5ee13724475.gif?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiIvZi8zODQ4ZDM5Zi1jZDM1LTQ3OTctOGVjNC0yY2FmYjlkYWM4N2YvZGZrZHk3dS0xMjAyZWIwNC00ZDZkLTRmMTgtOTJlYS1hNWVlMTM3MjQ0NzUuZ2lmIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.B5oW1OVayRPz8-UmBeWyzKh08UTAQCgE77AIP9E--hI"
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#111114] via-transparent to-transparent opacity-60" />
                  </div>
                  <div className="col-span-3">
                    <span className="text-[6px] font-bold text-[#F97316]/50 uppercase tracking-widest">Daily Fuel</span>
                    <p className="text-[9px] font-heading font-bold text-white/70 italic leading-tight mt-0.5">"Nobody cares. Work harder."</p>
                    <p className="text-[6px] text-white/25 mt-0.5">Nobody is coming to save you. Your life is your responsibility.</p>
                  </div>
                </div>
              </div>

              {/* Charts Row 2 - Categories + Status Pie */}
              <div className="grid grid-cols-5 gap-3 mb-3 items-start">
                <div className="col-span-3 bg-[#111114] rounded-xl p-4 border border-white/[0.06]">
                  <div className="flex items-center gap-1.5 mb-2.5">
                    <div className="w-6 h-6 rounded-lg bg-cyan-500/15 flex items-center justify-center">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#06B6D4" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
                    </div>
                    <span className="text-[10px] text-white/50 font-heading font-bold">Categories</span>
                  </div>
                  {/* SVG Bar Chart */}
                  <svg width="100%" height="55" viewBox="0 0 340 55" preserveAspectRatio="none">
                    {[{x:20,h:75,c:'#F97316'},{x:100,h:55,c:'#3B82F6'},{x:180,h:35,c:'#10B981'},{x:260,h:25,c:'#8B5CF6'}].map((b,i) => (
                      <g key={i}>
                        <rect x={b.x} y={55 - b.h*55/100} width="60" height={b.h*55/100} rx="4" fill={b.c} opacity="0.7" />
                        <rect x={b.x} y={55 - b.h*55/100} width="60" height={b.h*55/100} rx="4" fill={b.c} opacity="0.3" />
                      </g>
                    ))}
                  </svg>
                  <div className="flex justify-between mt-1 px-0.5">
                    {['Work','Dev','Docs','Personal'].map((l,i) => (
                      <span key={i} className="text-[6px] text-white/12 font-medium">{l}</span>
                    ))}
                  </div>
                </div>
                <div className="col-span-2 bg-[#111114] rounded-xl p-4 border border-white/[0.06]">
                  <div className="flex items-center gap-1.5 mb-2">
                    <div className="w-6 h-6 rounded-lg bg-purple-500/15 flex items-center justify-center">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>
                    </div>
                    <span className="text-[10px] text-white/50 font-heading font-bold">Status</span>
                  </div>
                  <div className="flex items-center justify-around">
                    {/* SVG Donut */}
                    <svg width="56" height="56" viewBox="0 0 56 56" className="-rotate-90 shrink-0">
                      <circle fill="none" stroke="rgba(255,255,255,0.04)" cx="28" cy="28" r="22" strokeWidth="6" />
                      <circle fill="none" stroke="#10B981" strokeLinecap="round" cx="28" cy="28" r="22" strokeWidth="6" strokeDasharray={138.2} strokeDashoffset="55.3" />
                      <circle fill="none" stroke="#3B82F6" strokeLinecap="round" cx="28" cy="28" r="22" strokeWidth="6" strokeDasharray={138.2} strokeDashoffset={138.2 - 36.8} style={{ transform: 'rotate(120deg)', transformOrigin: 'center' }} />
                      <circle fill="none" stroke="#EF4444" strokeLinecap="round" cx="28" cy="28" r="22" strokeWidth="6" strokeDasharray={138.2} strokeDashoffset={138.2 - 18.3} style={{ transform: 'rotate(220deg)', transformOrigin: 'center' }} />
                    </svg>
                    <div className="space-y-1">
                      {[{l:'Completed',v:12,c:'#10B981'},{l:'Active',v:8,c:'#3B82F6'},{l:'Overdue',v:4,c:'#EF4444'}].map(s => (
                        <div key={s.l} className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.c }} />
                            <span className="text-[7px] text-white/25">{s.l}</span>
                          </div>
                          <span className="text-[8px] font-bold" style={{ color: s.c }}>{s.v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress + Priority + Quick Actions */}
              <div className="grid grid-cols-3 gap-2 items-start mb-2">
                {/* Progress */}
                <div className="bg-[#111114] rounded-xl p-2.5 border border-white/[0.06]">
                  <div className="flex items-center gap-1 mb-2">
                    <div className="w-5 h-5 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                    </div>
                    <span className="text-[9px] text-white/50 font-heading font-bold">Progress</span>
                  </div>
                  <div className="flex items-center justify-around">
                    <div className="flex flex-col items-center">
                      <svg width="36" height="36" viewBox="0 0 36 36" className="-rotate-90">
                        <circle fill="none" stroke="rgba(255,255,255,0.04)" cx="18" cy="18" r="14.5" strokeWidth="3" />
                        <circle fill="none" stroke="#F97316" strokeLinecap="round" cx="18" cy="18" r="14.5" strokeWidth="3" strokeDasharray={91.1} strokeDashoffset={27.3} style={{ filter: 'drop-shadow(0 0 3px #F9731640)' }} />
                      </svg>
                      <span className="text-[6px] text-white/25 mt-0.5">Week 72%</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <svg width="36" height="36" viewBox="0 0 36 36" className="-rotate-90">
                        <circle fill="none" stroke="rgba(255,255,255,0.04)" cx="18" cy="18" r="14.5" strokeWidth="3" />
                        <circle fill="none" stroke="#8B5CF6" strokeLinecap="round" cx="18" cy="18" r="14.5" strokeWidth="3" strokeDasharray={91.1} strokeDashoffset={45.5} style={{ filter: 'drop-shadow(0 0 3px #8B5CF640)' }} />
                      </svg>
                      <span className="text-[6px] text-white/25 mt-0.5">Month 58%</span>
                    </div>
                  </div>
                </div>
                {/* Priority */}
                <div className="bg-[#111114] rounded-xl p-2.5 border border-white/[0.06]">
                  <div className="flex items-center gap-1 mb-2">
                    <div className="w-5 h-5 rounded-lg bg-orange-500/15 flex items-center justify-center">
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                    </div>
                    <span className="text-[9px] text-white/50 font-heading font-bold">Priority</span>
                  </div>
                  {[{p:'Urgent',v:3,c:'#EF4444',pc:30},{p:'High',v:5,c:'#F97316',pc:45},{p:'Medium',v:8,c:'#3B82F6',pc:70}].map((pr,i) => (
                    <div key={i} className="mb-1 last:mb-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[7px] text-white/30 font-semibold">{pr.p}</span>
                        <span className="text-[7px] font-bold" style={{ color: pr.c }}>{pr.v}</span>
                      </div>
                      <div className="h-1 bg-white/[0.03] rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${pr.pc}%`, background: `linear-gradient(90deg, ${pr.c}, ${pr.c}88)` }} />
                      </div>
                    </div>
                  ))}
                </div>
                {/* Quick Actions */}
                <div className="bg-[#111114] rounded-xl p-2.5 border border-white/[0.06]">
                  <div className="flex items-center gap-1 mb-2">
                    <div className="w-5 h-5 rounded-lg bg-[#F97316]/15 flex items-center justify-center">
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                    </div>
                    <span className="text-[9px] text-white/50 font-heading font-bold">Quick Actions</span>
                  </div>
                  <div className="space-y-0.5">
                    {['Create task','Analyze','List tasks','Mark done'].map((a,i) => (
                      <div key={i} className="flex items-center gap-1.5 p-1 rounded-lg bg-white/[0.02] border border-white/[0.03]">
                        <div className="w-4 h-4 rounded bg-white/[0.04] flex items-center justify-center">
                          <svg width="6" height="6" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        </div>
                        <span className="text-[7px] text-white/35 font-medium">{a}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Active Tasks */}
              <div className="bg-[#111114] rounded-xl p-2.5 border border-white/[0.06]">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1">
                    <div className="w-5 h-5 rounded-lg bg-[#F97316]/15 flex items-center justify-center">
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                    </div>
                    <span className="text-[9px] text-white/50 font-heading font-bold">Active Tasks</span>
                  </div>
                  <span className="text-[6px] text-white/20 font-bold bg-white/[0.04] px-1.5 py-0.5 rounded-full border border-white/[0.06]">6 pending</span>
                </div>
                <div className="space-y-0.5">
                  {[
                    {t:'Design new dashboard layout',p:'HIGH',c:'#F97316'},
                    {t:'Fix login page responsiveness',p:'URGENT',c:'#EF4444'},
                    {t:'Update API documentation',p:'MEDIUM',c:'#3B82F6'},
                  ].map((task,i) => (
                    <div key={i} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/[0.02] transition-colors">
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: task.c, boxShadow: task.p==='URGENT' ? `0 0 4px ${task.c}60` : 'none' }} />
                      <span className="flex-1 text-[7px] text-white/40 truncate">{task.t}</span>
                      <span className="text-[6px] font-bold px-1 py-0.5 rounded" style={{ background: `${task.c}15`, color: task.c }}>{task.p}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
