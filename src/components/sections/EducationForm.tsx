'use client'
import { nanoid } from 'nanoid'
import { useCVStore } from '@/store/cv-store'
import type { EducationData, EducationEntry } from '@/types/cv'

const inputCls = 'w-full rounded bg-zinc-800 border border-zinc-700 px-2 py-1.5 text-xs text-zinc-200 outline-none focus:border-indigo-500'
const labelCls = 'mb-1 block text-[10px] font-medium uppercase tracking-wider text-zinc-500'

interface Props { sectionId: string }

export function EducationForm({ sectionId }: Props) {
  const { cv, updateSection } = useCVStore()
  const section = cv?.sections.find(s => s.id === sectionId)
  if (!section) return null
  const data = section.data as EducationData

  const updateEntry = (id: string, field: keyof EducationEntry, value: string) => {
    const entries = data.entries.map(e => e.id === id ? { ...e, [field]: value } : e)
    updateSection(sectionId, { data: { ...data, entries } })
  }
  const addEntry = () => {
    const entry: EducationEntry = { id: nanoid(), degree: '', institution: '', startDate: '', endDate: '' }
    updateSection(sectionId, { data: { ...data, entries: [...data.entries, entry] } })
  }
  const removeEntry = (id: string) =>
    updateSection(sectionId, { data: { ...data, entries: data.entries.filter(e => e.id !== id) } })

  return (
    <div className="flex flex-col gap-3">
      {data.entries.map(entry => (
        <div key={entry.id} className="relative rounded-lg border border-zinc-700 bg-zinc-800/50 p-3 flex flex-col gap-2">
          <button onClick={() => removeEntry(entry.id)} className="absolute right-2 top-2 text-zinc-600 hover:text-red-400 text-sm">×</button>
          <div>
            <label className={labelCls}>Título / Carrera</label>
            <input className={inputCls} value={entry.degree} onChange={e => updateEntry(entry.id, 'degree', e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Institución</label>
            <input className={inputCls} value={entry.institution} onChange={e => updateEntry(entry.id, 'institution', e.target.value)} />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className={labelCls}>Desde</label>
              <input className={inputCls} value={entry.startDate} onChange={e => updateEntry(entry.id, 'startDate', e.target.value)} />
            </div>
            <div className="flex-1">
              <label className={labelCls}>Hasta</label>
              <input className={inputCls} value={entry.endDate} onChange={e => updateEntry(entry.id, 'endDate', e.target.value)} />
            </div>
          </div>
        </div>
      ))}
      <button onClick={addEntry} className="rounded-lg border border-dashed border-indigo-800 bg-indigo-950/30 py-2 text-xs text-indigo-400 hover:bg-indigo-950/60">
        + Agregar educación
      </button>
    </div>
  )
}
