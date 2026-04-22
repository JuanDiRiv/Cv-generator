'use client'
import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, ChevronDown, User, FileText, Briefcase, Sparkles, GraduationCap, Languages } from 'lucide-react'
import type { CVSection, SectionType } from '@/types/cv'

interface Props {
  section: CVSection
  children: React.ReactNode
}

const sectionIcon: Record<SectionType, React.ComponentType<{ size?: number; className?: string }>> = {
  contact: User,
  about: FileText,
  experience: Briefcase,
  skills: Sparkles,
  education: GraduationCap,
  languages: Languages,
}

const sectionAccent: Record<SectionType, string> = {
  contact: 'text-sky-300 bg-sky-500/10 ring-sky-500/20',
  about: 'text-amber-300 bg-amber-500/10 ring-amber-500/20',
  experience: 'text-indigo-300 bg-indigo-500/10 ring-indigo-500/20',
  skills: 'text-fuchsia-300 bg-fuchsia-500/10 ring-fuchsia-500/20',
  education: 'text-emerald-300 bg-emerald-500/10 ring-emerald-500/20',
  languages: 'text-rose-300 bg-rose-500/10 ring-rose-500/20',
}

export function SectionCard({ section, children }: Props) {
  const [open, setOpen] = useState(false)
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 10 : undefined,
  }

  const Icon = sectionIcon[section.type]
  const accent = sectionAccent[section.type]

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group rounded-xl border bg-zinc-900/70 backdrop-blur transition-colors overflow-hidden ${open ? 'border-zinc-700 shadow-lg shadow-black/20' : 'border-zinc-800 hover:border-zinc-700'
        } ${isDragging ? 'ring-2 ring-indigo-500/50' : ''}`}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left"
      >
        <span
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
          className="flex h-7 w-5 shrink-0 cursor-grab items-center justify-center text-zinc-600 opacity-0 transition-opacity group-hover:opacity-100 hover:text-zinc-300 active:cursor-grabbing"
          aria-label="Reordenar sección"
        >
          <GripVertical size={14} />
        </span>
        <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ring-1 ${accent}`}>
          <Icon size={14} />
        </span>
        <span className="flex-1 text-sm font-semibold text-zinc-100">{section.title}</span>
        <ChevronDown
          size={16}
          className={`text-zinc-500 transition-transform duration-200 ${open ? 'rotate-180 text-zinc-300' : ''}`}
        />
      </button>
      {open && (
        <div className="border-t border-zinc-800/80 bg-zinc-950/40 px-3 pb-3 pt-3">
          {children}
        </div>
      )}
    </div>
  )
}
