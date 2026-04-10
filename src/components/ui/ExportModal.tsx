'use client'
import { useState } from 'react'
import { useCVStore } from '@/store/cv-store'

interface Props { cvId: string; onClose: () => void }

export function ExportModal({ cvId, onClose }: Props) {
  const { cv } = useCVStore()
  const [translating, setTranslating] = useState<'es' | 'en' | null>(null)

  const exportPDF = async (targetLang: 'es' | 'en') => {
    if (!cv) return
    setTranslating(targetLang)

    const res = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cv, targetLang }),
    })
    const dataToExport = await res.json()

    localStorage.setItem('cv-print-data', JSON.stringify(dataToExport))
    window.open(`/cv/${cvId}/print`, '_blank')
    setTranslating(null)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-80 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="mb-1 text-base font-bold">Exportar PDF</h2>
        <p className="mb-5 text-xs text-zinc-500">La IA detecta el idioma y traduce automáticamente.</p>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => exportPDF('es')}
            disabled={translating !== null}
            className="w-full rounded-lg bg-zinc-800 py-2.5 text-sm font-semibold hover:bg-zinc-700 disabled:opacity-50"
          >{translating === 'es' ? 'Traduciendo…' : '🇨🇴 Exportar en Español'}</button>
          <button
            onClick={() => exportPDF('en')}
            disabled={translating !== null}
            className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold hover:bg-indigo-500 disabled:opacity-50"
          >{translating === 'en' ? 'Traduciendo…' : '🇺🇸 Exportar en Inglés'}</button>
        </div>
        <button onClick={onClose} disabled={translating !== null} className="mt-4 w-full text-xs text-zinc-600 hover:text-zinc-400 disabled:opacity-30">Cancelar</button>
      </div>
    </div>
  )
}
