import { useState, useEffect, useMemo } from 'react'
import { getDashboard } from '../api/dashboard'
import { getTasks } from '../api/tasks'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  ListTodo, CheckCircle2, Clock, AlertCircle,
  TrendingUp, TrendingDown, Calendar, Sparkles, ArrowUpRight, Flame,
  Target, Zap, ChevronRight, BarChart3, Layers, Timer,
  ArrowRight, Plus, Brain, Activity, Hash, CircleDot, Trophy,
  Sunrise, Sunset, Moon, Star, CalendarDays, Gauge,
  ArrowDownRight, Circle, TrendingDown as TrendingDownIcon,
  Sun, Cloud, CloudRain, CloudSnow, CloudLightning, CloudFog,
  CloudDrizzle, CloudSun, Thermometer, MapPin
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell, ResponsiveContainer,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  RadialBarChart, RadialBar
} from 'recharts'
import { DashboardSkeleton } from '../components/Skeleton'
import WeatherEffects from '../components/WeatherEffects'

const CHART_COLORS = {
  orange: '#F97316',
  orangeLight: '#FB923C',
  blue: '#3B82F6',
  green: '#10B981',
  red: '#EF4444',
  purple: '#8B5CF6',
  amber: '#F59E0B',
  cyan: '#06B6D4',
  rose: '#F43F5E',
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#1a1a1e] border border-white/10 rounded-xl px-4 py-3 shadow-2xl">
      <p className="text-[11px] font-bold text-white/40 uppercase tracking-wider mb-2">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2 text-[12px]">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-white/50">{p.name}:</span>
          <span className="font-bold" style={{ color: p.color }}>{p.value}</span>
        </div>
      ))}
    </div>
  )
}

function getWeatherIcon(condition) {
  if (!condition) return CloudSun
  const c = condition.toLowerCase()
  if (c.includes('sunny') || c.includes('clear')) return Sun
  if (c.includes('partly cloudy') || c.includes('partly')) return CloudSun
  if (c.includes('cloud') || c.includes('overcast')) return Cloud
  if (c.includes('thunder') || c.includes('storm')) return CloudLightning
  if (c.includes('drizzle')) return CloudDrizzle
  if (c.includes('rain') || c.includes('shower')) return CloudRain
  if (c.includes('snow') || c.includes('sleet') || c.includes('blizzard')) return CloudSnow
  if (c.includes('fog') || c.includes('mist') || c.includes('haze')) return CloudFog
  return CloudSun
}

