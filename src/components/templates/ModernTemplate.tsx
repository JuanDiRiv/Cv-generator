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

export function ModernTemplate({ cv, baselineCV, highlightChanges = false }: TemplateProps) {
  const accent = cv.accentColor || '#2d6a4f'
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
    <div className="flex font-sans" style={{ width: '210mm', minHeight: '297mm', background: '#fff' }}>
      <div className="w-[78mm] shrink-0 p-6 flex flex-col gap-5" style={{ background: accent, color: 'rgba(255,255,255,0.9)' }}>
        {contact && (
          <>
            <div>
              <h2 className="text-[13px] font-bold text-white leading-tight">{contact.firstName} {contact.lastName}</h2>
              <p className="text-[9.5px] font-semibold mt-1 opacity-80 uppercase tracking-widest">{contact.jobTitle}</p>
            </div>
            <div>
              <p className="text-[8px] font-bold uppercase tracking-widest mb-2 opacity-60 border-b border-white/20 pb-1">Contacto</p>
              {contact.email && <div className="flex items-center gap-1.5 leading-5"><Mail size={8} className="shrink-0 opacity-60" /><span className="text-[9px] opacity-80">{contact.email}</span></div>}
              {contact.phone && <div className="flex items-center gap-1.5 leading-5"><Phone size={8} className="shrink-0 opacity-60" /><span className="text-[9px] opacity-80">{contact.phone}</span></div>}
              {contact.location && <div className="flex items-center gap-1.5 leading-5"><MapPin size={8} className="shrink-0 opacity-60" /><span className="text-[9px] opacity-80">{contact.location}</span></div>}
              {contact.links?.filter(l => l.label && l.url).map((l, i) => {
                const Icon = linkIcon(l.label)
                return (
                  <a key={i} href={l.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 leading-5 opacity-80 hover:opacity-100 hover:underline text-white">
                    <Icon size={8} className="shrink-0" />
                    <span className="text-[9px]">{l.label}</span>
                  </a>
                )
              })}
            </div>
          </>
        )}
        {skills && (
          <div>
            <p className="text-[8px] font-bold uppercase tracking-widest mb-2 opacity-60 border-b border-white/20 pb-1">Habilidades</p>
            {skills.displayMode === 'chips' ? (
              <div className="flex flex-wrap gap-1">
                {skills.chips.map((c) => {
                  const isAdded = highlightChanges && !baselineChipSet.has(c.label.toLowerCase())
                  return (
                    <span
                      key={c.id}
                      className={`rounded px-1.5 py-0.5 text-[8px] ${isAdded ? 'bg-emerald-400/35 text-white' : 'bg-white/20 text-white'}`}
                    >
                      {c.label}
                    </span>
                  )
                })}
                {highlightChanges && removedChips.map((label) => (
                  <span key={`removed-${label}`} className="rounded px-1.5 py-0.5 text-[8px] bg-red-400/35 text-white line-through">
                    {label}
                  </span>
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {skills.categories.map(cat => (
                  <div key={cat.id}>
                    <p className="text-[8px] font-bold uppercase tracking-wider text-white/60">{cat.name}</p>
                    <p className="text-[8.5px] text-white/80 leading-relaxed">
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
        {languages && languages.entries.length > 0 && (
          <div>
            <p className="text-[8px] font-bold uppercase tracking-widest mb-2 opacity-60 border-b border-white/20 pb-1">Idiomas</p>
            {languages.entries.map(l => <p key={l.id} className="text-[9px] opacity-80 leading-5">{l.language} — {l.level}</p>)}
          </div>
        )}
      </div>
      <div className="flex-1 p-7 flex flex-col gap-5">
        {about?.summary && (
          <div>
            <h2 className="border-l-[3px] pl-2 text-[10px] font-bold uppercase tracking-wider mb-2" style={{ borderColor: accent, color: accent }}>Sobre mí</h2>
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
          <div>
            <h2 className="border-l-[3px] pl-2 text-[10px] font-bold uppercase tracking-wider mb-3" style={{ borderColor: accent, color: accent }}>Experiencia</h2>
            {experience.displayMode === 'timeline' ? (
              <div className="relative pl-4 border-l-2" style={{ borderColor: accent + '50' }}>
                {experience.entries.map((entry, i) => (
                  <div key={entry.id} className="relative mb-4 pl-3 last:mb-0">
                    <div className="absolute -left-5.25 top-1 h-2.5 w-2.5 rounded-full border-2" style={{ background: i === 0 ? accent : '#fff', borderColor: accent }} />
                    <div className="flex items-baseline justify-between">
                      <span className="text-[10px] font-bold text-zinc-800">{entry.title}</span>
                      <span className="text-[8px] rounded px-1.5 py-0.5 ml-2" style={{ background: accent + '15', color: accent }}>{entry.startDate}{entry.current ? ' — Actual' : entry.endDate ? ` — ${entry.endDate}` : ''}</span>
                    </div>
                    <p className="text-[9px] mb-1 font-medium" style={{ color: accent }}>{entry.company}</p>
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
            ) : (
              <div className="flex flex-col gap-3">
                {experience.entries.map(entry => (
                  <div key={entry.id}>
                    <div className="flex justify-between"><span className="text-[10px] font-bold text-zinc-800">{entry.title}</span><span className="text-[8.5px] text-zinc-400">{entry.startDate}{entry.current ? ' — Actual' : ''}</span></div>
                    <p className="text-[9px] mb-1" style={{ color: accent }}>{entry.company}</p>
                    {entry.location && <p className="text-[8.5px] text-zinc-400 mb-1">{entry.location}</p>}
                    <p className="text-[9px] text-zinc-500 whitespace-pre-line">
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
            )}
          </div>
        )}
        {education && education.entries.length > 0 && (
          <div>
            <h2 className="border-l-[3px] pl-2 text-[10px] font-bold uppercase tracking-wider mb-2" style={{ borderColor: accent, color: accent }}>Educación</h2>
            {education.entries.map(e => (
              <div key={e.id} className="mb-2">
                <p className="text-[10px] font-bold text-zinc-800">{e.degree}</p>
                <p className="text-[9px]" style={{ color: accent }}>{e.institution}</p>
                <p className="text-[8px] text-zinc-400">{e.startDate}{e.endDate ? ` — ${e.endDate}` : ''}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
