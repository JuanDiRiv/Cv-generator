import { describe, it, expect, afterEach } from 'vitest'
import { parseJSONLoose } from '@/lib/ai/client'
import { getAIProvider, getAIModel } from '@/lib/ai/config'

describe('parseJSONLoose', () => {
  it('parses plain JSON', () => {
    expect(parseJSONLoose('{"a":1}')).toEqual({ a: 1 })
  })

  it('parses JSON wrapped in a markdown fence', () => {
    expect(parseJSONLoose('```json\n{"a":1}\n```')).toEqual({ a: 1 })
  })

  it('parses JSON surrounded by stray text', () => {
    expect(parseJSONLoose('Here you go: {"a":1} done')).toEqual({ a: 1 })
  })

  it('throws on non-JSON', () => {
    expect(() => parseJSONLoose('no json here')).toThrow()
  })
})

describe('AI provider config', () => {
  const original = process.env.AI_PROVIDER
  afterEach(() => {
    process.env.AI_PROVIDER = original
  })

  it('defaults to Claude Haiku 5.5', () => {
    delete process.env.AI_PROVIDER
    expect(getAIProvider()).toBe('anthropic')
    expect(getAIModel()).toBe('claude-haiku-5-5')
  })

  it('can be switched to OpenAI via env', () => {
    process.env.AI_PROVIDER = 'openai'
    expect(getAIProvider()).toBe('openai')
  })
})
