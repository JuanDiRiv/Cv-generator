'use client'
import { useState } from 'react'
import { X, Copy, Check } from 'lucide-react'
import { useCVStore } from '@/store/cv-store'

export function AITextResultModal() {
    const { aiTextResult, setAITextResult } = useCVStore()
    const [copied, setCopied] = useState(false)

    if (!aiTextResult) return null

    const close = () => setAITextResult(null)

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(aiTextResult.content)
            setCopied(true)
            setTimeout(() => setCopied(false), 1500)
        } catch {
            // ignore
        }
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
            onClick={close}
        >
            <div
                className="relative flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="flex shrink-0 items-center gap-3 border-b border-zinc-800 px-5 py-3">
                    <div className="flex flex-1 flex-col">
                        <h2 className="text-sm font-semibold text-zinc-100">{aiTextResult.title}</h2>
                        {aiTextResult.meta?.language && (
                            <span className="text-[10px] uppercase tracking-wider text-zinc-500">
                                Idioma: {aiTextResult.meta.language}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={handleCopy}
                        className="flex items-center gap-1.5 rounded-md border border-zinc-700 px-2.5 py-1 text-[11px] font-medium text-zinc-200 hover:border-zinc-500"
                    >
                        {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                        {copied ? 'Copiado' : 'Copiar'}
                    </button>
                    <button
                        onClick={close}
                        className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
                        aria-label="Cerrar"
                    >
                        <X size={14} />
                    </button>
                </header>

                <div className="flex-1 overflow-auto px-5 py-4">
                    <pre className="whitespace-pre-wrap wrap-break-word font-sans text-sm leading-relaxed text-zinc-200">
                        {aiTextResult.content}
                    </pre>
                </div>
            </div>
        </div>
    )
}
