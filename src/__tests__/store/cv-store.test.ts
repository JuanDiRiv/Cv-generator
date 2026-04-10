// src/__tests__/store/cv-store.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useCVStore } from '@/store/cv-store'

describe('cv-store', () => {
  beforeEach(() => {
    useCVStore.setState({ cv: null, isDirty: false, isSaving: false, translatedData: null })
  })

  it('setCV populates the store', () => {
    const { result } = renderHook(() => useCVStore())
    act(() => {
      result.current.setCV({
        id: '1', uid: 'u', title: 'My CV', language: 'es',
        template: 'budapest', accentColor: '#6366f1', sections: [],
        createdAt: 0, updatedAt: 0,
      })
    })
    expect(result.current.cv?.title).toBe('My CV')
    expect(result.current.isDirty).toBe(false)
  })

  it('updateField marks store as dirty', () => {
    const { result } = renderHook(() => useCVStore())
    act(() => {
      result.current.setCV({
        id: '1', uid: 'u', title: 'Old', language: 'es',
        template: 'budapest', accentColor: '#6366f1', sections: [],
        createdAt: 0, updatedAt: 0,
      })
      result.current.updateField('title', 'New')
    })
    expect(result.current.cv?.title).toBe('New')
    expect(result.current.isDirty).toBe(true)
  })
})
