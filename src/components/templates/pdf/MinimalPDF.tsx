import { Document, Page, View, Text, Link } from '@react-pdf/renderer'
import { MailIcon, PhoneIcon, MapPinIcon, pdfLinkIcon } from './icons'
import { getPdfLabels } from './labels'
import type { CVDocument, ContactData, AboutData, ExperienceData, SkillsData, EducationData, LanguagesData } from '@/types/cv'
import { resolvePdfAccent, withOpacity } from './color'
import { normalizePdfParagraph } from './text-utils'

interface Props { cv: CVDocument }

export function MinimalPDF({ cv }: Props) {
  const accent = resolvePdfAccent(cv.accentColor)
  const contact = cv.sections.find(s => s.type === 'contact' && s.visible)?.data as ContactData | undefined
  const about = cv.sections.find(s => s.type === 'about' && s.visible)?.data as AboutData | undefined
  const experience = cv.sections.find(s => s.type === 'experience' && s.visible)?.data as ExperienceData | undefined
  const skills = cv.sections.find(s => s.type === 'skills' && s.visible)?.data as SkillsData | undefined
  const education = cv.sections.find(s => s.type === 'education' && s.visible)?.data as EducationData | undefined
  const languages = cv.sections.find(s => s.type === 'languages' && s.visible)?.data as LanguagesData | undefined
  const labels = getPdfLabels(cv.language)

  return (
    <Document>
      <Page size="A4" style={{ fontFamily: 'Helvetica', padding: '14mm 16mm', backgroundColor: '#ffffff', color: '#111111' }}>

        {contact && (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', borderBottomWidth: 2, borderBottomColor: '#111111', paddingBottom: 10, marginBottom: 14 }}>
            <View>
              <Text style={{ fontSize: 20, fontFamily: 'Helvetica-Bold' }}>{contact.firstName} {contact.lastName}</Text>
              <Text style={{ fontSize: 10, color: accent, marginTop: 2, fontFamily: 'Helvetica-Bold' }}>{contact.jobTitle}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              {contact.email && (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                  <Text style={{ fontSize: 8, color: '#71717a' }}>{contact.email}</Text>
                  <View style={{ width: 9, marginLeft: 4 }}>
                    <MailIcon size={8} color="#71717a" />
                  </View>
                </View>
              )}
              {contact.phone && (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                  <Text style={{ fontSize: 8, color: '#71717a' }}>{contact.phone}</Text>
                  <View style={{ width: 9, marginLeft: 4 }}>
                    <PhoneIcon size={8} color="#71717a" />
                  </View>
                </View>
              )}
              {contact.location && (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                  <Text style={{ fontSize: 8, color: '#71717a' }}>{contact.location}</Text>
                  <View style={{ width: 9, marginLeft: 4 }}>
                    <MapPinIcon size={8} color="#71717a" />
                  </View>
                </View>
              )}
              {contact.links?.filter(l => l.label && l.url).map((l, i) => {
                const Icon = pdfLinkIcon(l.label)
                return (
                  <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                    <Link src={l.url} style={{ color: accent, fontSize: 7.5, textDecoration: 'none' }}>{l.label}</Link>
                    <View style={{ width: 9, marginLeft: 4 }}>
                      <Icon size={8} color={accent} />
                    </View>
                  </View>
                )
              })}
            </View>
          </View>
        )}

        {about?.summary && (
          <View style={{ marginBottom: 14 }}>
            <Text style={{ fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: accent, marginBottom: 5 }}>{labels.profile}</Text>
            <Text style={{ fontSize: 8.5, color: '#52525b', lineHeight: 1.5 }}>{normalizePdfParagraph(about.summary)}</Text>
          </View>
        )}

        {experience && experience.entries.length > 0 && (
          <View style={{ marginBottom: 14 }}>
            <Text style={{ fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: accent, marginBottom: 8 }}>{labels.experience}</Text>
            {experience.displayMode === 'timeline' ? (
              <View style={{ position: 'relative', paddingLeft: 14 }}>
                <View style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 2, backgroundColor: accent }} />
                {experience.entries.map((entry, i) => (
                  <View key={entry.id} style={{ marginBottom: i < experience.entries.length - 1 ? 10 : 0, position: 'relative' }}>
                    <View style={{ position: 'absolute', left: -19, top: 2, width: 10, height: 10, borderRadius: 5, backgroundColor: i === 0 ? accent : '#ffffff', borderWidth: 2, borderColor: accent }} />
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 2 }}>
                      <Text style={{ fontSize: 9.5, fontFamily: 'Helvetica-Bold', color: '#111111', flex: 1 }}>{entry.title}</Text>
                      <View style={{ backgroundColor: withOpacity(accent, 0.1), paddingHorizontal: 5, paddingVertical: 2, borderRadius: 3, marginLeft: 6 }}>
                        <Text style={{ fontSize: 7.5, color: accent }}>{entry.startDate}{entry.current ? ` — ${labels.present}` : entry.endDate ? ` — ${entry.endDate}` : ''}</Text>
                      </View>
                    </View>
                    <Text style={{ fontSize: 8.5, color: accent, fontFamily: 'Helvetica-Bold', marginBottom: 3 }}>{entry.company}</Text>
                    {entry.location && <Text style={{ fontSize: 7.5, color: '#71717a', marginBottom: 2 }}>{entry.location}</Text>}
                    <Text style={{ fontSize: 8, color: '#52525b', lineHeight: 1.5 }}>{entry.description}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <View>
                {experience.entries.map((entry, i) => (
                  <View key={entry.id} style={{ marginBottom: i < experience.entries.length - 1 ? 10 : 0 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
                      <Text style={{ fontSize: 9.5, fontFamily: 'Helvetica-Bold', color: '#111111' }}>{entry.title}</Text>
                      <Text style={{ fontSize: 8, color: '#71717a' }}>
                        {entry.startDate}{entry.current ? ` — ${labels.present}` : entry.endDate ? ` — ${entry.endDate}` : ''}
                      </Text>
                    </View>
                    <Text style={{ fontSize: 8.5, color: accent, fontFamily: 'Helvetica-Bold', marginBottom: 3 }}>{entry.company}</Text>
                    {entry.location && <Text style={{ fontSize: 7.5, color: '#71717a', marginBottom: 2 }}>{entry.location}</Text>}
                    <Text style={{ fontSize: 8, color: '#52525b', lineHeight: 1.5 }}>{entry.description}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Two-column bottom */}
        <View style={{ flexDirection: 'row', gap: 20 }}>
          {skills && (
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: accent, marginBottom: 6 }}>{labels.skills}</Text>
              {skills.displayMode === 'chips' ? (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                  {skills.chips.map(chip => (
                    <View key={chip.id} style={{ borderWidth: 1, borderColor: '#e5e7eb', paddingHorizontal: 5, paddingVertical: 2, borderRadius: 2, marginRight: 3, marginBottom: 3 }}>
                      <Text style={{ fontSize: 7, color: '#52525b' }}>{chip.label}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <View>
                  {skills.categories.map(cat => (
                    <View key={cat.id} style={{ marginBottom: 5 }}>
                      <Text style={{ fontSize: 7, fontFamily: 'Helvetica-Bold', color: accent, marginBottom: 1 }}>{cat.name.toUpperCase()}</Text>
                      <Text style={{ fontSize: 8, color: '#52525b', lineHeight: 1.4 }}>{cat.skills.join(' | ')}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          <View style={{ width: 180, flexShrink: 0 }}>
            {education && education.entries.length > 0 && (
              <View style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: accent, marginBottom: 6 }}>{labels.education}</Text>
                {education.entries.map(e => (
                  <View key={e.id} style={{ marginBottom: 6 }}>
                    <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#111111' }}>{e.degree}</Text>
                    <Text style={{ fontSize: 8, color: accent }}>{e.institution}</Text>
                    <Text style={{ fontSize: 7.5, color: '#71717a' }}>{e.startDate}{e.endDate ? ` — ${e.endDate}` : ''}</Text>
                  </View>
                ))}
              </View>
            )}
            {languages && languages.entries.length > 0 && (
              <View>
                <Text style={{ fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: accent, marginBottom: 6 }}>{labels.languages}</Text>
                {languages.entries.map(l => (
                  <Text key={l.id} style={{ fontSize: 8, color: '#52525b', marginBottom: 2 }}>{l.language} — {l.level}</Text>
                ))}
              </View>
            )}
          </View>
        </View>
      </Page>
    </Document>
  )
}
