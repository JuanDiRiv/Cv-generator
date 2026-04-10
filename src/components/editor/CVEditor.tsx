'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'
import { useCVStore } from '@/store/cv-store'
import { updateCV } from '@/lib/firestore'
import { FormPanel } from './FormPanel'
import { PreviewPanel } from './PreviewPanel'
import { ExportModal } from '@/components/ui/ExportModal'
import { AutoSaveIndicator } from '@/components/ui/AutoSaveIndicator'

interface Props { cvId: string }

export function CVEditor({ cvId }: Props) {
  const { user } = useAuth()
  const router = useRouter()
  const { cv, isDirty, isSaving, setIsSaving, markSaved, updateField } = useCVStore()
  const [showExport, setShowExport] = useState(false)
  const saveTimer = useRef<ReturnType<typeof setTimeout>>()

  // Auto-save: debounce 1.5s after any change
  useEffect(() => {
    if (!isDirty || !cv || !user) return
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(async () => {
      setIsSaving(true)
      await updateCV(user.uid, cvId, cv)
      setIsSaving(false)
      markSaved()
    }, 1500)
    return () => clearTimeout(saveTimer.current)
  }, [cv, isDirty, user, cvId, setIsSaving, markSaved])

  if (!cv) return null

  return (
    <div className="flex h-screen flex-col bg-zinc-950 text-white overflow-hidden">
      {/* Header */}
      <header className="flex h-12 flex-shrink-0 items-center gap-3 border-b border-zinc-800 px-4">
        <button onClick={() => router.push('/dashboard')} className="text-zinc-500 hover:text-white text-sm">←</button>
        <span className="font-bold text-sm">CV<span className="text-indigo-500">craft</span></span>
        <input
          value={cv.title}
          onChange={(e) => updateField('title', e.target.value)}
          className="flex-1 bg-transparent text-sm text-zinc-300 outline-none border-b border-transparent focus:border-indigo-500 px-1 py-0.5"
        />
        <AutoSaveIndicator isSaving={isSaving} isDirty={isDirty} />
        <button
          onClick={() => setShowExport(true)}
          className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold hover:bg-indigo-500"
        >
          🌐 Exportar PDF
        </button>
      </header>

      {/* Split view */}
      <div className="flex flex-1 overflow-hidden">
        <FormPanel />
        <PreviewPanel />
      </div>

      {showExport && <ExportModal cvId={cvId} onClose={() => setShowExport(false)} />}
    </div>
  )
}
