// src/types/cv.ts
export type TemplateId = 'budapest' | 'minimal' | 'modern' | 'executive'
export type SectionType = 'contact' | 'about' | 'experience' | 'education' | 'skills' | 'languages'
export type ExperienceDisplayMode = 'list' | 'timeline'
export type SkillsDisplayMode = 'chips' | 'categories'

export interface ContactLink {
  label: string
  url: string
}

export interface ContactData {
  firstName: string
  lastName: string
  jobTitle: string
  email: string
  phone: string
  location: string
  links: ContactLink[]
}

export interface AboutData {
  summary: string
}

export interface ExperienceEntry {
  id: string
  title: string
  company: string
  location?: string
  startDate: string
  endDate: string
  current: boolean
  description: string
}

export interface ExperienceData {
  displayMode: ExperienceDisplayMode
  entries: ExperienceEntry[]
}

export interface EducationEntry {
  id: string
  degree: string
  institution: string
  startDate: string
  endDate: string
  description?: string
}

export interface EducationData {
  entries: EducationEntry[]
}

export interface SkillChip {
  id: string
  label: string
}

export interface SkillCategory {
  id: string
  name: string
  skills: string[]
}

export interface SkillsData {
  displayMode: SkillsDisplayMode
  chips: SkillChip[]
  categories: SkillCategory[]
}

export interface LanguageEntry {
  id: string
  language: string
  level: string
}

export interface LanguagesData {
  entries: LanguageEntry[]
}

export type SectionData =
  | ContactData
  | AboutData
  | ExperienceData
  | EducationData
  | SkillsData
  | LanguagesData

export interface CVSection {
  id: string
  type: SectionType
  title: string
  visible: boolean
  data: SectionData
}

export interface CVDocument {
  id: string
  uid: string
  title: string
  language: 'es' | 'en'
  template: TemplateId
  accentColor: string
  sections: CVSection[]
  createdAt: number
  updatedAt: number
}
