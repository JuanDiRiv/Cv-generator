'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'
import { getCV } from '@/lib/firestore'
import { useCVStore } from '@/store/cv-store'
import { CVEditor } from '@/components/editor/CVEditor'

export default function CVPage() {
  const { id } = useParams<{ id: string }>()
  const { user, loading } = useAuth()
  const router = useRouter()
  const { setCV } = useCVStore()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!loading && !user) router.replace('/')
  }, [user, loading, router])

  useEffect(() => {
    if (!user || !id) return
    getCV(user.uid, id).then((cv) => {
      if (!cv) { router.replace('/dashboard'); return }
      setCV(cv)
      setReady(true)
    })
  }, [user, id, setCV, router])

  if (!ready) return (
    <div className="flex h-screen items-center justify-center bg-zinc-950">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
    </div>
  )

  return <CVEditor cvId={id} />
}
