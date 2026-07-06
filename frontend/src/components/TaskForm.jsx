import { useState, useEffect } from 'react'
import { createTask, updateTask } from '../api/tasks'
import { getCategories } from '../api/categories'
import { getTags } from '../api/tags'
import { Loader2 } from 'lucide-react'

export default function TaskForm({ task, onSuccess, onCancel }) {
  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    priority: task?.priority || 'MEDIUM',
    dueDate: task?.dueDate ? task.dueDate.slice(0, 16) : '',
    estimatedTime: task?.estimatedTime || '',
    categoryId: task?.categoryId || '',
    tagIds: task?.tags?.map(t => t.id) || [],
  })
  const [categories, setCategories] = useState([])
  const [tags, setTags] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    Promise.all([getCategories(), getTags()])
      .then(([c, t]) => { setCategories(c.data.data); setTags(t.data.data) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleSubmit = async e => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const payload = {
        ...form,
        estimatedTime: form.estimatedTime ? Number(form.estimatedTime) : null,
        categoryId: form.categoryId || null,
        tagIds: form.tagIds,
      }
      if (task) await updateTask(task.id, payload)
      else await createTask(payload)
      onSuccess()
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }))

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="w-6 h-6 border-2 border-white/10 border-t-[#F97316] rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-xs font-semibold text-white/40 mb-2 uppercase tracking-wider">Title</label>
        <input
          value={form.title}
          onChange={e => set('title', e.target.value)}
          className="input-field"
          placeholder="Task title"
          required
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-white/40 mb-2 uppercase tracking-wider">Description</label>
        <textarea
          value={form.description}
          onChange={e => set('description', e.target.value)}
          className="input-field min-h-[90px] resize-y"
          placeholder="Optional description"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-white/40 mb-2 uppercase tracking-wider">Priority</label>
          <select value={form.priority} onChange={e => set('priority', e.target.value)} className="select-field">
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-white/40 mb-2 uppercase tracking-wider">Category</label>
          <select value={form.categoryId} onChange={e => set('categoryId', e.target.value)} className="select-field">
            <option value="">None</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-white/40 mb-2 uppercase tracking-wider">Due Date</label>
          <input
            type="datetime-local"
            value={form.dueDate}
            onChange={e => set('dueDate', e.target.value)}
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-white/40 mb-2 uppercase tracking-wider">Est. Time (min)</label>
          <input
            type="number"
            value={form.estimatedTime}
            onChange={e => set('estimatedTime', e.target.value)}
            className="input-field"
            placeholder="60"
            min="0"
          />
        </div>
      </div>

      {tags.length > 0 && (
        <div>
          <label className="block text-xs font-semibold text-white/40 mb-2.5 uppercase tracking-wider">Tags</label>
          <div className="flex flex-wrap gap-2">
            {tags.map(t => {
              const selected = form.tagIds.includes(t.id)
              const color = t.color || '#F97316'
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => set('tagIds', selected ? form.tagIds.filter(id => id !== t.id) : [...form.tagIds, t.id])}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold border-2 transition-all duration-200 ${
                    selected
                      ? 'border-[#F97316]/40 bg-[#F97316]/10 text-[#FB923C]'
                      : 'border-white/[0.06] bg-white/[0.02] text-white/50 hover:border-white/[0.12] hover:bg-white/[0.04]'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                  {t.name}
                </button>
              )
            })}
          </div>
        </div>
      )}

      <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.06]">
        <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting && <Loader2 size={15} className="animate-spin" />}
          {task ? 'Update Task' : 'Create Task'}
        </button>
      </div>
    </form>
  )
}
