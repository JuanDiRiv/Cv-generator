'use client'

import { useState } from 'react'
import {
  Sparkles, Target, FileSearch, Languages, Search, ListChecks,
  Mail, MessageSquare, Minimize2, SpellCheck, BarChart3, Mic2,
  ChevronDown, Loader2, Globe,
} from 'lucide-react'
import { useCVStore, type AIAnalysisReport, type AITextResult } from '@/store/cv-store'
import type { CVDocument } from '@/types/cv'

type ToolMode =
  | 'job-match' | 'cv-review' | 'translate' | 'keywords' | 'tailor'
  | 'cover-letter' | 'interview-questions' | 'one-page' | 'proofread'
  | 'metrics' | 'tone'

type IconType = typeof Sparkles

interface ToolDef {
  mode: ToolMode
  title: string
  description: string
  icon: IconType
  color: string
  needsOffer?: boolean
  needsTone?: boolean
  needsLanguage?: boolean
  output: 'cv' | 'text'
}

const TOOLS: ToolDef[] = [
  { mode: 'cv-review', title: 'Revisión general', description: 'Mejora claridad, verbos y métricas en todo el CV.', icon: Sparkles, color: 'indigo', output: 'cv' },
  { mode: 'job-match', title: 'Job Match', description: 'Calcula fit y sugiere mejoras vs. una oferta.', icon: Target, color: 'rose', needsOffer: true, output: 'cv' },
  { mode: 'tailor', title: 'Adaptar a oferta', description: 'Reescribe agresivo con keywords de la oferta.', icon: FileSearch, color: 'fuchsia', needsOffer: true, output: 'cv' },
  { mode: 'one-page', title: 'Optimizar a 1 página', description: 'Comprime descripciones manteniendo impacto.', icon: Minimize2, color: 'amber', output: 'cv' },
  { mode: 'proofread', title: 'Detectar errores', description: 'Corrige typos, gramática y consistencia.', icon: SpellCheck, color: 'emerald', output: 'cv' },
  { mode: 'tone', title: 'Cambiar tono', description: 'Reescribe en tono técnico, ejecutivo, startup o académico.', icon: Mic2, color: 'sky', needsTone: true, output: 'cv' },
  { mode: 'translate', title: 'Traducir CV', description: 'Traduce contenido a EN o ES.', icon: Languages, color: 'cyan', needsLanguage: true, output: 'cv' },
  { mode: 'keywords', title: 'Keywords ATS', description: 'Extrae keywords agrupadas por categoría.', icon: Search, color: 'violet', output: 'text' },
  { mode: 'metrics', title: 'Sugerir métricas', description: 'Identifica bullets sin números y propone qué medir.', icon: BarChart3, color: 'lime', output: 'text' },
  { mode: 'cover-letter', title: 'Cover Letter', description: 'Genera una carta de presentación personalizada.', icon: Mail, color: 'orange', needsOffer: true, output: 'text' },
  { mode: 'interview-questions', title: 'Preguntas de entrevista', description: 'Q&A probable para esta oferta y CV.', icon: MessageSquare, color: 'pink', needsOffer: true, output: 'text' },
]

const TONES = ['técnico', 'ejecutivo', 'startup', 'académico']

