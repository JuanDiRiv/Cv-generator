// src/store/cv-store.ts
import { create } from "zustand";
import type { CVDocument, CVSection } from "@/types/cv";

export interface AIAnalysisReport {
  mode: string;
  score: number | null;
  summary: string;
  missingKeywords: string[];
  recommendations: string[];
}

export interface AITextResult {
  tool: string;
  title: string;
  content: string;
  meta?: { language?: string };
}

interface CVStore {
  cv: CVDocument | null;
  isDirty: boolean;
  isSaving: boolean;
  translatedData: CVDocument | null;
  aiSuggestionCV: CVDocument | null;
  aiAnalysis: AIAnalysisReport | null;
  aiTextResult: AITextResult | null;
  setCV: (cv: CVDocument, options?: { markDirty?: boolean }) => void;
  updateField: <K extends keyof CVDocument>(
    key: K,
    value: CVDocument[K],
  ) => void;
  updateSection: (sectionId: string, data: Partial<CVSection>) => void;
  reorderSections: (sections: CVSection[]) => void;
  setIsSaving: (v: boolean) => void;
  setTranslatedData: (data: CVDocument | null) => void;
  setAISuggestion: (cv: CVDocument, analysis: AIAnalysisReport) => void;
  clearAISuggestion: () => void;
  setAITextResult: (result: AITextResult | null) => void;
  acceptSectionSuggestion: (sectionId: string) => void;
  discardSectionSuggestion: (sectionId: string) => void;
  acceptAllSuggestions: () => void;
  discardAllSuggestions: () => void;
  markSaved: () => void;
}

function sectionsEqual(a: CVSection | undefined, b: CVSection | undefined) {
  if (!a || !b) return a === b;
  return JSON.stringify(a.data) === JSON.stringify(b.data);
}

function buildMergedCV(
  base: CVDocument,
  suggestion: CVDocument,
  pickFromSuggestion: (sectionId: string) => boolean,
): CVDocument {
  const sections = base.sections.map((sec) => {
    if (!pickFromSuggestion(sec.id)) return sec;
    const replacement = suggestion.sections.find((s) => s.id === sec.id);
    return replacement ? { ...sec, data: replacement.data } : sec;
  });
  return { ...base, sections };
}

function suggestionHasAnyDiff(base: CVDocument, suggestion: CVDocument) {
  return base.sections.some((sec) => {
    const other = suggestion.sections.find((s) => s.id === sec.id);
    return !sectionsEqual(sec, other);
  });
}

export const useCVStore = create<CVStore>((set) => ({
  cv: null,
  isDirty: false,
  isSaving: false,
  translatedData: null,
  aiSuggestionCV: null,
  aiAnalysis: null,
  aiTextResult: null,

  setCV: (cv, options) =>
    set({
      cv,
      isDirty: options?.markDirty ?? false,
      aiSuggestionCV: null,
      aiAnalysis: null,
      aiTextResult: null,
    }),

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

  setAISuggestion: (aiSuggestionCV, aiAnalysis) =>
    set({ aiSuggestionCV, aiAnalysis, aiTextResult: null }),

  clearAISuggestion: () => set({ aiSuggestionCV: null, aiAnalysis: null }),

  setAITextResult: (aiTextResult) => set({ aiTextResult }),

  acceptSectionSuggestion: (sectionId) =>
    set((state) => {
      if (!state.cv || !state.aiSuggestionCV) return {};
      const merged = buildMergedCV(
        state.cv,
        state.aiSuggestionCV,
        (id) => id === sectionId,
      );
      const mergedSection = merged.sections.find((s) => s.id === sectionId);
      const newSuggestion: CVDocument = {
        ...state.aiSuggestionCV,
        sections: state.aiSuggestionCV.sections.map((sec) =>
          sec.id === sectionId && mergedSection
            ? { ...sec, data: mergedSection.data }
            : sec,
        ),
      };
      const stillHasDiff = suggestionHasAnyDiff(merged, newSuggestion);
      return {
        cv: merged,
        isDirty: true,
        aiSuggestionCV: stillHasDiff ? newSuggestion : null,
        aiAnalysis: stillHasDiff ? state.aiAnalysis : null,
      };
    }),

  discardSectionSuggestion: (sectionId) =>
    set((state) => {
      if (!state.cv || !state.aiSuggestionCV) return {};
      const baseSection = state.cv.sections.find((s) => s.id === sectionId);
      if (!baseSection) return {};
      const newSuggestion: CVDocument = {
        ...state.aiSuggestionCV,
        sections: state.aiSuggestionCV.sections.map((sec) =>
          sec.id === sectionId ? { ...sec, data: baseSection.data } : sec,
        ),
      };
      const stillHasDiff = suggestionHasAnyDiff(state.cv, newSuggestion);
      return {
        aiSuggestionCV: stillHasDiff ? newSuggestion : null,
        aiAnalysis: stillHasDiff ? state.aiAnalysis : null,
      };
    }),

  acceptAllSuggestions: () =>
    set((state) => {
      if (!state.cv || !state.aiSuggestionCV) return {};
      const merged = buildMergedCV(state.cv, state.aiSuggestionCV, () => true);
      return {
        cv: merged,
        isDirty: true,
        aiSuggestionCV: null,
        aiAnalysis: null,
      };
    }),

  discardAllSuggestions: () => set({ aiSuggestionCV: null, aiAnalysis: null }),

  markSaved: () => set({ isDirty: false }),
}));
