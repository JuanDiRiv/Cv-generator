interface Props { isSaving: boolean; isDirty: boolean }

export function AutoSaveIndicator({ isSaving, isDirty }: Props) {
  if (isSaving) return <span className="text-xs text-zinc-500">Guardando…</span>
  if (!isDirty) return <span className="flex items-center gap-1.5 text-xs text-emerald-500"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />Guardado</span>
  return <span className="text-xs text-zinc-500">Sin guardar</span>
}
