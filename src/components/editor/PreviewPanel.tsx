'use client'
import { useRef, useState, useLayoutEffect } from 'react'
import { useCVStore } from '@/store/cv-store'
import { templates } from '@/components/templates'
import type { TemplateId } from '@/types/cv'

const A4_WIDTH_PX = 794 // 210mm at 96dpi

const ACCENT_COLORS = ['#6366f1', '#e94560', '#2d6a4f', '#c9a96e', '#0ea5e9']
const TEMPLATE_IDS: TemplateId[] = ['budapest', 'minimal', 'modern', 'executive']

export function PreviewPanel() {
  const { cv, updateField } = useCVStore()
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.9)

  useLayoutEffect(() => {
    const el = containerRef.current
    if (!el) return
    const update = () => {
      const available = el.clientWidth - 48 // 24px padding each side
      setScale(Math.min(available / A4_WIDTH_PX, 1))
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  if (!cv) return null

  const Template = templates[cv.template]

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-shrink-0 items-center gap-3 border-b border-zinc-800 px-4 py-2">
        <span className="text-xs text-zinc-500">Plantilla</span>
        <div className="flex gap-1">
          {TEMPLATE_IDS.map((id) => (
            <button
              key={id}
              onClick={() => updateField('template', id)}
              className={`rounded px-2.5 py-1 text-xs capitalize transition-colors border ${
                cv.template === id
                  ? 'bg-indigo-600 border-indigo-600 text-white'
                  : 'border-zinc-700 text-zinc-400 hover:border-zinc-500'
              }`}
            >{id}</button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          {ACCENT_COLORS.map((color) => (
            <button
              key={color}
              onClick={() => updateField('accentColor', color)}
              className={`h-5 w-5 rounded-full border-2 transition-transform ${
                cv.accentColor === color ? 'border-white scale-110' : 'border-transparent'
              }`}
              style={{ background: color }}
            />
          ))}
        </div>
      </div>

      {/* A4 preview — scales to fill available width */}
      <div ref={containerRef} className="flex-1 overflow-auto bg-zinc-800 p-6">
        <div
          className="shadow-2xl mx-auto"
          style={{
            width: A4_WIDTH_PX,
            transformOrigin: 'top left',
            transform: `scale(${scale})`,
            marginBottom: `calc((${scale} - 1) * 100%)`,
          }}
        >
          <Template cv={cv} />
        </div>
      </div>
    </div>
  )
}
