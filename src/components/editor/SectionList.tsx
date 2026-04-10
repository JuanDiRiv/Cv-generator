'use client'
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { useCVStore } from '@/store/cv-store'
import { SectionCard } from './SectionCard'
import { ContactForm } from '@/components/sections/ContactForm'
import { AboutForm } from '@/components/sections/AboutForm'
import { ExperienceForm } from '@/components/sections/ExperienceForm'
import { SkillsForm } from '@/components/sections/SkillsForm'
import { EducationForm } from '@/components/sections/EducationForm'
import { LanguagesForm } from '@/components/sections/LanguagesForm'
import type { SectionType } from '@/types/cv'

const formMap: Record<SectionType, React.ComponentType<{ sectionId: string }>> = {
  contact: ContactForm,
  about: AboutForm,
  experience: ExperienceForm,
  skills: SkillsForm,
  education: EducationForm,
  languages: LanguagesForm,
}

export function SectionList() {
  const { cv, reorderSections } = useCVStore()
  const sensors = useSensors(useSensor(PointerSensor))

  if (!cv) return null

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = cv.sections.findIndex((s) => s.id === active.id)
    const newIndex = cv.sections.findIndex((s) => s.id === over.id)
    reorderSections(arrayMove(cv.sections, oldIndex, newIndex))
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={cv.sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2">
          {cv.sections.map((section) => {
            const FormComponent = formMap[section.type]
            return (
              <SectionCard key={section.id} section={section}>
                <FormComponent sectionId={section.id} />
              </SectionCard>
            )
          })}
        </div>
      </SortableContext>
    </DndContext>
  )
}
