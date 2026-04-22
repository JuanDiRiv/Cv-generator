'use client'
import { useRef, useState, useLayoutEffect, useMemo, useEffect, useCallback } from 'react'
import { Sparkles, Check, X, ChevronsUpDown } from 'lucide-react'
import { useCVStore } from '@/store/cv-store'
import { templates } from '@/components/templates'
import type { TemplateId, CVDocument, CVSection, SectionType } from '@/types/cv'

const A4_WIDTH_PX = 794 // 210mm at 96dpi

const ACCENT_COLORS = ['#6366f1', '#e94560', '#2d6a4f', '#c9a96e', '#0ea5e9']
const TEMPLATE_IDS: TemplateId[] = ['budapest', 'minimal', 'modern', 'executive']

function sectionsEqual(a: CVSection | undefined, b: CVSection | undefined) {
  if (!a || !b) return a === b
  return JSON.stringify(a.data) === JSON.stringify(b.data)
}

interface ChangedSection {
  id: string
  type: SectionType
  label: string
}

function diffSections(original: CVDocument, suggestion: CVDocument): ChangedSection[] {
  return original.sections
    .map((sec) => {
      const other = suggestion.sections.find((s) => s.id === sec.id)
      if (sectionsEqual(sec, other)) return null
      return { id: sec.id, type: sec.type, label: sec.title || sec.type }
    })
    .filter((v): v is ChangedSection => v !== null)
}

interface FloatingRect {
  id: string
  type: SectionType
  label: string
  top: number
  left: number
  width: number
}

