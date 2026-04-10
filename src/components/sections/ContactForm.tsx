'use client'
import { useCVStore } from '@/store/cv-store'
import type { ContactData, ContactLink } from '@/types/cv'
import { Mail, Phone, MapPin, Globe, X, Link as LinkIcon } from 'lucide-react'

const inputCls = 'w-full rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-2.5 text-sm text-zinc-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-colors'
const inputWithIconCls = 'w-full rounded-lg bg-zinc-900 border border-zinc-700 pl-9 pr-3 py-2.5 text-sm text-zinc-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-colors'
const labelCls = 'mb-1.5 block text-[10px] font-medium uppercase tracking-wider text-zinc-500'

function linkIcon(label: string) {
  const l = label.toLowerCase()
  if (l.includes('github')) return LinkIcon
  if (l.includes('linkedin')) return LinkIcon
  if (l.includes('twitter') || l === 'x') return X
  if (l.includes('portfolio') || l.includes('web') || l.includes('website')) return Globe
  return LinkIcon
}

interface Props { sectionId: string }

export function ContactForm({ sectionId }: Props) {
  const { cv, updateSection } = useCVStore()
  const section = cv?.sections.find(s => s.id === sectionId)
  if (!section) return null
  const data = section.data as ContactData

  const update = (field: keyof Omit<ContactData, 'links'>, value: string) =>
    updateSection(sectionId, { data: { ...data, [field]: value } })

  const links = data.links ?? []

  const updateLink = (index: number, field: keyof ContactLink, value: string) => {
    const updated = links.map((l, i) => i === index ? { ...l, [field]: value } : l)
    updateSection(sectionId, { data: { ...data, links: updated } })
  }

  const addLink = () => {
    updateSection(sectionId, { data: { ...data, links: [...links, { label: '', url: '' }] } })
  }

  const removeLink = (index: number) => {
    updateSection(sectionId, { data: { ...data, links: links.filter((_, i) => i !== index) } })
  }

  return (
    <div className="flex flex-col gap-4">
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

      <div>
        <label className={labelCls}>Email</label>
        <div className="relative">
          <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
          <input className={inputWithIconCls} value={data.email} onChange={e => update('email', e.target.value)} />
        </div>
      </div>

      <div className="flex gap-2">
        <div className="flex-1">
          <label className={labelCls}>Teléfono</label>
          <div className="relative">
            <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
            <input className={inputWithIconCls} value={data.phone} onChange={e => update('phone', e.target.value)} />
          </div>
        </div>
        <div className="flex-1">
          <label className={labelCls}>Ubicación</label>
          <div className="relative">
            <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
            <input className={inputWithIconCls} value={data.location} onChange={e => update('location', e.target.value)} />
          </div>
        </div>
      </div>

      {/* Dynamic links */}
      <div className="flex flex-col gap-2">
        <span className={labelCls}>Links</span>
        {links.map((link, i) => {
          const Icon = linkIcon(link.label)
          return (
            <div key={i} className="flex items-center gap-2">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-800 border border-zinc-700">
                <Icon size={14} className="text-zinc-400" />
              </div>
              <input
                className={`${inputCls} flex-1`}
                placeholder="Etiqueta (ej. GitHub)"
                value={link.label}
                onChange={e => updateLink(i, 'label', e.target.value)}
              />
              <input
                className={`${inputCls} flex-1`}
                placeholder="URL"
                value={link.url}
                onChange={e => updateLink(i, 'url', e.target.value)}
              />
              <button onClick={() => removeLink(i)} className="shrink-0 text-zinc-600 hover:text-red-400 text-lg leading-none">×</button>
            </div>
          )
        })}
        <button
          onClick={addLink}
          className="rounded-lg border border-dashed border-indigo-800 bg-indigo-950/30 py-2 text-xs text-indigo-400 hover:bg-indigo-950/60"
        >
          + Agregar link
        </button>
      </div>
    </div>
  )
}
