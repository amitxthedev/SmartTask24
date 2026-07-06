import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Tags as TagsIcon, Sparkles, Loader2 } from 'lucide-react'
import { getTags, createTag, updateTag, deleteTag } from '../api/tags'
import Modal from '../components/Modal'
import { TagSkeleton } from '../components/Skeleton'

export default function Tags() {
  const [tags, setTags] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', color: '' })

  const fetch = () => {
    setLoading(true)
    getTags().then(r => setTags(r.data.data)).catch(console.error).finally(() => setLoading(false))
  }

  useEffect(() => { fetch() }, [])

  const openCreate = () => { setEditing(null); setForm({ name: '', color: '' }); setShowModal(true) }
  const openEdit = (t) => { setEditing(t); setForm({ name: t.name, color: t.color || '' }); setShowModal(true) }

  const handleSubmit = async e => {
    e.preventDefault()
    setSubmitting(true)
    try {
      if (editing) await updateTag(editing.id, form)
      else await createTag(form)
      setShowModal(false)
      await fetch()
    } catch (err) { console.error(err) }
    setSubmitting(false)
  }

  const handleDelete = async id => {
    if (!confirm('Delete this tag?')) return
    setDeleting(id)
    await deleteTag(id)
    await fetch()
    setDeleting(null)
  }

  if (loading) return <TagSkeleton />

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#111114] to-[#0d0d10]">
        <div className="absolute -top-16 -right-16 w-32 h-32 rounded-full bg-[#F97316]/[0.05] blur-[50px] pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#F97316]/30 to-transparent" />

        <div className="relative z-10 p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#F97316]/20 to-[#EA580C]/10 flex items-center justify-center shadow-lg shadow-[#F97316]/10 border border-[#F97316]/10">
              <TagsIcon size={20} className="text-[#F97316]" />
            </div>
            <div>
              <h1 className="font-heading font-extrabold text-[1.2rem] text-white tracking-tight">Tags</h1>
              <p className="text-[12px] text-white/30 font-medium">{tags.length} tag{tags.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <button onClick={openCreate} className="btn-primary shrink-0">
            <Plus size={16} strokeWidth={2.5} />
            <span className="hidden sm:inline">New Tag</span>
          </button>
        </div>
      </div>

      {/* Tags Grid */}
      {tags.length === 0 ? (
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#111114] to-[#0d0d10]">
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.03] flex items-center justify-center mb-4">
              <TagsIcon size={28} className="text-white/10" />
            </div>
            <p className="font-heading font-bold text-white/50 text-[15px] mb-1">No tags</p>
            <p className="text-[13px] text-white/25 mb-5">Create tags to label your tasks</p>
            <button onClick={openCreate} className="btn-primary">
              <Plus size={16} strokeWidth={2.5} />
              Create Tag
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-3 stagger-children">
          {tags.map(t => {
            const color = t.color || '#F97316'
            return (
              <div key={t.id} className="group inline-flex items-center gap-2 animate-scale-in">
                <div
                  className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white/[0.02] border hover:bg-white/[0.035] hover:shadow-md transition-all duration-200 cursor-default"
                  style={{ borderColor: `${color}25`, borderLeftColor: color, borderLeftWidth: '3px' }}
                >
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}40` }} />
                  <span className="text-[13px] font-semibold text-white/55">{t.name}</span>
                </div>
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(t)} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-white/25 hover:text-white/50 transition-colors">
                    <Edit2 size={11} />
                  </button>
                    <button onClick={() => handleDelete(t.id)} disabled={deleting === t.id} className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/25 hover:text-red-400 transition-colors disabled:opacity-40">
                      {deleting === t.id ? <Loader2 size={11} className="animate-spin" /> : <Trash2 size={11} />}
                    </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Tag' : 'New Tag'}>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[11px] font-semibold text-white/40 mb-2 uppercase tracking-wider">Name</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input-field" placeholder="Tag name" required />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-white/40 mb-2 uppercase tracking-wider">Color</label>
            <div className="flex items-center gap-3">
              <input type="color" value={form.color || '#F97316'} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} className="w-10 h-10 rounded-xl cursor-pointer border-2 border-white/[0.08] hover:border-white/[0.15] transition-colors" />
              <span className="text-[13px] text-white/30 font-mono">{form.color || 'default'}</span>
              <div className="ml-auto w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${form.color || '#F97316'}20` }}>
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: form.color || '#F97316' }} />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary" disabled={submitting}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? <Loader2 size={14} className="animate-spin" /> : null}
              {editing ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
