// src/store/cv-store.ts
import { create } from "zustand";
import type { CVDocument, CVSection } from "@/types/cv";

interface CVStore {
  cv: CVDocument | null;
  isDirty: boolean;
  isSaving: boolean;
  translatedData: CVDocument | null;
  setCV: (cv: CVDocument, options?: { markDirty?: boolean }) => void;
  updateField: <K extends keyof CVDocument>(
    key: K,
    value: CVDocument[K],
  ) => void;
  updateSection: (sectionId: string, data: Partial<CVSection>) => void;
  reorderSections: (sections: CVSection[]) => void;
  setIsSaving: (v: boolean) => void;
  setTranslatedData: (data: CVDocument | null) => void;
  markSaved: () => void;
}

export const useCVStore = create<CVStore>((set) => ({
  cv: null,
  isDirty: false,
  isSaving: false,
  translatedData: null,

  setCV: (cv, options) => set({ cv, isDirty: options?.markDirty ?? false }),

  updateField: (key, value) =>
    set((s) => (s.cv ? { cv: { ...s.cv, [key]: value }, isDirty: true } : {})),

  updateSection: (sectionId, data) =>
    set((s) => {
      if (!s.cv) return {};
      const sections = s.cv.sections.map((sec) =>
        sec.id === sectionId ? { ...sec, ...data } : sec,
      );
      return { cv: { ...s.cv, sections }, isDirty: true };
    }),

  reorderSections: (sections) =>
    set((s) => (s.cv ? { cv: { ...s.cv, sections }, isDirty: true } : {})),

  setIsSaving: (isSaving) => set({ isSaving }),

  setTranslatedData: (translatedData) => set({ translatedData }),

  markSaved: () => set({ isDirty: false }),
}));
