'use client'
import { useState, useEffect } from 'react'
import { SectionList } from './SectionList'

type ViewMode = 'scroll' | 'tabs'

export function FormPanel() {
  const [viewMode, setViewMode] = useState<ViewMode>('scroll')
  const [profileOpen, setProfileOpen] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('cv-form-viewmode') as ViewMode | null
    if (stored) setViewMode(stored)
  }, [])

  const setMode = (mode: ViewMode) => {
    setViewMode(mode)
    localStorage.setItem('cv-form-viewmode', mode)
  }

  return (
    <div className="flex w-120 shrink-0 flex-col border-r border-zinc-800 overflow-hidden">
      <div className="flex shrink-0 items-center justify-between border-b border-zinc-800 px-3 py-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Editor</span>
        <div className="flex rounded-md bg-zinc-800 p-0.5 gap-0.5">
          {(['scroll', 'tabs'] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setMode(mode)}
              className={`rounded px-2.5 py-1 text-xs transition-colors ${viewMode === mode ? 'bg-zinc-600 text-white' : 'text-zinc-500 hover:text-zinc-300'
                }`}
            >
              {mode === 'scroll' ? '≡ Scroll' : '⊟ Tabs'}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        <div className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900">
          <button
            type="button"
            onClick={() => setProfileOpen((open) => !open)}
            className="flex w-full items-center justify-between px-3 py-2.5 text-left"
          >
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300">Profile</span>
            <span className={`text-zinc-500 text-sm transition-transform ${profileOpen ? 'rotate-180' : ''}`}>⌄</span>
          </button>
          {profileOpen && (
            <div className="border-t border-zinc-800 p-2.5">
              <SectionList />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
