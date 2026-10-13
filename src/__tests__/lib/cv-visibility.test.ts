// src/__tests__/lib/cv-visibility.test.ts
import { describe, it, expect } from 'vitest'
import { getVisibleExperience, withoutHiddenEntries } from '@/lib/cv-visibility'
import type { CVDocument, ExperienceEntry } from '@/types/cv'

const entry = (id: string, hidden?: boolean): ExperienceEntry => ({
  id, title: id, company: '', startDate: '', endDate: '', current: false, description: '', hidden,
})

const makeCV = (visible: boolean, entries: ExperienceEntry[]) => ({
  sections: [{ id: 's1', type: 'experience', title: 'Exp', visible, data: { displayMode: 'list', entries } }],
}) as unknown as CVDocument

describe('getVisibleExperience', () => {
  it('drops hidden entries and keeps order', () => {
    const cv = makeCV(true, [entry('a'), entry('b', true), entry('c', false)])
    expect(getVisibleExperience(cv)?.entries.map(e => e.id)).toEqual(['a', 'c'])
  })

  it('returns undefined when the section is hidden', () => {
    expect(getVisibleExperience(makeCV(false, [entry('a')]))).toBeUndefined()
  })

  it('does not mutate the stored entries', () => {
    const cv = makeCV(true, [entry('a', true)])
    getVisibleExperience(cv)
    expect((cv.sections[0].data as { entries: ExperienceEntry[] }).entries).toHaveLength(1)
  })
})

describe('withoutHiddenEntries', () => {
  it('drops hidden entries even when the section itself is hidden', () => {
    const cv = makeCV(false, [entry('a'), entry('b', true)])
    const out = withoutHiddenEntries(cv)
    expect((out.sections[0].data as { entries: ExperienceEntry[] }).entries.map(e => e.id)).toEqual(['a'])
    expect((cv.sections[0].data as { entries: ExperienceEntry[] }).entries).toHaveLength(2)
  })
})
