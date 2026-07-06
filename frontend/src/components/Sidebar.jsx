import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, CheckSquare2, Tags, FolderKanban, FileText,
  Bot, User, LogOut, X, ChevronLeft, ChevronRight, Zap
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const navSections = [
  {
    label: 'Main',
    items: [
      { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/tasks', label: 'Tasks', icon: CheckSquare2 },
      { to: '/categories', label: 'Categories', icon: FolderKanban },
      { to: '/tags', label: 'Tags', icon: Tags },
    ]
  },
  {
    label: 'Workspace',
    items: [
      { to: '/notes', label: 'Notes', icon: FileText },
      { to: '/ai', label: 'AI Assistant', icon: Bot, highlight: true },
    ]
  },
]

export default function Sidebar({ open, onClose, collapsed, onToggleCollapse }) {
  const { user, logout } = useAuth()

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-md z-40 lg:hidden transition-all duration-300"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed top-0 left-0 h-full z-50 flex flex-col
        transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
        lg:translate-x-0 lg:static lg:z-auto
        ${open ? 'translate-x-0' : '-translate-x-full'}
        ${collapsed ? 'w-[72px]' : 'w-[260px]'}
        bg-[#0d0d10] border-r border-white/[0.04]
      `}>
        {/* Header */}
        <div className={`flex items-center h-[64px] border-b border-white/[0.04] shrink-0 ${collapsed ? 'justify-center px-2' : 'justify-between px-5'}`}>
          {!collapsed && (
            <div className="flex items-center gap-2.5">
              <img src="/logo.png" alt="SmartTask24" className="w-9 h-9 rounded-xl shadow-lg shadow-[#F97316]/25 object-cover" />
              <div className="flex items-baseline gap-0.5">
                <span className="font-heading font-bold text-[15px] text-white tracking-tight">SmartTask</span>
                <span className="text-[10px] font-mono font-bold text-[#F97316]">24</span>
              </div>
            </div>
          )}
          {collapsed && (
            <img src="/logo.png" alt="SmartTask24" className="w-9 h-9 rounded-xl shadow-lg shadow-[#F97316]/25 object-cover" />
          )}
          <div className="hidden lg:flex items-center">
            <button
              onClick={onToggleCollapse}
              className="p-1.5 rounded-lg text-white/25 hover:text-white/60 hover:bg-white/[0.05] transition-all duration-200"
            >
              {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 custom-scrollbar">
          {navSections.map((section) => (
            <div key={section.label} className="mb-5">
              {!collapsed && (
                <p className="px-3 mb-2 text-[10px] font-bold text-white/20 uppercase tracking-[0.1em]">
                  {section.label}
                </p>
              )}
              <div className="space-y-0.5">
                {section.items.map(({ to, label, icon: Icon, highlight }) => (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={onClose}
                    title={collapsed ? label : undefined}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-xl transition-all duration-200 group relative ${
                        collapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5'
                      } ${
                        isActive
                          ? 'bg-[#F97316]/[0.08] text-[#F97316]'
                          : 'text-white/35 hover:bg-white/[0.04] hover:text-white/60'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[#F97316] rounded-r-full" />
                        )}
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 shrink-0 ${
                          isActive
                            ? 'bg-[#F97316]/15 shadow-sm shadow-[#F97316]/10'
                            : 'bg-white/[0.03] group-hover:bg-white/[0.06]'
                        }`}>
                          <Icon size={16} className={highlight && !isActive ? 'text-[#F97316]/50' : ''} />
                        </div>
                        {!collapsed && (
                          <span className="text-[13px] font-medium flex-1">{label}</span>
                        )}
                        {!collapsed && highlight && !isActive && (
                          <span className="px-1.5 py-0.5 text-[9px] font-bold bg-[#F97316]/10 text-[#F97316]/60 rounded-md">
                            AI
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Divider */}
        <div className="mx-4 h-px bg-white/[0.04]" />

        {/* User section */}
        <div className={`shrink-0 p-3 ${collapsed ? 'flex flex-col items-center gap-2' : ''}`}>
          {!collapsed ? (
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.02]">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#F97316] to-[#A78BFA] flex items-center justify-center text-white text-xs font-bold shadow-md shadow-[#F97316]/20 shrink-0">
                {user?.avatar ? (
                  <img src={user.avatar} alt="" className="w-full h-full rounded-xl object-cover" />
                ) : (
                  user?.name?.charAt(0)?.toUpperCase() || '?'
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-white/70 truncate leading-tight">{user?.name}</p>
                <p className="text-[11px] text-white/25 truncate mt-0.5">{user?.email}</p>
              </div>
            </div>
          ) : (
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#F97316] to-[#A78BFA] flex items-center justify-center text-white text-xs font-bold shadow-md shadow-[#F97316]/20">
              {user?.avatar ? (
                <img src={user.avatar} alt="" className="w-full h-full rounded-xl object-cover" />
              ) : (
                user?.name?.charAt(0)?.toUpperCase() || '?'
              )}
            </div>
          )}
          <button
            onClick={logout}
            title={collapsed ? 'Sign Out' : undefined}
            className={`flex items-center gap-3 rounded-xl text-[13px] font-medium text-white/30 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 mt-1 ${
              collapsed ? 'justify-center px-2 py-2 w-full' : 'px-3.5 py-2.5 w-full'
            }`}
          >
            <LogOut size={16} />
            {!collapsed && 'Sign Out'}
          </button>
        </div>
      </aside>
    </>
  )
}
