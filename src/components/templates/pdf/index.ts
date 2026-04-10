import { BudapestPDF } from './BudapestPDF'
import { MinimalPDF } from './MinimalPDF'
import { ModernPDF } from './ModernPDF'
import { ExecutivePDF } from './ExecutivePDF'
import type { TemplateId, CVDocument } from '@/types/cv'

export const pdfTemplates: Record<TemplateId, React.ComponentType<{ cv: CVDocument }>> = {
  budapest: BudapestPDF,
  minimal: MinimalPDF,
  modern: ModernPDF,
  executive: ExecutivePDF,
}
