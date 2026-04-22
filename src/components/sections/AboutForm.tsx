'use client'
import { useCVStore } from '@/store/cv-store'
import { AIRewriteTextarea } from '@/components/ui/AIRewriteTextarea'
import type { AboutData, ContactData } from '@/types/cv'

interface Props { sectionId: string }

export function AboutForm({ sectionId }: Props) {
  const { cv, updateSection } = useCVStore()
  const section = cv?.sections.find(s => s.id === sectionId)
  if (!section) return null
  const data = section.data as AboutData
  const contact = cv?.sections.find(s => s.type === 'contact')?.data as ContactData | undefined

  return (
    <AIRewriteTextarea
      label="Resumen profesional"
      placeholder="Escribe lo que haces y qué te diferencia. La IA lo pulirá ATS-friendly."
      minRows={4}
      field="about-summary"
      context={{ jobTitle: contact?.jobTitle }}
      value={data.summary}
      onChange={(text) => updateSection(sectionId, { data: { summary: text } })}
    />
  )
}
