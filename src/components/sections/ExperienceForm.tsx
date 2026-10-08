'use client'
import { useState } from 'react'
import { nanoid } from 'nanoid'
import { Trash2, Plus, List, GitBranch, GripVertical, ChevronDown } from 'lucide-react'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, arrayMove, sortableKeyboardCoordinates, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useCVStore } from '@/store/cv-store'
import { AIRewriteTextarea } from '@/components/ui/AIRewriteTextarea'
import type { ExperienceData, ExperienceEntry, ExperienceDisplayMode } from '@/types/cv'

const inputCls = 'w-full rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-2.5 text-sm text-zinc-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-colors'
const labelCls = 'mb-1.5 block text-[10px] font-medium uppercase tracking-wider text-zinc-500'

interface Props { sectionId: string }

interface SortableEntryCardProps {
  id: string
  title: string
  subtitle: string
  dates: string
  open: boolean
  onToggle: () => void
  onRemove: () => void
  children: React.ReactNode
}

function SortableEntryCard({ id, title, subtitle, dates, open, onToggle, onRemove, children }: SortableEntryCardProps) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group/entry relative flex flex-col rounded-xl border bg-zinc-900/60 p-3 shadow-sm transition-colors ${isDragging ? 'border-indigo-500/60 ring-2 ring-indigo-500/40' : 'border-zinc-700/80 hover:border-zinc-600'}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-start gap-1.5">
          <button
            type="button"
            ref={setActivatorNodeRef}
            {...attributes}
            {...listeners}
            className="-ml-1 flex h-7 w-5 shrink-0 cursor-grab touch-none items-center justify-center rounded text-zinc-600 transition-colors hover:text-zinc-300 active:cursor-grabbing"
            aria-label="Reordenar experiencia"
          >
            <GripVertical size={14} />
          </button>
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={open}
            className="min-w-0 flex-1 text-left"
          >
            <p className="truncate text-xs font-semibold text-zinc-200">{title}</p>
            {subtitle && <p className="truncate text-[10px] text-zinc-500">{subtitle}</p>}
            {!open && dates && <p className="truncate text-[10px] text-zinc-600">{dates}</p>}
          </button>
        </div>
        <div className="flex shrink-0 items-center">
          <button
            onClick={onRemove}
            className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-500 opacity-0 transition-all hover:bg-red-500/10 hover:text-red-400 group-hover/entry:opacity-100"
            aria-label="Eliminar experiencia"
          >
            <Trash2 size={13} />
          </button>
          <button
            type="button"
            onClick={onToggle}
            className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-500 transition-colors hover:text-zinc-300"
            aria-label={open ? 'Contraer experiencia' : 'Expandir experiencia'}
          >
            <ChevronDown size={14} className={`transition-transform duration-200 ${open ? 'rotate-180 text-zinc-300' : ''}`} />
          </button>
        </div>
      </div>
      {open && <div className="mt-3 flex flex-col gap-3">{children}</div>}
    </div>
  )
}

export function ExperienceForm({ sectionId }: Props) {
  const { cv, updateSection } = useCVStore()
  const [openIds, setOpenIds] = useState<Set<string>>(() => new Set())
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )
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
    updateSection(sectionId, { data: { ...data, entries: [entry, ...data.entries] } })
    setOpenIds(prev => new Set(prev).add(entry.id))
  }

  const toggleEntry = (id: string) =>
    setOpenIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const removeEntry = (id: string) =>
    updateSection(sectionId, { data: { ...data, entries: data.entries.filter(e => e.id !== id) } })

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return
    const oldIndex = data.entries.findIndex(e => e.id === active.id)
    const newIndex = data.entries.findIndex(e => e.id === over.id)
    if (oldIndex < 0 || newIndex < 0) return
    updateSection(sectionId, { data: { ...data, entries: arrayMove(data.entries, oldIndex, newIndex) } })
  }

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

      <button onClick={addEntry} className="flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-indigo-700/60 bg-indigo-950/30 py-2.5 text-xs font-medium text-indigo-300 transition-colors hover:border-indigo-500 hover:bg-indigo-950/60">
        <Plus size={14} /> Agregar experiencia
      </button>

      {data.entries.length > 1 && (
        <p className="text-[10px] text-zinc-500">Arrastra desde <GripVertical size={10} className="inline -mt-0.5" /> para reordenar las experiencias en el CV.</p>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={data.entries.map(e => e.id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-3">
            {data.entries.map((entry, idx) => {
              const headerTitle = entry.title || entry.company || `Experiencia ${idx + 1}`
              const headerSub = [entry.company, entry.location].filter(Boolean).join(' · ')
              const end = entry.current ? 'Actual' : entry.endDate
              const dates = [entry.startDate, end].filter(Boolean).join(' – ')
              return (
                <SortableEntryCard
                  key={entry.id}
                  id={entry.id}
                  title={headerTitle}
                  subtitle={headerSub}
                  dates={dates}
                  open={openIds.has(entry.id)}
                  onToggle={() => toggleEntry(entry.id)}
                  onRemove={() => removeEntry(entry.id)}
                >
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
                    <AIRewriteTextarea
                      label="Descripción"
                      placeholder="Cuenta lo que hiciste en este puesto: proyectos, tecnologías, impacto. La IA lo convertirá en bullets ATS-friendly que empiezan con •."
                      helper="Bullets generados con •"
                      minRows={3}
                      field="experience-description"
                      context={{ title: entry.title, company: entry.company, location: entry.location }}
                      value={entry.description}
                      onChange={(text) => updateEntry(entry.id, 'description', text)}
                    />
                  </div>
                </SortableEntryCard>
              )
            })}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}
