import type { ContactData, AboutData, ExperienceData, SkillsData, EducationData, LanguagesData } from '@/types/cv'
import { Mail, Phone, MapPin, Globe, X, Link as LinkIcon } from 'lucide-react'
import { DiffText, getBaselineTextMaps } from './highlight'
import type { TemplateProps } from './index'

function linkIcon(label: string) {
  const l = label.toLowerCase()
  if (l.includes('twitter') || l === 'x') return X
  if (l.includes('portfolio') || l.includes('web') || l.includes('website')) return Globe
  return LinkIcon
}

export function MinimalTemplate({ cv, baselineCV, highlightChanges = false }: TemplateProps) {
  const accent = cv.accentColor || '#6366f1'
  const contact = cv.sections.find(s => s.type === 'contact' && s.visible)?.data as ContactData | undefined
  const about = cv.sections.find(s => s.type === 'about' && s.visible)?.data as AboutData | undefined
  const experience = cv.sections.find(s => s.type === 'experience' && s.visible)?.data as ExperienceData | undefined
  const skills = cv.sections.find(s => s.type === 'skills' && s.visible)?.data as SkillsData | undefined
  const education = cv.sections.find(s => s.type === 'education' && s.visible)?.data as EducationData | undefined
  const languages = cv.sections.find(s => s.type === 'languages' && s.visible)?.data as LanguagesData | undefined
  const baseline = getBaselineTextMaps(baselineCV)
  const baselineChipSet = new Set(baseline.skillsChipLabels.map((label) => label.toLowerCase()))
  const removedChips = baseline.skillsChipLabels.filter(
    (label) => !skills?.chips.some((chip) => chip.label.toLowerCase() === label.toLowerCase()),
  )

  return (
    <div className="font-sans" style={{ width: '210mm', minHeight: '297mm', background: '#fff', padding: '14mm 16mm', color: '#111' }}>
      {contact && (
        <div className="flex items-start justify-between border-b-2 pb-4 mb-5" style={{ borderColor: '#111' }}>
          <div>
            <h1 className="text-[22px] font-bold tracking-tight">{contact.firstName} {contact.lastName}</h1>
            <p className="text-[11px] font-semibold mt-0.5" style={{ color: accent }}>{contact.jobTitle}</p>
          </div>
          <div className="text-right text-[9px] text-zinc-500 leading-5 flex flex-col items-end gap-0.5">
            {contact.email && <div className="flex items-center gap-1.5"><span>{contact.email}</span><Mail size={8} className="shrink-0 text-zinc-400" /></div>}
            {contact.phone && <div className="flex items-center gap-1.5"><span>{contact.phone}</span><Phone size={8} className="shrink-0 text-zinc-400" /></div>}
            {contact.location && <div className="flex items-center gap-1.5"><span>{contact.location}</span><MapPin size={8} className="shrink-0 text-zinc-400" /></div>}
            {contact.links?.filter(l => l.label && l.url).map((l, i) => {
              const Icon = linkIcon(l.label)
              return (
                <a key={i} href={l.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:underline" style={{ color: accent }}>
                  <span>{l.label}</span>
                  <Icon size={8} className="shrink-0" />
                </a>
              )
            })}
          </div>
        </div>
      )}

      {about?.summary && (
        <div className="mb-5" data-cv-section="about">
          <h2 className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: accent }}>Perfil</h2>
          <p className="text-[9.5px] leading-relaxed text-zinc-600">
            <DiffText
              previousText={baseline.aboutSummary}
              nextText={about.summary}
              enabled={highlightChanges}
              preserveLines
            />
          </p>
        </div>
      )}

      {experience && experience.entries.length > 0 && (
        <div className="mb-5" data-cv-section="experience">
          <h2 className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: accent }}>Experiencia</h2>
          <div className="flex flex-col gap-3">
            {experience.entries.map(entry => (
              <div key={entry.id}>
                <div className="flex justify-between items-baseline">
                  <span className="text-[10.5px] font-bold text-zinc-900">{entry.title}</span>
                  <span className="text-[8.5px] text-zinc-400">{entry.startDate}{entry.current ? ' — Actual' : entry.endDate ? ` — ${entry.endDate}` : ''}</span>
                </div>
                <p className="text-[9px] font-medium mb-1" style={{ color: accent }}>{entry.company}</p>
                {entry.location && <p className="text-[8.5px] text-zinc-400 mb-1">{entry.location}</p>}
                <p className="text-[9px] text-zinc-500 leading-relaxed whitespace-pre-line">
                  <DiffText
                    previousText={baseline.experienceById.get(entry.id) ?? ''}
                    nextText={entry.description}
                    enabled={highlightChanges}
                    preserveLines
                  />
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-8">
        {skills && (
          <div className="flex-1" data-cv-section="skills">
            <h2 className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: accent }}>Habilidades</h2>
            {skills.displayMode === 'chips' ? (
              <div className="flex flex-wrap gap-1">
                {skills.chips.map((c) => {
                  const isAdded = highlightChanges && !baselineChipSet.has(c.label.toLowerCase())
                  return (
                    <span
                      key={c.id}
                      className={`rounded px-1.5 py-0.5 text-[8px] border ${isAdded ? 'border-emerald-400 bg-emerald-500/20 text-emerald-700' : 'border-zinc-200 text-zinc-600'}`}
                    >
                      {c.label}
                    </span>
                  )
                })}
                {highlightChanges && removedChips.map((label) => (
                  <span key={`removed-${label}`} className="rounded px-1.5 py-0.5 text-[8px] border border-red-300 bg-red-500/15 text-red-700 line-through">
                    {label}
                  </span>
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {skills.categories.map(cat => (
                  <div key={cat.id}>
                    <p className="text-[8.5px] font-bold uppercase tracking-wider" style={{ color: accent }}>{cat.name}</p>
                    <p className="text-[8.5px] text-zinc-500">
                      <DiffText
                        previousText={baseline.skillsByCategoryName.get(cat.name.toLowerCase()) ?? ''}
                        nextText={cat.skills.join(' | ')}
                        enabled={highlightChanges}
                      />
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        <div className="flex flex-col gap-4 w-[45%]">
          {education && education.entries.length > 0 && (
            <div data-cv-section="education">
              <h2 className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: accent }}>Educación</h2>
              {education.entries.map(e => (
                <div key={e.id} className="mb-1.5">
                  <p className="text-[10px] font-bold text-zinc-800">{e.degree}</p>
                  <p className="text-[9px]" style={{ color: accent }}>{e.institution}</p>
                  <p className="text-[8px] text-zinc-400">{e.startDate}{e.endDate ? ` — ${e.endDate}` : ''}</p>
                </div>
              ))}
            </div>
          )}
          {languages && languages.entries.length > 0 && (
            <div data-cv-section="languages">
              <h2 className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: accent }}>Idiomas</h2>
              {languages.entries.map(l => <p key={l.id} className="text-[9px] text-zinc-600 leading-5">{l.language} — {l.level}</p>)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
