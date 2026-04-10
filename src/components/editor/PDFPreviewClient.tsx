'use client'
import { useEffect, useState } from 'react'
import { usePDF } from '@react-pdf/renderer'
import { pdfTemplates } from '@/components/templates/pdf'
import type { CVDocument } from '@/types/cv'

interface Props { cv: CVDocument }

export function PDFPreviewClient({ cv }: Props) {
  const Template = pdfTemplates[cv.template]
  const [instance, update] = usePDF({ document: <Template cv={cv} /> })
  const [stableUrl, setStableUrl] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  // Debounce PDF regeneration — keeps old content visible while new one is built
  useEffect(() => {
    setRefreshing(true)
    const t = setTimeout(() => update(<Template cv={cv} />), 700)
    return () => clearTimeout(t)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cv])

  // Only swap the iframe src once the new PDF is fully ready
  useEffect(() => {
    if (!instance.loading && instance.url) {
      setStableUrl(instance.url)
      setRefreshing(false)
    }
  }, [instance.loading, instance.url])

  if (!stableUrl) {
    return (
      <div className="flex flex-1 items-center justify-center bg-zinc-800">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="relative flex-1 overflow-hidden">
      <iframe
        src={stableUrl}
        width="100%"
        height="100%"
        style={{ border: 'none', display: 'block' }}
        title="PDF preview"
      />
      {refreshing && (
        <div className="absolute right-3 top-3 h-4 w-4 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent opacity-60" />
      )}
    </div>
  )
}
