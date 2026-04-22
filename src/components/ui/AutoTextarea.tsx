'use client'
import { TextareaHTMLAttributes, useEffect, useLayoutEffect, useRef } from 'react'

type Props = TextareaHTMLAttributes<HTMLTextAreaElement> & {
    minRows?: number
}

const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

/**
 * Textarea que crece automáticamente para mostrar todo el contenido
 * sin scroll interno, manteniendo una altura mínima cómoda.
 */
export function AutoTextarea({ minRows = 3, className = '', value, onChange, ...rest }: Props) {
    const ref = useRef<HTMLTextAreaElement | null>(null)

    const resize = () => {
        const el = ref.current
        if (!el) return
        el.style.height = 'auto'
        el.style.height = `${el.scrollHeight}px`
    }

    useIsoLayoutEffect(() => {
        resize()
    }, [value])

    useEffect(() => {
        const handler = () => resize()
        window.addEventListener('resize', handler)
        return () => window.removeEventListener('resize', handler)
    }, [])

    return (
        <textarea
            ref={ref}
            rows={minRows}
            value={value}
            onChange={(e) => {
                onChange?.(e)
                resize()
            }}
            className={`block w-full resize-none overflow-hidden leading-relaxed ${className}`}
            {...rest}
        />
    )
}
