import OpenAI from "openai";
import type {
  CVDocument,
  AboutData,
  ExperienceData,
  SkillsData,
} from "@/types/cv";

export const runtime = "nodejs";

type AnalysisMode = "job-match" | "cv-review";

interface AIExperienceDescriptionChange {
  entryId: string;
  description: string;
}

interface AISkillsCategoryChange {
  name: string;
  skills: string[];
}

interface AIChanges {
  aboutSummary?: string | null;
  experienceDescriptions?: AIExperienceDescriptionChange[];
  skillsChips?: string[];
  skillsCategories?: AISkillsCategoryChange[];
}

interface AIModelResponse {
  score?: number | null;
  summary?: string;
  missingKeywords?: string[];
  recommendations?: string[];
  changes?: AIChanges;
}

function clampScore(value: unknown): number {
  if (typeof value !== "number" || Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function asStringArray(value: unknown, max = 10): string[] {
  if (!Array.isArray(value)) return [];
  const cleaned = value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);

  return cleaned.slice(0, max);
}

function asExperienceChanges(value: unknown): AIExperienceDescriptionChange[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const entryId =
        typeof (item as { entryId?: unknown }).entryId === "string"
          ? (item as { entryId: string }).entryId.trim()
          : "";
      const description =
        typeof (item as { description?: unknown }).description === "string"
          ? (item as { description: string }).description.trim()
          : "";
      if (!entryId || !description) return null;
      return { entryId, description };
    })
    .filter((item): item is AIExperienceDescriptionChange => item !== null)
    .slice(0, 30);
}

function asSkillsCategories(value: unknown): AISkillsCategoryChange[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const name =
        typeof (item as { name?: unknown }).name === "string"
          ? (item as { name: string }).name.trim()
          : "";
      const skills = asStringArray((item as { skills?: unknown }).skills, 15);
      if (!name || skills.length === 0) return null;
      return { name, skills };
    })
    .filter((item): item is AISkillsCategoryChange => item !== null)
    .slice(0, 10);
}

function normalizeModelResponse(
  raw: AIModelResponse,
  mode: AnalysisMode,
): {
  score: number | null;
  summary: string;
  missingKeywords: string[];
  recommendations: string[];
  changes: AIChanges;
} {
  const summary =
    typeof raw.summary === "string" && raw.summary.trim()
      ? raw.summary.trim()
      : "Analisis generado por IA.";

  const score = mode === "job-match" ? clampScore(raw.score) : null;

  return {
    score,
    summary,
    missingKeywords: asStringArray(raw.missingKeywords, 12),
    recommendations: asStringArray(raw.recommendations, 12),
    changes: {
      aboutSummary:
        typeof raw.changes?.aboutSummary === "string" &&
        raw.changes.aboutSummary.trim()
          ? raw.changes.aboutSummary.trim()
          : null,
      experienceDescriptions: asExperienceChanges(
        raw.changes?.experienceDescriptions,
      ),
      skillsChips: asStringArray(raw.changes?.skillsChips, 20),
      skillsCategories: asSkillsCategories(raw.changes?.skillsCategories),
    },
  };
}

