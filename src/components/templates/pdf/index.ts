import { Font } from '@react-pdf/renderer'
import { BudapestPDF } from './BudapestPDF'
import { MinimalPDF } from './MinimalPDF'
import { ModernPDF } from './ModernPDF'
import { ExecutivePDF } from './ExecutivePDF'
import type { TemplateId, CVDocument } from '@/types/cv'

// Disable automatic hyphenation to avoid splitting long words with '-'.
Font.registerHyphenationCallback((word) => [word])

export const pdfTemplates: Record<TemplateId, React.ComponentType<{ cv: CVDocument }>> = {
  budapest: BudapestPDF,
  minimal: MinimalPDF,
  modern: ModernPDF,
  executive: ExecutivePDF,
}
