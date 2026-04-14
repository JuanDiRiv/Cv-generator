import { BudapestTemplate } from './BudapestTemplate'
import { MinimalTemplate } from './MinimalTemplate'
import { ModernTemplate } from './ModernTemplate'
import { ExecutiveTemplate } from './ExecutiveTemplate'
import type { TemplateId, CVDocument } from '@/types/cv'

export interface TemplateProps {
  cv: CVDocument
  baselineCV?: CVDocument
  highlightChanges?: boolean
}

export const templates: Record<TemplateId, React.ComponentType<TemplateProps>> = {
  budapest: BudapestTemplate,
  minimal: MinimalTemplate,
  modern: ModernTemplate,
  executive: ExecutiveTemplate,
}
