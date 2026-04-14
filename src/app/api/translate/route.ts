import { translateTexts } from "@/lib/translate";
import type {
  CVDocument,
  ExperienceData,
  EducationData,
  AboutData,
} from "@/types/cv";

export async function POST(request: Request) {
  const { cv, targetLang }: { cv: CVDocument; targetLang: "es" | "en" } =
    await request.json();
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey)
    return Response.json({ error: "Missing OPENAI_API_KEY" }, { status: 500 });

  const translationLang = targetLang.toUpperCase() as "EN" | "ES";

  // Collect all translatable strings preserving order
  const texts: string[] = [];
  const translated = structuredClone(cv) as CVDocument;
  translated.language = targetLang;

  const aboutSection = translated.sections.find((s) => s.type === "about");
  const aboutData = aboutSection?.data as AboutData | undefined;
  if (aboutData?.summary) texts.push(aboutData.summary);

  const expSection = translated.sections.find((s) => s.type === "experience");
  const expData = expSection?.data as ExperienceData | undefined;
  expData?.entries.forEach((e) => {
    // Keep role/company/location as authored. Only translate narrative description.
    if (e.description) texts.push(e.description);
  });

  const eduSection = translated.sections.find((s) => s.type === "education");
  const eduData = eduSection?.data as EducationData | undefined;
  eduData?.entries.forEach((e) => {
    // Keep degree titles as authored; only translate optional description.
    if (e.description) texts.push(e.description);
  });

  if (texts.length === 0) return Response.json(translated);

  const results = await translateTexts(texts, translationLang, apiKey);

  // Re-assign in same order
  let i = 0;
  if (aboutData?.summary && aboutSection) {
    (
      translated.sections.find((s) => s.type === "about")!.data as AboutData
    ).summary = results[i++];
  }
  expData?.entries.forEach((_, idx) => {
    if (expData.entries[idx].description)
      (
        translated.sections.find((s) => s.type === "experience")!
          .data as ExperienceData
      ).entries[idx].description = results[i++];
  });
  eduData?.entries.forEach((_, idx) => {
    if (eduData.entries[idx].description)
      (
        translated.sections.find((s) => s.type === "education")!
          .data as EducationData
      ).entries[idx].description = results[i++];
  });

  return Response.json(translated);
}
