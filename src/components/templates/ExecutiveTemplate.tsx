import type { CVDocument, ContactData, AboutData, ExperienceData, SkillsData, EducationData, LanguagesData } from '@/types/cv'

interface Props { cv: CVDocument }

export function ExecutiveTemplate({ cv }: Props) {
  const accent = cv.accentColor || '#c9a96e'
  const contact = cv.sections.find(s => s.type === 'contact' && s.visible)?.data as ContactData | undefined
  const about = cv.sections.find(s => s.type === 'about' && s.visible)?.data as AboutData | undefined
  const experience = cv.sections.find(s => s.type === 'experience' && s.visible)?.data as ExperienceData | undefined
  const skills = cv.sections.find(s => s.type === 'skills' && s.visible)?.data as SkillsData | undefined
  const education = cv.sections.find(s => s.type === 'education' && s.visible)?.data as EducationData | undefined
  const languages = cv.sections.find(s => s.type === 'languages' && s.visible)?.data as LanguagesData | undefined

  return (
    <div className="font-sans" style={{ width: '210mm', minHeight: '297mm', background: '#fff' }}>
      {/* Dark header band */}
      <div className="px-8 py-6 flex items-end justify-between" style={{ background: '#1a1a1a' }}>
        <div>
          {contact && <h1 className="text-[22px] font-bold text-white tracking-tight">{contact.firstName} {contact.lastName}</h1>}
          {contact && <p className="text-[10px] font-semibold mt-1 uppercase tracking-widest" style={{ color: accent }}>{contact.jobTitle}</p>}
        </div>
        {contact && (
          <div className="text-right text-[8.5px] text-zinc-400 leading-5">
            {contact.email && <p>{contact.email}</p>}
            {contact.phone && <p>{contact.phone}</p>}
            {contact.location && <p>{contact.location}</p>}
          </div>
        )}
      </div>

      <div className="px-8 py-6 flex gap-8">
        {/* Left column */}
        <div className="flex-1 flex flex-col gap-5">
          {about?.summary && (
            <div>
              <h2 className="text-[9px] font-bold uppercase tracking-widest mb-1.5 border-b pb-1" style={{ color: accent, borderColor: accent + '40' }}>Perfil Profesional</h2>
              <p className="text-[9.5px] leading-relaxed text-zinc-600">{about.summary}</p>
            </div>
          )}
          {experience && experience.entries.length > 0 && (
            <div>
              <h2 className="text-[9px] font-bold uppercase tracking-widest mb-3 border-b pb-1" style={{ color: accent, borderColor: accent + '40' }}>Experiencia</h2>
              {experience.displayMode === 'timeline' ? (
                <div className="relative pl-3 border-l" style={{ borderColor: accent + '40' }}>
                  {experience.entries.map((entry, i) => (
                    <div key={entry.id} className="relative mb-4 pl-3">
                      <div className="absolute -left-[17px] top-1 h-2 w-2 rounded-full border" style={{ background: i === 0 ? accent : '#fff', borderColor: accent }} />
                      <div className="flex justify-between items-baseline">
                        <span className="text-[10px] font-bold text-zinc-800">{entry.title}</span>
                        <span className="text-[8px] ml-2 flex-shrink-0" style={{ color: accent }}>{entry.startDate}{entry.current ? ' — Actual' : entry.endDate ? ` — ${entry.endDate}` : ''}</span>
                      </div>
                      <p className="text-[9px] mb-1 text-zinc-500">{entry.company}</p>
                      <p className="text-[9px] text-zinc-500 leading-relaxed whitespace-pre-line">{entry.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {experience.entries.map(entry => (
                    <div key={entry.id}>
                      <div className="flex justify-between"><span className="text-[10px] font-bold text-zinc-800">{entry.title}</span><span className="text-[8.5px] text-zinc-400">{entry.startDate}</span></div>
                      <p className="text-[9px] mb-1 text-zinc-500">{entry.company}</p>
                      <p className="text-[9px] text-zinc-500 whitespace-pre-line">{entry.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="w-[70mm] flex flex-col gap-5">
          {skills && (
            <div>
              <h2 className="text-[9px] font-bold uppercase tracking-widest mb-2 border-b pb-1" style={{ color: accent, borderColor: accent + '40' }}>Habilidades</h2>
              {skills.displayMode === 'chips' ? (
                <div className="flex flex-wrap gap-1">
                  {skills.chips.map(c => <span key={c.id} className="text-[8px] rounded px-1.5 py-0.5 border text-zinc-600" style={{ borderColor: accent + '50' }}>{c.label}</span>)}
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {skills.categories.map(cat => (
                    <div key={cat.id}>
                      <p className="text-[8px] font-bold uppercase tracking-wider" style={{ color: accent }}>{cat.name}</p>
                      <p className="text-[8.5px] text-zinc-500 leading-relaxed">{cat.skills.join(' | ')}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {education && education.entries.length > 0 && (
            <div>
              <h2 className="text-[9px] font-bold uppercase tracking-widest mb-2 border-b pb-1" style={{ color: accent, borderColor: accent + '40' }}>Educación</h2>
              {education.entries.map(e => (
                <div key={e.id} className="mb-2">
                  <p className="text-[10px] font-bold text-zinc-800">{e.degree}</p>
                  <p className="text-[9px] text-zinc-500">{e.institution}</p>
                  <p className="text-[8px] text-zinc-400">{e.startDate}{e.endDate ? ` — ${e.endDate}` : ''}</p>
                </div>
              ))}
            </div>
          )}
          {languages && languages.entries.length > 0 && (
            <div>
              <h2 className="text-[9px] font-bold uppercase tracking-widest mb-2 border-b pb-1" style={{ color: accent, borderColor: accent + '40' }}>Idiomas</h2>
              {languages.entries.map(l => <p key={l.id} className="text-[9px] text-zinc-600 leading-5">{l.language} — {l.level}</p>)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
