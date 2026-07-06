import { useEffect, useRef, useState } from 'react'
import mermaid from 'mermaid'

mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  themeVariables: {
    primaryColor: '#F97316',
    primaryTextColor: '#fff',
    primaryBorderColor: '#F9731650',
    lineColor: '#F9731660',
    secondaryColor: '#1a1a1e',
    tertiaryColor: '#111114',
    fontFamily: 'inherit',
    fontSize: '12px',
  },
  flowchart: { curve: 'basis', padding: 15 },
  sequence: { mirrorActors: false },
})

let mermaidCounter = 0

export default function MermaidRenderer({ code, className = '' }) {
  const ref = useRef(null)
  const [svg, setSvg] = useState('')
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!code?.trim()) return
    let cancelled = false
    const id = `mermaid-${++mermaidCounter}`

    mermaid.render(id, code.trim()).then(({ svg: rendered }) => {
      if (!cancelled) {
        setSvg(rendered)
        setError(null)
      }
    }).catch(err => {
      if (!cancelled) {
        setError(err.message || 'Failed to render diagram')
        setSvg('')
      }
    })

    return () => { cancelled = true }
  }, [code])

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/15 bg-red-500/[0.03] p-4 my-2">
        <p className="text-[11px] text-red-400/70 font-medium mb-1">Diagram Error</p>
        <p className="text-[10px] text-red-400/40 font-mono">{error}</p>
      </div>
    )
  }

  if (!svg) {
    return (
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 my-2 flex items-center justify-center">
        <div className="flex gap-1 items-center">
          <div className="w-1.5 h-1.5 bg-[#F97316] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-1.5 h-1.5 bg-[#F97316] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-1.5 h-1.5 bg-[#F97316] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    )
  }

  return (
    <div className={`rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 my-2 overflow-x-auto ${className}`}>
      <div ref={ref} className="mermaid-diagram [&>svg]:max-w-full [&>svg]:h-auto" dangerouslySetInnerHTML={{ __html: svg }} />
    </div>
  )
}

export function extractMermaidBlocks(content) {
  if (!content) return []
  const blocks = []
  const regex = /```mermaid\s*\n([\s\S]*?)```/g
  let match
  while ((match = regex.exec(content)) !== null) {
    blocks.push({ index: match.index, code: match[1].trim(), fullMatch: match[0] })
  }
  return blocks
}

export function renderContentWithDiagrams(content, navigate) {
  if (!content) return null
  const parts = []
  const lines = content.split('\n')
  let inMermaid = false
  let mermaidCode = []
  let key = 0

  for (const line of lines) {
    if (line.trim() === '```mermaid' && !inMermaid) {
      inMermaid = true
      mermaidCode = []
      continue
    }
    if (line.trim() === '```' && inMermaid) {
      inMermaid = false
      parts.push(<MermaidRenderer key={key++} code={mermaidCode.join('\n')} />)
      continue
    }
    if (inMermaid) {
      mermaidCode.push(line)
      continue
    }

    const trimmed = line.trim()
    if (!trimmed) { parts.push(<div key={key++} className="h-2" />); continue }
    if (trimmed.startsWith('## ')) { parts.push(<h2 key={key++} className="text-white/80 font-heading font-bold text-lg mt-6 mb-3">{trimmed.replace('## ', '')}</h2>); continue }
    if (trimmed.startsWith('### ')) { parts.push(<h3 key={key++} className="text-white/70 font-heading font-semibold text-base mt-4 mb-2">{trimmed.replace('### ', '')}</h3>); continue }
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) { parts.push(<div key={key++} className="flex gap-2 ml-4 my-1"><span className="text-cyan-400/50 mt-0.5">•</span><span>{trimmed.replace(/^[-*]\s*/, '')}</span></div>); continue }
    if (trimmed.startsWith('**') && trimmed.endsWith('**')) { parts.push(<p key={key++} className="font-bold text-white/70 mt-3 mb-1">{trimmed.replace(/\*\*/g, '')}</p>); continue }

    // Image: ![alt](url) or plain image URL
    const imgMatch = trimmed.match(/^!\[.*?\]\((.+?)\)$/)
    const isImageUrl = /\.(png|jpg|jpeg|gif|svg|webp)(\?.*)?$/i.test(trimmed) && trimmed.startsWith('http')
    if (imgMatch || isImageUrl) {
      const url = imgMatch ? imgMatch[1] : trimmed
      parts.push(
        <div key={key++} className="my-3 rounded-xl overflow-hidden border border-white/[0.06] bg-white/[0.02] group/img hover:border-blue-500/20 transition-colors">
          <img
            src={url}
            alt="diagram"
            className="w-full h-auto max-h-[400px] object-contain"
            loading="lazy"
            onError={e => {
              e.target.onerror = null
              e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60"><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23666" font-size="12">Image not found</text></svg>'
            }}
          />
        </div>
      )
      continue
    }

    parts.push(<p key={key++} className="my-1">{trimmed}</p>)
  }

  return parts
}
