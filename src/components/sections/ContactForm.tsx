'use client'
import { useCVStore } from '@/store/cv-store'
import type { ContactData } from '@/types/cv'

const inputCls = 'w-full rounded bg-zinc-800 border border-zinc-700 px-2 py-1.5 text-xs text-zinc-200 outline-none focus:border-indigo-500'
const labelCls = 'mb-1 block text-[10px] font-medium uppercase tracking-wider text-zinc-500'

interface Props { sectionId: string }

export function ContactForm({ sectionId }: Props) {
  const { cv, updateSection } = useCVStore()
  const section = cv?.sections.find(s => s.id === sectionId)
  if (!section) return null
  const data = section.data as ContactData

  const update = (field: keyof ContactData, value: string) =>
    updateSection(sectionId, { data: { ...data, [field]: value } })

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <div className="flex-1">
          <label className={labelCls}>Nombre</label>
          <input className={inputCls} value={data.firstName} onChange={e => update('firstName', e.target.value)} />
        </div>
        <div className="flex-1">
          <label className={labelCls}>Apellido</label>
          <input className={inputCls} value={data.lastName} onChange={e => update('lastName', e.target.value)} />
        </div>
      </div>
      <div>
        <label className={labelCls}>Título profesional</label>
        <input className={inputCls} value={data.jobTitle} onChange={e => update('jobTitle', e.target.value)} />
      </div>
      <div className="flex gap-2">
        <div className="flex-1">
          <label className={labelCls}>Email</label>
          <input className={inputCls} value={data.email} onChange={e => update('email', e.target.value)} />
        </div>
        <div className="flex-1">
          <label className={labelCls}>Teléfono</label>
          <input className={inputCls} value={data.phone} onChange={e => update('phone', e.target.value)} />
        </div>
      </div>
      <div>
        <label className={labelCls}>Ubicación</label>
        <input className={inputCls} value={data.location} onChange={e => update('location', e.target.value)} />
      </div>
      <div>
        <label className={labelCls}>LinkedIn (opcional)</label>
        <input className={inputCls} value={data.linkedin ?? ''} onChange={e => update('linkedin', e.target.value)} />
      </div>
    </div>
  )
}
