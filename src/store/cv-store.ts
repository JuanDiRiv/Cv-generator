// src/store/cv-store.ts
import { create } from "zustand";
import type { CVDocument, CVSection } from "@/types/cv";

export type EditorPreviewTab = "original" | "ai";

export interface AIAnalysisReport {
  mode: "job-match" | "cv-review";
  score: number | null;
  summary: string;
  missingKeywords: string[];
  recommendations: string[];
}

interface CVStore {
  cv: CVDocument | null;
  isDirty: boolean;
  isSaving: boolean;
  translatedData: CVDocument | null;
  aiSuggestionCV: CVDocument | null;
  aiAnalysis: AIAnalysisReport | null;
  activePreviewTab: EditorPreviewTab;
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
  setActivePreviewTab: (tab: EditorPreviewTab) => void;
  markSaved: () => void;
}

export const useCVStore = create<CVStore>((set) => ({
  cv: null,
  isDirty: false,
  isSaving: false,
  translatedData: null,
  aiSuggestionCV: null,
  aiAnalysis: null,
  activePreviewTab: "original",

  setCV: (cv, options) =>
    set({
      cv,
      isDirty: options?.markDirty ?? false,
      aiSuggestionCV: null,
      aiAnalysis: null,
      activePreviewTab: "original",
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
    set({ aiSuggestionCV, aiAnalysis, activePreviewTab: "ai" }),

  clearAISuggestion: () =>
    set({
      aiSuggestionCV: null,
      aiAnalysis: null,
      activePreviewTab: "original",
    }),

  setActivePreviewTab: (tab) =>
    set((state) => ({
      activePreviewTab:
        tab === "ai" && !state.aiSuggestionCV ? "original" : tab,
    })),

  markSaved: () => set({ isDirty: false }),
}));
