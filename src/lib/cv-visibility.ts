import type { CVDocument, ExperienceData } from '@/types/cv'

/** Experience data as it should be rendered: section must be visible, hidden entries are dropped. */
export function getVisibleExperience(cv: CVDocument): ExperienceData | undefined {
  const section = cv.sections.find(s => s.type === 'experience' && s.visible)
  if (!section) return undefined
  const data = section.data as ExperienceData
  return { ...data, entries: data.entries.filter(e => !e.hidden) }
}

/** Copy of the CV without hidden experience entries, so AI tools only see what the CV shows. */
export function withoutHiddenEntries(cv: CVDocument): CVDocument {
  return {
    ...cv,
    sections: cv.sections.map(section => {
      if (section.type !== 'experience') return section
      const data = section.data as ExperienceData
      return { ...section, data: { ...data, entries: data.entries.filter(e => !e.hidden) } }
    }),
  }
}
