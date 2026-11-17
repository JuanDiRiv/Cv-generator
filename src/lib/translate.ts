import { generateJSON } from "@/lib/ai/client";

export async function translateTexts(
  texts: string[],
  targetLang: "EN" | "ES",
): Promise<string[]> {
  if (texts.length === 0) return [];

  const language = targetLang === "EN" ? "English" : "Spanish";

  const parsed = await generateJSON<{ translations: string[] }>({
    system: `You are a professional CV translator. For each string in the input array, detect its language and translate it to ${language} if it is not already in ${language}. If a string is already in ${language}, return it unchanged. Preserve formatting, bullet points, line breaks, and professional tone. Keep the exact same number of strings in the same order. Return JSON with a single key "translations" whose value is an array of strings.`,
    user: JSON.stringify({ texts }),
  });

  if (
    !Array.isArray(parsed.translations) ||
    parsed.translations.length !== texts.length
  ) {
    throw new Error(
      `El modelo devolvió ${parsed.translations?.length} traducciones, se esperaban ${texts.length}`,
    );
  }
  return parsed.translations;
}
