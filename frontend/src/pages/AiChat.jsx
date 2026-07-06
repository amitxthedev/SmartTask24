import { useState, useEffect, useRef, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Trash2, Sparkles, ArrowUp, Plus, CheckCircle2, ListTodo,
  BarChart3, Clock, AlertCircle, ChevronRight, Tag, Layers,
  Zap, Brain, RotateCcw, Send, Bot, User
} from 'lucide-react'
import { aiChat, getConversations } from '../api/ai'
import { getTasks } from '../api/tasks'

export default function AiChat() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [tasks, setTasks] = useState([])
  const bottomRef = useRef(null)
  const inputRef = useRef(null)
  const location = useLocation()
  const navigate = useNavigate()

  const loadTasks = useCallback(() => {
    getTasks().then(r => setTasks(r.data.data)).catch(() => {})
  }, [])

  useEffect(() => {
    loadTasks()
    getConversations().then(r => {
      const convos = r.data.data
      const msgs = convos.flatMap(c => [
        { role: 'user', text: c.prompt, id: c.id + '-u', time: c.createdAt },
        { role: 'assistant', text: c.response, id: c.id + '-a', time: c.createdAt },
      ])
      setMessages(msgs)
    }).catch(console.error)
  }, [loadTasks])

  useEffect(() => {
    if (location.state?.preset) {
      setInput(location.state.preset)
      window.history.replaceState({}, document.title)
    }
  }, [location.state])

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

  const getContextualSuggestions = () => {
    if (messages.length === 0) return emptySuggestions
    const last = messages[messages.length - 1]
    if (last.role !== 'assistant') return null
    const resp = last.text.toLowerCase()
    if (resp.includes('created') || resp.includes('task created')) return postCreateSuggestions
    if (resp.includes('deleted')) return postDeleteSuggestions
    if (resp.includes('completed') || resp.includes('done')) return postCompleteSuggestions
    if (resp.includes('you have') && resp.includes('task')) return listFollowUp
    return defaultSuggestions
  }

  const suggestions = getContextualSuggestions()

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)]">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#111114] to-[#0d0d10] mb-4">
        <div className="absolute -top-16 -right-16 w-32 h-32 rounded-full bg-[#F97316]/[0.06] blur-[50px] pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-24 h-24 rounded-full bg-purple-500/[0.04] blur-[40px] pointer-events-none" />

        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#F97316]/30 to-transparent" />

        <div className="relative z-10 p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#F97316] to-[#EA580C] flex items-center justify-center shadow-lg shadow-[#F97316]/20">
              <Brain size={20} className="text-white" />
            </div>
            <div>
              <h1 className="font-heading font-extrabold text-[1.2rem] text-white tracking-tight">AI Assistant</h1>
              <p className="text-[12px] text-white/30 font-medium">Create, manage, and analyze tasks with AI</p>
            </div>
          </div>
          {messages.length > 0 && (
            <button
              onClick={() => setMessages([])}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-[11px] font-medium text-white/30 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-all duration-200"
            >
              <Trash2 size={12} />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 pb-4 custom-scrollbar">
        {messages.length === 0 ? (
          <EmptyState onSend={handleSend} tasks={tasks} />
        ) : (
          <div className="space-y-4">
            {messages.map(m => (
              <MessageBubble key={m.id} message={m} onNavigate={navigate} />
            ))}
          </div>
        )}

        {sending && (
          <div className="flex gap-3 animate-fade-in">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#F97316]/20 to-[#EA580C]/10 flex items-center justify-center shrink-0 mt-0.5 border border-[#F97316]/10">
              <Sparkles size={15} className="text-[#F97316]" />
            </div>
            <div className="bg-white/[0.025] border border-white/[0.06] rounded-2xl rounded-bl-md px-5 py-4">
              <div className="flex gap-1.5">
                <div className="w-1.5 h-1.5 bg-[#F97316] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 bg-[#F97316] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 bg-[#F97316] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {suggestions && !sending && (
        <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide -mx-1 px-1">
          {suggestions.map((s) => (
            <button
              key={s.label}
              onClick={() => handleSend(s.prompt || s.label)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-[11px] font-medium text-white/35 hover:border-[#F97316]/20 hover:text-[#F97316] hover:bg-[#F97316]/[0.04] transition-all duration-200 whitespace-nowrap shrink-0"
            >
              <s.icon size={11} />
              {s.label}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="mt-auto pt-3">
        <div className="relative rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#111114] to-[#0d0d10] focus-within:border-[#F97316]/30 transition-all duration-200">
          <div className="flex items-end gap-2 p-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="What do you want to do?"
              rows={1}
              className="flex-1 bg-transparent px-3 py-2.5 resize-none min-h-[42px] max-h-[120px] leading-relaxed text-[13px] text-white placeholder-white/20 outline-none"
              style={{ height: 'auto' }}
              onInput={e => { e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px' }}
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || sending}
              className="flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white shrink-0 disabled:opacity-30 shadow-lg shadow-[#F97316]/20 hover:shadow-xl hover:shadow-[#F97316]/30 transition-all duration-200 disabled:hover:shadow-none"
            >
              <Send size={15} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════ EMPTY STATE ═══════════════ */

function EmptyState({ onSend, tasks }) {
  const pending = tasks.filter(t => t.status === 'PENDING' || t.status === 'IN_PROGRESS')
  const overdue = tasks.filter(t => t.status !== 'COMPLETED' && t.dueDate && new Date(t.dueDate) < new Date())

  return (
    <div className="flex flex-col items-center justify-center h-full">
      {/* Animated gradient orb */}
      <div className="relative mb-6">
        <div className="absolute inset-0 w-24 h-24 rounded-full bg-[#F97316]/10 blur-[30px] animate-pulse-soft" />
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#F97316]/15 to-[#EA580C]/10 flex items-center justify-center relative border border-[#F97316]/10">
          <Brain size={30} className="text-[#F97316]" />
          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center border-2 border-[#0d0d10]">
            <div className="w-1.5 h-1.5 rounded-full bg-white" />
          </div>
        </div>
      </div>

      <p className="font-heading font-bold text-white/60 text-[16px] mb-1.5">How can I help?</p>
      <p className="text-[13px] text-white/25 max-w-sm text-center leading-relaxed mb-8">
        I understand natural language. Just tell me what you need.
      </p>

      <div className="grid grid-cols-2 gap-2.5 w-full max-w-md mb-8">
        <SuggestCard icon={Plus} label="Create a task" hint="e.g. 'Add meeting at 3pm'" color="#F97316" onSend={onSend} prompt="Create a new task" />
        <SuggestCard icon={ListTodo} label="List my tasks" hint="See all pending tasks" color="#3B82F6" onSend={onSend} prompt="Show me all my tasks" />
        <SuggestCard icon={BarChart3} label="Analyze progress" hint="Get productivity report" color="#8B5CF6" onSend={onSend} prompt="Analyze my productivity" />
        <SuggestCard icon={CheckCircle2} label="Complete a task" hint="Mark as done" color="#10B981" onSend={onSend} prompt="Mark a task as complete" />
      </div>

      {(pending.length > 0 || overdue.length > 0) && (
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-3 px-1">
            <Zap size={11} className="text-[#F97316]" />
            <span className="text-[10px] font-bold text-white/25 uppercase tracking-wider">Quick Status</span>
          </div>
          <div className="space-y-2">
            {overdue.length > 0 && (
              <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-500/[0.04] border border-red-500/10">
                <AlertCircle size={13} className="text-red-400" />
                <span className="text-[12px] text-red-400/80 font-medium">{overdue.length} overdue task{overdue.length > 1 ? 's' : ''}</span>
              </div>
            )}
            <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <Clock size={13} className="text-[#F97316]" />
              <span className="text-[12px] text-white/30 font-medium">{pending.length} task{pending.length !== 1 ? 's' : ''} in progress</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function SuggestCard({ icon: Icon, label, hint, color, onSend, prompt }) {
  return (
    <button
      onClick={() => onSend(prompt)}
      className="flex items-start gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] hover:bg-white/[0.035] transition-all duration-200 text-left group"
    >
      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200" style={{ background: `${color}10` }}>
        <Icon size={14} style={{ color }} className="opacity-60 group-hover:opacity-100 transition-opacity" />
      </div>
      <div className="min-w-0">
        <p className="text-[12px] font-semibold text-white/50 group-hover:text-white/70 transition-colors">{label}</p>
        <p className="text-[10px] text-white/18 mt-0.5">{hint}</p>
      </div>
    </button>
  )
}

/* ═══════════════ MESSAGE BUBBLE ═══════════════ */

function MessageBubble({ message, onNavigate }) {
  const { role, text } = message
  const isUser = role === 'user'

  const isTaskList = !isUser && /\[\d+\]/.test(text)
  const isCreated = !isUser && /task created/i.test(text)
  const isDeleted = !isUser && /deleted task/i.test(text)
  const isCompleted = !isUser && /task completed/i.test(text)
  const isReport = !isUser && /productivity report/i.test(text)

  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : ''} animate-slide-up`}>
      {!isUser && (
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#F97316]/20 to-[#EA580C]/10 flex items-center justify-center shrink-0 mt-0.5 border border-[#F97316]/10">
          <Sparkles size={14} className="text-[#F97316]" />
        </div>
      )}
      <div className={`max-w-[80%] ${isUser ? 'order-1' : ''}`}>
        <div className={`px-4 py-3 ${
          isUser
            ? 'bg-gradient-to-br from-[#F97316] to-[#EA580C] text-white rounded-2xl rounded-br-md shadow-lg shadow-[#F97316]/15'
            : 'bg-white/[0.025] border border-white/[0.06] text-white/55 rounded-2xl rounded-bl-md'
        }`}>
          {isCreated && <ResponseBadge icon={Plus} text="Task Created" color="#10B981" />}
          {isDeleted && <ResponseBadge icon={Trash2} text="Task Deleted" color="#EF4444" />}
          {isCompleted && <ResponseBadge icon={CheckCircle2} text="Task Completed" color="#10B981" />}
          {isReport && <ResponseBadge icon={BarChart3} text="Report" color="#8B5CF6" />}
          <p className="text-[13px] leading-relaxed whitespace-pre-wrap">{text}</p>
        </div>
        {isTaskList && !isUser && (
          <button
            onClick={() => onNavigate('/tasks')}
            className="mt-2 flex items-center gap-1 text-[11px] text-[#F97316]/50 hover:text-[#F97316] font-medium transition-colors ml-1"
          >
            View in task board
            <ChevronRight size={10} />
          </button>
        )}
      </div>
      {isUser && (
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#F97316] to-purple-500 flex items-center justify-center shrink-0 mt-0.5 order-2 shadow-lg shadow-[#F97316]/10">
          <User size={14} className="text-white" />
        </div>
      )}
    </div>
  )
}

function ResponseBadge({ icon: Icon, text, color }) {
  return (
    <div className="flex items-center gap-1.5 mb-2 pb-2 border-b border-white/[0.05]">
      <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: `${color}15` }}>
        <Icon size={9} style={{ color }} />
      </div>
      <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color }}>{text}</span>
    </div>
  )
}

/* ═══════════════ SUGGESTIONS ═══════════════ */

const emptySuggestions = [
  { icon: Plus, label: 'Create a task', prompt: 'Create a new task' },
  { icon: ListTodo, label: 'Show tasks', prompt: 'Show me all my tasks' },
  { icon: BarChart3, label: 'Analyze', prompt: 'Analyze my productivity' },
  { icon: CheckCircle2, label: 'Complete task', prompt: 'Mark a task as complete' },
]

const postCreateSuggestions = [
  { icon: Plus, label: 'Create another', prompt: 'Create a new task' },
  { icon: ListTodo, label: 'View tasks', prompt: 'Show me all my tasks' },
  { icon: RotateCcw, label: 'Undo', prompt: 'Delete the last task' },
]

const postDeleteSuggestions = [
  { icon: ListTodo, label: 'View remaining', prompt: 'Show me all my tasks' },
  { icon: Plus, label: 'Create new', prompt: 'Create a new task' },
]

const postCompleteSuggestions = [
  { icon: BarChart3, label: 'View report', prompt: 'Analyze my productivity' },
  { icon: ListTodo, label: 'More tasks', prompt: 'Show me all my tasks' },
  { icon: Plus, label: 'Add task', prompt: 'Create a new task' },
]

const listFollowUp = [
  { icon: Plus, label: 'Create task', prompt: 'Create a new task' },
  { icon: CheckCircle2, label: 'Complete one', prompt: 'Mark a task as complete' },
  { icon: BarChart3, label: 'Analyze', prompt: 'Analyze my productivity' },
  { icon: Trash2, label: 'Delete task', prompt: 'Delete a task' },
]

const defaultSuggestions = [
  { icon: Plus, label: 'Create task', prompt: 'Create a new task' },
  { icon: ListTodo, label: 'List tasks', prompt: 'Show me all my tasks' },
  { icon: BarChart3, label: 'Analyze', prompt: 'Analyze my productivity' },
]
