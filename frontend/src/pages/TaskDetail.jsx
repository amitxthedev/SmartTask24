import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Calendar, Clock, Trash2, CheckCircle2, RotateCcw,
  Archive, Copy, Edit2, Tag, FolderOpen, Timer, BarChart3
} from 'lucide-react'
import { getTask, deleteTask, completeTask, uncompleteTask, archiveTask, restoreTask, duplicateTask } from '../api/tasks'
import { trackCompletion } from '../utils/streak'
import Modal from '../components/Modal'
import TaskForm from '../components/TaskForm'
import { SkeletonCard } from '../components/Skeleton'

const priorityStyles = {
  URGENT: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20', dot: 'bg-red-500', label: 'Urgent', bar: 'from-red-400 to-red-600' },
  HIGH: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20', dot: 'bg-orange-500', label: 'High', bar: 'from-orange-400 to-orange-600' },
  MEDIUM: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20', dot: 'bg-blue-500', label: 'Medium', bar: 'from-blue-400 to-blue-600' },
  LOW: { bg: 'bg-white/[0.04]', text: 'text-white/40', border: 'border-white/[0.08]', dot: 'bg-white/20', label: 'Low', bar: 'from-white/20 to-white/10' },
}

export default function TaskDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [task, setTask] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showEdit, setShowEdit] = useState(false)

  const fetchTask = () => {
    getTask(id).then(r => setTask(r.data.data)).catch(() => navigate('/tasks')).finally(() => setLoading(false))
  }

  useEffect(() => { fetchTask() }, [id])

  const handleAction = async (action) => {
    try {
      switch (action) {
        case 'complete': await completeTask(id); trackCompletion(); break
        case 'uncomplete': await uncompleteTask(id); break
        case 'archive': await archiveTask(id); break
        case 'restore': await restoreTask(id); break
        case 'duplicate': await duplicateTask(id); break
        case 'delete': await deleteTask(id); navigate('/tasks'); return
      }
      fetchTask()
    } catch (e) { console.error(e) }
  }

  if (loading) return <SkeletonCard />
  if (!task) return null

  const p = priorityStyles[task.priority] || priorityStyles.MEDIUM
  const completedCount = task.subtasks?.filter(s => s.completed).length || 0
  const totalCount = task.subtasks?.length || 0

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-slide-up">
      <button onClick={() => navigate('/tasks')} className="btn-ghost -ml-2">
        <ArrowLeft size={15} />
        Back to tasks
      </button>

      <div className="section-card relative overflow-hidden">
        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${p.bar}`} />

        <div className="section-card-body">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="font-heading font-extrabold text-xl text-white tracking-tight mb-2">{task.title}</h1>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg border ${p.bg} ${p.text} ${p.border}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${p.dot}`} />
                  {p.label}
                </span>
                <span className={`badge ${task.status === 'COMPLETED' ? 'badge-green' : task.status === 'ARCHIVED' ? 'badge-slate' : task.status === 'IN_PROGRESS' ? 'badge-blue' : 'badge-yellow'}`}>
                  {task.status?.replace('_', ' ')}
                </span>
              </div>
            </div>
            <button onClick={() => setShowEdit(true)} className="p-2 rounded-xl hover:bg-white/[0.06] text-white/30 hover:text-white/60 transition-colors">
              <Edit2 size={15} />
            </button>
          </div>

          {task.description && (
            <div className="mt-5 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <p className="text-[13px] text-white/40 leading-relaxed whitespace-pre-wrap">{task.description}</p>
            </div>
          )}

          <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {task.dueDate && (
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/[0.02]">
                <Calendar size={13} className="text-white/25" />
                <div>
                  <p className="text-[10px] text-white/25 font-medium uppercase tracking-wider">Due Date</p>
                  <p className="text-[13px] font-semibold text-white/60 mt-0.5">
                    {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </div>
            )}
            {task.estimatedTime && (
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/[0.02]">
                <Timer size={13} className="text-white/25" />
                <div>
                  <p className="text-[10px] text-white/25 font-medium uppercase tracking-wider">Est. Time</p>
                  <p className="text-[13px] font-semibold text-white/60 mt-0.5">{task.estimatedTime} min</p>
                </div>
              </div>
            )}
            {task.progress > 0 && (
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/[0.02]">
                <BarChart3 size={13} className="text-white/25" />
                <div>
                  <p className="text-[10px] text-white/25 font-medium uppercase tracking-wider">Progress</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-16 h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                      <div className="h-full bg-[#F97316] rounded-full" style={{ width: `${task.progress}%` }} />
                    </div>
                    <span className="text-[12px] font-bold text-white/50">{task.progress}%</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {(task.categoryName || task.tags?.length > 0) && (
            <div className="mt-4 flex items-center gap-3 flex-wrap">
              {task.categoryName && (
                <div className="flex items-center gap-2">
                  <FolderOpen size={12} className="text-white/25" />
                  <span className="badge-blue">{task.categoryName}</span>
                </div>
              )}
              {task.tags?.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Tag size={12} className="text-white/25" />
                  {task.tags.map(t => (
                    <span key={t.id} className="badge-purple">{t.name}</span>
                  ))}
                </div>
              )}
            </div>
          )}

          {totalCount > 0 && (
            <div className="mt-5 pt-5 border-t border-white/[0.04]">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-heading font-bold text-[13px] text-white/50">Subtasks</h4>
                <span className="text-[11px] font-bold text-white/30">{completedCount}/{totalCount}</span>
              </div>
              <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden mb-4">
                <div
                  className="h-full bg-gradient-to-r from-[#F97316] to-[#EA580C] rounded-full transition-all duration-500"
                  style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
                />
              </div>
              <div className="space-y-1.5">
                {task.subtasks.map(s => (
                  <div key={s.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/[0.02] transition-colors">
                    <div className={`w-4 h-4 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                      s.completed ? 'bg-[#10B981] border-[#10B981]' : 'border-white/10'
                    }`}>
                      {s.completed && <CheckCircle2 size={10} className="text-white" strokeWidth={3} />}
                    </div>
                    <span className={`text-[13px] font-medium ${s.completed ? 'line-through text-white/20' : 'text-white/50'}`}>{s.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-5 pt-5 border-t border-white/[0.04] flex items-center gap-2 flex-wrap">
            {task.status === 'COMPLETED'
              ? <ActionBtn icon={RotateCcw} label="Uncomplete" onClick={() => handleAction('uncomplete')} />
              : <ActionBtn icon={CheckCircle2} label="Complete" onClick={() => handleAction('complete')} primary />
            }
            {task.status === 'ARCHIVED'
              ? <ActionBtn icon={RotateCcw} label="Restore" onClick={() => handleAction('restore')} />
              : <ActionBtn icon={Archive} label="Archive" onClick={() => handleAction('archive')} />
            }
            <ActionBtn icon={Copy} label="Duplicate" onClick={() => handleAction('duplicate')} />
            <div className="flex-1" />
            <button onClick={() => handleAction('delete')} className="btn-danger text-[13px]">
              <Trash2 size={13} />
              Delete
            </button>
          </div>
        </div>
      </div>

      <Modal open={showEdit} onClose={() => setShowEdit(false)} title="Edit Task">
        <TaskForm task={task} onSuccess={() => { setShowEdit(false); fetchTask() }} onCancel={() => setShowEdit(false)} />
      </Modal>
    </div>
  )
}

function ActionBtn({ icon: Icon, label, onClick, primary }) {
  return (
    <button onClick={onClick} className={primary ? 'btn-primary text-[13px]' : 'btn-secondary text-[13px]'}>
      <Icon size={13} />
      {label}
    </button>
  )
}
