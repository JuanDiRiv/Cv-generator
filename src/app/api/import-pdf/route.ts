import OpenAI from "openai";
import { normalizeImportedCV } from "@/lib/cv-import";

export const runtime = "nodejs";

const MAX_PDF_SIZE_BYTES = 8 * 1024 * 1024;

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
    const completion = await client.chat.completions.create({
      model: "gpt-5.4-nano",
      max_completion_tokens: 12000,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            'You are an expert resume parser. Convert the provided raw PDF text into a strict JSON object for a CV editor. Do not include markdown. Do not include explanations. Never invent details that are not present in the text. If data is missing, return empty strings or empty arrays. Preserve full wording for summaries and descriptions: do not summarize, do not shorten, do not paraphrase. Keep all bullet points and line breaks when present. Output object keys exactly: language, title, contact, about, experience, education, skills, languages. language must be "es" or "en". contact fields: firstName,lastName,jobTitle,email,phone,location,links[{label,url}]. about: {summary}. experience: {displayMode, entries[{title,company,location,startDate,endDate,current,description}]}. education: {entries[{degree,institution,startDate,endDate,description}]}. skills: {displayMode, chips[string], categories[{name,skills[string]}]}. languages: {entries[{language,level}]}. IMPORTANT for experience: create one entry per distinct role/company/date range; never merge multiple jobs into one entry even if the PDF text is continuous.',
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this CV PDF and return only the requested JSON structure. Keep complete experience descriptions without truncating bullets or sentences.",
            },
            {
              type: "file",
              file: {
                file_id: uploadedFile.id,
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
