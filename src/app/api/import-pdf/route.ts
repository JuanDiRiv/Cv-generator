import OpenAI from "openai";
import { normalizeImportedCV, type ImportedCVPayload } from "@/lib/cv-import";

export const runtime = "nodejs";

const MAX_PDF_SIZE_BYTES = 8 * 1024 * 1024;
const IMPORT_MODEL = "gpt-5.4-mini";

const BASE_SYSTEM_PROMPT =
  'You are an expert resume parser. Convert the provided raw PDF text into a strict JSON object for a CV editor. Do not include markdown. Do not include explanations. Never invent details that are not present in the text. If data is missing, return empty strings or empty arrays. Preserve full wording for summaries and descriptions: do not summarize, do not shorten, do not paraphrase. Keep all bullet points and line breaks when present. Output object keys exactly: language, title, contact, about, experience, education, skills, languages. language must be "es" or "en". contact fields: firstName,lastName,jobTitle,email,phone,location,links[{label,url}]. about: {summary}. experience: {displayMode, entries[{title,company,location,startDate,endDate,current,description}]}. education: {entries[{degree,institution,startDate,endDate,description}]}. skills: {displayMode, chips[string], categories[{name,skills[string]}]}. languages: {entries[{language,level}]}. IMPORTANT for experience: create one entry per distinct role/company/date range; never merge multiple jobs into one entry even if the PDF text is continuous.';

const BASE_USER_PROMPT =
  "Analyze this CV PDF and return only the requested JSON structure. Keep complete experience descriptions without truncating bullets or sentences.";

function countExperienceTextChars(
  entries: ImportedCVPayload["experience"]["entries"],
): number {
  return entries.reduce(
    (acc, entry) =>
      acc +
      entry.title.length +
      entry.company.length +
      entry.location.length +
      entry.description.length,
    0,
  );
}

function hasPotentialMergedExperience(imported: ImportedCVPayload): boolean {
  if (imported.experience.entries.length !== 1) return false;
  const [entry] = imported.experience.entries;
  if (!entry) return false;
  const text = `${entry.title}\n${entry.description}`;
  const dateMatches = text.match(/\b(?:\d{1,2}\/\d{4}|\d{4})\b/g)?.length ?? 0;
  return (
    dateMatches >= 4 ||
    /\b(?:LANGUAGES|SKILLS|EDUCATION|IDIOMAS|HABILIDADES|EDUCACION|EDUCACIÓN)\b/i.test(
      text,
    )
  );
}

function shouldRunRecovery(imported: ImportedCVPayload): boolean {
  const missingSkills =
    imported.skills.chips.length === 0 &&
    imported.skills.categories.length === 0;
  const missingExperience = imported.experience.entries.length === 0;
  const weakExperience =
    imported.experience.entries.length > 0 &&
    countExperienceTextChars(imported.experience.entries) < 220;
  const missingCoreContact =
    !imported.contact.firstName &&
    !imported.contact.lastName &&
    !imported.contact.email;

  return (
    missingSkills ||
    missingExperience ||
    weakExperience ||
    missingCoreContact ||
    hasPotentialMergedExperience(imported)
  );
}

function getRecoveryHints(imported: ImportedCVPayload): string[] {
  const hints: string[] = [];

  if (
    imported.skills.chips.length === 0 &&
    imported.skills.categories.length === 0
  ) {
    hints.push("skills");
  }
  if (imported.experience.entries.length === 0) {
    hints.push("experience");
  }
  if (hasPotentialMergedExperience(imported)) {
    hints.push("experience splitting by role/date range");
  }
  if (
    !imported.contact.firstName &&
    !imported.contact.lastName &&
    !imported.contact.email
  ) {
    hints.push("contact");
  }
  if (!imported.about.summary) {
    hints.push("about summary");
  }

  return hints;
}

function mergeString(primary: string, recovery: string): string {
  return primary || recovery;
}

function mergeLinks(
  primary: ImportedCVPayload["contact"]["links"],
  recovery: ImportedCVPayload["contact"]["links"],
): ImportedCVPayload["contact"]["links"] {
  if (primary.length > 0) return primary;
  return recovery;
}

function mergeExperienceEntries(
  primary: ImportedCVPayload["experience"]["entries"],
  recovery: ImportedCVPayload["experience"]["entries"],
): ImportedCVPayload["experience"]["entries"] {
  if (primary.length === 0) return recovery;
  if (recovery.length === 0) return primary;

  const primaryScore =
    primary.length * 1000 + countExperienceTextChars(primary);
  const recoveryScore =
    recovery.length * 1000 + countExperienceTextChars(recovery);

  return recoveryScore > primaryScore ? recovery : primary;
}

function skillsScore(skills: ImportedCVPayload["skills"]): number {
  const categorySkills = skills.categories.reduce(
    (acc, category) => acc + category.skills.length,
    0,
  );
  return skills.chips.length + skills.categories.length * 2 + categorySkills;
}

