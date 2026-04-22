'use client'
import { nanoid } from 'nanoid'
import { Trash2, Plus } from 'lucide-react'
import { useCVStore } from '@/store/cv-store'
import type { EducationData, EducationEntry } from '@/types/cv'

const inputCls = 'w-full rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-2.5 text-sm text-zinc-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-colors'
const labelCls = 'mb-1.5 block text-[10px] font-medium uppercase tracking-wider text-zinc-500'

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
      {data.entries.map((entry, idx) => {
        const headerTitle = entry.degree || entry.institution || `Educación ${idx + 1}`
        return (
          <div key={entry.id} className="group/entry relative flex flex-col gap-2 rounded-xl border border-zinc-700/80 bg-zinc-900/60 p-3 transition-colors hover:border-zinc-600">
            <div className="flex items-start justify-between gap-2">
              <p className="truncate text-xs font-semibold text-zinc-200">{headerTitle}</p>
              <button
                onClick={() => removeEntry(entry.id)}
                className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-500 opacity-0 transition-all hover:bg-red-500/10 hover:text-red-400 group-hover/entry:opacity-100"
                aria-label="Eliminar educación"
              >
                <Trash2 size={13} />
              </button>
            </div>
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
        )
      })}
      <button onClick={addEntry} className="flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-indigo-700/60 bg-indigo-950/30 py-2.5 text-xs font-medium text-indigo-300 transition-colors hover:border-indigo-500 hover:bg-indigo-950/60">
        <Plus size={14} /> Agregar educación
      </button>
    </div>
  )
}
