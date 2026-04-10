'use client'
import { nanoid } from 'nanoid'
import { useCVStore } from '@/store/cv-store'
import type { ExperienceData, ExperienceEntry, ExperienceDisplayMode } from '@/types/cv'

const inputCls = 'w-full rounded bg-zinc-800 border border-zinc-700 px-2 py-1.5 text-xs text-zinc-200 outline-none focus:border-indigo-500'
const labelCls = 'mb-1 block text-[10px] font-medium uppercase tracking-wider text-zinc-500'

interface Props { sectionId: string }

export function ExperienceForm({ sectionId }: Props) {
  const { cv, updateSection } = useCVStore()
  const section = cv?.sections.find(s => s.id === sectionId)
  if (!section) return null
  const data = section.data as ExperienceData

  const setMode = (displayMode: ExperienceDisplayMode) =>
    updateSection(sectionId, { data: { ...data, displayMode } })

  const updateEntry = (id: string, field: keyof ExperienceEntry, value: string | boolean) => {
    const entries = data.entries.map(e => e.id === id ? { ...e, [field]: value } : e)
    updateSection(sectionId, { data: { ...data, entries } })
  }

  const addEntry = () => {
    const entry: ExperienceEntry = { id: nanoid(), title: '', company: '', startDate: '', endDate: '', current: false, description: '' }
    updateSection(sectionId, { data: { ...data, entries: [...data.entries, entry] } })
  }

  const removeEntry = (id: string) =>
    updateSection(sectionId, { data: { ...data, entries: data.entries.filter(e => e.id !== id) } })

  return (
    <div className="flex flex-col gap-3">
      {/* Mode toggle */}
      <div>
        <label className={labelCls}>Estilo de visualización</label>
        <div className="flex rounded-md bg-zinc-800 p-0.5 gap-0.5">
          {(['list', 'timeline'] as ExperienceDisplayMode[]).map(mode => (
            <button key={mode} onClick={() => setMode(mode)}
              className={`flex-1 rounded py-1.5 text-xs transition-colors ${data.displayMode === mode ? 'bg-indigo-600 text-white font-semibold' : 'text-zinc-500 hover:text-zinc-300'}`}>
              {mode === 'list' ? '• Lista' : '⊢ Timeline'}
            </button>
          ))}
        </div>
      </div>

      {data.entries.map((entry) => (
        <div key={entry.id} className="relative rounded-lg border border-zinc-700 bg-zinc-800/50 p-3 flex flex-col gap-2">
          <button onClick={() => removeEntry(entry.id)} className="absolute right-2 top-2 text-zinc-600 hover:text-red-400 text-sm">×</button>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className={labelCls}>Cargo</label>
              <input className={inputCls} value={entry.title} onChange={e => updateEntry(entry.id, 'title', e.target.value)} />
            </div>
            <div className="flex-1">
              <label className={labelCls}>Empresa</label>
              <input className={inputCls} value={entry.company} onChange={e => updateEntry(entry.id, 'company', e.target.value)} />
            </div>
          </div>
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label className={labelCls}>Desde</label>
              <input className={inputCls} placeholder="Ene 2022" value={entry.startDate} onChange={e => updateEntry(entry.id, 'startDate', e.target.value)} />
            </div>
            <div className="flex-1">
              <label className={labelCls}>Hasta</label>
              <input className={inputCls} placeholder="Actual" value={entry.endDate} disabled={entry.current} onChange={e => updateEntry(entry.id, 'endDate', e.target.value)} />
            </div>
            <label className="flex items-center gap-1.5 text-[10px] text-zinc-400 mb-1.5 cursor-pointer">
              <input type="checkbox" checked={entry.current} onChange={e => updateEntry(entry.id, 'current', e.target.checked)} className="accent-indigo-500" />
              Actual
            </label>
          </div>
          <div>
            <label className={labelCls}>Descripción</label>
            <textarea rows={3} className={`${inputCls} resize-none leading-relaxed`} value={entry.description} onChange={e => updateEntry(entry.id, 'description', e.target.value)} />
          </div>
        </div>
      ))}

      <button onClick={addEntry} className="rounded-lg border border-dashed border-indigo-800 bg-indigo-950/30 py-2 text-xs text-indigo-400 hover:bg-indigo-950/60">
        + Agregar experiencia
      </button>
    </div>
  )
}
