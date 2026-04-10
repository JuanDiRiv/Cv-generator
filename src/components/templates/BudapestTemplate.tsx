import type { CVDocument, ExperienceData, SkillsData, EducationData, LanguagesData, ContactData, AboutData } from '@/types/cv'

interface Props { cv: CVDocument }

export function BudapestTemplate({ cv }: Props) {
  const accent = cv.accentColor || '#6366f1'

  const contact = cv.sections.find(s => s.type === 'contact' && s.visible)?.data as ContactData | undefined
  const about = cv.sections.find(s => s.type === 'about' && s.visible)?.data as AboutData | undefined
  const experience = cv.sections.find(s => s.type === 'experience' && s.visible)?.data as ExperienceData | undefined
  const skills = cv.sections.find(s => s.type === 'skills' && s.visible)?.data as SkillsData | undefined
  const education = cv.sections.find(s => s.type === 'education' && s.visible)?.data as EducationData | undefined
  const languages = cv.sections.find(s => s.type === 'languages' && s.visible)?.data as LanguagesData | undefined

  return (
    <div
      className="cv-page flex font-sans text-[#222]"
      style={{ width: '210mm', minHeight: '297mm', background: '#fff' }}
    >
      {/* Sidebar */}
      <div className="w-[80mm] flex-shrink-0 p-6 flex flex-col gap-5" style={{ background: '#1a1a2e', color: '#ccc' }}>
        {/* Avatar initials */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold text-white" style={{ background: accent }}>
          {contact ? `${contact.firstName?.[0] ?? ''}${contact.lastName?.[0] ?? ''}` : 'CV'}
        </div>

        {contact && (
          <div className="text-center">
            <p className="text-[11px] font-bold text-white leading-tight">{contact.firstName} {contact.lastName}</p>
            <p className="mt-1 text-[9px] font-semibold uppercase tracking-widest" style={{ color: accent }}>{contact.jobTitle}</p>
          </div>
        )}

        {contact && (
          <div>
            <p className="mb-2 border-b pb-1 text-[8px] font-bold uppercase tracking-widest" style={{ color: accent, borderColor: '#2a2a4e' }}>Contacto</p>
            {contact.email && <p className="text-[9px] text-zinc-400 leading-5">{contact.email}</p>}
            {contact.phone && <p className="text-[9px] text-zinc-400 leading-5">{contact.phone}</p>}
            {contact.location && <p className="text-[9px] text-zinc-400 leading-5">{contact.location}</p>}
            {contact.linkedin && <p className="text-[9px] text-zinc-400 leading-5">{contact.linkedin}</p>}
          </div>
        )}

        {skills && (
          <div>
            <p className="mb-2 border-b pb-1 text-[8px] font-bold uppercase tracking-widest" style={{ color: accent, borderColor: '#2a2a4e' }}>Habilidades</p>
            {skills.displayMode === 'chips' ? (
              <div className="flex flex-wrap gap-1">
                {skills.chips.map(chip => (
                  <span key={chip.id} className="rounded px-1.5 py-0.5 text-[8px]" style={{ background: '#2a2a4e', color: '#b0b0c8' }}>{chip.label}</span>
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {skills.categories.map(cat => (
                  <div key={cat.id}>
                    <p className="text-[8px] font-bold uppercase tracking-wider mb-0.5" style={{ color: accent }}>{cat.name}</p>
                    <p className="text-[8.5px] leading-[1.55]" style={{ color: '#b0b0c8' }}>
                      {cat.skills.join(' | ')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {languages && languages.entries.length > 0 && (
          <div>
            <p className="mb-2 border-b pb-1 text-[8px] font-bold uppercase tracking-widest" style={{ color: accent, borderColor: '#2a2a4e' }}>Idiomas</p>
            {languages.entries.map(l => (
              <p key={l.id} className="text-[9px] text-zinc-400 leading-5">{l.language} — {l.level}</p>
            ))}
          </div>
        )}
      </div>

      {/* Main */}
      <div className="flex-1 p-7 flex flex-col gap-5">
        {contact && (
          <div className="border-b-2 pb-3" style={{ borderColor: accent }}>
            <h1 className="text-[20px] font-bold leading-tight" style={{ color: '#1a1a2e' }}>{contact.firstName} {contact.lastName}</h1>
            <p className="mt-1 text-[10px] font-semibold" style={{ color: accent }}>{contact.jobTitle}</p>
          </div>
        )}

        {about?.summary && (
          <div>
            <h2 className="mb-2 border-l-[3px] pl-2 text-[10px] font-bold uppercase tracking-wider" style={{ borderColor: accent, color: '#1a1a2e' }}>Sobre mí</h2>
            <p className="text-[9.5px] leading-relaxed text-zinc-600">{about.summary}</p>
          </div>
        )}

        {experience && experience.entries.length > 0 && (
          <div>
            <h2 className="mb-3 border-l-[3px] pl-2 text-[10px] font-bold uppercase tracking-wider" style={{ borderColor: accent, color: '#1a1a2e' }}>Experiencia</h2>
            {experience.displayMode === 'timeline' ? (
              <div className="relative pl-4 border-l-2" style={{ borderColor: accent + '60' }}>
                {experience.entries.map((entry, i) => (
                  <div key={entry.id} className="relative mb-4 pl-4 last:mb-0">
                    <div className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full border-2" style={{ background: i === 0 ? accent : '#fff', borderColor: accent }} />
                    <div className="flex items-baseline justify-between">
                      <span className="text-[10px] font-bold" style={{ color: '#1a1a2e' }}>{entry.title}</span>
                      <span className="text-[8px] rounded px-1.5 py-0.5 ml-2 flex-shrink-0" style={{ background: accent + '15', color: accent }}>{entry.startDate}{entry.current ? ' — Actual' : entry.endDate ? ` — ${entry.endDate}` : ''}</span>
                    </div>
                    <p className="text-[9px] mb-1" style={{ color: accent }}>{entry.company}</p>
                    <p className="text-[9px] leading-relaxed text-zinc-500 whitespace-pre-line">{entry.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {experience.entries.map((entry) => (
                  <div key={entry.id} className="flex gap-2">
                    <div className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full" style={{ background: accent }} />
                    <div>
                      <div className="flex items-baseline justify-between">
                        <span className="text-[10px] font-bold" style={{ color: '#1a1a2e' }}>{entry.title}</span>
                        <span className="text-[8px] text-zinc-400 ml-2 flex-shrink-0">{entry.startDate}{entry.current ? ' — Actual' : entry.endDate ? ` — ${entry.endDate}` : ''}</span>
                      </div>
                      <p className="text-[9px] mb-1" style={{ color: accent }}>{entry.company}</p>
                      <p className="text-[9px] leading-relaxed text-zinc-500 whitespace-pre-line">{entry.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {education && education.entries.length > 0 && (
          <div>
            <h2 className="mb-3 border-l-[3px] pl-2 text-[10px] font-bold uppercase tracking-wider" style={{ borderColor: accent, color: '#1a1a2e' }}>Educación</h2>
            <div className="flex flex-col gap-2">
              {education.entries.map((entry) => (
                <div key={entry.id} className="flex gap-2">
                  <div className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full" style={{ background: accent }} />
                  <div>
                    <p className="text-[10px] font-bold" style={{ color: '#1a1a2e' }}>{entry.degree}</p>
                    <p className="text-[9px]" style={{ color: accent }}>{entry.institution}</p>
                    <p className="text-[8px] text-zinc-400">{entry.startDate}{entry.endDate ? ` — ${entry.endDate}` : ''}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