const COLOR_CLASSES: Record<string, { bg: string; text: string; border: string }> = {
  indigo: { bg: 'bg-indigo-500/10', text: 'text-indigo-300', border: 'group-hover:border-indigo-500/50' },
  rose: { bg: 'bg-rose-500/10', text: 'text-rose-300', border: 'group-hover:border-rose-500/50' },
  fuchsia: { bg: 'bg-fuchsia-500/10', text: 'text-fuchsia-300', border: 'group-hover:border-fuchsia-500/50' },
  amber: { bg: 'bg-amber-500/10', text: 'text-amber-300', border: 'group-hover:border-amber-500/50' },
  emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-300', border: 'group-hover:border-emerald-500/50' },
  sky: { bg: 'bg-sky-500/10', text: 'text-sky-300', border: 'group-hover:border-sky-500/50' },
  cyan: { bg: 'bg-cyan-500/10', text: 'text-cyan-300', border: 'group-hover:border-cyan-500/50' },
  violet: { bg: 'bg-violet-500/10', text: 'text-violet-300', border: 'group-hover:border-violet-500/50' },
  lime: { bg: 'bg-lime-500/10', text: 'text-lime-300', border: 'group-hover:border-lime-500/50' },
  orange: { bg: 'bg-orange-500/10', text: 'text-orange-300', border: 'group-hover:border-orange-500/50' },
  pink: { bg: 'bg-pink-500/10', text: 'text-pink-300', border: 'group-hover:border-pink-500/50' },
}

interface ToolResponse {
  kind?: 'cv' | 'text'
  suggestedCV?: CVDocument
  analysis?: AIAnalysisReport
  title?: string
  text?: string
  meta?: { language?: string | null }
  error?: string
}

