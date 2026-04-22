'use client'
import { useEffect, useRef, useState } from 'react'
import { Sparkles, Loader2, Check, X } from 'lucide-react'
import { AutoTextarea } from './AutoTextarea'

type FieldKind = 'experience-description' | 'about-summary'

interface RewriteContext {
    title?: string
    company?: string
    location?: string
    jobTitle?: string
}

interface Props {
    value: string
    onChange: (value: string) => void
    field: FieldKind
    context?: RewriteContext
    placeholder?: string
    minRows?: number
    label?: string
    showCharCount?: boolean
    helper?: string
}

const LANGS: { code: string; label: string }[] = [
    { code: 'es', label: 'ES' },
    { code: 'en', label: 'EN' },
    { code: 'pt', label: 'PT' },
    { code: 'fr', label: 'FR' },
    { code: 'de', label: 'DE' },
    { code: 'it', label: 'IT' },
]

const STORAGE_KEY = 'cv-rewrite-language'

export function AIRewriteTextarea({
    value,
    onChange,
    field,
    context,
    placeholder,
    minRows = 3,
    label,
    showCharCount = true,
    helper,
}: Props) {
    const [language, setLanguage] = useState<string>('es')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [suggestion, setSuggestion] = useState<string | null>(null)
    const abortRef = useRef<AbortController | null>(null)

    useEffect(() => {
        if (typeof window === 'undefined') return
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored && LANGS.some((l) => l.code === stored)) setLanguage(stored)
    }, [])

    const setLang = (code: string) => {
        setLanguage(code)
        if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, code)
    }

    const cancel = () => {
        abortRef.current?.abort()
        abortRef.current = null
        setLoading(false)
    }

    const requestRewrite = async () => {
        if (loading) return
        setError(null)
        if (!value || value.trim().length < 10) {
            setError('Escribe al menos una frase con lo que hiciste.')
            return
        }
        const ctrl = new AbortController()
        abortRef.current = ctrl
        setLoading(true)
        try {
            const res = await fetch('/api/rewrite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: value, language, field, context }),
                signal: ctrl.signal,
            })
            const json = (await res.json()) as { text?: string; error?: string }
            if (!res.ok) throw new Error(json.error || 'No se pudo reescribir')
            if (!json.text) throw new Error('Respuesta vacía de la IA')
            setSuggestion(json.text)
        } catch (err) {
            if ((err as Error).name === 'AbortError') return
            setError(err instanceof Error ? err.message : 'Error desconocido')
        } finally {
            setLoading(false)
            abortRef.current = null
        }
    }

    const accept = () => {
        if (suggestion == null) return
        onChange(suggestion)
        setSuggestion(null)
    }

    const discard = () => {
        setSuggestion(null)
        setError(null)
    }

    const charCount = (value ?? '').length

    return (
        <div>
            <div className="mb-1.5 flex items-center justify-between gap-2">
                {label ? (
                    <label className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">{label}</label>
                ) : (
                    <span />
                )}
                <div className="flex items-center gap-1.5">
                    <select
                        value={language}
                        onChange={(e) => setLang(e.target.value)}
                        disabled={loading}
                        className="rounded-md border border-zinc-700 bg-zinc-950 px-1.5 py-0.5 text-[10px] font-medium text-zinc-300 outline-none focus:border-indigo-500"
                        aria-label="Idioma de la reescritura"
                    >
                        {LANGS.map((l) => (
                            <option key={l.code} value={l.code}>
                                {l.label}
                            </option>
                        ))}
                    </select>
                    {loading ? (
                        <button
                            type="button"
                            onClick={cancel}
                            className="flex items-center gap-1 rounded-md border border-zinc-700 bg-zinc-900 px-2 py-0.5 text-[10px] font-semibold text-zinc-300 hover:bg-zinc-800"
                        >
                            <Loader2 size={11} className="animate-spin" /> Cancelar
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={requestRewrite}
                            className="flex items-center gap-1 rounded-md border border-indigo-500/40 bg-indigo-500/10 px-2 py-0.5 text-[10px] font-semibold text-indigo-300 transition-colors hover:bg-indigo-500/20"
                        >
                            <Sparkles size={11} /> Mejorar con IA
                        </button>
                    )}
                </div>
            </div>

            {suggestion == null ? (
                <AutoTextarea
                    minRows={minRows}
                    placeholder={placeholder}
                    className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-200 outline-none transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    disabled={loading}
                />
            ) : (
                <div className="overflow-hidden rounded-lg border border-indigo-500/40 bg-indigo-500/5">
                    <div className="border-b border-indigo-500/20 bg-zinc-900/60 px-3 py-2">
                        <p className="mb-1 text-[9px] uppercase tracking-wider text-zinc-500">Original</p>
                        <p className="whitespace-pre-line text-sm leading-relaxed text-zinc-400 line-through decoration-zinc-700/60">
                            {value}
                        </p>
                    </div>
                    <div className="px-3 py-2">
                        <div className="mb-1.5 flex items-center justify-between">
                            <p className="flex items-center gap-1 text-[9px] uppercase tracking-wider text-indigo-300">
                                <Sparkles size={10} /> Sugerencia ATS · {language.toUpperCase()}
                            </p>
                            <div className="flex gap-1">
                                <button
                                    type="button"
                                    onClick={discard}
                                    className="flex items-center gap-1 rounded-md bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-300 hover:bg-zinc-700"
                                >
                                    <X size={11} /> Descartar
                                </button>
                                <button
                                    type="button"
                                    onClick={accept}
                                    className="flex items-center gap-1 rounded-md bg-indigo-600 px-2 py-0.5 text-[10px] font-semibold text-white hover:bg-indigo-500"
                                >
                                    <Check size={11} /> Aceptar
                                </button>
                            </div>
                        </div>
                        <p className="whitespace-pre-line text-sm leading-relaxed text-zinc-100">{suggestion}</p>
                    </div>
                </div>
            )}

            <div className="mt-1.5 flex items-center justify-between text-[10px] text-zinc-600">
                <span>{showCharCount ? `${charCount} caracteres` : helper}</span>
                {showCharCount && helper && <span className="text-zinc-500">{helper}</span>}
                {error && <span className="text-red-400">{error}</span>}
            </div>
        </div>
    )
}
