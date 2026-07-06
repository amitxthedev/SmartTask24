import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Plus, MoreHorizontal, CheckCircle2, RotateCcw,
  Archive, Copy, Trash2, Clock, ListTodo, Filter, Search,
  BarChart3, ArrowUpDown, ChevronDown
} from 'lucide-react'
import { getTasks, searchTasks, deleteTask, completeTask, uncompleteTask, archiveTask, restoreTask, duplicateTask } from '../api/tasks'
import { trackCompletion } from '../utils/streak'
import Modal from '../components/Modal'
import TaskForm from '../components/TaskForm'
import { TaskListSkeleton } from '../components/Skeleton'

const priorityConfig = {
  URGENT: { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', dot: 'bg-red-500', glow: '#EF4444' },
  HIGH: { text: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', dot: 'bg-orange-500', glow: '#F97316' },
  MEDIUM: { text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', dot: 'bg-blue-500', glow: '#3B82F6' },
  LOW: { text: 'text-white/30', bg: 'bg-white/[0.03]', border: 'border-white/[0.06]', dot: 'bg-white/20', glow: 'rgba(255,255,255,0.15)' },
}

const statusConfig = {
  PENDING: 'badge-yellow',
  IN_PROGRESS: 'badge-blue',
  COMPLETED: 'badge-green',
  ARCHIVED: 'badge-slate',
}

export default function Tasks() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchParams] = useSearchParams()
  const [showCreate, setShowCreate] = useState(false)
  const [menuOpen, setMenuOpen] = useState(null)
  const [filter, setFilter] = useState('all')
  const [sortBy, setSortBy] = useState('date')
  const navigate = useNavigate()
  const searchQuery = searchParams.get('search')

  const fetchTasks = () => {
    if (searchQuery) {
      searchTasks(searchQuery).then(r => setTasks(r.data.data)).catch(console.error)
    } else {
      getTasks().then(r => setTasks(r.data.data)).catch(console.error)
    }
    setLoading(false)
  }

  useEffect(() => { fetchTasks() }, [searchQuery])

  const handleAction = async (action, id) => {
    try {
      switch (action) {
        case 'complete': await completeTask(id); trackCompletion(); break
        case 'uncomplete': await uncompleteTask(id); break
        case 'archive': await archiveTask(id); break
        case 'restore': await restoreTask(id); break
        case 'duplicate': await duplicateTask(id); break
        case 'delete': await deleteTask(id); break
      }
      fetchTasks()
    } catch (e) { console.error(e) }
    setMenuOpen(null)
  }

  const filteredTasks = tasks.filter(t => {
    if (filter === 'all') return true
    return t.status === filter
  }).sort((a, b) => {
    if (sortBy === 'priority') {
      const order = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 }
      return (order[a.priority] || 4) - (order[b.priority] || 4)
    }
    if (sortBy === 'name') return a.title.localeCompare(b.title)
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
  })

  const statusCounts = {
    all: tasks.length,
    PENDING: tasks.filter(t => t.status === 'PENDING').length,
    IN_PROGRESS: tasks.filter(t => t.status === 'IN_PROGRESS').length,
    COMPLETED: tasks.filter(t => t.status === 'COMPLETED').length,
    ARCHIVED: tasks.filter(t => t.status === 'ARCHIVED').length,
  }

  if (loading) return <TaskListSkeleton />

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="page-title">Tasks</h1>
          <p className="page-subtitle truncate">
            {searchQuery ? (
              <>Results for "<span className="font-medium text-white/50">{searchQuery}</span>"</>
            ) : (
              <>{tasks.length} task{tasks.length !== 1 ? 's' : ''}</>
            )}
          </p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary shrink-0">
          <Plus size={16} strokeWidth={2.5} />
          <span className="hidden sm:inline">New Task</span>
        </button>
      </div>

      {/* Filter Chips + Sort */}
      {!searchQuery && (
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            {[
              { key: 'all', label: 'All' },
              { key: 'PENDING', label: 'Pending' },
              { key: 'IN_PROGRESS', label: 'In Progress' },
              { key: 'COMPLETED', label: 'Completed' },
              { key: 'ARCHIVED', label: 'Archived' },
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`filter-chip ${filter === f.key ? 'active' : ''}`}
              >
                {f.label}
                <span className="text-[9px] opacity-60">{statusCounts[f.key]}</span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setSortBy(sortBy === 'date' ? 'priority' : sortBy === 'priority' ? 'name' : 'date')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-[11px] font-medium text-white/35 hover:text-white/50 hover:bg-white/[0.05] transition-all"
            >
              <ArrowUpDown size={11} />
              {sortBy === 'date' ? 'Date' : sortBy === 'priority' ? 'Priority' : 'Name'}
            </button>
          </div>
        </div>
      )}

      {/* Tasks List */}
      {filteredTasks.length === 0 ? (
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#111114] to-[#0d0d10]">
          <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-[#F97316]/[0.03] blur-[60px] pointer-events-none" />
          <div className="relative z-10 flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/[0.06] flex items-center justify-center mb-5 shadow-lg">
              <ListTodo size={32} className="text-white/10" />
            </div>
            <p className="font-heading font-bold text-white/50 text-[16px] mb-1.5">
              {searchQuery ? 'No results found' : filter !== 'all' ? `No ${filter.toLowerCase().replace('_', ' ')} tasks` : 'No tasks yet'}
            </p>
            <p className="text-[13px] text-white/25 mb-6 max-w-[240px] text-center leading-relaxed">
              {searchQuery ? 'Try a different search term' : 'Create your first task to start being productive'}
            </p>
            {!searchQuery && (
              <button onClick={() => setShowCreate(true)} className="btn-primary">
                <Plus size={16} strokeWidth={2.5} />
                Create Task
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#111114] to-[#0d0d10]">
          {/* Subtle top glow */}
          <div className="absolute -top-16 -right-16 w-32 h-32 rounded-full bg-[#F97316]/[0.03] blur-[50px] pointer-events-none" />

          <div className="relative z-10 p-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 stagger-children">
            {filteredTasks.map(task => {
              const isCompleted = task.status === 'COMPLETED'
              const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !isCompleted
              const isDueToday = task.dueDate && new Date(task.dueDate).toDateString() === new Date().toDateString() && !isCompleted
              const daysUntil = task.dueDate ? Math.ceil((new Date(task.dueDate) - new Date()) / (1000 * 60 * 60 * 24)) : null
              const hoursUntil = task.dueDate ? Math.ceil((new Date(task.dueDate) - new Date()) / (1000 * 60 * 60)) : null
              const pc = priorityConfig[task.priority] || priorityConfig.MEDIUM

              return (
                <div
                  key={task.id}
                  className="group/task relative rounded-xl overflow-hidden transition-all duration-300 cursor-pointer"
                  style={{
                    background: 'rgba(255,255,255,0.018)',
                    border: `1px solid ${isOverdue ? 'rgba(239,68,68,0.3)' : isDueToday ? 'rgba(249,115,22,0.25)' : 'rgba(255,255,255,0.05)'}`,
                  }}
                  onClick={() => navigate(`/tasks/${task.id}`)}
                >
                  {/* Priority color top strip */}
                  <div
                    className="absolute top-0 left-0 right-0 h-[3px] transition-all duration-300"
                    style={{ background: `linear-gradient(90deg, ${pc.glow}, transparent)` }}
                  />

                  {/* Hover glow effect */}
                  <div
                    className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-[50px] opacity-0 group-hover/task:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{ background: pc.glow }}
                  />

                  <div className="relative z-10 p-4">
                    {/* Top row: checkbox + priority + status + menu */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleAction(isCompleted ? 'uncomplete' : 'complete', task.id) }}
                          className={`shrink-0 w-[22px] h-[22px] rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
                            isCompleted
                              ? 'bg-[#10B981] border-[#10B981] text-white shadow-md shadow-[#10B981]/25'
                              : 'border-white/10 hover:border-[#F97316] hover:bg-[#F97316]/10'
                          }`}
                        >
                          {isCompleted && <CheckCircle2 size={13} strokeWidth={3} />}
                        </button>
                        <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-[3px] rounded-md border ${pc.text} ${pc.bg} ${pc.border}`}>
                          <span className={`w-[5px] h-[5px] rounded-full ${pc.dot}`} style={{ boxShadow: `0 0 6px ${pc.glow}` }} />
                          {task.priority}
                        </span>
                        <span className={`${statusConfig[task.status] || 'badge-slate'}`}>
                          {task.status?.replace('_', ' ')}
                        </span>
                      </div>

                      {/* Menu */}
                      <div className="relative" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setMenuOpen(menuOpen === task.id ? null : task.id)}
                          className="p-1.5 rounded-lg hover:bg-white/[0.06] text-white/20 opacity-0 group-hover/task:opacity-100 hover:text-white/50 transition-all"
                        >
                          <MoreHorizontal size={15} />
                        </button>
                        {menuOpen === task.id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(null)} />
                            <div className="absolute right-0 top-full mt-1 w-44 bg-[#18181B] rounded-xl shadow-2xl border border-white/[0.08] py-1 z-20 animate-scale-in overflow-hidden">
                              {isCompleted
                                ? <MenuBtn icon={RotateCcw} label="Uncomplete" onClick={() => handleAction('uncomplete', task.id)} />
                                : <MenuBtn icon={CheckCircle2} label="Complete" onClick={() => handleAction('complete', task.id)} />
                              }
                              {task.status === 'ARCHIVED'
                                ? <MenuBtn icon={RotateCcw} label="Restore" onClick={() => handleAction('restore', task.id)} />
                                : <MenuBtn icon={Archive} label="Archive" onClick={() => handleAction('archive', task.id)} />
                              }
                              <MenuBtn icon={Copy} label="Duplicate" onClick={() => handleAction('duplicate', task.id)} />
                              <div className="h-px bg-white/[0.04] my-1" />
                              <MenuBtn icon={Trash2} label="Delete" onClick={() => handleAction('delete', task.id)} danger />
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className={`text-[14px] font-semibold leading-snug mb-2 transition-colors ${
                      isCompleted ? 'line-through text-white/20' : 'text-white/80'
                    }`}>
                      {task.title}
                    </h3>

                    {/* Description */}
                    {task.description && (
                      <p className="text-[11px] text-white/25 line-clamp-2 mb-3 leading-relaxed">
                        {task.description}
                      </p>
                    )}

                    {/* Bottom row: due date + estimated time */}
                    <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/[0.03]">
                      {task.dueDate ? (
                        <div className={`flex items-center gap-1.5 text-[11px] font-medium ${
                          isOverdue ? 'text-red-400' : isDueToday ? 'text-orange-400' : 'text-white/25'
                        }`}>
                          <Clock size={11} />
                          <span>{new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                          {isOverdue && <span className="text-red-400 font-bold ml-1">Overdue!</span>}
                          {isDueToday && <span className="text-orange-400 font-bold ml-1">Today!</span>}
                          {!isOverdue && !isDueToday && daysUntil !== null && daysUntil <= 7 && daysUntil > 0 && (
                            <span className="text-white/30 ml-1">({daysUntil}d)</span>
                          )}
                        </div>
                      ) : <div />}
                      {task.estimatedTime && task.estimatedTime > 0 && (
                        <span className="text-[10px] text-white/15 font-medium flex items-center gap-1">
                          <BarChart3 size={10} />
                          {task.estimatedTime}m
                        </span>
                      )}
                    </div>

                    {/* Tags row */}
                    {task.tags && task.tags.length > 0 && (
                      <div className="flex items-center gap-1 mt-2 flex-wrap">
                        {task.tags.slice(0, 3).map((tag, i) => (
                          <span key={i} className="text-[9px] font-medium px-1.5 py-[2px] rounded bg-white/[0.04] text-white/30 border border-white/[0.04]">
                            {tag.name}
                          </span>
                        ))}
                        {task.tags.length > 3 && (
                          <span className="text-[9px] text-white/15">+{task.tags.length - 3}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create Task">
        <TaskForm onSuccess={() => { setShowCreate(false); fetchTasks() }} onCancel={() => setShowCreate(false)} />
      </Modal>
    </div>
  )
}

function MenuBtn({ icon: Icon, label, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2.5 w-full px-3.5 py-2 text-[13px] font-medium transition-colors ${
        danger ? 'text-red-400 hover:bg-red-500/10' : 'text-white/50 hover:bg-white/[0.04] hover:text-white/70'
      }`}
    >
      <Icon size={13} />
      {label}
    </button>
  )
}
