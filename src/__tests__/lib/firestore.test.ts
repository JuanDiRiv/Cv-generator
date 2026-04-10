// src/__tests__/lib/firestore.test.ts
import { describe, it, expect, vi } from 'vitest'

vi.mock('@/lib/firebase', () => ({ db: {} }))
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  doc: vi.fn(),
  addDoc: vi.fn().mockResolvedValue({ id: 'cv-123' }),
  getDocs: vi.fn().mockResolvedValue({ docs: [] }),
  getDoc: vi.fn().mockResolvedValue({ exists: () => false }),
  updateDoc: vi.fn().mockResolvedValue(undefined),
  deleteDoc: vi.fn().mockResolvedValue(undefined),
  query: vi.fn(),
  orderBy: vi.fn(),
}))

import { createCV, getUserCVs } from '@/lib/firestore'

describe('firestore helpers', () => {
  it('createCV returns a document id', async () => {
    const id = await createCV('uid-1', {
      uid: 'uid-1', title: 'Test', language: 'es', template: 'budapest',
      accentColor: '#6366f1', sections: [], createdAt: 0, updatedAt: 0,
    })
    expect(id).toBe('cv-123')
  })

  it('getUserCVs returns empty array when no CVs', async () => {
    const cvs = await getUserCVs('uid-1')
    expect(cvs).toEqual([])
  })
})
