// @vitest-environment node
// src/__tests__/components/pdf-templates.test.tsx
import { describe, it, expect } from 'vitest'
import { renderToBuffer } from '@react-pdf/renderer'
import { pdfTemplates } from '@/components/templates/pdf'
import type { CVDocument, CVSection, TemplateId } from '@/types/cv'

const A4_HEIGHT = 841.89

function buildCV(experienceCount: number): CVDocument {
  const entries = Array.from({ length: experienceCount }, (_, e) => ({
    id: `e${e}`, title: `Cargo ${e}`, company: `Empresa ${e}`, location: 'Madrid',
    startDate: 'Ene 2020', endDate: 'Dic 2021', current: false,
    description: Array.from({ length: 6 }, () => '• Lideré el desarrollo de una funcionalidad con impacto medible en el negocio').join('\n'),
  }))
  const sections: CVSection[] = [
    { id: 's1', type: 'contact', title: 'Contacto', visible: true, data: { firstName: 'Juan', lastName: 'Rivero', jobTitle: 'Dev', email: 'a@b.c', phone: '1', location: 'X', links: [] } },
    { id: 's2', type: 'about', title: 'Sobre mí', visible: true, data: { summary: 'Resumen profesional' } },
    { id: 's3', type: 'experience', title: 'Experiencia', visible: true, data: { displayMode: 'list', entries } },
    { id: 's4', type: 'skills', title: 'Habilidades', visible: true, data: { displayMode: 'chips', chips: [{ id: 'k', label: 'React' }], categories: [] } },
    { id: 's5', type: 'education', title: 'Educación', visible: true, data: { entries: [{ id: 'ed', degree: 'Grado', institution: 'Uni', startDate: '2010', endDate: '2014' }] } },
    { id: 's6', type: 'languages', title: 'Idiomas', visible: true, data: { entries: [{ id: 'l', language: 'Inglés', level: 'C1' }] } },
  ]
  return {
    id: 'test', uid: 'u', title: 'Test', language: 'es', template: 'budapest',
    accentColor: '#6366f1', sections, createdAt: 0, updatedAt: 0,
  }
}

// pdfkit writes page dictionaries uncompressed, so page count and size can be read from the raw bytes
function inspectPDF(buffer: Buffer) {
  const raw = buffer.toString('latin1')
  const mediaBoxes = [...raw.matchAll(/\/MediaBox \[0 0 ([\d.]+) ([\d.]+)\]/g)]
  return {
    pages: mediaBoxes.length,
    heights: mediaBoxes.map(m => Number(m[2])),
  }
}

const templateIds = Object.keys(pdfTemplates) as TemplateId[]

describe('PDF templates render the whole CV on a single page', () => {
  it.each(templateIds)('%s: a long CV stays on one page taller than A4', async (id) => {
    const Template = pdfTemplates[id]
    const { pages, heights } = inspectPDF(await renderToBuffer(<Template cv={{ ...buildCV(8), template: id }} />))
    expect(pages).toBe(1)
    expect(heights[0]).toBeGreaterThan(A4_HEIGHT)
  })

  it.each(templateIds)('%s: a short CV is never shorter than A4', async (id) => {
    const Template = pdfTemplates[id]
    const { pages, heights } = inspectPDF(await renderToBuffer(<Template cv={{ ...buildCV(1), template: id }} />))
    expect(pages).toBe(1)
    expect(heights[0]).toBeCloseTo(A4_HEIGHT, 0)
  })
})
