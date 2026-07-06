import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Edit2, Trash2, Clock, FileText, GitBranch, Image, Loader2 } from 'lucide-react'
import { getNotes, updateNote, deleteNote } from '../api/notes'
import { Skeleton, SkeletonText } from '../components/Skeleton'
import MermaidRenderer, { renderContentWithDiagrams } from '../components/MermaidRenderer'
import ImageSearch from '../components/ImageSearch'

export default function NoteDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [note, setNote] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ title: '', content: '' })
  const [showImageSearch, setShowImageSearch] = useState(false)

  useEffect(() => {
    setLoading(true)
    getNotes().then(r => {
      const found = r.data.data.find(n => String(n.id) === String(id))
      if (found) {
        setNote(found)
        setForm({ title: found.title, content: found.content })
      }
    }).catch(console.error).finally(() => setLoading(false))
  }, [id])

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateNote(note.id, form)
      setNote({ ...note, ...form })
      setEditing(false)
    } catch (e) { console.error(e) }
    setSaving(false)
  }

  const handleInsertImage = (url) => {
    const imageMarkdown = `\n![diagram](${url})\n`
    setForm(f => ({ ...f, content: f.content + imageMarkdown }))
  }

  const handleDelete = async () => {
    if (!confirm('Delete this note?')) return
    setDeleting(true)
    await deleteNote(note.id)
    navigate('/notes')
  }

  const hasDiagrams = note?.content?.includes('```mermaid')

  if (loading) return <NoteDetailSkeleton />
  if (!note) return (
    <div className="flex items-center justify-center h-80">
      <div className="flex flex-col items-center gap-4 text-center">
        <p className="text-white/40 text-sm">Note not found.</p>
        <button onClick={() => navigate('/notes')} className="btn-primary">Back to Notes</button>
      </div>
    </div>
  )

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#111114] to-[#0d0d10]">
        <div className="absolute -top-16 -right-16 w-32 h-32 rounded-full bg-cyan-500/[0.05] blur-[50px] pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
        <div className="relative z-10 p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/notes')} className="p-2 rounded-xl hover:bg-white/[0.06] text-white/30 hover:text-white/60 transition-colors">
              <ArrowLeft size={18} />
            </button>
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 flex items-center justify-center shadow-lg shadow-cyan-500/10 border border-cyan-500/10">
              <FileText size={20} className="text-cyan-400" />
            </div>
            <div>
              <h1 className="font-heading font-extrabold text-[1.2rem] text-white tracking-tight">{note.title}</h1>
              <div className="flex items-center gap-2 text-[11px] text-white/20 font-medium">
                <Clock size={10} />
                {new Date(note.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
                {hasDiagrams && (
                  <>
                    <span className="text-white/10">·</span>
                    <span className="flex items-center gap-1 text-purple-400/50">
                      <GitBranch size={9} /> Has diagram
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setEditing(!editing)} className={`p-2 rounded-xl transition-colors ${editing ? 'bg-cyan-500/10 text-cyan-400' : 'hover:bg-white/[0.06] text-white/25 hover:text-white/50'}`}>
              <Edit2 size={15} />
            </button>
            <button onClick={handleDelete} disabled={deleting} className="p-2 rounded-xl hover:bg-red-500/10 text-white/25 hover:text-red-400 transition-colors disabled:opacity-40">
              {deleting ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#111114] to-[#0d0d10]">
        <div className="relative z-10 p-6">
          {editing ? (
            <div className="space-y-4">
              <input
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className="input-field text-lg font-heading font-bold"
                placeholder="Note title"
              />
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[11px] font-semibold text-white/40 uppercase tracking-wider">Content</label>
                  <button
                    type="button"
                    onClick={() => setShowImageSearch(true)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/15 text-[10px] font-semibold text-blue-400/70 hover:bg-blue-500/20 transition-colors"
                  >
                    <Image size={10} /> Insert Image
                  </button>
                </div>
                <textarea
                  value={form.content}
                  onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                  className="input-field min-h-[300px] resize-y font-mono text-[13px] leading-relaxed"
                  placeholder="Write your note here... Use ```mermaid code blocks for diagrams."
                />
                <p className="text-[10px] text-white/15 mt-1.5">Tip: Wrap mermaid code in ```mermaid ... ``` to render diagrams</p>
              </div>
              <div className="flex justify-end gap-3">
                <button onClick={() => { setEditing(false); setForm({ title: note.title, content: note.content }) }} className="btn-secondary" disabled={saving}>Cancel</button>
                <button onClick={handleSave} className="btn-primary" disabled={saving}>
                  {saving ? <Loader2 size={14} className="animate-spin" /> : null}
                  Save
                </button>
              </div>
            </div>
          ) : (
            <div className="prose prose-invert prose-sm max-w-none">
              <div className="text-white/50 text-[14px] leading-relaxed break-words" style={{ lineHeight: '1.8' }}>
                {renderContentWithDiagrams(note.content)}
              </div>
            </div>
          )}
        </div>
      </div>

      <ImageSearch open={showImageSearch} onClose={() => setShowImageSearch(false)} onSelect={handleInsertImage} />
    </div>
  )
}

function NoteDetailSkeleton() {
  return (
    <div className="space-y-5 animate-fade-in">
      <div className="rounded-2xl border border-white/[0.04] bg-white/[0.02] p-5 flex items-center gap-3">
        <Skeleton className="w-9 h-9 rounded-xl shrink-0" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
      <div className="rounded-2xl border border-white/[0.04] bg-white/[0.02] p-6 space-y-4">
        <Skeleton className="h-5 w-40" />
        <SkeletonText lines={6} />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  )
}