function mergeImportedPayload(
  primary: ImportedCVPayload,
  recovery: ImportedCVPayload,
): ImportedCVPayload {
  const mergedExperienceEntries = mergeExperienceEntries(
    primary.experience.entries,
    recovery.experience.entries,
  );

  const mergedSkills =
    skillsScore(recovery.skills) > skillsScore(primary.skills)
      ? recovery.skills
      : primary.skills;

  const mergedEducation =
    recovery.education.entries.length > primary.education.entries.length
      ? recovery.education
      : primary.education;

  const mergedLanguages =
    recovery.languages.entries.length > primary.languages.entries.length
      ? recovery.languages
      : primary.languages;

  return {
    language: primary.language || recovery.language,
    title: mergeString(primary.title, recovery.title),
    contact: {
      firstName: mergeString(
        primary.contact.firstName,
        recovery.contact.firstName,
      ),
      lastName: mergeString(
        primary.contact.lastName,
        recovery.contact.lastName,
      ),
      jobTitle: mergeString(
        primary.contact.jobTitle,
        recovery.contact.jobTitle,
      ),
      email: mergeString(primary.contact.email, recovery.contact.email),
      phone: mergeString(primary.contact.phone, recovery.contact.phone),
      location: mergeString(
        primary.contact.location,
        recovery.contact.location,
      ),
      links: mergeLinks(primary.contact.links, recovery.contact.links),
    },
    about: {
      summary:
        primary.about.summary.length >= recovery.about.summary.length
          ? primary.about.summary
          : recovery.about.summary,
    },
    experience: {
      displayMode:
        mergedExperienceEntries.length === primary.experience.entries.length
          ? primary.experience.displayMode
          : recovery.experience.displayMode,
      entries: mergedExperienceEntries,
    },
    education: mergedEducation,
    skills: mergedSkills,
    languages: mergedLanguages,
  };
}

async function requestImportedCV(
  client: OpenAI,
  uploadedFileId: string,
  userPrompt: string,
): Promise<ImportedCVPayload> {
  const completion = await client.chat.completions.create({
    model: IMPORT_MODEL,
    temperature: 0,
    max_completion_tokens: 12000,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: BASE_SYSTEM_PROMPT,
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: userPrompt,
          },
          {
            type: "file",
            file: {
              file_id: uploadedFileId,
            },
          },
        ],
      },
    ],
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error("OpenAI returned empty response");
  }

  const parsed = JSON.parse(content);
  return normalizeImportedCV(parsed);
}

function hasMeaningfulImportedData(
  imported: ReturnType<typeof normalizeImportedCV>,
): boolean {
  return Boolean(
    imported.title ||
    imported.contact.firstName ||
    imported.contact.lastName ||
    imported.contact.jobTitle ||
    imported.contact.email ||
    imported.about.summary ||
    imported.experience.entries.length ||
    imported.education.entries.length ||
    imported.skills.chips.length ||
    imported.skills.categories.length ||
    imported.languages.entries.length,
  );
}

async function extractStructuredCV(pdfFile: File, apiKey: string) {
  const client = new OpenAI({ apiKey });
  const uploadedFile = await client.files.create({
    file: pdfFile,
    purpose: "user_data",
  });

  try {
    const primary = await requestImportedCV(
      client,
      uploadedFile.id,
      BASE_USER_PROMPT,
    );

    if (!shouldRunRecovery(primary)) {
      return primary;
    }

    const hints = getRecoveryHints(primary);
    const recoveryPrompt = `${BASE_USER_PROMPT} Re-read the same PDF and focus especially on missing or weak sections: ${
      hints.join(", ") || "all sections"
    }. Return complete JSON with the same schema and keep bullets in experience descriptions.`;

    try {
      const recovery = await requestImportedCV(
        client,
        uploadedFile.id,
        recoveryPrompt,
      );
      return mergeImportedPayload(primary, recovery);
    } catch {
      return primary;
    }
  } finally {
    void client.files.delete(uploadedFile.id).catch(() => undefined);
  }
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

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return Response.json({ error: "No PDF file provided" }, { status: 400 });
    }

    if (file.size <= 0) {
      return Response.json({ error: "Uploaded PDF is empty" }, { status: 400 });
    }

    if (file.size > MAX_PDF_SIZE_BYTES) {
      return Response.json({ error: "PDF exceeds 8MB limit" }, { status: 413 });
    }

    if (file.type && file.type !== "application/pdf") {
      return Response.json({ error: "File must be a PDF" }, { status: 400 });
    }

    const imported = await extractStructuredCV(file, apiKey);
    if (!hasMeaningfulImportedData(imported)) {
      return Response.json(
        { error: "No se pudo extraer contenido útil del PDF" },
        { status: 422 },
      );
    }

    return Response.json({ imported });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to import CV from PDF";
    return Response.json({ error: message }, { status: 500 });
  }
}
