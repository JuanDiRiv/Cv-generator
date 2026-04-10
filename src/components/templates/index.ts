import { BudapestTemplate } from './BudapestTemplate'
import { MinimalTemplate } from './MinimalTemplate'
import { ModernTemplate } from './ModernTemplate'
import { ExecutiveTemplate } from './ExecutiveTemplate'
import type { TemplateId, CVDocument } from '@/types/cv'

export const templates: Record<TemplateId, React.ComponentType<{ cv: CVDocument }>> = {
  budapest: BudapestTemplate,
  minimal: MinimalTemplate,
  modern: ModernTemplate,
  executive: ExecutiveTemplate,
}
