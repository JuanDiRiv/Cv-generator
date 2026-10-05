'use client'
import { useRef, useState } from 'react'
import { Camera, Loader2, Trash2, User } from 'lucide-react'
import { fileToProfilePhoto } from '@/lib/image'

interface Props {
  value?: string
  onChange: (photo: string | undefined) => void
}

export function PhotoPicker({ value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFile = async (file: File | undefined) => {
    if (!file) return
    setError(null)
    setLoading(true)
    try {
      onChange(await fileToProfilePhoto(file))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar la foto')
    } finally {
      setLoading(false)
      // Allow re-selecting the same file after removing it
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-zinc-700 bg-zinc-800">
        {loading ? (
          <Loader2 size={18} className="animate-spin text-zinc-400" />
        ) : value ? (
          // eslint-disable-next-line @next/next/no-img-element -- data URL, nothing to optimize
          <img src={value} alt="Foto de perfil" className="h-full w-full object-cover" />
        ) : (
          <User size={22} className="text-zinc-500" />
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800/60 px-3 py-1.5 text-xs text-zinc-200 transition-colors hover:border-indigo-500 disabled:opacity-50"
          >
            <Camera size={13} /> {value ? 'Cambiar foto' : 'Subir foto'}
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange(undefined)}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-zinc-500 transition-colors hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
            >
              <Trash2 size={13} /> Quitar
            </button>
          )}
        </div>
        <p className={`text-[10px] ${error ? 'text-red-400' : 'text-zinc-500'}`}>
          {error ?? 'Opcional · JPG, PNG o WebP'}
        </p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={e => handleFile(e.target.files?.[0])}
      />
    </div>
  )
}
