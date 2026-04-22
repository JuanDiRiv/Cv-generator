'use client'
import { useState } from 'react'
import { useCVStore } from '@/store/cv-store'
import type { CVDocument } from '@/types/cv'

interface Props { onClose: () => void }

export function ExportModal({ onClose }: Props) {
  const { cv, aiSuggestionCV } = useCVStore()
  const [translating, setTranslating] = useState<'es' | 'en' | null>(null)
  const [error, setError] = useState<string | null>(null)

  const exportPDF = async (targetLang: 'es' | 'en') => {
    const sourceCV = aiSuggestionCV ?? cv
    if (!sourceCV) return
    setTranslating(targetLang)
    setError(null)

    try {
      // 1. Translate via API (model detects language and translates only what differs)
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cv: sourceCV, targetLang }),
      })
      if (!res.ok) throw new Error('Error en traducción')
      const dataToExport = (await res.json()) as CVDocument

      // 2. Dynamically import to avoid SSR issues
      const [{ pdf }, { pdfTemplates }] = await Promise.all([
        import('@react-pdf/renderer'),
        import('@/components/templates/pdf'),
      ])

      // 3. Generate PDF blob in the browser
      const Template = pdfTemplates[dataToExport.template]
      const blob = await pdf(<Template cv={dataToExport} />).toBlob()

      // 4. Trigger download
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${dataToExport.title || 'CV'}_${targetLang.toUpperCase()}.pdf`
      a.click()
      setTimeout(() => URL.revokeObjectURL(url), 100)

      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error')
    } finally {
      setTranslating(null)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-80 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="mb-1 text-base font-bold">Exportar PDF</h2>
        <p className="mb-5 text-xs text-zinc-500">La IA detecta el idioma y traduce automáticamente si es necesario.</p>

        {error && (
          <p className="mb-3 rounded-lg bg-red-900/30 border border-red-800 px-3 py-2 text-xs text-red-400">{error}</p>
        )}

        <div className="flex flex-col gap-2">
          <button
            onClick={() => exportPDF('es')}
            disabled={translating !== null}
            className="w-full rounded-lg bg-zinc-800 py-2.5 text-sm font-semibold hover:bg-zinc-700 disabled:opacity-50 transition-colors"
          >
            {translating === 'es' ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Generando…
              </span>
            ) : '🇨🇴 Exportar en Español'}
          </button>
          <button
            onClick={() => exportPDF('en')}
            disabled={translating !== null}
            className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold hover:bg-indigo-500 disabled:opacity-50 transition-colors"
          >
            {translating === 'en' ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Generando…
              </span>
            ) : '🇺🇸 Exportar en Inglés'}
          </button>
        </div>

        <button
          onClick={onClose}
          disabled={translating !== null}
          className="mt-4 w-full text-xs text-zinc-600 hover:text-zinc-400 disabled:opacity-30 transition-colors"
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}
