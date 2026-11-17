import { describe, it, expect, vi } from 'vitest'

const generateJSON = vi.fn()
vi.mock('@/lib/ai/client', () => ({
  generateJSON: (...args: unknown[]) => generateJSON(...args),
}))

import { translateTexts } from '@/lib/translate'

describe('translateTexts', () => {
  it('returns translated strings in order', async () => {
    generateJSON.mockResolvedValueOnce({ translations: ['Hello', 'Engineer'] })
    const result = await translateTexts(['Hola', 'Ingeniero'], 'EN')
    expect(result).toEqual(['Hello', 'Engineer'])
  })

  it('returns empty array when given empty input', async () => {
    const result = await translateTexts([], 'EN')
    expect(result).toEqual([])
  })

  it('throws when the model returns a different number of strings', async () => {
    generateJSON.mockResolvedValueOnce({ translations: ['Hello'] })
    await expect(translateTexts(['Hola', 'Ingeniero'], 'EN')).rejects.toThrow()
  })
})
