import { Document, Page, View, Text, Link } from '@react-pdf/renderer'
import { MailIcon, PhoneIcon, MapPinIcon, pdfLinkIcon } from './icons'
import { getPdfLabels } from './labels'
import type { CVDocument, ContactData, AboutData, ExperienceData, SkillsData, EducationData, LanguagesData } from '@/types/cv'
import { withOpacity } from './color'

interface Props { cv: CVDocument }

export function ModernPDF({ cv }: Props) {
  const accent = cv.accentColor || '#2d6a4f'
  const contact = cv.sections.find(s => s.type === 'contact' && s.visible)?.data as ContactData | undefined
  const about = cv.sections.find(s => s.type === 'about' && s.visible)?.data as AboutData | undefined
  const experience = cv.sections.find(s => s.type === 'experience' && s.visible)?.data as ExperienceData | undefined
  const skills = cv.sections.find(s => s.type === 'skills' && s.visible)?.data as SkillsData | undefined
  const education = cv.sections.find(s => s.type === 'education' && s.visible)?.data as EducationData | undefined
  const languages = cv.sections.find(s => s.type === 'languages' && s.visible)?.data as LanguagesData | undefined
  const labels = getPdfLabels(cv.language)

  return (
    <Document>
      <Page size="A4" style={{ flexDirection: 'row', fontFamily: 'Helvetica', backgroundColor: '#ffffff' }}>

        {/* ── Colored sidebar ── */}
        <View style={{ width: 190, backgroundColor: accent, padding: 20, flexShrink: 0 }}>
          {contact && (
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 13, fontFamily: 'Helvetica-Bold', color: '#ffffff', lineHeight: 1.2 }}>{contact.firstName} {contact.lastName}</Text>
              <Text style={{ fontSize: 8, color: 'rgba(255,255,255,0.75)', marginTop: 4 }}>{contact.jobTitle?.toUpperCase()}</Text>
            </View>
          )}
          {contact && (
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 6.5, fontFamily: 'Helvetica-Bold', color: 'rgba(255,255,255,0.6)', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.2)', paddingBottom: 3, marginBottom: 5 }}>{labels.contact}</Text>
              {contact.email && (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 3 }}>
                  <View style={{ width: 9, marginRight: 4 }}>
                    <MailIcon size={8} color="rgba(255,255,255,0.6)" />
                  </View>
                  <Text style={{ fontSize: 7.5, color: 'rgba(255,255,255,0.8)' }}>{contact.email}</Text>
                </View>
              )}
              {contact.phone && (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 3 }}>
                  <View style={{ width: 9, marginRight: 4 }}>
                    <PhoneIcon size={8} color="rgba(255,255,255,0.6)" />
                  </View>
                  <Text style={{ fontSize: 7.5, color: 'rgba(255,255,255,0.8)' }}>{contact.phone}</Text>
                </View>
              )}
              {contact.location && (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 3 }}>
                  <View style={{ width: 9, marginRight: 4 }}>
                    <MapPinIcon size={8} color="rgba(255,255,255,0.6)" />
                  </View>
                  <Text style={{ fontSize: 7.5, color: 'rgba(255,255,255,0.8)' }}>{contact.location}</Text>
                </View>
              )}
              {contact.links?.filter(l => l.label && l.url).map((l, i) => {
                const Icon = pdfLinkIcon(l.label)
                return (
                  <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 3 }}>
                    <View style={{ width: 9, marginRight: 4 }}>
                      <Icon size={8} color="rgba(255,255,255,0.8)" />
                    </View>
                    <Link src={l.url} style={{ color: 'rgba(255,255,255,0.8)', fontSize: 7.5, textDecoration: 'none' }}>{l.label}</Link>
                  </View>
                )
              })}
            </View>
          )}
          {skills && (
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 6.5, fontFamily: 'Helvetica-Bold', color: 'rgba(255,255,255,0.6)', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.2)', paddingBottom: 3, marginBottom: 6 }}>{labels.skills}</Text>
              {skills.displayMode === 'chips' ? (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                  {skills.chips.map(chip => (
                    <View key={chip.id} style={{ backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 5, paddingVertical: 2, borderRadius: 2, marginRight: 3, marginBottom: 3 }}>
                      <Text style={{ fontSize: 7, color: '#ffffff' }}>{chip.label}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <View>
                  {skills.categories.map(cat => (
                    <View key={cat.id} style={{ marginBottom: 6 }}>
                      <Text style={{ fontSize: 6.5, fontFamily: 'Helvetica-Bold', color: 'rgba(255,255,255,0.6)', marginBottom: 2 }}>{cat.name.toUpperCase()}</Text>
                      <Text style={{ fontSize: 7.5, color: 'rgba(255,255,255,0.85)', lineHeight: 1.5 }}>{cat.skills.join(' | ')}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}
          {languages && languages.entries.length > 0 && (
            <View>
              <Text style={{ fontSize: 6.5, fontFamily: 'Helvetica-Bold', color: 'rgba(255,255,255,0.6)', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.2)', paddingBottom: 3, marginBottom: 5 }}>{labels.languages}</Text>
              {languages.entries.map(l => (
                <Text key={l.id} style={{ fontSize: 7.5, color: 'rgba(255,255,255,0.8)', marginBottom: 3 }}>{l.language} — {l.level}</Text>
              ))}
            </View>
          )}
        </View>

        {/* ── Main ── */}
        <View style={{ flex: 1, padding: 24 }}>
          {about?.summary && (
            <View style={{ marginBottom: 14 }}>
              <View style={{ borderLeftWidth: 3, borderLeftColor: accent, paddingLeft: 6, marginBottom: 5 }}>
                <Text style={{ fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: accent }}>{labels.aboutMe}</Text>
              </View>
              <Text style={{ fontSize: 8.5, color: '#52525b', lineHeight: 1.5 }}>{about.summary}</Text>
            </View>
          )}

          {experience && experience.entries.length > 0 && (
            <View style={{ marginBottom: 14 }}>
              <View style={{ borderLeftWidth: 3, borderLeftColor: accent, paddingLeft: 6, marginBottom: 8 }}>
                <Text style={{ fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: accent }}>{labels.experience}</Text>
              </View>

              {experience.displayMode === 'timeline' ? (
                <View style={{ position: 'relative', paddingLeft: 14 }}>
                  <View style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 2, backgroundColor: accent }} />
                  {experience.entries.map((entry, i) => (
                    <View key={entry.id} style={{ marginBottom: i < experience.entries.length - 1 ? 10 : 0, position: 'relative' }}>
                      <View style={{ position: 'absolute', left: -19, top: 2, width: 10, height: 10, borderRadius: 5, backgroundColor: i === 0 ? accent : '#ffffff', borderWidth: 2, borderColor: accent }} />
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 2 }}>
                        <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#1f2937', flex: 1 }}>{entry.title}</Text>
                        <View style={{ backgroundColor: withOpacity(accent, 0.12), paddingHorizontal: 5, paddingVertical: 2, borderRadius: 3, marginLeft: 6 }}>
                          <Text style={{ fontSize: 7, color: accent }}>{entry.startDate}{entry.current ? ` — ${labels.present}` : entry.endDate ? ` — ${entry.endDate}` : ''}</Text>
                        </View>
                      </View>
                      <Text style={{ fontSize: 8, color: accent, fontFamily: 'Helvetica-Bold', marginBottom: 3 }}>{entry.company}</Text>
                      {entry.location && <Text style={{ fontSize: 7.5, color: '#71717a', marginBottom: 2 }}>{entry.location}</Text>}
                      <Text style={{ fontSize: 8, color: '#71717a', lineHeight: 1.5 }}>{entry.description}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <View>
                  {experience.entries.map((entry, i) => (
                    <View key={entry.id} style={{ marginBottom: i < experience.entries.length - 1 ? 10 : 0 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
                        <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#1f2937' }}>{entry.title}</Text>
                        <Text style={{ fontSize: 7.5, color: '#71717a' }}>{entry.startDate}{entry.current ? ` — ${labels.present}` : entry.endDate ? ` — ${entry.endDate}` : ''}</Text>
                      </View>
                      <Text style={{ fontSize: 8, color: accent, fontFamily: 'Helvetica-Bold', marginBottom: 3 }}>{entry.company}</Text>
                      {entry.location && <Text style={{ fontSize: 7.5, color: '#71717a', marginBottom: 2 }}>{entry.location}</Text>}
                      <Text style={{ fontSize: 8, color: '#71717a', lineHeight: 1.5 }}>{entry.description}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          {education && education.entries.length > 0 && (
            <View>
              <View style={{ borderLeftWidth: 3, borderLeftColor: accent, paddingLeft: 6, marginBottom: 8 }}>
                <Text style={{ fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: accent }}>{labels.education}</Text>
              </View>
              {education.entries.map((entry, i) => (
                <View key={entry.id} wrap={false} style={{ marginBottom: i < education.entries.length - 1 ? 8 : 0 }}>
                  <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#1f2937' }}>{entry.degree}</Text>
                  <Text style={{ fontSize: 8, color: accent }}>{entry.institution}</Text>
                  <Text style={{ fontSize: 7.5, color: '#71717a', marginTop: 1 }}>{entry.startDate}{entry.endDate ? ` — ${entry.endDate}` : ''}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </Page>
    </Document>
  )
}