export function PreviewPanel() {
  const {
    cv,
    aiSuggestionCV,
    aiAnalysis,
    updateField,
    acceptSectionSuggestion,
    discardSectionSuggestion,
    acceptAllSuggestions,
    discardAllSuggestions,
  } = useCVStore()
  const containerRef = useRef<HTMLDivElement>(null)
  const pageRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.9)
  const [showHighlights, setShowHighlights] = useState(true)
  const [analysisOpen, setAnalysisOpen] = useState(false)
  const [floatingRects, setFloatingRects] = useState<FloatingRect[]>([])

  useLayoutEffect(() => {
    const el = containerRef.current
    if (!el) return
    const update = () => {
      const available = el.clientWidth - 48
      setScale(Math.min(available / A4_WIDTH_PX, 1))
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const changedSections = useMemo(() => {
    if (!cv || !aiSuggestionCV) return [] as ChangedSection[]
    return diffSections(cv, aiSuggestionCV)
  }, [cv, aiSuggestionCV])

  const inReview = changedSections.length > 0
  const previewCV = inReview && aiSuggestionCV ? aiSuggestionCV : cv
  const Template = previewCV ? templates[previewCV.template] : null

  const recomputeRects = useCallback(() => {
    const container = containerRef.current
    const page = pageRef.current
    if (!container || !page || !inReview) {
      setFloatingRects([])
      return
    }
    const containerBox = container.getBoundingClientRect()
    const next: FloatingRect[] = []
    for (const sec of changedSections) {
      const node = page.querySelector<HTMLElement>(
        `[data-cv-section="${sec.type}"]`,
      )
      if (!node) continue
      const box = node.getBoundingClientRect()
      next.push({
        id: sec.id,
        type: sec.type,
        label: sec.label,
        top: box.top - containerBox.top + container.scrollTop,
        left: box.left - containerBox.left + container.scrollLeft,
        width: box.width,
      })
    }
    setFloatingRects(next)
  }, [changedSections, inReview])

  useLayoutEffect(() => {
    const raf = requestAnimationFrame(() => recomputeRects())
    return () => cancelAnimationFrame(raf)
  }, [recomputeRects, scale, previewCV])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const onScroll = () => recomputeRects()
    container.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    const ro = new ResizeObserver(onScroll)
    if (pageRef.current) ro.observe(pageRef.current)
    return () => {
      container.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      ro.disconnect()
    }
  }, [recomputeRects])

  if (!cv || !previewCV || !Template) return null

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="flex shrink-0 items-center gap-3 border-b border-zinc-800 px-4 py-2">
        <span className="text-xs text-zinc-500">Plantilla</span>
        <div className="flex gap-1">
          {TEMPLATE_IDS.map((id) => (
            <button
              key={id}
              disabled={inReview}
              onClick={() => updateField('template', id)}
              className={`rounded px-2.5 py-1 text-xs capitalize transition-colors border ${previewCV.template === id
                ? 'bg-indigo-600 border-indigo-600 text-white'
                : 'border-zinc-700 text-zinc-400 hover:border-zinc-500'
                } disabled:cursor-not-allowed disabled:opacity-50`}
            >{id}</button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          {ACCENT_COLORS.map((color) => (
            <button
              key={color}
              disabled={inReview}
              onClick={() => updateField('accentColor', color)}
              className={`h-5 w-5 rounded-full border-2 transition-transform ${previewCV.accentColor === color ? 'border-white scale-110' : 'border-transparent'
                } disabled:cursor-not-allowed disabled:opacity-50`}
              style={{ background: color }}
            />
          ))}
        </div>
      </div>

      {/* Slim review header (only shows when in review) */}
      {inReview && (
        <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-indigo-500/30 bg-indigo-500/5 px-4 py-2">
          <span className="flex items-center gap-1.5 text-[11px] font-semibold text-indigo-200">
            <Sparkles size={12} className="text-indigo-300" />
            {changedSections.length === 1
              ? '1 sección con sugerencias'
              : `${changedSections.length} secciones con sugerencias`}
          </span>
          <button
            type="button"
            onClick={() => setShowHighlights((v) => !v)}
            className="rounded-md border border-zinc-700 px-2 py-0.5 text-[10px] font-medium text-zinc-300 hover:border-zinc-500"
          >
            {showHighlights ? 'Ocultar highlights' : 'Mostrar highlights'}
          </button>
          {aiAnalysis && (
            <button
              type="button"
              onClick={() => setAnalysisOpen((v) => !v)}
              className="flex items-center gap-1 rounded-md border border-zinc-700 px-2 py-0.5 text-[10px] font-medium text-zinc-300 hover:border-zinc-500"
            >
              <ChevronsUpDown size={10} />
              Notas IA
              {typeof aiAnalysis.score === 'number' && (
                <span className="ml-1 rounded-full bg-indigo-500/20 px-1.5 text-[9px] font-bold text-indigo-200">
                  {aiAnalysis.score}/100
                </span>
              )}
            </button>
          )}
          <div className="ml-auto flex gap-1">
            <button
              type="button"
              onClick={discardAllSuggestions}
              className="flex items-center gap-1 rounded-md bg-zinc-800 px-2 py-1 text-[10px] font-medium text-zinc-200 hover:bg-zinc-700"
            >
              <X size={11} /> Descartar todo
            </button>
            <button
              type="button"
              onClick={acceptAllSuggestions}
              className="flex items-center gap-1 rounded-md bg-indigo-600 px-2 py-1 text-[10px] font-semibold text-white hover:bg-indigo-500"
            >
              <Check size={11} /> Mantener todo
            </button>
          </div>
        </div>
      )}

      {analysisOpen && aiAnalysis && (
        <div className="shrink-0 space-y-2 border-b border-indigo-500/20 bg-zinc-950/60 px-4 py-2.5 text-[11px] text-zinc-300">
          <p>{aiAnalysis.summary}</p>
          {aiAnalysis.missingKeywords.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-zinc-500">Keywords faltantes</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {aiAnalysis.missingKeywords.map((k) => (
                  <span key={k} className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-300">
                    {k}
                  </span>
                ))}
              </div>
            </div>
          )}
          {aiAnalysis.recommendations.length > 0 && (
            <ul className="list-disc space-y-0.5 pl-4">
              {aiAnalysis.recommendations.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* A4 preview with floating action overlay */}
      <div ref={containerRef} className="relative flex-1 overflow-auto bg-zinc-800 p-6">
        <div
          ref={pageRef}
          className="shadow-2xl mx-auto"
          style={{
            width: A4_WIDTH_PX,
            transformOrigin: 'top left',
            transform: `scale(${scale})`,
            marginBottom: `calc((${scale} - 1) * 100%)`,
          }}
        >
          <Template
            cv={previewCV}
            baselineCV={inReview ? cv : undefined}
            highlightChanges={inReview && showHighlights}
          />
        </div>

        {/* Floating per-section actions */}
        {inReview &&
          floatingRects.map((rect) => (
            <div
              key={rect.id}
              className="pointer-events-none absolute z-30"
              style={{
                top: rect.top - 4,
                left: rect.left,
                width: rect.width,
              }}
            >
              <div className="pointer-events-auto flex justify-end gap-1 -translate-y-full pb-1">
                <button
                  type="button"
                  onClick={() => discardSectionSuggestion(rect.id)}
                  className="flex items-center gap-1 rounded-full border border-zinc-700 bg-zinc-900/95 px-2.5 py-1 text-[11px] font-medium text-zinc-200 shadow-lg backdrop-blur hover:border-red-400/60 hover:text-red-200"
                  title={`Descartar ${rect.label}`}
                >
                  <X size={11} /> Descartar
                </button>
                <button
                  type="button"
                  onClick={() => acceptSectionSuggestion(rect.id)}
                  className="flex items-center gap-1 rounded-full bg-indigo-600 px-2.5 py-1 text-[11px] font-semibold text-white shadow-lg hover:bg-indigo-500"
                  title={`Mantener ${rect.label}`}
                >
                  <Check size={11} /> Mantener
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}
