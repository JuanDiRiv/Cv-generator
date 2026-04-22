'use client'
import { useCVStore } from '@/store/cv-store'
import { AutoTextarea } from '@/components/ui/AutoTextarea'
import type { AboutData } from '@/types/cv'

interface Props { sectionId: string }

export function AboutForm({ sectionId }: Props) {
  const { cv, updateSection } = useCVStore()
  const section = cv?.sections.find(s => s.id === sectionId)
  if (!section) return null
  const data = section.data as AboutData

  const count = data.summary?.length ?? 0

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
          Resumen profesional
        </label>
        <span className="text-[10px] tabular-nums text-zinc-600">{count} caracteres</span>
      </div>
      <AutoTextarea
        minRows={4}
        placeholder="Cuenta en 2-4 frases quién eres, qué haces y qué te diferencia."
        className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-200 outline-none transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30"
        value={data.summary}
        onChange={e => updateSection(sectionId, { data: { summary: e.target.value } })}
      />
    </div>
  )
}
