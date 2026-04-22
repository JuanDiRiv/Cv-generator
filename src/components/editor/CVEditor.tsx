'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'
import { useCVStore } from '@/store/cv-store'
import { updateCV } from '@/lib/firestore'
import { applyImportedDataToCV, normalizeImportedCV } from '@/lib/cv-import'
import { FormPanel } from './FormPanel'
import { PreviewPanel } from './PreviewPanel'
import { ExportModal } from '@/components/ui/ExportModal'
import { AITextResultModal } from '@/components/ui/AITextResultModal'
import { AutoSaveIndicator } from '@/components/ui/AutoSaveIndicator'

interface Props { cvId: string }

export function CVEditor({ cvId }: Props) {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const {
    cv,
    isDirty,
    isSaving,
    setIsSaving,
    markSaved,
    updateField,
    setCV,
  } = useCVStore()
  const [showExport, setShowExport] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [importMessage, setImportMessage] = useState<string>('')
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const importInputRef = useRef<HTMLInputElement>(null)
  const autoOpenImportRef = useRef(false)

  // Auto-save: debounce 1.5s after any change
  useEffect(() => {
    if (!isDirty || !cv || !user) return
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(async () => {
      setIsSaving(true)
      await updateCV(user.uid, cvId, cv)
      setIsSaving(false)
      markSaved()
    }, 1500)
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
    }
  }, [cv, isDirty, user, cvId, setIsSaving, markSaved])

  useEffect(() => {
    if (searchParams.get('import') !== '1') return
    if (autoOpenImportRef.current) return
    autoOpenImportRef.current = true
    setImportMessage('Selecciona tu PDF para cargar tu CV existente.')
    // Delay ensures input is mounted and browser can open picker from user-initiated flow.
    const timer = setTimeout(() => {
      importInputRef.current?.click()
    }, 50)
    return () => clearTimeout(timer)
  }, [searchParams])

  if (!cv) return null

  const openImportPicker = () => {
    if (isImporting) return
    importInputRef.current?.click()
  }

  const onImportFile = async (file: File) => {
    setIsImporting(true)
    setImportMessage('Analizando PDF con IA...')

    try {
      const body = new FormData()
      body.set('file', file)

      const response = await fetch('/api/import-pdf', {
        method: 'POST',
        body,
      })

      const payload = await response.json() as { imported?: unknown; error?: string }
      if (!response.ok) {
        throw new Error(payload.error || 'No se pudo importar el PDF')
      }

      if (!payload.imported) {
        throw new Error('La IA no devolvió datos para importar')
      }

      const latestCV = useCVStore.getState().cv
      if (!latestCV) {
        throw new Error('No se encontró el CV activo')
      }

      const normalized = normalizeImportedCV(payload.imported)
      const merged = applyImportedDataToCV(latestCV, normalized)
      setCV(merged, { markDirty: true })
      setImportMessage('CV importado. Puedes editar cualquier campo antes de exportar.')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo importar el PDF'
      setImportMessage(message)
    } finally {
      setIsImporting(false)
    }
  }

  const onImportInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    await onImportFile(file)
  }

  return (
    <div className="flex h-screen flex-col bg-zinc-950 text-white overflow-hidden">
      {/* Header */}
      <header className="flex h-12 shrink-0 items-center gap-3 border-b border-zinc-800 px-4">
        <button onClick={() => router.push('/dashboard')} className="text-zinc-500 hover:text-white text-sm">←</button>
        <span className="font-bold text-sm">CV<span className="text-indigo-500">craft</span></span>
        <input
          value={cv.title}
          onChange={(e) => updateField('title', e.target.value)}
          className="flex-1 bg-transparent text-sm text-zinc-300 outline-none border-b border-transparent focus:border-indigo-500 px-1 py-0.5"
        />
        <AutoSaveIndicator isSaving={isSaving} isDirty={isDirty} />
        {importMessage && (
          <span className="max-w-[320px] truncate text-[11px] text-zinc-400">{importMessage}</span>
        )}
        <input
          ref={importInputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={onImportInputChange}
        />
        <button
          onClick={openImportPicker}
          disabled={isImporting}
          className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:border-zinc-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isImporting ? 'Analizando...' : 'Importar PDF'}
        </button>
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

      <AITextResultModal />
      {showExport && <ExportModal onClose={() => setShowExport(false)} />}
    </div>
  )
}
