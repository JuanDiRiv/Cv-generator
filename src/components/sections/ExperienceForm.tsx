'use client'
import { nanoid } from 'nanoid'
import { Trash2, Plus, List, GitBranch } from 'lucide-react'
import { useCVStore } from '@/store/cv-store'
import { AutoTextarea } from '@/components/ui/AutoTextarea'
import type { ExperienceData, ExperienceEntry, ExperienceDisplayMode } from '@/types/cv'

const inputCls = 'w-full rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-2.5 text-sm text-zinc-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-colors'
const labelCls = 'mb-1.5 block text-[10px] font-medium uppercase tracking-wider text-zinc-500'

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
    const entry: ExperienceEntry = {
      id: nanoid(), title: '', company: '', location: '',
      startDate: '', endDate: '', current: false, description: '',
    }
    updateSection(sectionId, { data: { ...data, entries: [...data.entries, entry] } })
  }

  const removeEntry = (id: string) =>
    updateSection(sectionId, { data: { ...data, entries: data.entries.filter(e => e.id !== id) } })

  return (
    <div className="flex flex-col gap-3">
      {/* Mode toggle */}
      <div>
        <label className={labelCls}>Estilo de visualización</label>
        <div className="flex gap-0.5 rounded-lg bg-zinc-800/80 p-0.5">
          {(['list', 'timeline'] as ExperienceDisplayMode[]).map(mode => {
            const Icon = mode === 'list' ? List : GitBranch
            const active = data.displayMode === mode
            return (
              <button key={mode} onClick={() => setMode(mode)}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-xs transition-colors ${active ? 'bg-indigo-600 text-white font-semibold shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
                  }`}>
                <Icon size={12} />
                {mode === 'list' ? 'Lista' : 'Timeline'}
              </button>
            )
          })}
        </div>
      </div>

      {data.entries.map((entry, idx) => {
        const headerTitle = entry.title || entry.company || `Experiencia ${idx + 1}`
        const headerSub = [entry.company, entry.location].filter(Boolean).join(' · ')
        return (
          <div key={entry.id} className="group/entry relative flex flex-col gap-3 rounded-xl border border-zinc-700/80 bg-zinc-900/60 p-3 shadow-sm transition-colors hover:border-zinc-600">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-zinc-200">{headerTitle}</p>
                {headerSub && <p className="truncate text-[10px] text-zinc-500">{headerSub}</p>}
              </div>
              <button
                onClick={() => removeEntry(entry.id)}
                className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-500 opacity-0 transition-all hover:bg-red-500/10 hover:text-red-400 group-hover/entry:opacity-100"
                aria-label="Eliminar experiencia"
              >
                <Trash2 size={13} />
              </button>
            </div>
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
            <div>
              <label className={labelCls}>Ubicación</label>
              <input className={inputCls} placeholder="Madrid, España · Remoto" value={entry.location ?? ''} onChange={e => updateEntry(entry.id, 'location', e.target.value)} />
            </div>
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <label className={labelCls}>Desde</label>
                <input className={inputCls} placeholder="Ene 2022" value={entry.startDate} onChange={e => updateEntry(entry.id, 'startDate', e.target.value)} />
              </div>
              <div className="flex-1">
                <label className={labelCls}>Hasta</label>
                <input className={inputCls} placeholder="Actual" value={entry.endDate} disabled={entry.current} onChange={e => updateEntry(entry.id, 'endDate', e.target.value)} />
              </div>
              <label className="mb-1.5 flex cursor-pointer items-center gap-1.5 rounded-md border border-zinc-700 bg-zinc-800/60 px-2 py-1.5 text-[10px] text-zinc-300 hover:border-zinc-600">
                <input type="checkbox" checked={entry.current} onChange={e => updateEntry(entry.id, 'current', e.target.checked)} className="accent-indigo-500" />
                Actual
              </label>
            </div>
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">Descripción</label>
                <span className="text-[10px] tabular-nums text-zinc-600">{(entry.description ?? '').length} caracteres</span>
              </div>
              <AutoTextarea
                minRows={3}
                placeholder="• Logros medibles, tecnologías, impacto en negocio..."
                className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-200 outline-none transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30"
                value={entry.description}
                onChange={e => updateEntry(entry.id, 'description', e.target.value)}
              />
            </div>
          </div>
        )
      })}

      <button onClick={addEntry} className="flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-indigo-700/60 bg-indigo-950/30 py-2.5 text-xs font-medium text-indigo-300 transition-colors hover:border-indigo-500 hover:bg-indigo-950/60">
        <Plus size={14} /> Agregar experiencia
      </button>
    </div>
  )
}
