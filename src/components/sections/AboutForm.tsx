'use client'
import { useCVStore } from '@/store/cv-store'
import type { AboutData } from '@/types/cv'

interface Props { sectionId: string }

export function AboutForm({ sectionId }: Props) {
  const { cv, updateSection } = useCVStore()
  const section = cv?.sections.find(s => s.id === sectionId)
  if (!section) return null
  const data = section.data as AboutData

  return (
    <div>
      <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-wider text-zinc-500">Resumen profesional</label>
      <textarea
        rows={5}
        className="w-full rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-2.5 text-sm text-zinc-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-colors resize-none leading-relaxed"
        value={data.summary}
        onChange={e => updateSection(sectionId, { data: { summary: e.target.value } })}
      />
    </div>
  )
}
