import { useState } from 'react'
import { Search, X, Image, Download, Loader2, ExternalLink } from 'lucide-react'

export default function ImageSearch({ open, onClose, onSelect }) {
  const [query, setQuery] = useState('')
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedTab, setSelectedTab] = useState('search')

  const searchImages = async () => {
    if (!query.trim()) return
    setLoading(true)
    setImages([])
    try {
      // Use Wikipedia/Wikimedia for reliable free images
      const searchRes = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`,
        { signal: AbortSignal.timeout(5000) }
      )
      const results = []

      if (searchRes.ok) {
        const data = await searchRes.json()
        if (data.thumbnail?.source) {
          results.push({
            url: data.thumbnail.source,
            title: data.title,
            source: 'Wikipedia',
            desc: data.extract?.substring(0, 100) || ''
          })
        }
      }

      // Also search for images on Wikimedia Commons
      const commonsRes = await fetch(
        `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query + ' diagram')}&srnamespace=6&srlimit=10&format=json&origin=*`,
        { signal: AbortSignal.timeout(5000) }
      )
      if (commonsRes.ok) {
        const data = await commonsRes.json()
        const items = data.query?.search || []
        for (const item of items) {
          const title = item.title.replace('File:', '')
          if (title.match(/\.(png|jpg|jpeg|gif|svg)$/i)) {
            const imgUrl = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(title)}`
            results.push({
              url: imgUrl,
              title: title.replace(/\.(png|jpg|jpeg|gif|svg)$/i, ''),
              source: 'Wikimedia Commons',
              desc: item.snippet?.replace(/<[^>]*>/g, '') || ''
            })
          }
        }
      }

      setImages(results)
    } catch (err) {
      console.error('Image search failed:', err)
      setImages([])
    } finally {
      setLoading(false)
    }
  }

  const handleSelect = (url) => {
    onSelect(url)
    onClose()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') searchImages()
  }

  const QUICK_SEARCHES = [
    'Database Management System',
    'Binary Tree',
    'Linked List',
    'Sorting Algorithm',
    'Network Topology',
    'ER Diagram',
    'Class Diagram',
    'OS Scheduling',
    'TCP IP Model',
    'Relational Model',
  ]

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-2xl rounded-2xl border border-white/[0.08] bg-[#111114] shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Image size={16} className="text-blue-400" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-[14px] text-white/70">Insert Diagram</h3>
              <p className="text-[10px] text-white/25">Search Wikipedia & Wikimedia Commons</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/[0.06] text-white/30 hover:text-white/60 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Search */}
        <div className="px-5 py-3 border-b border-white/[0.04]">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g. Binary Tree, ER Diagram, TCP/IP Model..."
                className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl pl-9 pr-4 py-2.5 text-[12px] text-white placeholder-white/20 outline-none focus:border-blue-500/30 transition-colors"
                autoFocus
              />
            </div>
            <button
              onClick={searchImages}
              disabled={loading || !query.trim()}
              className="px-4 py-2.5 rounded-xl bg-blue-500/20 border border-blue-500/20 text-blue-400 text-[12px] font-semibold hover:bg-blue-500/30 transition-colors disabled:opacity-40"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : 'Search'}
            </button>
          </div>

          {/* Quick search chips */}
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {QUICK_SEARCHES.map(s => (
              <button
                key={s}
                onClick={() => { setQuery(s); }}
                className="px-2 py-0.5 rounded-md bg-white/[0.03] border border-white/[0.05] text-[9px] text-white/30 hover:text-white/50 hover:bg-white/[0.06] transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="flex gap-1 items-center mb-3">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <p className="text-[11px] text-white/25">Searching for diagrams...</p>
            </div>
          ) : images.length > 0 ? (
            <div className="space-y-2">
              {images.map((img, i) => (
                <div
                  key={i}
                  className="group flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] cursor-pointer hover:bg-blue-500/[0.04] hover:border-blue-500/15 transition-all"
                  onClick={() => handleSelect(img.url)}
                >
                  <div className="w-20 h-16 rounded-lg overflow-hidden bg-white/[0.04] shrink-0 flex items-center justify-center">
                    <img
                      src={img.url}
                      alt={img.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={e => { e.target.style.display = 'none' }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-white/60 truncate">{img.title}</p>
                    <p className="text-[10px] text-white/25 truncate mt-0.5">{img.desc}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[8px] text-blue-400/40 font-medium">{img.source}</span>
                    </div>
                  </div>
                  <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="px-2.5 py-1 rounded-lg bg-blue-500 text-white text-[10px] font-bold flex items-center gap-1">
                      <Download size={10} /> Insert
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : query ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Image size={32} className="text-white/10 mb-3" />
              <p className="text-[13px] text-white/30">No diagrams found</p>
              <p className="text-[11px] text-white/20 mt-1">Try different keywords or paste a URL below</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <Image size={32} className="text-white/10 mb-3" />
              <p className="text-[13px] text-white/30">Search for diagrams</p>
              <p className="text-[11px] text-white/20 mt-1">Try "binary tree", "ER diagram", "OS scheduling"</p>
            </div>
          )}
        </div>

        {/* URL input */}
        <div className="px-5 py-3 border-t border-white/[0.06] bg-white/[0.01]">
          <p className="text-[10px] text-white/20 mb-2">Or paste an image URL directly:</p>
          <div className="flex gap-2">
            <input
              id="image-url-input"
              placeholder="https://example.com/diagram.png"
              className="flex-1 bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2 text-[11px] text-white placeholder-white/15 outline-none focus:border-blue-500/30"
              onKeyDown={e => { if (e.key === 'Enter' && e.target.value) handleSelect(e.target.value) }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
