import type {
  CVDocument,
  SectionType,
  AboutData,
  ExperienceData,
  SkillsData,
} from '@/types/cv'
import { diffByWords } from '@/lib/text-diff'

interface DiffTextProps {
  previousText: string
  nextText: string
  enabled?: boolean
  preserveLines?: boolean
  className?: string
}

export function DiffText({
  previousText,
  nextText,
  enabled = false,
  preserveLines = false,
  className,
}: DiffTextProps) {
  const wrapperClass = `${preserveLines ? 'whitespace-pre-line' : ''}${className ? ` ${className}` : ''}`.trim()

  if (!enabled || previousText === nextText) {
    return <span className={wrapperClass}>{nextText}</span>
  }

  const segments = diffByWords(previousText, nextText)

  return (
    <span className={wrapperClass}>
      {segments.map((segment, index) => {
        const key = `${segment.type}-${index}`

        if (/^\s+$/.test(segment.text)) {
          return <span key={key}>{segment.text}</span>
        }

        if (segment.type === 'added') {
          return (
            <mark key={key} className="rounded bg-emerald-500/25 px-0.5 text-inherit">
              {segment.text}
            </mark>
          )
        }

        if (segment.type === 'removed') {
          return (
            <mark key={key} className="rounded bg-red-500/20 px-0.5 text-inherit line-through">
              {segment.text}
            </mark>
          )
        }

        return <span key={key}>{segment.text}</span>
      })}
    </span>
  )
}

export function getSectionData<T>(
  cv: CVDocument | undefined,
  type: SectionType,
): T | undefined {
  if (!cv) return undefined
  return cv.sections.find((section) => section.type === type)?.data as T | undefined
}

export function getBaselineTextMaps(cv: CVDocument | undefined) {
  const about = getSectionData<AboutData>(cv, 'about')
  const experience = getSectionData<ExperienceData>(cv, 'experience')
  const skills = getSectionData<SkillsData>(cv, 'skills')

  const experienceById = new Map(
    (experience?.entries ?? []).map((entry) => [entry.id, entry.description]),
  )

  const skillsByCategoryName = new Map(
    (skills?.categories ?? []).map((category) => [
      category.name.toLowerCase(),
      category.skills.join(' | '),
    ]),
  )

  const chipsText = (skills?.chips ?? []).map((chip) => chip.label).join(' | ')
  const chipLabels = (skills?.chips ?? []).map((chip) => chip.label)

  return {
    aboutSummary: about?.summary ?? '',
    experienceById,
    skillsByCategoryName,
    skillsChipsText: chipsText,
    skillsChipLabels: chipLabels,
  }
}