export function AIToolsPanel() {
  const { cv, setAISuggestion, setAITextResult } = useCVStore()
  const [activeTool, setActiveTool] = useState<ToolMode | null>(null)
  const [running, setRunning] = useState<ToolMode | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [jobOffer, setJobOffer] = useState('')
  const [tone, setTone] = useState(TONES[0])
  const initialLanguage: 'EN' | 'ES' = cv?.language === 'es' ? 'ES' : 'EN'
  const [language, setLanguage] = useState<'EN' | 'ES'>(initialLanguage)

  if (!cv) return null

  const runTool = async (tool: ToolDef) => {
    if (running) return

    if (tool.needsOffer && jobOffer.trim().length < 40) {
      setError('Pega una oferta laboral más completa (mínimo 40 caracteres).')
      setActiveTool(tool.mode)
      return
    }

    setError(null)
    setRunning(tool.mode)

    try {
      const res = await fetch('/api/ai-tools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: tool.mode,
          cv,
          jobOffer: tool.needsOffer ? jobOffer : undefined,
          tone: tool.needsTone ? tone : undefined,
          language,
        }),
      })

      const payload = (await res.json()) as ToolResponse
      if (!res.ok) throw new Error(payload.error || 'Error al ejecutar la herramienta')

      if (tool.output === 'cv') {
        if (!payload.suggestedCV || !payload.analysis) {
          throw new Error('Respuesta incompleta de IA')
        }
        setAISuggestion(payload.suggestedCV, payload.analysis)
      } else {
        if (!payload.text) throw new Error('Respuesta vacía de IA')
        const result: AITextResult = {
          tool: tool.mode,
          title: payload.title || tool.title,
          content: payload.text,
          meta: { language: payload.meta?.language ?? undefined },
        }
        setAITextResult(result)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al ejecutar AI Tools')
    } finally {
      setRunning(null)
    }
  }

  const needsAnyConfig = TOOLS.some(
    (t) => activeTool === t.mode && (t.needsOffer || t.needsTone),
  )
  const activeDef = TOOLS.find((t) => t.mode === activeTool)

  const LANGUAGES: { code: 'EN' | 'ES'; label: string }[] = [
    { code: 'EN', label: 'Inglés' },
    { code: 'ES', label: 'Español' },
  ]

  return (
    <div className="flex flex-col gap-3">
      {/* Global language selector */}
      <div className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-950 px-2.5 py-2">
        <Globe size={13} className="text-zinc-400" />
        <span className="text-[11px] font-semibold text-zinc-300">Idioma de salida</span>
        <div className="ml-auto flex gap-1">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => setLanguage(l.code)}
              className={`rounded-md border px-2.5 py-1 text-[11px] font-semibold transition-colors ${language === l.code
                ? 'border-indigo-500 bg-indigo-500/20 text-indigo-100'
                : 'border-zinc-700 text-zinc-400 hover:border-zinc-500'
                }`}
            >
              {l.code} · {l.label}
            </button>
          ))}
        </div>
      </div>

      <p className="text-[11px] text-zinc-500">
        Las herramientas que modifican el CV abren un modo revisión en la vista previa donde puedes aceptar o descartar cambios por sección. Todo el contenido reescrito se entregará en <span className="font-semibold text-zinc-300">{language === 'EN' ? 'Inglés' : 'Español'}</span>.
      </p>

      {/* Config drawer */}
      {needsAnyConfig && activeDef && (
        <div className="rounded-lg border border-indigo-500/30 bg-indigo-500/5 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-indigo-200">
              Configurar: {activeDef.title}
            </span>
            <button
              onClick={() => setActiveTool(null)}
              className="text-[10px] text-zinc-400 hover:text-zinc-200"
            >Cerrar</button>
          </div>

          {activeDef.needsOffer && (
            <textarea
              value={jobOffer}
              onChange={(e) => setJobOffer(e.target.value)}
              placeholder="Pega aquí la oferta laboral..."
              className="min-h-24 w-full resize-y rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1.5 text-xs text-zinc-200 outline-none focus:border-indigo-500"
            />
          )}

          {activeDef.needsTone && (
            <div className="flex flex-wrap gap-1">
              {TONES.map((t) => (
                <button
                  key={t}
                  onClick={() => setTone(t)}
                  className={`rounded-md border px-2 py-1 text-[11px] capitalize transition-colors ${tone === t
                    ? 'border-indigo-500 bg-indigo-500/20 text-indigo-100'
                    : 'border-zinc-700 text-zinc-400 hover:border-zinc-500'
                    }`}
                >{t}</button>
              ))}
            </div>
          )}

          <button
            onClick={() => runTool(activeDef)}
            disabled={running !== null}
            className="w-full rounded-md bg-indigo-600 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
          >
            {running === activeDef.mode ? 'Ejecutando...' : `Ejecutar ${activeDef.title}`}
          </button>
        </div>
      )}

      {/* Tools grid */}
      <div className="grid grid-cols-1 gap-2">
        {TOOLS.map((tool) => {
          const colors = COLOR_CLASSES[tool.color]
          const Icon = tool.icon
          const isRunning = running === tool.mode
          const isActive = activeTool === tool.mode
          const needsConfig = tool.needsOffer || tool.needsTone

          return (
            <button
              key={tool.mode}
              type="button"
              disabled={running !== null && !isRunning}
              onClick={() => {
                if (needsConfig) {
                  setActiveTool(isActive ? null : tool.mode)
                } else {
                  runTool(tool)
                }
              }}
              className={`group flex items-start gap-2.5 rounded-lg border bg-zinc-900/60 p-2.5 text-left transition-all hover:bg-zinc-900 disabled:opacity-50 ${isActive ? 'border-indigo-500/60' : `border-zinc-800 ${colors.border}`
                }`}
            >
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${colors.bg} ${colors.text}`}>
                {isRunning ? <Loader2 size={14} className="animate-spin" /> : <Icon size={14} />}
              </span>
              <span className="flex-1 min-w-0">
                <span className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-zinc-100">{tool.title}</span>
                  {tool.output === 'text' && (
                    <span className="rounded bg-zinc-800 px-1 py-0.5 text-[9px] uppercase tracking-wider text-zinc-500">
                      texto
                    </span>
                  )}
                </span>
                <span className="mt-0.5 block text-[10.5px] leading-tight text-zinc-500">
                  {tool.description}
                </span>
              </span>
              {needsConfig && (
                <ChevronDown
                  size={12}
                  className={`mt-2 shrink-0 text-zinc-600 transition-transform ${isActive ? 'rotate-180' : ''
                    }`}
                />
              )}
            </button>
          )
        })}
      </div>

      {error && (
        <p className="rounded-lg border border-red-900 bg-red-950/30 px-3 py-2 text-xs text-red-300">
          {error}
        </p>
      )}

      <ListChecks className="hidden" />
    </div>
  )
}
