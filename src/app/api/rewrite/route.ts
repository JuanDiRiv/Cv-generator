import OpenAI from 'openai'

export const runtime = 'nodejs'

type FieldKind = 'experience-description' | 'about-summary'

interface RewriteRequest {
  text: string
  language: string
  field?: FieldKind
  context?: {
    title?: string
    company?: string
    location?: string
    jobTitle?: string
  }
}

const MODEL = 'gpt-5.4-mini'

const LANGUAGE_LABEL: Record<string, string> = {
  es: 'español',
  en: 'English',
  pt: 'português',
  fr: 'français',
  de: 'Deutsch',
  it: 'italiano',
}

function buildPrompt(field: FieldKind, language: string, context?: RewriteRequest['context']): string {
  const langName = LANGUAGE_LABEL[language] ?? language

  const base = [
    'You are an expert ATS resume writer.',
    `Write the result entirely in ${langName}.`,
    'Return strict JSON only, no markdown, with shape: {"text": string}.',
    'Use strong action verbs and quantifiable impact when reasonable. Do not invent metrics that are not implied by the input.',
    'Do not include the job title, company or dates inside the text — only the bullets.',
    'Keep tone professional and concise.',
  ]

  if (field === 'experience-description') {
    base.push(
      'Rewrite the user input as 3 to 6 bullet lines.',
      'Each bullet MUST start with the character "• " (bullet + space) followed by the achievement.',
      'Separate bullets with a single newline character (\\n). No blank lines.',
      'No introductory or closing sentences, just the bullets.',
    )
    if (context?.title || context?.company) {
      base.push(`Role context (do not repeat in output): ${context.title ?? ''} at ${context.company ?? ''}.`)
    }
  } else {
    base.push(
      'Rewrite the user input as a 2 to 4 sentence professional summary in a single paragraph.',
      'Do NOT use bullets. Do NOT use first person plural ("we"). First person singular implicit (no "I am"); start with the role / value proposition.',
      'Avoid clichés like "passionate", "team player".',
    )
    if (context?.jobTitle) {
      base.push(`Person target role: ${context.jobTitle}.`)
    }
  }

  return base.join(' ')
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return Response.json({ error: 'Missing OPENAI_API_KEY' }, { status: 500 })
    }

    const body = (await request.json()) as RewriteRequest
    const text = (body.text ?? '').trim()
    const language = (body.language ?? 'es').trim().toLowerCase()
    const field: FieldKind = body.field === 'about-summary' ? 'about-summary' : 'experience-description'

    if (!text || text.length < 10) {
      return Response.json(
        { error: 'Escribe al menos una frase con lo que hiciste antes de pedir la reescritura.' },
        { status: 400 },
      )
    }
    if (text.length > 4000) {
      return Response.json({ error: 'Texto demasiado largo (máx. 4000 caracteres).' }, { status: 400 })
    }

    const client = new OpenAI({ apiKey })
    const completion = await client.chat.completions.create({
      model: MODEL,
      temperature: 0.3,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: buildPrompt(field, language, body.context) },
        { role: 'user', content: text },
      ],
    })

    const content = completion.choices[0]?.message?.content
    if (!content) {
      return Response.json({ error: 'OpenAI devolvió respuesta vacía' }, { status: 502 })
    }

    const parsed = JSON.parse(content) as { text?: unknown }
    let rewritten = typeof parsed.text === 'string' ? parsed.text.trim() : ''

    if (!rewritten) {
      return Response.json({ error: 'No se pudo generar la reescritura' }, { status: 502 })
    }

    if (field === 'experience-description') {
      // Normalize bullets: ensure each non-empty line starts with "• "
      rewritten = rewritten
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => (line.startsWith('•') ? line : `• ${line.replace(/^[-*]\s*/, '')}`))
        .join('\n')
    }

    return Response.json({ text: rewritten })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido'
    return Response.json({ error: message }, { status: 500 })
  }
}
