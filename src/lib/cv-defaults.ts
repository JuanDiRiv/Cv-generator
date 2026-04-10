// src/lib/cv-defaults.ts
import { nanoid } from 'nanoid'
import type { CVDocument, CVSection } from '@/types/cv'

export function defaultSections(): CVSection[] {
  return [
    {
      id: nanoid(), type: 'contact', title: 'Información Personal', visible: true,
      data: { firstName: '', lastName: '', jobTitle: '', email: '', phone: '', location: '' },
    },
    {
      id: nanoid(), type: 'about', title: 'Sobre mí', visible: true,
      data: { summary: '' },
    },
    {
      id: nanoid(), type: 'experience', title: 'Experiencia', visible: true,
      data: { displayMode: 'list', entries: [] },
    },
    {
      id: nanoid(), type: 'skills', title: 'Habilidades', visible: true,
      data: { displayMode: 'chips', chips: [], categories: [] },
    },
    {
      id: nanoid(), type: 'education', title: 'Educación', visible: true,
      data: { entries: [] },
    },
    {
      id: nanoid(), type: 'languages', title: 'Idiomas', visible: true,
      data: { entries: [] },
    },
  ]
}

export function newCV(uid: string): Omit<CVDocument, 'id'> {
  return {
    uid,
    title: 'Mi CV',
    language: 'es',
    template: 'budapest',
    accentColor: '#6366f1',
    sections: defaultSections(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
}
