import { describe, it, expect, vi } from 'vitest'

vi.mock('openai', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: vi.fn().mockResolvedValue({
            choices: [
              {
                message: {
                  content: JSON.stringify({ translations: ['Hello', 'Engineer'] }),
                },
              },
            ],
          }),
        },
      },
    })),
  }
})

import { translateTexts } from '@/lib/translate'

describe('translateTexts', () => {
  it('returns translated strings in order', async () => {
    const result = await translateTexts(['Hola', 'Ingeniero'], 'EN', 'fake-key')
    expect(result).toEqual(['Hello', 'Engineer'])
  })

  it('returns empty array when given empty input', async () => {
    const result = await translateTexts([], 'EN', 'fake-key')
    expect(result).toEqual([])
  })
})
