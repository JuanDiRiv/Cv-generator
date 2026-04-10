import { Document, Page, View, Text, Link } from '@react-pdf/renderer'
import { MailIcon, PhoneIcon, MapPinIcon, pdfLinkIcon } from './icons'
import type { CVDocument, ContactData, AboutData, ExperienceData, SkillsData, EducationData, LanguagesData } from '@/types/cv'
import { withOpacity } from './color'

interface Props { cv: CVDocument }

export function BudapestPDF({ cv }: Props) {
  const accent = cv.accentColor || '#6366f1'
  const contact = cv.sections.find(s => s.type === 'contact' && s.visible)?.data as ContactData | undefined
  const about = cv.sections.find(s => s.type === 'about' && s.visible)?.data as AboutData | undefined
  const experience = cv.sections.find(s => s.type === 'experience' && s.visible)?.data as ExperienceData | undefined
  const skills = cv.sections.find(s => s.type === 'skills' && s.visible)?.data as SkillsData | undefined
  const education = cv.sections.find(s => s.type === 'education' && s.visible)?.data as EducationData | undefined
  const languages = cv.sections.find(s => s.type === 'languages' && s.visible)?.data as LanguagesData | undefined

  return (
    <Document>
      <Page size="A4" style={{ flexDirection: 'row', fontFamily: 'Helvetica', backgroundColor: '#ffffff' }}>

        {/* ── Sidebar ── */}
        <View style={{ width: 195, backgroundColor: '#1a1a2e', padding: 20, flexShrink: 0 }}>

          {/* Avatar */}
          <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: accent, alignSelf: 'center', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
            <Text style={{ color: '#ffffff', fontSize: 17, fontFamily: 'Helvetica-Bold' }}>
              {contact ? `${contact.firstName?.[0] ?? ''}${contact.lastName?.[0] ?? ''}` : 'CV'}
            </Text>
          </View>

          {contact && (
            <View style={{ alignItems: 'center', marginBottom: 14 }}>
              <Text style={{ color: '#ffffff', fontSize: 10, fontFamily: 'Helvetica-Bold', textAlign: 'center' }}>
                {contact.firstName} {contact.lastName}
              </Text>
              <Text style={{ color: accent, fontSize: 7, marginTop: 3, textAlign: 'center' }}>
                {contact.jobTitle?.toUpperCase()}
              </Text>
            </View>
          )}

          {contact && (
            <View style={{ marginBottom: 14 }}>
              <Text style={{ color: accent, fontSize: 6.5, fontFamily: 'Helvetica-Bold', borderBottomWidth: 1, borderBottomColor: '#2a2a4e', paddingBottom: 3, marginBottom: 5 }}>CONTACTO</Text>
              {contact.email && (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 3 }}>
                  <View style={{ width: 9, marginRight: 4 }}>
                    <MailIcon size={8} color="#9ca3af" />
                  </View>
                  <Text style={{ color: '#9ca3af', fontSize: 7.5 }}>{contact.email}</Text>
                </View>
              )}
              {contact.phone && (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 3 }}>
                  <View style={{ width: 9, marginRight: 4 }}>
                    <PhoneIcon size={8} color="#9ca3af" />
                  </View>
                  <Text style={{ color: '#9ca3af', fontSize: 7.5 }}>{contact.phone}</Text>
                </View>
              )}
              {contact.location && (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 3 }}>
                  <View style={{ width: 9, marginRight: 4 }}>
                    <MapPinIcon size={8} color="#9ca3af" />
                  </View>
                  <Text style={{ color: '#9ca3af', fontSize: 7.5 }}>{contact.location}</Text>
                </View>
              )}
              {contact.links?.filter(l => l.label && l.url).map((l, i) => {
                const Icon = pdfLinkIcon(l.label)
                return (
                  <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 3 }}>
                    <View style={{ width: 9, marginRight: 4 }}>
                      <Icon size={8} color={accent} />
                    </View>
                    <Link src={l.url} style={{ color: accent, fontSize: 7.5, textDecoration: 'none' }}>{l.label}</Link>
                  </View>
                )
              })}
            </View>
          )}

          {skills && (
            <View style={{ marginBottom: 14 }}>
              <Text style={{ color: accent, fontSize: 6.5, fontFamily: 'Helvetica-Bold', borderBottomWidth: 1, borderBottomColor: '#2a2a4e', paddingBottom: 3, marginBottom: 6 }}>HABILIDADES</Text>
              {skills.displayMode === 'chips' ? (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                  {skills.chips.map(chip => (
                    <View key={chip.id} style={{ backgroundColor: '#2a2a4e', paddingHorizontal: 5, paddingVertical: 2, borderRadius: 2, marginRight: 3, marginBottom: 3 }}>
                      <Text style={{ color: '#b0b0c8', fontSize: 7 }}>{chip.label}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <View>
                  {skills.categories.map(cat => (
                    <View key={cat.id} style={{ marginBottom: 7 }}>
                      <Text style={{ color: accent, fontSize: 6.5, fontFamily: 'Helvetica-Bold', marginBottom: 2 }}>{cat.name.toUpperCase()}</Text>
                      <Text style={{ color: '#b0b0c8', fontSize: 7.5, lineHeight: 1.5 }}>{cat.skills.join(' | ')}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          {languages && languages.entries.length > 0 && (
            <View>
              <Text style={{ color: accent, fontSize: 6.5, fontFamily: 'Helvetica-Bold', borderBottomWidth: 1, borderBottomColor: '#2a2a4e', paddingBottom: 3, marginBottom: 5 }}>IDIOMAS</Text>
              {languages.entries.map(l => (
                <Text key={l.id} style={{ color: '#9ca3af', fontSize: 7.5, marginBottom: 3 }}>{l.language} — {l.level}</Text>
              ))}
            </View>
          )}
        </View>

        {/* ── Main ── */}
        <View style={{ flex: 1, padding: 24 }}>

          {contact && (
            <View style={{ borderBottomWidth: 2, borderBottomColor: accent, paddingBottom: 10, marginBottom: 14 }}>
              <Text style={{ fontSize: 19, fontFamily: 'Helvetica-Bold', color: '#1a1a2e' }}>{contact.firstName} {contact.lastName}</Text>
              <Text style={{ fontSize: 9, color: accent, marginTop: 3, fontFamily: 'Helvetica-Bold' }}>{contact.jobTitle}</Text>
            </View>
          )}

          {about?.summary && (
            <View style={{ marginBottom: 14 }}>
              <View style={{ borderLeftWidth: 3, borderLeftColor: accent, paddingLeft: 6, marginBottom: 5 }}>
                <Text style={{ fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: '#1a1a2e' }}>SOBRE MÍ</Text>
              </View>
              <Text style={{ fontSize: 8.5, color: '#52525b', lineHeight: 1.5 }}>{about.summary}</Text>
            </View>
          )}

          {experience && experience.entries.length > 0 && (
            <View style={{ marginBottom: 14 }}>
              <View style={{ borderLeftWidth: 3, borderLeftColor: accent, paddingLeft: 6, marginBottom: 8 }}>
                <Text style={{ fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: '#1a1a2e' }}>EXPERIENCIA</Text>
              </View>

              {experience.displayMode === 'timeline' ? (
                /* Timeline mode */
                <View style={{ position: 'relative', paddingLeft: 14 }}>
                  <View style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 2, backgroundColor: accent }} />
                  {experience.entries.map((entry, i) => (
                    <View key={entry.id} style={{ marginBottom: i < experience.entries.length - 1 ? 10 : 0, position: 'relative' }}>
                      {/* Dot */}
                      <View style={{
                        position: 'absolute', left: -19, top: 2,
                        width: 10, height: 10, borderRadius: 5,
                        backgroundColor: i === 0 ? accent : '#ffffff',
                        borderWidth: 2, borderColor: accent,
                      }} />
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 2 }}>
                        <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#1a1a2e', flex: 1 }}>{entry.title}</Text>
                        {/* Date badge */}
                        <View style={{ backgroundColor: withOpacity(accent, 0.12), paddingHorizontal: 5, paddingVertical: 2, borderRadius: 3, marginLeft: 6 }}>
                          <Text style={{ fontSize: 7, color: accent }}>
                            {entry.startDate}{entry.current ? ' — Actual' : entry.endDate ? ` — ${entry.endDate}` : ''}
                          </Text>
                        </View>
                      </View>
                      <Text style={{ fontSize: 8, color: accent, fontFamily: 'Helvetica-Bold', marginBottom: 3 }}>{entry.company}</Text>
                      {entry.location && <Text style={{ fontSize: 7.5, color: '#71717a', marginBottom: 2 }}>{entry.location}</Text>}
                      <Text style={{ fontSize: 8, color: '#71717a', lineHeight: 1.5 }}>{entry.description}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                /* List mode */
                <View>
                  {experience.entries.map((entry, i) => (
                    <View key={entry.id} wrap={false} style={{ flexDirection: 'row', gap: 6, marginBottom: i < experience.entries.length - 1 ? 10 : 0 }}>
                      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: accent, marginTop: 3, flexShrink: 0 }} />
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
                          <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#1a1a2e' }}>{entry.title}</Text>
                          <Text style={{ fontSize: 7.5, color: '#71717a' }}>
                            {entry.startDate}{entry.current ? ' — Actual' : entry.endDate ? ` — ${entry.endDate}` : ''}
                          </Text>
                        </View>
                        <Text style={{ fontSize: 8, color: accent, fontFamily: 'Helvetica-Bold', marginBottom: 3 }}>{entry.company}</Text>
                        {entry.location && <Text style={{ fontSize: 7.5, color: '#71717a', marginBottom: 2 }}>{entry.location}</Text>}
                        <Text style={{ fontSize: 8, color: '#71717a', lineHeight: 1.5 }}>{entry.description}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          {education && education.entries.length > 0 && (
            <View>
              <View style={{ borderLeftWidth: 3, borderLeftColor: accent, paddingLeft: 6, marginBottom: 8 }}>
                <Text style={{ fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: '#1a1a2e' }}>EDUCACIÓN</Text>
              </View>
              {education.entries.map((entry, i) => (
                <View key={entry.id} wrap={false} style={{ flexDirection: 'row', gap: 6, marginBottom: i < education.entries.length - 1 ? 8 : 0 }}>
                  <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: accent, marginTop: 3, flexShrink: 0 }} />
                  <View>
                    <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#1a1a2e' }}>{entry.degree}</Text>
                    <Text style={{ fontSize: 8, color: accent }}>{entry.institution}</Text>
                    <Text style={{ fontSize: 7.5, color: '#71717a', marginTop: 1 }}>{entry.startDate}{entry.endDate ? ` — ${entry.endDate}` : ''}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </Page>
    </Document>
  )
}
