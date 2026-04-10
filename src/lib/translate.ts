import OpenAI from 'openai'

export async function translateTexts(
  texts: string[],
  targetLang: 'EN' | 'ES',
  apiKey: string
): Promise<string[]> {
  if (texts.length === 0) return []

  const client = new OpenAI({ apiKey })
  const language = targetLang === 'EN' ? 'English' : 'Spanish'

  const completion = await client.chat.completions.create({
    model: 'gpt-5.4-nano',
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content:
          `You are a professional CV translator. For each string in the input array, detect its language and translate it to ${language} if it is not already in ${language}. If a string is already in ${language}, return it unchanged. Preserve formatting, bullet points, line breaks, and professional tone. Keep the exact same number of strings in the same order. Return JSON with a single key "translations" whose value is an array of strings.`,
      },
      {
        role: 'user',
        content: JSON.stringify({ texts }),
      },
    ],
  })

  const content = completion.choices[0]?.message?.content
  if (!content) throw new Error('OpenAI returned empty response')

  const parsed = JSON.parse(content) as { translations: string[] }
  if (!Array.isArray(parsed.translations) || parsed.translations.length !== texts.length) {
    throw new Error(`OpenAI returned ${parsed.translations?.length} translations, expected ${texts.length}`)
  }
  return parsed.translations
}
