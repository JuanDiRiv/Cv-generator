'use client'
import { useState } from 'react'
import { nanoid } from 'nanoid'
import { useCVStore } from '@/store/cv-store'
import type { SkillsData, SkillsDisplayMode, SkillCategory } from '@/types/cv'

const inputCls = 'w-full rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-2.5 text-sm text-zinc-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-colors'
const labelCls = 'mb-1.5 block text-[10px] font-medium uppercase tracking-wider text-zinc-500'

interface Props { sectionId: string }

export function SkillsForm({ sectionId }: Props) {
  const { cv, updateSection } = useCVStore()
  const [chipInput, setChipInput] = useState('')
  const [catInputs, setCatInputs] = useState<Record<string, string>>({})
  const section = cv?.sections.find(s => s.id === sectionId)
  if (!section) return null
  const data = section.data as SkillsData

  const setMode = (displayMode: SkillsDisplayMode) =>
    updateSection(sectionId, { data: { ...data, displayMode } })

  const addChip = (e: React.KeyboardEvent) => {
    if (e.key !== 'Enter' || !chipInput.trim()) return
    const chips = [...data.chips, { id: nanoid(), label: chipInput.trim() }]
    updateSection(sectionId, { data: { ...data, chips } })
    setChipInput('')
  }
  const removeChip = (id: string) =>
    updateSection(sectionId, { data: { ...data, chips: data.chips.filter(c => c.id !== id) } })

  const addCategory = () => {
    const cat: SkillCategory = { id: nanoid(), name: 'Nueva categoría', skills: [] }
    updateSection(sectionId, { data: { ...data, categories: [...data.categories, cat] } })
  }
  const updateCategoryName = (id: string, name: string) => {
    const categories = data.categories.map(c => c.id === id ? { ...c, name } : c)
    updateSection(sectionId, { data: { ...data, categories } })
  }
  const addSkillToCategory = (catId: string) => {
    const val = (catInputs[catId] ?? '').trim()
    if (!val) return
    const categories = data.categories.map(c =>
      c.id === catId ? { ...c, skills: [...c.skills, val] } : c
    )
    updateSection(sectionId, { data: { ...data, categories } })
    setCatInputs(prev => ({ ...prev, [catId]: '' }))
  }
  const removeSkillFromCategory = (catId: string, skill: string) => {
    const categories = data.categories.map(c =>
      c.id === catId ? { ...c, skills: c.skills.filter(s => s !== skill) } : c
    )
    updateSection(sectionId, { data: { ...data, categories } })
  }
  const removeCategory = (id: string) =>
    updateSection(sectionId, { data: { ...data, categories: data.categories.filter(c => c.id !== id) } })

  return (
    <div className="flex flex-col gap-3">
      <div>
        <label className={labelCls}>Modo de visualización</label>
        <div className="flex rounded-md bg-zinc-800 p-0.5 gap-0.5">
          {(['chips', 'categories'] as SkillsDisplayMode[]).map(mode => (
            <button key={mode} onClick={() => setMode(mode)}
              className={`flex-1 rounded py-1.5 text-xs transition-colors ${data.displayMode === mode ? 'bg-indigo-600 text-white font-semibold' : 'text-zinc-500 hover:text-zinc-300'}`}>
              {mode === 'chips' ? '🏷 Chips' : '📂 Categorías'}
            </button>
          ))}
        </div>
      </div>

      {data.displayMode === 'chips' ? (
        <>
          <div className="flex flex-wrap gap-1.5">
            {data.chips.map(chip => (
              <span key={chip.id} className="flex items-center gap-1 rounded-full bg-zinc-800 border border-zinc-700 px-2.5 py-1 text-xs text-zinc-300">
                {chip.label}
                <button onClick={() => removeChip(chip.id)} className="text-zinc-500 hover:text-red-400">×</button>
              </span>
            ))}
          </div>
          <input
            className={inputCls}
            placeholder="Agregar habilidad y presionar Enter"
            value={chipInput}
            onChange={e => setChipInput(e.target.value)}
            onKeyDown={addChip}
          />
        </>
      ) : (
        <>
          {data.categories.map(cat => (
            <div key={cat.id} className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-3 flex flex-col gap-2 relative">
              <button onClick={() => removeCategory(cat.id)} className="absolute right-2 top-2 text-zinc-600 hover:text-red-400 text-sm">×</button>
              <input
                className="bg-transparent border-b border-zinc-700 pb-1 text-xs font-bold text-indigo-400 outline-none w-[calc(100%-20px)]"
                value={cat.name}
                onChange={e => updateCategoryName(cat.id, e.target.value)}
              />
              <div className="flex flex-wrap gap-1">
                {cat.skills.map(skill => (
                  <span key={skill} className="flex items-center gap-1 rounded bg-zinc-700/60 border border-zinc-600 px-2 py-0.5 text-[10px] text-zinc-300">
                    {skill}
                    <button onClick={() => removeSkillFromCategory(cat.id, skill)} className="text-zinc-500 hover:text-red-400">×</button>
                  </span>
                ))}
              </div>
              <input
                className={inputCls}
                placeholder="+ Agregar tecnología y Enter"
                value={catInputs[cat.id] ?? ''}
                onChange={e => setCatInputs(prev => ({ ...prev, [cat.id]: e.target.value }))}
                onKeyDown={e => { if (e.key === 'Enter') addSkillToCategory(cat.id) }}
              />
            </div>
          ))}
          <button onClick={addCategory} className="rounded-lg border border-dashed border-indigo-800 bg-indigo-950/30 py-2 text-xs text-indigo-400 hover:bg-indigo-950/60">
            + Agregar categoría
          </button>
        </>
      )}
    </div>
  )
}