function getWeatherColor(condition) {
  if (!condition) return '#F59E0B'
  const c = condition.toLowerCase()
  if (c.includes('sunny') || c.includes('clear')) return '#F59E0B'
  if (c.includes('cloud') || c.includes('overcast')) return '#94A3B8'
  if (c.includes('thunder') || c.includes('storm')) return '#8B5CF6'
  if (c.includes('rain') || c.includes('drizzle') || c.includes('shower')) return '#3B82F6'
  if (c.includes('snow')) return '#E2E8F0'
  if (c.includes('fog') || c.includes('mist') || c.includes('haze')) return '#64748B'
  return '#F59E0B'
}

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [weather, setWeather] = useState(null)
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    Promise.all([getDashboard(), getTasks()])
      .then(([dash, taskRes]) => { setData(dash.data.data); setTasks(taskRes.data.data) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    try {
      const cached = localStorage.getItem('smarttask24_weather')
      const cacheTime = localStorage.getItem('smarttask24_weather_time')
      if (cached && cacheTime && Date.now() - Number(cacheTime) < 30 * 60 * 1000) {
        setWeather(JSON.parse(cached))
      }
    } catch {}
  }, [])

  const greeting = useMemo(() => {
    const h = new Date().getHours()
    if (weather) {
      const Icon = getWeatherIcon(weather.condition)
      return { text: h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening', icon: Icon, color: getWeatherColor(weather.condition) }
    }
    if (h < 6) return { text: 'Good night', icon: Moon, color: '#8B5CF6' }
    if (h < 12) return { text: 'Good morning', icon: Sunrise, color: '#F59E0B' }
    if (h < 17) return { text: 'Good afternoon', icon: Sunset, color: '#F97316' }
    return { text: 'Good evening', icon: Moon, color: '#8B5CF6' }
  }, [weather])

  const recentTasks = useMemo(() =>
    tasks.filter(t => t.status === 'PENDING' || t.status === 'IN_PROGRESS').slice(0, 8),
    [tasks]
  )

  const pendingCount = useMemo(() =>
    tasks.filter(t => t.status === 'PENDING' || t.status === 'IN_PROGRESS').length,
    [tasks]
  )

  const completionRate = data ? Math.round((data.completedTasks / Math.max(data.totalTasks, 1)) * 100) : 0

  const statusPieData = data ? [
    { name: 'Completed', value: Number(data.completedTasks), color: CHART_COLORS.green },
    { name: 'In Progress', value: Number(data.pendingTasks), color: CHART_COLORS.blue },
    { name: 'Overdue', value: Number(data.overdueTasks), color: CHART_COLORS.red },
  ].filter(d => d.value > 0) : []

  const categoryBarData = data?.categoryBreakdown?.map(c => ({
    name: c.name.length > 10 ? c.name.slice(0, 10) + '…' : c.name,
    count: c.count,
    color: c.color || CHART_COLORS.orange,
  })) || []

  const weeklyAreaData = data?.weeklyActivity?.map(d => ({
    day: d.day,
    created: d.created,
    completed: d.completed,
  })) || []

  const priorityData = data?.priorityBreakdown?.map(p => ({
    name: p.priority,
    value: p.count,
    color: p.color || CHART_COLORS.orange,
    fill: p.color || CHART_COLORS.orange,
  })) || []

  if (loading) return <DashboardSkeleton />

  if (!data) {
    return (
      <div className="flex items-center justify-center h-80">
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-white/40 text-sm">Could not load dashboard data.</p>
          <p className="text-white/25 text-xs">Make sure the backend server is running on port 8080.</p>
          <button onClick={() => window.location.reload()} className="px-4 py-2 rounded-lg bg-[#F97316]/10 border border-[#F97316]/20 text-[#F97316] text-xs font-medium hover:bg-[#F97316]/20 transition-colors">Retry</button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* ═══════════════ HERO HEADER ═══════════════ */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#111114] via-[#0f0f12] to-[#0d0d10]">
        {/* Gradient mesh background */}
        <div className="absolute inset-0">
          <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-[#F97316]/[0.07] blur-[100px]" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-purple-500/[0.05] blur-[80px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] rounded-full bg-[#F97316]/[0.02] blur-[120px]" />
        </div>

        {/* Weather effects */}
        {weather && <WeatherEffects condition={weather.condition} />}

        {/* Dot grid */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.015]" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(249,115,22,0.4) 0.5px, transparent 0)',
          backgroundSize: '24px 24px'
        }} />

        {/* Top gradient line */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#F97316]/30 to-transparent" />

        <div className="relative z-10 p-6 lg:p-7">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${greeting.color}15` }}>
                  <greeting.icon size={18} style={{ color: greeting.color, filter: `drop-shadow(0 0 6px ${greeting.color}40)` }} />
                </div>
                <h1 className="font-heading font-extrabold text-[1.5rem] lg:text-[1.85rem] text-white tracking-tight leading-none">
                  {greeting.text}
                </h1>
                {weather && (
                  <div className="flex items-center gap-1.5 ml-2 px-2.5 py-1 rounded-lg border border-white/[0.06] bg-white/[0.02]">
                    <Thermometer size={11} className="text-white/30" />
                    <span className="text-[12px] font-bold text-white/50">{weather.temp}°C</span>
                    <span className="text-[11px] text-white/30 font-medium">{weather.condition}</span>
                    <div className="flex items-center gap-0.5 ml-1">
                      <MapPin size={8} className="text-white/20" />
                      <span className="text-[10px] text-white/25 font-medium">{weather.city}</span>
                    </div>
                  </div>
                )}
              </div>
              <p className="text-white/30 text-[13px] lg:text-sm">
                Welcome back, <span className="text-white/60 font-semibold">{user?.name?.split(' ')[0]}</span>.
                {weather ? (
                  <> It's <span className="text-white/50 font-semibold">{weather.temp}°C</span> with <span className="text-white/50 font-semibold">{weather.condition}</span> in <span className="text-white/50 font-semibold">{weather.city}</span>.</>
                ) : (
                  <> Here's your productivity overview.</>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              {data.streakDays > 0 && (
                <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500/15 to-orange-500/10 border border-amber-500/20 shadow-lg shadow-amber-500/5">
                  <Flame size={14} className="text-amber-400" />
                  <span className="text-[11px] font-bold text-amber-300">{data.streakDays} day streak</span>
                </div>
              )}
              <button
                onClick={() => navigate('/tasks')}
                className="flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-[12px] font-medium text-white/40 hover:bg-white/[0.08] hover:text-white/60 hover:border-white/[0.12] transition-all duration-200"
              >
                View all
                <ChevronRight size={12} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════ CHARTS ROW 1 ═══════════════ */}
      <div className="grid lg:grid-cols-3 gap-4 items-start">
        {/* Weekly Activity Area Chart */}
        <div className="lg:col-span-2 relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#111114] to-[#0d0d10]">
          <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-[#F97316]/[0.04] blur-[60px] pointer-events-none" />
          <div className="relative z-10 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#F97316]/10 flex items-center justify-center">
                  <Activity size={13} className="text-[#F97316]" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-[13px] text-white/60">Weekly Activity</h3>
                  <p className="text-[10px] text-white/25 font-medium">Tasks created vs completed</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-[10px]">
                <span className="flex items-center gap-1.5 text-white/30">
                  <span className="w-2.5 h-1 rounded-full bg-[#F97316]" /> Created
                </span>
                <span className="flex items-center gap-1.5 text-white/30">
                  <span className="w-2.5 h-1 rounded-full bg-[#10B981]" /> Done
                </span>
              </div>
            </div>
            <div className="h-[200px] lg:h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyAreaData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradCreated" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={CHART_COLORS.orange} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={CHART_COLORS.orange} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradCompleted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={CHART_COLORS.green} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={CHART_COLORS.green} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.25)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.25)' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="created" stroke={CHART_COLORS.orange} strokeWidth={2} fill="url(#gradCreated)" name="Created" />
                  <Area type="monotone" dataKey="completed" stroke={CHART_COLORS.green} strokeWidth={2} fill="url(#gradCompleted)" name="Done" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Status Position */}
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#111114] to-[#0d0d10]">
          <div className="relative z-10 p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#F97316]/20 to-[#EA580C]/10 flex items-center justify-center">
                <Gauge size={13} className="text-[#F97316]" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-[12px] text-white/60">Status Position</h3>
                <p className="text-[9px] text-white/25 font-medium">Your progress snapshot</p>
              </div>
            </div>

            <div className="space-y-2.5">
              {/* Big Progress Number */}
              <div className="flex items-center gap-3">
                <div className="relative w-14 h-14 shrink-0">
                  <svg width="56" height="56" className="-rotate-90">
                    <circle fill="none" stroke="rgba(255,255,255,0.04)" cx="28" cy="28" r="23" strokeWidth="4" />
                    <circle fill="none" stroke="#F97316" strokeLinecap="round" cx="28" cy="28" r="23" strokeWidth="4" strokeDasharray={144.5} strokeDashoffset={144.5 - (completionRate / 100) * 144.5} style={{ transition: 'stroke-dashoffset 1s ease-out', filter: 'drop-shadow(0 0 6px #F9731640)' }} />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[12px] font-heading font-extrabold text-[#F97316]">{completionRate}%</span>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-[11px] font-bold text-white/60">
                    {completionRate >= 80 ? '🔥 On Fire!' : completionRate >= 50 ? '💪 Strong Progress' : completionRate >= 25 ? '📈 Growing' : '🌱 Just Started'}
                  </p>
                  <p className="text-[9px] text-white/30">
                    {data.completedTasks} of {data.totalTasks} tasks completed
                  </p>
                </div>
              </div>

              {/* Task Status Grid */}
              <div className="grid grid-cols-3 gap-1">
                <div className="p-1.5 rounded-lg bg-emerald-500/[0.06] border border-emerald-500/10 text-center">
                  <CheckCircle2 size={10} className="text-emerald-400/60 mx-auto mb-0.5" />
                  <p className="text-[12px] font-heading font-bold text-emerald-400">{data.completedTasks}</p>
                  <p className="text-[7px] text-white/20 font-medium uppercase">Done</p>
                </div>
                <div className="p-1.5 rounded-lg bg-blue-500/[0.06] border border-blue-500/10 text-center">
                  <Clock size={10} className="text-blue-400/60 mx-auto mb-0.5" />
                  <p className="text-[12px] font-heading font-bold text-blue-400">{data.pendingTasks}</p>
                  <p className="text-[7px] text-white/20 font-medium uppercase">Active</p>
                </div>
                <div className="p-1.5 rounded-lg bg-red-500/[0.06] border border-red-500/10 text-center">
                  <AlertCircle size={10} className="text-red-400/60 mx-auto mb-0.5" />
                  <p className="text-[12px] font-heading font-bold text-red-400">{data.overdueTasks}</p>
                  <p className="text-[7px] text-white/20 font-medium uppercase">Overdue</p>
                </div>
              </div>

              {/* Streak + Weekly */}
              <div className="flex gap-1.5">
                {data.streakDays > 0 && (
                  <div className="flex-1 p-2 rounded-lg bg-amber-500/[0.06] border border-amber-500/10 flex items-center gap-1.5">
                    <Flame size={12} className="text-amber-400" />
                    <div>
                      <p className="text-[10px] font-bold text-amber-400">{data.streakDays} day streak</p>
                      <p className="text-[7px] text-white/20">Keep it up!</p>
                    </div>
                  </div>
                )}
                <div className="flex-1 p-2 rounded-lg bg-white/[0.02] border border-white/[0.04] flex items-center gap-1.5">
                  <Target size={12} className="text-purple-400" />
                  <div>
                    <p className="text-[10px] font-bold text-white/50">{Math.round(data.weeklyProgress.completionRate)}% weekly</p>
                    <p className="text-[7px] text-white/20">{data.weeklyProgress.completed}/{data.weeklyProgress.total} this week</p>
                  </div>
                </div>
              </div>

            </div>

            <button
              onClick={() => navigate('/ai')}
              className="w-full mt-2 flex items-center justify-center gap-1.5 h-8 rounded-xl bg-gradient-to-r from-[#F97316] to-[#EA580C] text-[10px] font-bold text-white shadow-lg shadow-[#F97316]/15 hover:shadow-xl hover:shadow-[#F97316]/25 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              <Brain size={11} />
              Open AI Chat
            </button>
          </div>
        </div>
      </div>

      {/* ═══════════════ MOTIVATIONAL CARD ═══════════════ */}
      <MotivationalCard />

      {/* ═══════════════ CHARTS ROW 2 ═══════════════ */}
      <div className="grid lg:grid-cols-3 gap-4 items-start">
        {/* Category Bar Chart */}
        <div className="lg:col-span-2 relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#111114] to-[#0d0d10]">
          <div className="relative z-10 p-5 lg:p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                  <Layers size={15} className="text-cyan-400" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-[13px] text-white/60">Categories</h3>
                  <p className="text-[10px] text-white/25 font-medium">Tasks per category</p>
                </div>
              </div>
            </div>
            {categoryBarData.length > 0 ? (
              <div className="h-[200px] lg:h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryBarData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.25)' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.25)' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" name="Tasks" radius={[6, 6, 0, 0]} maxBarSize={40}>
                      {categoryBarData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} fillOpacity={0.8} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[200px]">
                <Layers size={32} className="text-white/8 mb-3" />
                <p className="text-[13px] text-white/25 mb-3">No categories yet</p>
                <button onClick={() => navigate('/categories')} className="text-[12px] text-[#F97316]/60 hover:text-[#F97316] font-semibold transition-colors">Create one</button>
              </div>
            )}
          </div>
        </div>

        {/* Task Status Pie Chart (moved from Charts Row 1) */}
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#111114] to-[#0d0d10]">
          <div className="absolute -bottom-16 -right-16 w-32 h-32 rounded-full bg-purple-500/[0.04] blur-[50px] pointer-events-none" />
          <div className="relative z-10 p-5">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <CircleDot size={15} className="text-purple-400" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-[13px] text-white/60">Status</h3>
                <p className="text-[10px] text-white/25 font-medium">Task distribution</p>
              </div>
            </div>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {statusPieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-2">
              {statusPieData.map(d => (
                <div key={d.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                    <span className="text-[12px] text-white/40 font-medium">{d.name}</span>
                  </div>
                  <span className="text-[13px] font-heading font-bold" style={{ color: d.color }}>{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════ CHARTS ROW 3 ═══════════════ */}
      <div className="grid lg:grid-cols-3 gap-4 items-start">
        {/* Completion Progress Ring */}
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#111114] to-[#0d0d10]">
          <div className="relative z-10 p-5">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <Target size={15} className="text-emerald-400" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-[13px] text-white/60">Progress</h3>
                <p className="text-[10px] text-white/25 font-medium">Completion rates</p>
              </div>
            </div>
            <div className="flex items-center justify-around py-2">
              <ProgressRing value={data.weeklyProgress.completionRate} label="Weekly" size={95} strokeWidth={6} color={CHART_COLORS.orange} />
              <ProgressRing value={data.monthlyProgress.completionRate} label="Monthly" size={95} strokeWidth={6} color={CHART_COLORS.purple} />
            </div>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <div className="text-center p-3 rounded-xl bg-white/[0.02] border border-white/[0.03]">
                <p className="text-[17px] font-heading font-extrabold text-white/70">{data.weeklyProgress.completed}/{data.weeklyProgress.total}</p>
                <p className="text-[9px] text-white/20 font-semibold uppercase tracking-wider mt-1">This Week</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-white/[0.02] border border-white/[0.03]">
                <p className="text-[17px] font-heading font-extrabold text-white/70">{data.monthlyProgress.completed}/{data.monthlyProgress.total}</p>
                <p className="text-[9px] text-white/20 font-semibold uppercase tracking-wider mt-1">This Month</p>
              </div>
            </div>
          </div>
        </div>

        {/* Priority Breakdown - Radial Chart */}
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#111114] to-[#0d0d10]">
          <div className="relative z-10 p-5">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-9 h-9 rounded-xl bg-orange-500/10 flex items-center justify-center">
                <Gauge size={15} className="text-orange-400" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-[13px] text-white/60">Priority</h3>
                <p className="text-[10px] text-white/25 font-medium">Task distribution</p>
              </div>
            </div>
            {priorityData.length > 0 ? (
              <div className="space-y-3.5">
                {data.priorityBreakdown.map((p) => (
                  <div key={p.priority}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ background: p.color, boxShadow: `0 0 8px ${p.color}40` }} />
                        <span className="text-[12px] font-semibold text-white/50">{p.priority}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[14px] font-heading font-bold" style={{ color: p.color }}>{p.count}</span>
                        <span className="text-[10px] text-white/20 font-medium">{Math.round(p.percentage)}%</span>
                      </div>
                    </div>
                    <div className="h-2 bg-white/[0.04] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000 ease-out"
                        style={{
                          width: `${p.percentage}%`,
                          background: `linear-gradient(90deg, ${p.color}, ${p.color}88)`,
                          boxShadow: `0 0 12px ${p.color}30`
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-28 text-[12px] text-white/15">No active tasks</div>
            )}
          </div>
        </div>

        {/* Quick AI Actions */}
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#111114] to-[#0d0d10]">
          <div className="absolute -bottom-16 -left-16 w-32 h-32 rounded-full bg-[#F97316]/[0.04] blur-[50px] pointer-events-none" />
          <div className="relative z-10 p-5">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#F97316]/20 to-[#EA580C]/10 flex items-center justify-center">
                <Zap size={15} className="text-[#F97316]" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-[13px] text-white/60">Quick Actions</h3>
                <p className="text-[10px] text-white/25 font-medium">AI-powered shortcuts</p>
              </div>
            </div>

            <div className="space-y-2">
              <QuickAction icon={Plus} label="Create a task" hint="Tell AI what to do" onClick={() => navigate('/ai', { state: { preset: 'Create a new task' } })} />
              <QuickAction icon={BarChart3} label="Analyze productivity" hint="Get insights" onClick={() => navigate('/ai', { state: { preset: 'Analyze my productivity' } })} />
              <QuickAction icon={ListTodo} label="List my tasks" hint="See everything" onClick={() => navigate('/ai', { state: { preset: 'Show me all my tasks' } })} />
              <QuickAction icon={CheckCircle2} label="Complete a task" hint="Mark as done" onClick={() => navigate('/ai', { state: { preset: 'Mark a task as complete' } })} />
              <QuickAction icon={Hash} label="Manage categories" hint="Organize tasks" onClick={() => navigate('/categories')} />
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════ ACTIVE TASKS ═══════════════ */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#111114] to-[#0d0d10]">
        <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-[#F97316]/[0.03] blur-[50px] pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center justify-between p-5 pb-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#F97316]/10 flex items-center justify-center">
                <Zap size={15} className="text-[#F97316]" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-[13px] text-white/60">Active Tasks</h3>
                <p className="text-[10px] text-white/25 font-medium">Recent activity</p>
              </div>
            </div>
            {pendingCount > 0 && (
              <span className="text-[10px] text-white/25 font-bold bg-white/[0.04] px-2.5 py-1 rounded-full border border-white/[0.06]">
                {pendingCount} pending
              </span>
            )}
          </div>
          <div className="p-3">
            {recentTasks.length > 0 ? (
              <div className="space-y-1">
                {recentTasks.map((t) => (
                  <div
                    key={t.id}
                    className="group/task flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.03] transition-all duration-200 cursor-pointer border border-transparent hover:border-white/[0.04]"
                    onClick={() => navigate(`/tasks/${t.id}`)}
                  >
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{
                        background: t.priority === 'URGENT' ? CHART_COLORS.red : t.priority === 'HIGH' ? CHART_COLORS.orange : t.priority === 'MEDIUM' ? CHART_COLORS.blue : 'rgba(255,255,255,0.15)',
                        boxShadow: t.priority === 'URGENT' ? `0 0 8px ${CHART_COLORS.red}60` : t.priority === 'HIGH' ? `0 0 8px ${CHART_COLORS.orange}60` : 'none'
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-[13px] text-white/55 font-medium truncate block group-hover/task:text-white/80 transition-colors">
                        {t.title}
                      </span>
                      {t.categoryName && (
                        <span className="text-[10px] text-white/20 font-medium mt-0.5 block">{t.categoryName}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {t.estimatedTime && (
                        <span className="flex items-center gap-1 text-[10px] text-white/15">
                          <Timer size={9} />
                          {t.estimatedTime}m
                        </span>
                      )}
                      <span
                        className="text-[9px] font-bold px-2 py-0.5 rounded-md"
                        style={{
                          background: t.priority === 'URGENT' ? `${CHART_COLORS.red}15` : t.priority === 'HIGH' ? `${CHART_COLORS.orange}15` : t.priority === 'MEDIUM' ? `${CHART_COLORS.blue}15` : 'rgba(255,255,255,0.04)',
                          color: t.priority === 'URGENT' ? CHART_COLORS.red : t.priority === 'HIGH' ? CHART_COLORS.orange : t.priority === 'MEDIUM' ? CHART_COLORS.blue : 'rgba(255,255,255,0.25)'
                        }}
                      >
                        {t.priority}
                      </span>
                    </div>
                    <ChevronRight size={12} className="text-white/8 opacity-0 group-hover/task:opacity-100 transition-opacity shrink-0" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-14">
                <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.04] flex items-center justify-center mb-4">
                  <ListTodo size={26} className="text-white/10" />
                </div>
                <p className="text-[13px] font-medium text-white/30 mb-1">No active tasks</p>
                <button onClick={() => navigate('/ai')} className="mt-2 flex items-center gap-1 text-[12px] text-[#F97316]/50 hover:text-[#F97316] font-medium transition-colors">
                  <Plus size={11} /> Ask AI to create one
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════ SUB-COMPONENTS ═══════════════ */

function ProgressRing({ value, label, size = 80, strokeWidth = 6, color = '#F97316' }) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (Math.min(value, 100) / 100) * circumference

  return (
    <div className="flex flex-col items-center gap-2.5">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle fill="none" stroke="rgba(255,255,255,0.04)" cx={size / 2} cy={size / 2} r={radius} strokeWidth={strokeWidth} />
          <circle
            fill="none"
            stroke={color}
            strokeLinecap="round"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)', filter: `drop-shadow(0 0 6px ${color}40)` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[15px] font-heading font-extrabold" style={{ color }}>{Math.round(value)}%</span>
        </div>
      </div>
      <span className="text-[10px] font-semibold text-white/25 uppercase tracking-wider">{label}</span>
    </div>
  )
}

function MotivationalCard() {
  const BATMAN_GIF = "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/3848d39f-cd35-4797-8ec4-2cafb9dac87f/dfkdy7u-1202eb04-4d6d-4f18-92ea-a5ee13724475.gif?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiIvZi8zODQ4ZDM5Zi1jZDM1LTQ3OTctOGVjNC0yY2FmYjlkYWM4N2YvZGZrZHk3dS0xMjAyZWIwNC00ZDZkLTRmMTgtOTJlYS1hNWVlMTM3MjQ0NzUuZ2lmIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.B5oW1OVayRPz8-UmBeWyzKh08UTAQCgE77AIP9E--hI"

  const quotes = [
    { quote: "Nobody cares. Work harder.", subtext: "Nobody is coming to save you. Your life is your responsibility." },
    { quote: "They laugh at me because I'm different. I laugh at them because they're all the same.", subtext: "Stop fitting in. Start standing out. Your path is yours alone." },
    { quote: "You're not tired. You're uninspired.", subtext: "Find your fire. Nobody will burn for you." },
    { quote: "While you're wasting time, someone else is grinding.", subtext: "The world doesn't wait for anyone. Move or be moved." },
    { quote: "Your comfort zone is a beautiful place, but nothing grows there.", subtext: "Growth begins where comfort ends. Embrace the pain." },
    { quote: "Pain is temporary. Quitting lasts forever.", subtext: "Suffer now or suffer later. The choice is yours." },
    { quote: "You didn't come this far to only come this far.", subtext: "The finish line is closer than you think. Don't stop now." },
    { quote: "The only person you're competing with is yesterday's version of yourself.", subtext: "Be better than you were. That's the only race that matters." },
  ]

  const [current] = useState(() => Math.floor(Math.random() * quotes.length))
  const m = quotes[current]

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#111114] to-[#0d0d10]">
      <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-[#F97316]/[0.04] blur-[60px] pointer-events-none" />
      <div className="relative z-10 p-4">
        <div className="grid md:grid-cols-2 gap-4 items-center">
          <div className="relative w-full h-44 rounded-xl overflow-hidden">
            <img
              src={BATMAN_GIF}
              alt=""
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#111114] via-transparent to-transparent opacity-60" />
          </div>
          <div className="text-center md:text-left">
            <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
              <div className="w-6 h-px bg-[#F97316]/40" />
              <span className="text-[9px] font-bold text-[#F97316]/60 uppercase tracking-widest">Daily Fuel</span>
              <div className="w-6 h-px bg-[#F97316]/40" />
            </div>
            <p className="text-[18px] font-heading font-extrabold text-white/80 leading-snug mb-2 italic">
              "{m.quote}"
            </p>
            <p className="text-[12px] text-white/35 leading-relaxed">{m.subtext}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function QuickAction({ icon: Icon, label, hint, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] hover:border-white/[0.08] transition-all duration-200 group/qa text-left"
    >
      <div className="w-9 h-9 rounded-xl bg-white/[0.04] flex items-center justify-center group-hover/qa:bg-[#F97316]/10 transition-all duration-200 shrink-0">
        <Icon size={14} className="text-white/30 group-hover/qa:text-[#F97316] transition-colors" />
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-[12px] font-semibold text-white/50 group-hover/qa:text-white/75 transition-colors block">{label}</span>
        <span className="text-[10px] text-white/18 font-medium">{hint}</span>
      </div>
      <ArrowRight size={11} className="text-white/10 group-hover/qa:text-[#F97316]/70 transition-all group-hover/qa:translate-x-0.5 shrink-0" />
    </button>
  )
}
