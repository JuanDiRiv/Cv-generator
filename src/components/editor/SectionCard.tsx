'use client'
import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { CVSection } from '@/types/cv'

interface Props {
  section: CVSection
  children: React.ReactNode
}

export function SectionCard({ section, children }: Props) {
  const [open, setOpen] = useState(false)
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className="rounded-lg border border-zinc-800 bg-zinc-900 overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2.5 cursor-pointer" onClick={() => setOpen((o) => !o)}>
        <span
          {...attributes} {...listeners}
          onClick={(e) => e.stopPropagation()}
          className="cursor-grab text-zinc-600 hover:text-zinc-400 select-none"
        >⠿</span>
        <span className="flex-1 text-xs font-semibold text-zinc-300">{section.title}</span>
        <span className={`text-zinc-500 text-sm transition-transform ${open ? 'rotate-180' : ''}`}>⌄</span>
      </div>
      {open && (
        <div className="border-t border-zinc-800 px-3 pb-3 pt-2.5">
          {children}
        </div>
      )}
    </div>
  )
}
