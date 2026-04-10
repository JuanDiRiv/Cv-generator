'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'
import { getUserCVs, createCV, deleteCV } from '@/lib/firestore'
import { newCV } from '@/lib/cv-defaults'
import type { CVDocument } from '@/types/cv'

export default function DashboardPage() {
  const { user, loading, logOut } = useAuth()
  const router = useRouter()
  const [cvs, setCVs] = useState<CVDocument[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [creatingMode, setCreatingMode] = useState<'new' | 'import' | null>(null)

  useEffect(() => {
    if (!loading && !user) router.replace('/')
  }, [user, loading, router])

  useEffect(() => {
    if (user) getUserCVs(user.uid).then(setCVs)
  }, [user])

  const handleCreate = async (mode: 'new' | 'import') => {
    if (!user) return
    try {
      setCreatingMode(mode)
      const data = newCV(user.uid)
      const id = await createCV(user.uid, data)
      if (mode === 'import') {
        router.push(`/cv/${id}?import=1`)
        return
      }
      router.push(`/cv/${id}`)
    } finally {
      setCreatingMode(null)
      setShowCreateModal(false)
    }
  }

  const handleDelete = async (cvId: string) => {
    if (!user || !confirm('¿Eliminar este CV?')) return
    await deleteCV(user.uid, cvId)
    setCVs((prev) => prev.filter((c) => c.id !== cvId))
  }

  if (loading || !user) return (
    <div className="flex h-screen items-center justify-center bg-zinc-950">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
    </div>
  )

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
        <span className="text-xl font-bold">CV<span className="text-indigo-500">craft</span></span>
        <div className="flex items-center gap-4">
          <span className="text-sm text-zinc-400">{user.displayName}</span>
          <button onClick={logOut} className="text-sm text-zinc-500 hover:text-white">Salir</button>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-6 py-10">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Mis CVs</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            disabled={Boolean(creatingMode)}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold hover:bg-indigo-500 disabled:opacity-50"
          >
            {creatingMode ? 'Creando…' : '+ Nuevo CV'}
          </button>
        </div>
        {cvs.length === 0 ? (
          <div className="rounded-xl border border-zinc-800 py-16 text-center text-zinc-500">
            <p>No tienes CVs todavía.</p>
            <p className="text-sm">Crea uno para comenzar.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cvs.map((cv) => (
              <div key={cv.id} className="group rounded-xl border border-zinc-800 bg-zinc-900 p-5 transition hover:border-zinc-600">
                <h3 className="mb-1 font-semibold">{cv.title}</h3>
                <p className="mb-4 text-xs text-zinc-500 capitalize">{cv.template} · {cv.language.toUpperCase()}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => router.push(`/cv/${cv.id}`)}
                    className="flex-1 rounded-lg bg-indigo-600 py-1.5 text-xs font-semibold hover:bg-indigo-500"
                  >Editar</button>
                  <button
                    onClick={() => handleDelete(cv.id)}
                    className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-400 hover:border-red-800 hover:text-red-400"
                  >×</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {showCreateModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="w-full max-w-xl rounded-2xl border border-zinc-800 bg-zinc-900 p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 className="text-lg font-bold">¿Cómo quieres empezar?</h2>
            <p className="mt-1 text-sm text-zinc-400">Puedes crear uno desde cero o cargar un CV existente en PDF para autocompletar con IA.</p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button
                onClick={() => handleCreate('import')}
                disabled={Boolean(creatingMode)}
                className="rounded-xl border border-zinc-700 bg-zinc-950 p-4 text-left transition hover:border-indigo-500 disabled:opacity-60"
              >
                <p className="text-sm font-semibold">Cargar existente</p>
                <p className="mt-1 text-xs text-zinc-400">Sube tu CV en PDF y rellenamos el editor automáticamente.</p>
              </button>

              <button
                onClick={() => handleCreate('new')}
                disabled={Boolean(creatingMode)}
                className="rounded-xl border border-zinc-700 bg-zinc-950 p-4 text-left transition hover:border-indigo-500 disabled:opacity-60"
              >
                <p className="text-sm font-semibold">Crear nuevo</p>
                <p className="mt-1 text-xs text-zinc-400">Empieza con un CV en blanco y rellena las secciones manualmente.</p>
              </button>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setShowCreateModal(false)}
                disabled={Boolean(creatingMode)}
                className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 hover:border-zinc-500 disabled:opacity-60"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
