import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, FolderKanban, Hash, ArrowUpRight } from 'lucide-react'
import { getCategories, createCategory, updateCategory, deleteCategory } from '../api/categories'
import Modal from '../components/Modal'
import { CategoryCardSkeleton } from '../components/Skeleton'

export default function Categories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', color: '#F97316' })

  const fetch = () => getCategories().then(r => setCategories(r.data.data)).catch(console.error).finally(() => setLoading(false))

  useEffect(() => { fetch() }, [])

  const openCreate = () => { setEditing(null); setForm({ name: '', color: '#F97316' }); setShowModal(true) }
  const openEdit = (c) => { setEditing(c); setForm({ name: c.name, color: c.color || '#F97316' }); setShowModal(true) }

  const handleSubmit = async e => {
    e.preventDefault()
    try {
      if (editing) await updateCategory(editing.id, form)
      else await createCategory(form)
      setShowModal(false)
      fetch()
    } catch (err) { console.error(err) }
  }

  const handleDelete = async id => {
    if (!confirm('Delete this category?')) return
    await deleteCategory(id)
    fetch()
  }

  if (loading) return <CategoryCardSkeleton />

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#111114] to-[#0d0d10]">
        <div className="absolute -top-16 -right-16 w-32 h-32 rounded-full bg-purple-500/[0.05] blur-[50px] pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />

        <div className="relative z-10 p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 flex items-center justify-center shadow-lg shadow-purple-500/10 border border-purple-500/10">
              <FolderKanban size={20} className="text-purple-400" />
            </div>
            <div>
              <h1 className="font-heading font-extrabold text-[1.2rem] text-white tracking-tight">Categories</h1>
              <p className="text-[12px] text-white/30 font-medium">{categories.length} categor{categories.length !== 1 ? 'ies' : 'y'}</p>
            </div>
          </div>
          <button onClick={openCreate} className="btn-primary shrink-0">
            <Plus size={16} strokeWidth={2.5} />
            <span className="hidden sm:inline">New Category</span>
          </button>
        </div>
      </div>

      {/* Grid */}
      {categories.length === 0 ? (
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#111114] to-[#0d0d10]">
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.03] flex items-center justify-center mb-4">
              <FolderKanban size={28} className="text-white/10" />
            </div>
            <p className="font-heading font-bold text-white/50 text-[15px] mb-1">No categories</p>
            <p className="text-[13px] text-white/25 mb-5">Create categories to organize your tasks</p>
            <button onClick={openCreate} className="btn-primary">
              <Plus size={16} strokeWidth={2.5} />
              Create Category
            </button>
          </div>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4 stagger-children">
          {categories.map(c => (
            <div key={c.id} className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#111114] to-[#0d0d10] transition-all duration-300 hover:border-white/[0.1] hover:shadow-xl hover:-translate-y-0.5 cursor-default">
              {/* Top accent line */}
              <div className="absolute top-0 left-0 right-0 h-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: `linear-gradient(90deg, transparent, ${c.color || '#F97316'}50, transparent)` }} />

              {/* Background glow */}
              <div className="absolute -top-12 -right-12 w-24 h-24 rounded-full blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: `${c.color || '#F97316'}10` }} />

              <div className="relative z-10 p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110" style={{ backgroundColor: `${c.color || '#F97316'}12` }}>
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: c.color || '#F97316', boxShadow: `0 0 12px ${c.color || '#F97316'}30` }} />
                    </div>
                    <div>
                      <p className="font-heading font-bold text-[14px] text-white/70 truncate">{c.name}</p>
                      <p className="text-[11px] text-white/25 font-medium mt-0.5">{c.taskCount || 0} task{(c.taskCount || 0) !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(c)} className="p-2 rounded-lg hover:bg-white/[0.06] text-white/25 hover:text-white/50 transition-colors">
                      <Edit2 size={13} />
                    </button>
                    <button onClick={() => handleDelete(c.id)} className="p-2 rounded-lg hover:bg-red-500/10 text-white/25 hover:text-red-400 transition-colors">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Category' : 'New Category'}>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[11px] font-semibold text-white/40 mb-2 uppercase tracking-wider">Name</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input-field" placeholder="Category name" required />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-white/40 mb-2 uppercase tracking-wider">Color</label>
            <div className="flex items-center gap-3">
              <input type="color" value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} className="w-10 h-10 rounded-xl cursor-pointer border-2 border-white/[0.08] hover:border-white/[0.15] transition-colors" />
              <span className="text-[13px] text-white/30 font-mono">{form.color}</span>
              <div className="ml-auto w-8 h-8 rounded-xl" style={{ backgroundColor: `${form.color}20`, border: `2px solid ${form.color}` }} />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">{editing ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
