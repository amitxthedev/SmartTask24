import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, FileText, Clock, BookOpen, Hash, Star, ArrowRight, GitBranch, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getNotes, createNote, updateNote, deleteNote } from '../api/notes'
import Modal from '../components/Modal'
import { NotesSkeleton } from '../components/Skeleton'

export default function Notes() {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ title: '', content: '' })
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()

  const fetchNotes = () => {
    setLoading(true)
    getNotes().then(r => setNotes(r.data.data)).catch(console.error).finally(() => setLoading(false))
  }

  useEffect(() => { fetchNotes() }, [])

  const openCreate = () => { setEditing(null); setForm({ title: '', content: '' }); setShowModal(true) }
  const openEdit = (n, e) => { e.stopPropagation(); setEditing(n); setForm({ title: n.title, content: n.content }); setShowModal(true) }

  const handleSubmit = async e => {
    e.preventDefault()
    setSubmitting(true)
    try {
      if (editing) await updateNote(editing.id, form)
      else await createNote(form)
      setShowModal(false)
      await fetchNotes()
    } catch (err) { console.error(err) }
    setSubmitting(false)
  }

  const handleDelete = async (id, e) => {
    e.stopPropagation()
    if (!confirm('Delete this note?')) return
    setDeleting(id)
    await deleteNote(id)
    await fetchNotes()
    setDeleting(null)
  }

  const filteredNotes = notes.filter(n =>
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatDate = (dateStr) => {
    const d = new Date(dateStr)
    const now = new Date()
    const diffMs = now - d
    const diffMin = Math.floor(diffMs / 60000)
    const diffHr = Math.floor(diffMs / 3600000)
    const diffDay = Math.floor(diffMs / 86400000)
    if (diffMin < 1) return 'Just now'
    if (diffMin < 60) return `${diffMin}m ago`
    if (diffHr < 24) return `${diffHr}h ago`
    if (diffDay < 7) return `${diffDay}d ago`
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const getContentPreview = (content, maxLen = 120) => {
    if (!content) return 'No content'
    const clean = content.replace(/[#*_`>\-\[\]]/g, '').trim()
    return clean.length > maxLen ? clean.slice(0, maxLen) + '...' : clean
  }

  const getWordCount = (content) => {
    if (!content) return 0
    return content.trim().split(/\s+/).length
  }

  if (loading) return <NotesSkeleton />

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#111114] to-[#0d0d10]">
        <div className="absolute -top-16 -right-16 w-32 h-32 rounded-full bg-cyan-500/[0.05] blur-[50px] pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-32 h-32 rounded-full bg-purple-500/[0.05] blur-[50px] pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />

        <div className="relative z-10 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 flex items-center justify-center shadow-lg shadow-cyan-500/10 border border-cyan-500/10">
                <BookOpen size={20} className="text-cyan-400" />
              </div>
              <div>
                <h1 className="font-heading font-extrabold text-[1.2rem] text-white tracking-tight">Notes</h1>
                <p className="text-[12px] text-white/30 font-medium">{notes.length} note{notes.length !== 1 ? 's' : ''} · {notes.reduce((sum, n) => sum + getWordCount(n.content), 0)} words</p>
              </div>
            </div>
            <button onClick={openCreate} className="btn-primary shrink-0">
              <Plus size={16} strokeWidth={2.5} />
              <span className="hidden sm:inline">New Note</span>
            </button>
          </div>

          {/* Search */}
          {notes.length > 3 && (
            <div className="relative">
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search notes..."
                className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-2.5 text-[12px] text-white placeholder-white/20 outline-none focus:border-cyan-500/30 transition-colors"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Hash size={12} className="text-white/15" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Notes Grid */}
      {filteredNotes.length === 0 ? (
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#111114] to-[#0d0d10]">
          <div className="flex flex-col items-center justify-center py-16">
            <div className="relative mb-4">
              <div className="absolute inset-0 w-16 h-16 rounded-full bg-cyan-500/10 blur-[20px] animate-pulse-soft" />
              <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center relative">
                <FileText size={28} className="text-white/10" />
              </div>
            </div>
            <p className="font-heading font-bold text-white/50 text-[15px] mb-1">
              {searchQuery ? 'No matching notes' : 'No notes yet'}
            </p>
            <p className="text-[13px] text-white/25 mb-5">
              {searchQuery ? 'Try a different search term' : 'Create notes to remember important things'}
            </p>
            {!searchQuery && (
              <button onClick={openCreate} className="btn-primary">
                <Plus size={16} strokeWidth={2.5} />
                Create Note
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4 stagger-children">
          {filteredNotes.map((n, i) => (
            <div
              key={n.id}
              onClick={() => navigate(`/notes/${n.id}`)}
              className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#111114] to-[#0d0d10] transition-all duration-300 hover:border-cyan-500/20 hover:shadow-xl hover:shadow-cyan-500/5 hover:-translate-y-0.5 cursor-pointer"
            >
              {/* Top accent gradient */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-500/30 via-purple-500/20 to-cyan-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Glow orb on hover */}
              <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-cyan-500/0 group-hover:bg-cyan-500/[0.04] blur-[30px] transition-all duration-500 pointer-events-none" />

              <div className="relative z-10 p-5">
                {/* Title row */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500/15 to-purple-500/10 flex items-center justify-center shrink-0 border border-cyan-500/10">
                      <FileText size={14} className="text-cyan-400/70" />
                    </div>
                    <h3 className="font-heading font-bold text-[13px] text-white/75 truncate leading-snug group-hover:text-white/90 transition-colors">{n.title}</h3>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button onClick={(e) => openEdit(n, e)} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-white/25 hover:text-cyan-400 transition-colors" title="Edit">
                      <Edit2 size={11} />
                    </button>
                    <button onClick={(e) => handleDelete(n.id, e)} disabled={deleting === n.id} className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/25 hover:text-red-400 transition-colors disabled:opacity-40" title="Delete">
                      {deleting === n.id ? <Loader2 size={11} className="animate-spin" /> : <Trash2 size={11} />}
                    </button>
                  </div>
                </div>

                {/* Content preview */}
                <p className="text-[12px] text-white/30 line-clamp-3 leading-relaxed mb-3 group-hover:text-white/40 transition-colors">
                  {getContentPreview(n.content)}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[10px] text-white/18 font-medium">
                    <Clock size={9} />
                    <span>{formatDate(n.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {n.content?.includes('```mermaid') && (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/15 text-[8px] font-bold text-purple-400/50">
                        <GitBranch size={7} /> DIAGRAM
                      </span>
                    )}
                    {n.isMarkdown && (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/15 text-[8px] font-bold text-purple-400/50">
                        <Star size={7} /> MD
                      </span>
                    )}
                    <span className="text-[9px] text-white/12">{getWordCount(n.content)}w</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Note' : 'New Note'}>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[11px] font-semibold text-white/40 mb-2 uppercase tracking-wider">Title</label>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="input-field" placeholder="Note title" required />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-white/40 mb-2 uppercase tracking-wider">Content</label>
            <textarea
              value={form.content}
              onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
              className="input-field min-h-[130px] resize-y"
              placeholder="Write your note here..."
              rows={5}
            />
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
