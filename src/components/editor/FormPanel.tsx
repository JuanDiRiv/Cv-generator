'use client'
import { useState } from 'react'
import { ChevronDown, LayoutList, PanelsTopLeft, UserCog, Wand2 } from 'lucide-react'
import { SectionList } from './SectionList'
import { AIToolsPanel } from './AIToolsPanel'

type ViewMode = 'scroll' | 'tabs'

export function FormPanel() {
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window === 'undefined') return 'scroll'
    const stored = localStorage.getItem('cv-form-viewmode')
    return stored === 'tabs' ? 'tabs' : 'scroll'
  })
  const [profileOpen, setProfileOpen] = useState(true)
  const [aiToolsOpen, setAiToolsOpen] = useState(false)

  const setMode = (mode: ViewMode) => {
    setViewMode(mode)
    localStorage.setItem('cv-form-viewmode', mode)
  }

  return (
    <div className="flex w-120 shrink-0 flex-col overflow-hidden border-r border-zinc-800 bg-linear-to-b from-zinc-950 to-zinc-900/60">
      <div className="flex shrink-0 items-center justify-between border-b border-zinc-800/80 bg-zinc-950/80 px-3 py-2 backdrop-blur">
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">Editor</span>
        <div className="flex gap-0.5 rounded-lg border border-zinc-800 bg-zinc-900/80 p-0.5">
          {(['scroll', 'tabs'] as ViewMode[]).map((mode) => {
            const Icon = mode === 'scroll' ? LayoutList : PanelsTopLeft
            const active = viewMode === mode
            return (
              <button
                key={mode}
                onClick={() => setMode(mode)}
                className={`flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium transition-colors ${active ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
              >
                <Icon size={12} />
                {mode === 'scroll' ? 'Scroll' : 'Tabs'}
              </button>
            )
          })}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        <div className="flex flex-col gap-3">
          <Group
            icon={UserCog}
            label="Perfil"
            open={profileOpen}
            onToggle={() => setProfileOpen((o) => !o)}
            accent="text-indigo-300"
          >
            <SectionList />
          </Group>

          <Group
            icon={Wand2}
            label="Herramientas IA"
            open={aiToolsOpen}
            onToggle={() => setAiToolsOpen((o) => !o)}
            accent="text-fuchsia-300"
          >
            <AIToolsPanel />
          </Group>
        </div>
      </div>
    </div>
  )
}

interface GroupProps {
  icon: React.ComponentType<{ size?: number; className?: string }>
  label: string
  open: boolean
  onToggle: () => void
  accent: string
  children: React.ReactNode
}

function Group({ icon: Icon, label, open, onToggle, accent, children }: GroupProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/60 backdrop-blur">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-2 px-3 py-2.5 text-left transition-colors hover:bg-zinc-900"
      >
        <span className={`flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-800/70 ring-1 ring-zinc-700/50 ${accent}`}>
          <Icon size={14} />
        </span>
        <span className="flex-1 text-xs font-semibold uppercase tracking-wider text-zinc-200">{label}</span>
        <ChevronDown size={16} className={`text-zinc-500 transition-transform ${open ? 'rotate-180 text-zinc-300' : ''}`} />
      </button>
      {open && <div className="border-t border-zinc-800/80 p-2.5">{children}</div>}
    </div>
  )
}
