'use client'

import { useState } from 'react'
import { useCVStore, type AIAnalysisReport } from '@/store/cv-store'
import type { CVDocument } from '@/types/cv'

type AnalysisMode = 'job-match' | 'cv-review'

interface AIAnalyzeResponse {
  analysis: AIAnalysisReport
  suggestedCV: CVDocument
  error?: string
}

export function AIToolsPanel() {
  const { cv, aiAnalysis, setAISuggestion, setActivePreviewTab } = useCVStore()
  const [jobOffer, setJobOffer] = useState('')
  const [jobMatchOpen, setJobMatchOpen] = useState(false)
  const [runningMode, setRunningMode] = useState<AnalysisMode | null>(null)
  const [error, setError] = useState<string | null>(null)

  if (!cv) return null

  const runAnalysis = async (mode: AnalysisMode) => {
    if (runningMode) return

    if (mode === 'job-match' && jobOffer.trim().length < 40) {
      setError('Pega una oferta laboral mas completa para calcular el fit.')
      return
    }

    setError(null)
    setRunningMode(mode)

    try {
      const response = await fetch('/api/ai-tools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          cv,
          jobOffer: mode === 'job-match' ? jobOffer : undefined,
        }),
      })

      const payload = (await response.json()) as AIAnalyzeResponse
      if (!response.ok) {
        throw new Error(payload.error || 'No se pudo ejecutar el analisis con IA')
      }

      if (!payload.suggestedCV || !payload.analysis) {
        throw new Error('La respuesta de IA no vino completa')
      }

      setAISuggestion(payload.suggestedCV, payload.analysis)
      setActivePreviewTab('ai')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al ejecutar AI Tools')
    } finally {
      setRunningMode(null)
    }
  }

  const fitScore = aiAnalysis?.mode === 'job-match' ? aiAnalysis.score : null

  return (
    <div className="flex flex-col gap-3">
      <p className="text-[11px] text-zinc-500">
        Las sugerencias de IA no editan tu CV original. Se abren en una tab separada.
      </p>

      <div className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950">
        <button
          type="button"
          onClick={() => setJobMatchOpen((open) => !open)}
          className="flex w-full items-center justify-between px-3 py-2.5 text-left"
        >
          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Job Match</span>
          <span className={`text-zinc-500 text-sm transition-transform ${jobMatchOpen ? 'rotate-180' : ''}`}>⌄</span>
        </button>
        {jobMatchOpen && (
          <div className="border-t border-zinc-800 p-3">
            <textarea
              value={jobOffer}
              onChange={(e) => setJobOffer(e.target.value)}
              placeholder="Pega aqui la oferta laboral para medir que tan apto es tu perfil..."
              className="min-h-28 w-full resize-y rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs text-zinc-200 outline-none focus:border-indigo-500"
            />
            <button
              type="button"
              onClick={() => runAnalysis('job-match')}
              disabled={runningMode !== null}
              className="mt-2 w-full rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-60"
            >
              {runningMode === 'job-match' ? 'Analizando oferta...' : 'Analizar fit con oferta'}
            </button>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => runAnalysis('cv-review')}
        disabled={runningMode !== null}
        className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs font-semibold text-zinc-200 hover:border-zinc-500 disabled:opacity-60"
      >
        {runningMode === 'cv-review' ? 'Analizando CV completo...' : 'Sugerencias IA del CV completo'}
      </button>

      {error && (
        <p className="rounded-lg border border-red-900 bg-red-950/30 px-3 py-2 text-xs text-red-300">{error}</p>
      )}

      {aiAnalysis && (
        <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">AI Result</p>
            <button
              type="button"
              onClick={() => setActivePreviewTab('ai')}
              className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300"
            >
              Ver tab AI suggestions
            </button>
          </div>

          {typeof fitScore === 'number' && (
            <div className="mb-3">
              <div className="mb-1 flex items-center justify-between text-[11px] text-zinc-400">
                <span>Fit score</span>
                <span>{fitScore}/100</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
                <div
                  className="h-full rounded-full bg-linear-to-r from-red-500 via-amber-400 to-emerald-500 transition-all"
                  style={{ width: `${fitScore}%` }}
                />
              </div>
            </div>
          )}

          <p className="mb-2 text-xs leading-relaxed text-zinc-300">{aiAnalysis.summary}</p>

          {aiAnalysis.missingKeywords.length > 0 && (
            <div className="mb-2">
              <p className="mb-1 text-[11px] font-semibold text-zinc-400">Keywords faltantes</p>
              <div className="flex flex-wrap gap-1">
                {aiAnalysis.missingKeywords.map((keyword) => (
                  <span key={keyword} className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-300">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

          {aiAnalysis.recommendations.length > 0 && (
            <div>
              <p className="mb-1 text-[11px] font-semibold text-zinc-400">Sugerencias</p>
              <ul className="list-disc space-y-1 pl-4 text-xs text-zinc-300">
                {aiAnalysis.recommendations.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
