import OpenAI from "openai";
import type {
  CVDocument,
  AboutData,
  ExperienceData,
  SkillsData,
} from "@/types/cv";
import { translateTexts } from "@/lib/translate";

export const runtime = "nodejs";

type ToolMode =
  | "job-match"
  | "cv-review"
  | "translate"
  | "keywords"
  | "tailor"
  | "cover-letter"
  | "interview-questions"
  | "one-page"
  | "proofread"
  | "metrics"
  | "tone";

const CV_TOOLS = new Set<ToolMode>([
  "job-match",
  "cv-review",
  "tailor",
  "one-page",
  "proofread",
  "tone",
]);

const TEXT_TOOLS = new Set<ToolMode>([
  "keywords",
  "cover-letter",
  "interview-questions",
  "metrics",
]);

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

interface AITextModelResponse {
  title?: string;
  content?: string;
}

function clampScore(value: unknown): number {
  if (typeof value !== "number" || Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function asStringArray(value: unknown, max = 10): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean)
    .slice(0, max);
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
  mode: ToolMode,
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
      : "Análisis generado por IA.";

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
    if (aboutData) aboutData.summary = changes.aboutSummary;
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
      skillsData.chips = changes.skillsChips.map((label, idx) => ({
        id: skillsData.chips[idx]?.id ?? `ai-chip-${idx + 1}`,
        label,
      }));
    }

    if (
      skillsData.displayMode === "categories" &&
      changes.skillsCategories &&
      changes.skillsCategories.length > 0
    ) {
      if (skillsData.categories.length > 0) {
        skillsData.categories = skillsData.categories.map((category, idx) => {
          const incoming = changes.skillsCategories?.[idx];
          if (!incoming || incoming.skills.length === 0) return category;
          return { ...category, skills: incoming.skills };
        });
      } else {
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

const BASE_RULES = [
  "You are an expert ATS resume optimization assistant.",
  "Return strict JSON only. No markdown.",
  "Always keep the candidate's facts unchanged: contact identity and links, cv.title, section titles, contact.jobTitle, experience title/company/location/start/end/current, education degree/institution/dates, and existing skills category names.",
  "Do not translate or rewrite any title/heading/label. Only improve descriptive content.",
  "You may improve only: about summary, experience descriptions, and skills lists.",
  "Keep the same language already used in cv.language unless explicitly asked to change it.",
];

const CHANGES_SHAPE =
  '{"score": number|null, "summary": string, "missingKeywords": string[], "recommendations": string[], "changes": {"aboutSummary": string|null, "experienceDescriptions": [{"entryId": string, "description": string}], "skillsChips": string[], "skillsCategories": [{"name": string, "skills": string[]}]}}';

function buildCVSystemPrompt(
  mode: ToolMode,
  options: { tone?: string } = {},
): string {
  const lines = [...BASE_RULES];

  switch (mode) {
    case "job-match":
      lines.push(
        "Set score (0-100) based on fit against the job offer.",
        "Rewrite about/experience/skills to better match the offer with measurable outcomes.",
      );
      break;
    case "cv-review":
      lines.push(
        "Set score to null.",
        "Improve clarity, action verbs and quantified impact for ATS without inventing facts.",
      );
      break;
    case "tailor":
      lines.push(
        "Set score (0-100) for fit against the offer.",
        "Aggressively tailor: incorporate offer keywords, restructure bullets, prioritize most relevant achievements first.",
      );
      break;
    case "one-page":
      lines.push(
        "Set score to null.",
        "Compress descriptions: merge similar bullets, remove fluff, target 3-4 punchy bullets per role, keep only the most impactful skills.",
      );
      break;
    case "proofread":
      lines.push(
        "Set score to null.",
        "Fix typos, grammar, capitalization, punctuation and inconsistent tense. Do not change meaning. Put a list of corrections in recommendations.",
      );
      break;
    case "tone":
      lines.push(
        "Set score to null.",
        `Rewrite in a ${options.tone || "professional"} tone, keeping facts intact. Adjust voice, vocabulary and rhythm consistently across about/experience.`,
      );
      break;
  }

  lines.push("Output shape:", CHANGES_SHAPE);
  return lines.join(" ");
}

function buildTextSystemPrompt(
  mode: ToolMode,
  options: { tone?: string; language?: string } = {},
): string {
  const lang = options.language || "the same language as the CV";
  switch (mode) {
    case "keywords":
      return [
        "You are an ATS keyword analyst.",
        "Given a CV (and optional job offer), produce a clear text report of the most relevant ATS keywords grouped by category (Hard skills, Soft skills, Tools, Domain, Missing).",
        "Use plain text with section headings and comma-separated lists. No markdown headers, just UPPERCASE labels.",
        `Write in ${lang}.`,
        'Return strict JSON: {"title": string, "content": string}',
      ].join(" ");
    case "cover-letter":
      return [
        "You are an expert cover-letter writer.",
        "Given a CV and a job offer, write a concise (max ~280 words), specific and warm cover letter.",
        "Open with a strong hook, mention 2-3 relevant achievements with metrics, close with a clear call to action.",
        `Write in ${lang}.`,
        'Return strict JSON: {"title": string, "content": string}',
      ].join(" ");
    case "interview-questions":
      return [
        "You are a senior technical interviewer.",
        "Given the CV (and optional job offer), produce 8-12 interview questions tailored to the candidate, mixing behavioural, technical and role-specific. For each question add a short suggested answer angle.",
        "Format each item as: 'Q: ...\\nA: ...' separated by blank lines. No markdown.",
        `Write in ${lang}.`,
        'Return strict JSON: {"title": string, "content": string}',
      ].join(" ");
    case "metrics":
      return [
        "You are a resume coach focused on quantified impact.",
        "Scan experience descriptions and identify bullets that lack metrics. Suggest concrete metric ideas the candidate could add (timeframe, %, $, scale, count). Do not invent numbers; phrase as questions/prompts.",
        "Format: per role, list bullets with a 'Sugerencia:' line.",
        `Write in ${lang}.`,
        'Return strict JSON: {"title": string, "content": string}',
      ].join(" ");
  }
  return "";
}

async function runCVMode(
  client: OpenAI,
  mode: ToolMode,
  cv: CVDocument,
  options: { jobOffer?: string; tone?: string },
) {
  const completion = await client.chat.completions.create({
    model: "gpt-5.4-mini",
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: buildCVSystemPrompt(mode, options) },
      {
        role: "user",
        content: JSON.stringify({
          mode,
          cv,
          jobOffer: options.jobOffer ?? null,
          tone: options.tone ?? null,
        }),
      },
    ],
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error("OpenAI returned empty response");

  const parsed = JSON.parse(content) as AIModelResponse;
  const normalized = normalizeModelResponse(parsed, mode);
  const suggestedCV = applyAIChanges(cv, normalized.changes);

  return {
    kind: "cv" as const,
    suggestedCV,
    analysis: {
      mode,
      score: normalized.score,
      summary: normalized.summary,
      missingKeywords: normalized.missingKeywords,
      recommendations: normalized.recommendations,
    },
  };
}

async function runTextMode(
  client: OpenAI,
  mode: ToolMode,
  cv: CVDocument,
  options: { jobOffer?: string; language?: string },
) {
  const completion = await client.chat.completions.create({
    model: "gpt-5.4-mini",
    temperature: 0.4,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: buildTextSystemPrompt(mode, options) },
      {
        role: "user",
        content: JSON.stringify({
          mode,
          cv,
          jobOffer: options.jobOffer ?? null,
        }),
      },
    ],
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error("OpenAI returned empty response");

  const parsed = JSON.parse(content) as AITextModelResponse;
  const title =
    typeof parsed.title === "string" && parsed.title.trim()
      ? parsed.title.trim()
      : defaultTextTitle(mode);
  const text =
    typeof parsed.content === "string" && parsed.content.trim()
      ? parsed.content.trim()
      : "";

  if (!text) throw new Error("OpenAI returned empty content");

  return {
    kind: "text" as const,
    title,
    text,
    meta: { language: options.language ?? null },
  };
}

function defaultTextTitle(mode: ToolMode): string {
  switch (mode) {
    case "keywords":
      return "Keywords ATS";
    case "cover-letter":
      return "Cover Letter";
    case "interview-questions":
      return "Preguntas de entrevista";
    case "metrics":
      return "Sugerencias de métricas";
    default:
      return "Resultado IA";
  }
}

async function runTranslateMode(
  apiKey: string,
  cv: CVDocument,
  targetLang: "EN" | "ES",
): Promise<{
  kind: "cv";
  suggestedCV: CVDocument;
  analysis: {
    mode: ToolMode;
    score: null;
    summary: string;
    missingKeywords: string[];
    recommendations: string[];
  };
}> {
  // Collect translatable strings: about.summary + experience descriptions
  const next = structuredClone(cv) as CVDocument;
  const aboutSection = next.sections.find((s) => s.type === "about");
  const aboutData = aboutSection?.data as AboutData | undefined;
  const experienceSection = next.sections.find((s) => s.type === "experience");
  const experienceData = experienceSection?.data as ExperienceData | undefined;

  const buckets: { kind: "about" | "exp"; idx?: number; text: string }[] = [];
  if (aboutData?.summary)
    buckets.push({ kind: "about", text: aboutData.summary });
  experienceData?.entries.forEach((entry, idx) => {
    if (entry.description)
      buckets.push({ kind: "exp", idx, text: entry.description });
  });

  const lower = targetLang.toLowerCase() as "en" | "es";

  if (buckets.length === 0) {
    return {
      kind: "cv",
      suggestedCV: { ...next, language: lower },
      analysis: {
        mode: "translate",
        score: null,
        summary: `CV marcado como ${targetLang}. No había contenido para traducir.`,
        missingKeywords: [],
        recommendations: [],
      },
    };
  }

  const translated = await translateTexts(
    buckets.map((b) => b.text),
    targetLang,
    apiKey,
  );

  buckets.forEach((b, i) => {
    const text = translated[i];
    if (!text) return;
    if (b.kind === "about" && aboutData) aboutData.summary = text;
    if (b.kind === "exp" && experienceData && typeof b.idx === "number") {
      const entry = experienceData.entries[b.idx];
      if (entry) entry.description = text;
    }
  });

  next.language = lower;

  return {
    kind: "cv",
    suggestedCV: next,
    analysis: {
      mode: "translate",
      score: null,
      summary: `CV traducido a ${targetLang === "EN" ? "Inglés" : "Español"}.`,
      missingKeywords: [],
      recommendations: [],
    },
  };
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
      tone,
      language,
    }: {
      mode: ToolMode;
      cv: CVDocument;
      jobOffer?: string;
      tone?: string;
      language?: string;
    } = await request.json();

    if (!cv || typeof cv !== "object") {
      return Response.json({ error: "Missing CV payload" }, { status: 400 });
    }

    if (!CV_TOOLS.has(mode) && !TEXT_TOOLS.has(mode) && mode !== "translate") {
      return Response.json({ error: "Invalid tool mode" }, { status: 400 });
    }

    const requiresOffer: ToolMode[] = [
      "job-match",
      "tailor",
      "cover-letter",
      "interview-questions",
    ];
    if (
      requiresOffer.includes(mode) &&
      (!jobOffer || jobOffer.trim().length < 40)
    ) {
      return Response.json(
        {
          error:
            "Esta herramienta necesita una oferta laboral con al menos 40 caracteres.",
        },
        { status: 400 },
      );
    }

    const client = new OpenAI({ apiKey });

    if (mode === "translate") {
      const target: "EN" | "ES" = language === "ES" ? "ES" : "EN";
      const result = await runTranslateMode(apiKey, cv, target);
      return Response.json(result);
    }

    if (CV_TOOLS.has(mode)) {
      const result = await runCVMode(client, mode, cv, { jobOffer, tone });
      return Response.json(result);
    }

    if (TEXT_TOOLS.has(mode)) {
      const result = await runTextMode(client, mode, cv, {
        jobOffer,
        language,
      });
      return Response.json(result);
    }

    return Response.json({ error: "Unhandled mode" }, { status: 400 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to run AI tool";
    return Response.json({ error: message }, { status: 500 });
  }
}