function applyAIChanges(cv: CVDocument, changes: AIChanges): CVDocument {
  const next = structuredClone(cv) as CVDocument;

  if (changes.aboutSummary) {
    const aboutSection = next.sections.find((s) => s.type === "about");
    const aboutData = aboutSection?.data as AboutData | undefined;
    if (aboutData) {
      aboutData.summary = changes.aboutSummary;
    }
  }

  if (
    changes.experienceDescriptions &&
    changes.experienceDescriptions.length > 0
  ) {
    const descriptionById = new Map(
      changes.experienceDescriptions.map((item) => [
        item.entryId,
        item.description,
      ]),
    );
    const experienceSection = next.sections.find(
      (s) => s.type === "experience",
    );
    const experienceData = experienceSection?.data as
      | ExperienceData
      | undefined;
    if (experienceData) {
      experienceData.entries = experienceData.entries.map((entry) => {
        const description = descriptionById.get(entry.id);
        if (!description) return entry;
        return { ...entry, description };
      });
    }
  }

  const skillsSection = next.sections.find((s) => s.type === "skills");
  const skillsData = skillsSection?.data as SkillsData | undefined;
  if (skillsData) {
    if (
      skillsData.displayMode === "chips" &&
      changes.skillsChips &&
      changes.skillsChips.length > 0
    ) {
      const nextChips = changes.skillsChips.map((label, idx) => ({
        id: skillsData.chips[idx]?.id ?? `ai-chip-${idx + 1}`,
        label,
      }));
      skillsData.chips = nextChips;
    }

    if (
      skillsData.displayMode === "categories" &&
      changes.skillsCategories &&
      changes.skillsCategories.length > 0
    ) {
      if (skillsData.categories.length > 0) {
        // Preserve category names (titles) exactly as authored.
        skillsData.categories = skillsData.categories.map((category, idx) => {
          const incoming = changes.skillsCategories?.[idx];
          if (!incoming || incoming.skills.length === 0) return category;
          return { ...category, skills: incoming.skills };
        });
      } else {
        // If there are no existing category titles, allow IA to propose an initial structure.
        skillsData.categories = changes.skillsCategories.map(
          (category, idx) => ({
            id: `ai-category-${idx + 1}`,
            name: category.name,
            skills: category.skills,
          }),
        );
      }
    }
  }

  return next;
}

function buildSystemPrompt(mode: AnalysisMode): string {
  const scoreInstruction =
    mode === "job-match"
      ? "Set score to an integer from 0 to 100 based on fit against the job offer."
      : "Set score to null.";

  return [
    "You are an expert ATS resume optimization assistant.",
    "Return strict JSON only. No markdown.",
    scoreInstruction,
    "Always keep the candidate's facts unchanged: contact identity and links, cv.title, section titles, contact.jobTitle, experience title/company/location/start/end/current, education degree/institution/dates, and existing skills category names.",
    "Do not translate or rewrite any title/heading/label. Only improve descriptive content.",
    "You may improve only: about summary, experience descriptions, and skills lists.",
    "Keep the same language already used in cv.language.",
    "Output shape:",
    '{"score": number|null, "summary": string, "missingKeywords": string[], "recommendations": string[], "changes": {"aboutSummary": string|null, "experienceDescriptions": [{"entryId": string, "description": string}], "skillsChips": string[], "skillsCategories": [{"name": string, "skills": string[]}]}}',
  ].join(" ");
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: "Missing OPENAI_API_KEY" },
        { status: 500 },
      );
    }

    const {
      mode,
      cv,
      jobOffer,
    }: { mode: AnalysisMode; cv: CVDocument; jobOffer?: string } =
      await request.json();

    if (!cv || typeof cv !== "object") {
      return Response.json({ error: "Missing CV payload" }, { status: 400 });
    }

    if (mode !== "job-match" && mode !== "cv-review") {
      return Response.json({ error: "Invalid analysis mode" }, { status: 400 });
    }

    if (mode === "job-match" && (!jobOffer || jobOffer.trim().length < 40)) {
      return Response.json(
        { error: "Pega una oferta laboral mas completa para analizar el fit." },
        { status: 400 },
      );
    }

    const client = new OpenAI({ apiKey });
    const completion = await client.chat.completions.create({
      model: "gpt-5.4-nano",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: buildSystemPrompt(mode),
        },
        {
          role: "user",
          content: JSON.stringify({
            mode,
            cv,
            jobOffer: mode === "job-match" ? jobOffer : null,
          }),
        },
      ],
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return Response.json(
        { error: "OpenAI returned empty response" },
        { status: 502 },
      );
    }

    const parsed = JSON.parse(content) as AIModelResponse;
    const normalized = normalizeModelResponse(parsed, mode);
    const suggestedCV = applyAIChanges(cv, normalized.changes);

    return Response.json({
      analysis: {
        mode,
        score: normalized.score,
        summary: normalized.summary,
        missingKeywords: normalized.missingKeywords,
        recommendations: normalized.recommendations,
      },
      suggestedCV,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to analyze CV with AI";
    return Response.json({ error: message }, { status: 500 });
  }
}
