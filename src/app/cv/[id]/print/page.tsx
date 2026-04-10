'use client'
import { useEffect, useState } from 'react'
import { templates } from '@/components/templates'
import type { CVDocument } from '@/types/cv'

export default function PrintPage() {
  const [cv, setCV] = useState<CVDocument | null>(null)

  useEffect(() => {
    const raw = localStorage.getItem('cv-print-data')
    if (!raw) { window.close(); return }
    localStorage.removeItem('cv-print-data')
    setCV(JSON.parse(raw) as CVDocument)
  }, [])

  useEffect(() => {
    if (!cv) return
    // Small delay to ensure render completes before print dialog
    const t = setTimeout(() => window.print(), 300)
    return () => clearTimeout(t)
  }, [cv])

  if (!cv) return <div className="flex h-screen items-center justify-center text-zinc-500">Cargando…</div>

  const Template = templates[cv.template]

  return (
    <div id="cv-print-root" style={{ display: 'block' }}>
      <Template cv={cv} />
    </div>
  )
}
