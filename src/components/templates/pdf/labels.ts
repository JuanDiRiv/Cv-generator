import type { CVDocument } from "@/types/cv";

interface PdfLabels {
  contact: string;
  profile: string;
  professionalProfile: string;
  aboutMe: string;
  experience: string;
  skills: string;
  education: string;
  languages: string;
  present: string;
}

const labelsByLanguage: Record<CVDocument["language"], PdfLabels> = {
  es: {
    contact: "CONTACTO",
    profile: "PERFIL",
    professionalProfile: "PERFIL PROFESIONAL",
    aboutMe: "SOBRE MI",
    experience: "EXPERIENCIA",
    skills: "HABILIDADES",
    education: "EDUCACION",
    languages: "IDIOMAS",
    present: "Actual",
  },
  en: {
    contact: "CONTACT",
    profile: "PROFILE",
    professionalProfile: "PROFESSIONAL PROFILE",
    aboutMe: "ABOUT ME",
    experience: "EXPERIENCE",
    skills: "SKILLS",
    education: "EDUCATION",
    languages: "LANGUAGES",
    present: "Present",
  },
};

export function getPdfLabels(
  language: CVDocument["language"] | undefined,
): PdfLabels {
  return labelsByLanguage[language ?? "es"];
}
