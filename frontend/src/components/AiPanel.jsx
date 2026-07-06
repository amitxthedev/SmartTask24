import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Sparkles, Send, Plus, ListTodo, BarChart3, CheckCircle2,
  Trash2, ChevronRight, MessageSquare, Zap,
  Lightbulb, TrendingUp, Calendar,
  Sun, Cloud, CloudRain, CloudSnow, CloudLightning, CloudFog,
  CloudDrizzle, CloudSun, Moon, Thermometer, MapPin, Activity,
  FileText, Tag, FolderOpen, Clock, AlertTriangle, Flame,
  ArrowRight, Star, Target, Brain
} from 'lucide-react'
import { aiChat, getConversations, clearConversations } from '../api/ai'
import { getTasks } from '../api/tasks'
import WeatherEffects from './WeatherEffects'

export default function AiPanel({ collapsed, onToggle, overlay }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [tasks, setTasks] = useState([])
  const bottomRef = useRef(null)
  const inputRef = useRef(null)
  const navigate = useNavigate()

  const loadTasks = useCallback(() => {
    getTasks().then(r => setTasks(r.data.data)).catch(() => {})
  }, [])

  useEffect(() => {
    loadTasks()
    getConversations().then(r => {
      const convos = r.data.data
      if (convos.length > 0) {
        const msgs = convos.slice(-10).flatMap(c => [
          { role: 'user', text: c.prompt, id: c.id + '-u' },
          { role: 'assistant', text: c.response, id: c.id + '-a' },
        ])
        setMessages(msgs)
      }
    }).catch(console.error)
  }, [loadTasks])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const handleSend = async (text) => {
    const prompt = (text || input).trim()
    if (!prompt || sending) return
    const userMsg = { role: 'user', text: prompt, id: Date.now() + '-u' }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setSending(true)
    try {
      const res = await aiChat(prompt)
      const aiMsg = { role: 'assistant', text: res.data.data.response, id: Date.now() + '-a' }
      setMessages(prev => [...prev, aiMsg])
      const lower = prompt.toLowerCase()
      if (/\b(create|add|make|new|delete|remove|complete|done|finish|mark)\b/.test(lower)) {
        loadTasks()
      }
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: 'Sorry, I had trouble processing that. Please try again.',
        id: Date.now() + '-e'
      }])
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  const quickActions = [
    { icon: Plus, label: 'Create task', prompt: 'Create a new task', color: '#F97316' },
    { icon: ListTodo, label: 'List tasks', prompt: 'Show me all my tasks', color: '#3B82F6' },
    { icon: BarChart3, label: 'Analyze', prompt: 'Analyze my productivity', color: '#8B5CF6' },
    { icon: CheckCircle2, label: 'Complete', prompt: 'Mark a task as complete', color: '#10B981' },
  ]

  const smartSuggestions = [
    { icon: Calendar, label: 'Plan my day', prompt: 'Plan my day' },
    { icon: TrendingUp, label: 'How am I doing?', prompt: 'What should I focus on today based on my tasks?' },
    { icon: Zap, label: 'Create 2 tasks', prompt: 'Create 2 tasks: one for morning workout and one for evening study' },
    { icon: Lightbulb, label: 'Suggest tasks', prompt: 'Suggest tasks based on my current tasks' },
    { icon: Brain, label: 'Suggest categories', prompt: 'Suggest categories for my tasks' },
    { icon: Tag, label: 'Create 5 tags', prompt: 'Create 5 useful tags' },
  ]

  if (collapsed) {
    return (
      <button onClick={onToggle} className="fixed right-0 top-1/2 -translate-y-1/2 z-30 flex items-center justify-center w-10 h-20 rounded-l-xl bg-[#111114] border border-white/[0.06] border-r-0 text-white/30 hover:text-[#F97316] hover:bg-[#1a1a1e] transition-all duration-200 shadow-lg">
        <MessageSquare size={16} />
      </button>
    )
  }

  return (
    <>
      {overlay && <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={onToggle} />}
      <div className={`${overlay ? 'fixed right-0 top-0 bottom-0 z-50 shadow-2xl animate-slide-left' : ''} w-[340px] xl:w-[380px] h-full flex flex-col bg-[#0d0d10] border-l border-white/[0.04] shrink-0 overflow-hidden`}>
      {/* Header */}
      <div className="relative shrink-0 border-b border-white/[0.04]">
        <div className="absolute inset-0 bg-gradient-to-b from-[#F97316]/[0.03] to-transparent pointer-events-none" />
        <div className="relative z-10 flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="SmartTask24" className="w-8 h-8 rounded-xl shadow-md shadow-[#F97316]/20 object-cover" />
            <div>
              <h3 className="font-heading font-bold text-[12px] text-white/60">SmartTask24 AI</h3>
              <div className="flex items-center gap-1.5">
                <img src="/logo.png" alt="SmartTask24" className="w-3.5 h-3.5 rounded-sm" />
                <span className="text-[8px] font-semibold text-white/25">Powered by SmartTask24</span>
              </div>
            </div>
          </div>
            <div className="flex items-center gap-1">
              {overlay && (
                <button onClick={onToggle} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-white/30 hover:text-white/60 transition-colors mr-1">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              )}
              <button onClick={() => { clearConversations().catch(() => {}); setMessages([]) }} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-white/[0.06] text-white/30 hover:text-white/60 transition-colors text-[11px] font-medium">
                <Trash2 size={12} />
                Clear
              </button>
              <button onClick={onToggle} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-white/20 hover:text-white/40 transition-colors" title="Collapse">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
        </div>
        {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-6">
            <div className="relative mb-4">
              <div className="absolute inset-0 w-16 h-16 rounded-full bg-[#8B5CF6]/10 blur-[20px] animate-pulse-soft" />
              <div className="w-14 h-14 rounded-2xl bg-[#111114] border border-white/[0.06] flex items-center justify-center relative shadow-lg overflow-hidden">
                <img src="/logo.png" alt="SmartTask24" className="w-10 h-10" />
              </div>
            </div>
            <p className="font-heading font-bold text-white/50 text-[13px] mb-1">Ask me anything</p>
            <p className="text-[11px] text-white/25 text-center max-w-[220px] leading-relaxed mb-5">
              I understand natural language. Try asking me to create tasks, plan your day, or just chat.
            </p>
            <div className="w-full space-y-1.5 mb-4">
              {quickActions.map((a) => (
                <button key={a.label} onClick={() => handleSend(a.prompt)} className="w-full flex items-center gap-2.5 p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] hover:border-white/[0.08] transition-all duration-200 text-left group">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${a.color}10` }}>
                    <a.icon size={12} style={{ color: a.color }} className="opacity-60 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <span className="text-[11px] font-medium text-white/40 group-hover:text-white/60 transition-colors">{a.label}</span>
                </button>
              ))}
            </div>
            <div className="w-full">
              <p className="text-[9px] font-bold text-white/20 uppercase tracking-wider mb-2 px-1">Smart Suggestions</p>
              <div className="space-y-1.5">
                {smartSuggestions.map((s) => (
                  <button key={s.label} onClick={() => handleSend(s.prompt)} className="w-full flex items-center gap-2 p-2 rounded-lg bg-[#F97316]/[0.03] border border-[#F97316]/[0.06] hover:bg-[#F97316]/[0.06] transition-all duration-200 text-left group">
                    <s.icon size={10} className="text-[#F97316]/50 group-hover:text-[#F97316]/80 shrink-0" />
                    <span className="text-[10px] text-white/30 group-hover:text-white/50 transition-colors">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          messages.map(m => <ChatBubble key={m.id} message={m} />)
        )}

        {sending && (
          <div className="flex gap-2.5 animate-fade-in">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-[#111114] border border-white/[0.06] shadow-md shadow-[#8B5CF6]/10">
              <img src="/logo.png" alt="SmartTask24" className="w-5 h-5 animate-pulse" />
            </div>
            <div className="bg-white/[0.025] border border-white/[0.05] rounded-xl rounded-bl-md px-3.5 py-2.5">
              <div className="flex gap-1 items-center">
                <div className="w-1 h-1 bg-[#8B5CF6] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1 h-1 bg-[#8B5CF6] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1 h-1 bg-[#8B5CF6] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                <span className="text-[9px] text-white/15 ml-1">Thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 px-3 pb-3">
        <div className="relative rounded-xl border border-white/[0.06] bg-[#111114] focus-within:border-[#F97316]/30 transition-all duration-200">
          <div className="flex items-end gap-1.5 p-1.5">
            <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder="Ask AI anything..." rows={1} className="flex-1 bg-transparent px-2.5 py-2 resize-none min-h-[36px] max-h-[100px] leading-relaxed text-[12px] text-white placeholder-white/20 outline-none" style={{ height: 'auto' }}
              onInput={e => { e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px' }} />
            <button onClick={() => handleSend()} disabled={!input.trim() || sending} className="flex items-center justify-center h-8 w-8 rounded-lg bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white shrink-0 disabled:opacity-30 shadow-md shadow-[#F97316]/15 hover:shadow-lg hover:shadow-[#F97316]/25 transition-all duration-200">
              <Send size={12} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}

// ─── ChatBubble ────────────────────────────────────────────────────

function getWeatherIcon(condition) {
  if (!condition) return CloudSun
  const c = condition.toLowerCase()
  if (c.includes('sunny') || c.includes('clear')) return Sun
  if (c.includes('partly')) return CloudSun
  if (c.includes('cloud') || c.includes('overcast')) return Cloud
  if (c.includes('thunder') || c.includes('storm')) return CloudLightning
  if (c.includes('drizzle')) return CloudDrizzle
  if (c.includes('rain') || c.includes('shower')) return CloudRain
  if (c.includes('snow')) return CloudSnow
  if (c.includes('fog') || c.includes('mist') || c.includes('haze')) return CloudFog
  return Cloud
}

function getWeatherIconColor(condition) {
  if (!condition) return '#F59E0B'
  const c = condition.toLowerCase()
  if (c.includes('sunny') || c.includes('clear')) return '#F59E0B'
  if (c.includes('cloud') || c.includes('overcast')) return '#94A3B8'
  if (c.includes('thunder') || c.includes('storm')) return '#8B5CF6'
  if (c.includes('rain') || c.includes('drizzle')) return '#3B82F6'
  if (c.includes('snow')) return '#E2E8F0'
  if (c.includes('fog') || c.includes('mist')) return '#64748B'
  return '#F59E0B'
}

function parseGreeting(text) {
  const lines = text.split('\n')
  const firstLine = lines[0] || ''
  const greetingMatch = firstLine.match(/^(?:🌤️|☀️|☁️|🌧️|⛈️|🌨️|🌫️)?\s*(Good\s+(morning|afternoon|evening))/i)
  if (!greetingMatch) return null
  const weatherLine = lines.find(l => l.includes('°C'))
  if (!weatherLine) return null
  const weatherMatch = weatherLine.match(/It's\s+(\d+)°C\s+with\s+(.+?)\s+in\s+(.+?)\.?$/i)
  if (!weatherMatch) return null
  return { timeOfDay: greetingMatch[2], temp: weatherMatch[1], condition: weatherMatch[2], city: weatherMatch[3] }
}

// ─── Rich Structured Renderer ─────────────────────────────────────

function RichResponse({ text, navigate }) {
  const lines = text.split('\n')
  const elements = []

  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    const trimmed = line.trim()

    // Skip empty lines
    if (!trimmed) { elements.push(<div key={i} className="h-1" />); i++; continue }

    // Section headers: ## or ###
    if (trimmed.startsWith('## ')) {
      elements.push(<h3 key={i} className="text-[12px] font-heading font-bold text-white/70 mt-3 mb-1.5 flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-[#F97316]" />{trimmed.replace(/^##\s*/, '')}</h3>)
      i++; continue
    }
    if (trimmed.startsWith('### ')) {
      elements.push(<h4 key={i} className="text-[11px] font-heading font-semibold text-white/55 mt-2 mb-1">{trimmed.replace(/^###\s*/, '')}</h4>)
      i++; continue
    }

    // Horizontal rule
    if (trimmed === '---') {
      elements.push(<div key={i} className="border-t border-white/[0.05] my-2" />)
      i++; continue
    }

    // Note created card: "Title: xxx"
    if (/^Title:\s*.+/i.test(trimmed)) {
      const titleMatch = trimmed.match(/^Title:\s*(.+)/i)
      if (titleMatch) {
        elements.push(
          <div key={i} className="rounded-xl bg-cyan-500/[0.05] border border-cyan-500/[0.1] p-2.5 my-1 cursor-pointer hover:bg-cyan-500/[0.08] transition-colors" onClick={() => navigate('/notes')}>
            <div className="flex items-center gap-2 mb-1">
              <FileText size={10} className="text-cyan-400" />
              <span className="text-[8px] font-bold text-cyan-400 uppercase tracking-wider">Note Created</span>
            </div>
            <p className="text-[12px] font-heading font-bold text-cyan-300/70">{titleMatch[1]}</p>
            <span className="text-[9px] text-cyan-400/30 mt-1 inline-flex items-center gap-1">Click to open <ArrowRight size={7} /></span>
          </div>
        )
        i++; continue
      }
    }

    // Content line after note title — skip (handled in title card)
    if (/^Content:\s*.+/i.test(trimmed)) { i++; continue }

    // Deleted note: "Deleted note: xxx"
    if (/^Deleted note:/i.test(trimmed)) {
      const name = trimmed.replace(/^Deleted note:\s*/i, '')
      elements.push(
        <div key={i} className="flex items-center gap-2 p-2.5 rounded-xl bg-red-500/[0.05] border border-red-500/[0.1] my-1">
          <div className="w-6 h-6 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
            <Trash2 size={10} className="text-red-400" />
          </div>
          <div>
            <span className="text-[8px] font-bold text-red-400 uppercase tracking-wider block">Note Deleted</span>
            <span className="text-[11px] text-red-300/60">{name}</span>
          </div>
        </div>
      )
      i++; continue
    }

    // Task created: "Title: xxx" with Priority line below
    if (/^Title:\s*.+/i.test(trimmed) && i + 1 < lines.length && /Priority:/i.test(lines[i + 1])) {
      const titleMatch = trimmed.match(/^Title:\s*(.+)/i)
      const pMatch = lines[i + 1].match(/Priority:\s*(\w+)/i)
      if (titleMatch) {
        const p = pMatch?.[1] || 'MEDIUM'
        const pColor = p === 'URGENT' ? '#EF4444' : p === 'HIGH' ? '#F97316' : p === 'MEDIUM' ? '#3B82F6' : '#6B7280'
        elements.push(
          <div key={i} className="rounded-xl bg-emerald-500/[0.05] border border-emerald-500/[0.1] p-2.5 my-1">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Plus size={10} className="text-emerald-400" />
              </div>
              <span className="text-[8px] font-bold text-emerald-400 uppercase tracking-wider">Task Created</span>
              <span className="text-[8px] font-bold px-1.5 py-0.5 rounded ml-auto" style={{ background: `${pColor}15`, color: pColor }}>{p}</span>
            </div>
            <p className="text-[12px] font-heading font-bold text-emerald-300/70 ml-8">{titleMatch[1]}</p>
          </div>
        )
        i += 2; continue
      }
    }

    // Priority line standalone
    if (/^Priority:\s*\w+/i.test(trimmed)) { i++; continue }

    // Task item: "[63] Title (PRIORITY)"
    const taskMatch = trimmed.match(/^\[(\d+)\]\s+(.+?)(?:\s+\((\w+)\))?(?:\s*-\s*(.+))?$/)
    if (taskMatch) {
      const [, id, title, priority, time] = taskMatch
      const pColor = priority === 'URGENT' ? '#EF4444' : priority === 'HIGH' ? '#F97316' : priority === 'MEDIUM' ? '#3B82F6' : '#6B7280'
      elements.push(
        <div key={i} className="flex items-center gap-2 p-1.5 rounded-lg bg-white/[0.02] border border-white/[0.04] my-0.5 hover:bg-white/[0.04] transition-colors cursor-pointer" onClick={() => navigate(`/tasks/${id}`)}>
          <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: pColor, boxShadow: `0 0 6px ${pColor}50` }} />
          <span className="text-[11px] text-white/55 flex-1 truncate">{title}</span>
          {priority && <span className="text-[8px] font-bold px-1.5 py-0.5 rounded" style={{ background: `${pColor}15`, color: pColor }}>{priority}</span>}
          {time && <span className="text-[8px] text-white/20">{time}</span>}
          <ArrowRight size={8} className="text-white/10" />
        </div>
      )
      i++; continue
    }

    // Completed task: "done Title"
    const doneMatch = trimmed.match(/^(?:done|completed|✓)\s+(.+)/i)
    if (doneMatch) {
      elements.push(
        <div key={i} className="flex items-center gap-2 p-1.5 rounded-lg bg-emerald-500/[0.03] border border-emerald-500/[0.06] my-0.5">
          <CheckCircle2 size={10} className="text-emerald-400/60 shrink-0" />
          <span className="text-[11px] text-emerald-300/40 line-through flex-1 truncate">{doneMatch[1]}</span>
        </div>
      )
      i++; continue
    }

    // Note list item: "📝 Title"
    if (/^📝\s/.test(trimmed)) {
      const noteName = trimmed.replace(/^📝\s*/, '')
      elements.push(
        <div key={i} className="flex items-center gap-2 p-1.5 rounded-lg bg-cyan-500/[0.03] border border-cyan-500/[0.06] my-0.5 cursor-pointer hover:bg-cyan-500/[0.06] transition-colors" onClick={() => navigate('/notes')}>
          <FileText size={10} className="text-cyan-400/60 shrink-0" />
          <span className="text-[11px] text-cyan-300/50 flex-1 truncate">{noteName}</span>
          <ArrowRight size={8} className="text-cyan-400/20" />
        </div>
      )
      i++; continue
    }

    // Tag chip: "  - TagName" (indented under "Created X tags:")
    if (/^-\s+\S/.test(trimmed) && i > 0 && /Created \d+ tag/i.test(lines[Math.max(0, i - 1)].trim())) {
      const tagName = trimmed.replace(/^-\s*/, '')
      elements.push(
        <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-[10px] font-medium text-purple-300/60 m-0.5">
          <Tag size={8} />{tagName}
        </span>
      )
      i++; continue
    }

    // Category chip: "📁 Name" or "- Name" under categories
    if (/^📁\s/.test(trimmed)) {
      const catName = trimmed.replace(/^📁\s*/, '')
      elements.push(
        <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-medium text-blue-300/60 m-0.5">
          <FolderOpen size={8} />{catName}
        </span>
      )
      i++; continue
    }

    // Day plan schedule: "10:00 - 11:00: Task"
    const scheduleMatch = trimmed.match(/^(\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)?)\s*[-–—]\s*(\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)?)\s*[:\-]\s*(.+)/)
    if (scheduleMatch) {
      const [, start, end, task] = scheduleMatch
      elements.push(
        <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.02] border border-white/[0.04] my-0.5">
          <div className="flex flex-col items-center shrink-0">
            <span className="text-[9px] font-bold text-[#F97316]">{start}</span>
            <div className="w-[1px] h-2 bg-white/10" />
            <span className="text-[9px] text-white/25">{end}</span>
          </div>
          <div className="w-[2px] h-6 rounded-full bg-[#F97316]/30 shrink-0" />
          <span className="text-[11px] text-white/50">{task}</span>
        </div>
      )
      i++; continue
    }

    // Stats: "Pending: 4"
    const statMatch = trimmed.match(/^(Pending|Completed|Total|In Progress|Overdue|Done|Active):\s*(\d+)/i)
    if (statMatch) {
      const [, label, val] = statMatch
      const c = /complet|done/i.test(label) ? '#10B981' : /overdue/i.test(label) ? '#EF4444' : /progress|active/i.test(label) ? '#3B82F6' : '#F97316'
      elements.push(
        <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-bold my-0.5 mr-1" style={{ borderColor: `${c}20`, background: `${c}08`, color: `${c}CC` }}>
          {label}: {val}
        </span>
      )
      i++; continue
    }

    // Bullet points
    if (/^[-*•]\s/.test(trimmed)) {
      const content = trimmed.replace(/^[-*•]\s*/, '')
      elements.push(
        <div key={i} className="flex items-start gap-1.5 ml-1 my-0.5">
          <span className="w-1 h-1 rounded-full bg-[#F97316]/60 mt-[5px] shrink-0" />
          <span className="text-[11px] text-white/45 leading-relaxed"><FormattedText text={content} /></span>
        </div>
      )
      i++; continue
    }

    // Numbered list
    if (/^\d+[.)]\s/.test(trimmed)) {
      const match = trimmed.match(/^(\d+)[.)]\s*(.+)/)
      if (match) {
        elements.push(
          <div key={i} className="flex items-start gap-2 ml-1 my-0.5">
            <span className="text-[9px] font-bold text-[#F97316]/70 bg-[#F97316]/10 rounded-md px-1.5 py-0.5 mt-0.5 shrink-0">{match[1]}</span>
            <span className="text-[11px] text-white/45 leading-relaxed"><FormattedText text={match[2]} /></span>
          </div>
        )
        i++; continue
      }
    }

    // Regular text
    elements.push(
      <p key={i} className="text-[11px] text-white/45 leading-relaxed my-0.5">
        <FormattedText text={trimmed} />
      </p>
    )
    i++
  }

  return <div className="space-y-0.5">{elements}</div>
}

function FormattedText({ text, navigate }) {
  // Parse inline: **bold**, `code`, [clickable], emoji prefixes
  const parts = []
  let remaining = text

  // Bold
  const boldParts = remaining.split(/\*\*(.+?)\*\*/)
  for (let j = 0; j < boldParts.length; j++) {
    if (j % 2 === 1) {
      parts.push(<strong key={`b${j}`} className="text-white/70 font-semibold">{boldParts[j]}</strong>)
    } else if (boldParts[j]) {
      // Inline code
      const codeParts = boldParts[j].split(/`(.+?)`/)
      for (let k = 0; k < codeParts.length; k++) {
        if (k % 2 === 1) {
          parts.push(<code key={`c${j}-${k}`} className="px-1 py-0.5 rounded bg-white/[0.06] text-[#F97316]/80 text-[10px] font-mono">{codeParts[k]}</code>)
        } else if (codeParts[k]) {
          parts.push(codeParts[k])
        }
      }
    }
  }

  return parts.length > 0 ? parts : text
}

function ChatBubble({ message }) {
  const { role, text } = message
  const isUser = role === 'user'
  const navigate = useNavigate()
  const greeting = !isUser ? parseGreeting(text) : null

  let overviewText = text
  if (greeting) {
    const overviewIdx = text.indexOf("Here's your productivity overview")
    if (overviewIdx >= 0) overviewText = text.substring(overviewIdx).trim()
  }

  const WeatherIcon = greeting ? getWeatherIcon(greeting.condition) : null
  const weatherColor = greeting ? getWeatherIconColor(greeting.condition) : '#F59E0B'

  return (
    <div className={`flex gap-2 ${isUser ? 'justify-end' : ''} animate-slide-up`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 shadow-md shadow-[#8B5CF6]/10 bg-[#111114] border border-white/[0.06]">
          <img src="/logo.png" alt="SmartTask24" className="w-5 h-5" />
        </div>
      )}
      <div className={`max-w-[85%] min-w-0 ${isUser ? 'order-1' : ''}`}>
        <div className={`px-3 py-2.5 ${
          isUser
            ? 'bg-gradient-to-br from-[#F97316] to-[#EA580C] text-white rounded-xl rounded-br-md shadow-md shadow-[#F97316]/10'
            : 'bg-white/[0.025] border border-white/[0.05] text-white/50 rounded-xl rounded-bl-md'
        }`}>
          {isUser ? (
            <p className="text-[12px] leading-relaxed whitespace-pre-wrap">{text}</p>
          ) : greeting ? (
            <div className="space-y-2">
              <div className="relative overflow-hidden rounded-xl border border-white/[0.06] bg-gradient-to-br from-white/[0.03] to-transparent p-3">
                <div className="absolute -top-8 -right-8 w-20 h-20 rounded-full blur-[30px] pointer-events-none" style={{ background: `${weatherColor}15` }} />
                <WeatherEffects condition={greeting.condition} intensity="light" />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${weatherColor}15` }}>
                      <WeatherIcon size={16} style={{ color: weatherColor, filter: `drop-shadow(0 0 4px ${weatherColor}40)` }} />
                    </div>
                    <div>
                      <p className="text-[12px] font-bold text-white/70">Good {greeting.timeOfDay}!</p>
                      <div className="flex items-center gap-1">
                        <Thermometer size={9} className="text-white/30" />
                        <span className="text-[10px] text-white/40 font-semibold">{greeting.temp}°C</span>
                        <span className="text-[10px] text-white/25">·</span>
                        <span className="text-[10px] text-white/35">{greeting.condition}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <MapPin size={8} className="text-white/20" />
                    <span className="text-[9px] text-white/25 font-medium">{greeting.city}</span>
                  </div>
                </div>
              </div>
              <RichResponse text={overviewText} navigate={navigate} />
            </div>
          ) : (
            <RichResponse text={text} navigate={navigate} />
          )}
        </div>
      </div>
      {isUser && (
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#F97316] to-purple-500 flex items-center justify-center shrink-0 mt-0.5 order-2 shadow-md shadow-[#F97316]/10">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
          </svg>
        </div>
      )}
    </div>
  )
}
