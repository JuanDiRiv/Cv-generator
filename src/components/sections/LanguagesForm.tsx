'use client'
import { nanoid } from 'nanoid'
import { useCVStore } from '@/store/cv-store'
import type { LanguagesData, LanguageEntry } from '@/types/cv'

const inputCls = 'w-full rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-2.5 text-sm text-zinc-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-colors'
const labelCls = 'mb-1.5 block text-[10px] font-medium uppercase tracking-wider text-zinc-500'

interface Props { sectionId: string }

export function LanguagesForm({ sectionId }: Props) {
  const { cv, updateSection } = useCVStore()
  const section = cv?.sections.find(s => s.id === sectionId)
  if (!section) return null
  const data = section.data as LanguagesData

  const updateEntry = (id: string, field: keyof LanguageEntry, value: string) => {
    const entries = data.entries.map(e => e.id === id ? { ...e, [field]: value } : e)
    updateSection(sectionId, { data: { ...data, entries } })
  }
  const addEntry = () => {
    const entry: LanguageEntry = { id: nanoid(), language: '', level: '' }
    updateSection(sectionId, { data: { ...data, entries: [...data.entries, entry] } })
  }
  const removeEntry = (id: string) =>
    updateSection(sectionId, { data: { ...data, entries: data.entries.filter(e => e.id !== id) } })

  return (
    <div className="flex flex-col gap-3">
      {data.entries.map(entry => (
        <div key={entry.id} className="relative flex gap-2 rounded-lg border border-zinc-700 bg-zinc-800/50 p-3">
          <button onClick={() => removeEntry(entry.id)} className="absolute right-2 top-2 text-zinc-600 hover:text-red-400 text-sm">×</button>
          <div className="flex-1">
            <label className={labelCls}>Idioma</label>
            <input className={inputCls} placeholder="Español" value={entry.language} onChange={e => updateEntry(entry.id, 'language', e.target.value)} />
          </div>
          <div className="flex-1">
            <label className={labelCls}>Nivel</label>
            <input className={inputCls} placeholder="Nativo / B2 / C1" value={entry.level} onChange={e => updateEntry(entry.id, 'level', e.target.value)} />
          </div>
        </div>
      ))}
      <button onClick={addEntry} className="rounded-lg border border-dashed border-indigo-800 bg-indigo-950/30 py-2 text-xs text-indigo-400 hover:bg-indigo-950/60">
        + Agregar idioma
      </button>
    </div>
  )
}
