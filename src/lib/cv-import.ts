import { nanoid } from "nanoid";
import type {
  AboutData,
  ContactData,
  ContactLink,
  CVDocument,
  CVSection,
  EducationData,
  ExperienceData,
  ExperienceDisplayMode,
  LanguageEntry,
  LanguagesData,
  SkillsData,
  SkillsDisplayMode,
} from "@/types/cv";

interface ImportedExperienceEntry {
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

interface ImportedEducationEntry {
  degree: string;
  institution: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface ImportedSkillCategory {
  name: string;
  skills: string[];
}

interface ImportedLanguageEntry {
  language: string;
  level: string;
}

const EXPERIENCE_STOP_HEADINGS = [
  "PROFESSIONAL SUMMARY",
  "SUMMARY",
  "PROFILE",
  "LANGUAGES",
  "LANGUAGE",
  "SKILLS",
  "EDUCATION",
  "CERTIFICATIONS",
  "CERTIFICATES",
  "RESUMEN PROFESIONAL",
  "PERFIL",
  "IDIOMAS",
  "HABILIDADES",
  "EDUCACION",
  "EDUCACIÓN",
  "CERTIFICACIONES",
];

const BULLET_PREFIX_REGEX = /^[•▪◦●\-*]\s*/;
const BULLET_START_VERB_REGEX =
  /^(delivered|built|automated|integrated|implemented|improved|developed|migrated|provided|led|created|designed|optimized|managed|spearheaded|engineered)\b/i;

export interface ImportedCVPayload {
  language: "es" | "en";
  title: string;
  contact: {
    firstName: string;
    lastName: string;
    jobTitle: string;
    email: string;
    phone: string;
    location: string;
    links: ContactLink[];
  };
  about: {
    summary: string;
  };
  experience: {
    displayMode: ExperienceDisplayMode;
    entries: ImportedExperienceEntry[];
  };
  education: {
    entries: ImportedEducationEntry[];
  };
  skills: {
    displayMode: SkillsDisplayMode;
    chips: string[];
    categories: ImportedSkillCategory[];
  };
  languages: {
    entries: ImportedLanguageEntry[];
  };
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function toText(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean")
    return String(value);

  if (Array.isArray(value)) {
    return value
      .map((item) => toText(item).trim())
      .filter(Boolean)
      .join("\n");
  }

  if (typeof value === "object" && value !== null) {
    const record = value as Record<string, unknown>;
    const preferred =
      record.text ?? record.value ?? record.content ?? record.description;
    const preferredText = toText(preferred).trim();
    if (preferredText) return preferredText;

    return Object.values(record)
      .map((item) => toText(item).trim())
      .filter(Boolean)
      .join("\n");
  }

  return "";
}

function asString(value: unknown, max = 6000): string {
  return toText(value)
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, max);
}

function normalizeHeading(line: string): string {
  return line
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z ]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();
}

function isSectionBoundaryLine(line: string): boolean {
  const heading = normalizeHeading(line);
  if (!heading) return false;
  return EXPERIENCE_STOP_HEADINGS.includes(heading);
}

function isDateRangeLike(line: string): boolean {
  const dateToken =
    /\b(?:\d{1,2}\/\d{4}|\d{4}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|Ene|Abr|Ago|Dic)\s+\d{4}|Present|Current|Actual)\b/i;
  const hasDate = dateToken.test(line);
  const hasSeparator = /[-—–]|\bto\b|\ba\b|\bal\b/i.test(line);
  return hasDate && hasSeparator;
}

function extractDateRange(line: string): {
  startDate: string;
  endDate: string;
  current: boolean;
} {
  const tokens =
    line.match(
      /\b(?:\d{1,2}\/\d{4}|\d{4}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|Ene|Abr|Ago|Dic)\s+\d{4}|Present|Current|Actual)\b/gi,
    ) ?? [];

  const startDate = (tokens[0] ?? "").trim();
  const rawEnd = (tokens[1] ?? "").trim();
  const current = /^(present|current|actual)$/i.test(rawEnd);
  const endDate = current ? "" : rawEnd;

  return { startDate, endDate, current };
}

function stripNonExperienceTail(text: string): string {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const stopIndex = lines.findIndex((line) => isSectionBoundaryLine(line));
  const kept = stopIndex >= 0 ? lines.slice(0, stopIndex) : lines;
  return kept.join("\n").trim();
}

function normalizeExperienceDescription(text: string): string {
  const cleaned = text.replace(/\u0000/g, "").replace(/\r/g, "").trim();
  if (!cleaned) return "";

  const lines = cleaned
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  if (lines.length === 0) return "";

  const hasExplicitBullets = lines.some((line) => BULLET_PREFIX_REGEX.test(line));
  if (!hasExplicitBullets) {
    return lines.join("\n").trim();
  }

  const items: string[] = [];
  let pendingEmptyBullet = false;

  for (const line of lines) {
    if (BULLET_PREFIX_REGEX.test(line)) {
      const content = line.replace(BULLET_PREFIX_REGEX, "").trim();
      if (content) {
        items.push(content);
        pendingEmptyBullet = false;
      } else {
        pendingEmptyBullet = true;
      }
      continue;
    }

    if (pendingEmptyBullet) {
      items.push(line);
      pendingEmptyBullet = false;
      continue;
    }

    if (items.length === 0) {
      items.push(line);
      continue;
    }

    if (BULLET_START_VERB_REGEX.test(line)) {
      items.push(line);
      continue;
    }

    const lastIndex = items.length - 1;
    items[lastIndex] = `${items[lastIndex]} ${line}`.replace(/\s+/g, " ").trim();
  }

  const normalizedItems = items.map((item) => item.trim()).filter(Boolean);
  if (normalizedItems.length === 0) return "";

  return normalizedItems.map((item) => `• ${item}`).join("\n");
}

function isLikelyRoleLine(line: string): boolean {
  if (!line || line.length < 3 || line.length > 95) return false;
  if (/^[•*\-]/.test(line)) return false;
  if (isSectionBoundaryLine(line) || isDateRangeLike(line)) return false;

  const hasRoleKeyword =
    /(developer|engineer|specialist|manager|analyst|consultant|frontend|front-end|full-stack|fullstack|software|devops|architect|lead|desarrollador|ingeniero|especialista|consultor)/i.test(
      line,
    );

  const isUppercaseTitle =
    line === line.toUpperCase() &&
    /[A-ZÁÉÍÓÚÑ]/.test(line) &&
    line.length <= 40;

  return hasRoleKeyword || isUppercaseTitle;
}

function isLikelyCompanyLine(line: string): boolean {
  if (!line || line.length > 120) return false;
  if (/^[•*\-]/.test(line)) return false;
  if (isSectionBoundaryLine(line) || isDateRangeLike(line)) return false;
  return /[A-Za-zÁÉÍÓÚáéíóúÑñ]/.test(line);
}

function parseExperienceBlock(
  blockLines: string[],
): ImportedExperienceEntry | null {
  const lines = blockLines.map((line) => line.trim()).filter(Boolean);
  if (lines.length === 0) return null;

  const title = lines[0] ?? "";
  let cursor = 1;

  let company = "";
  if (cursor < lines.length && isLikelyCompanyLine(lines[cursor] ?? "")) {
    company = lines[cursor] ?? "";
    cursor += 1;
  }

  let startDate = "";
  let endDate = "";
  let current = false;

  if (cursor < lines.length && isDateRangeLike(lines[cursor] ?? "")) {
    const dates = extractDateRange(lines[cursor] ?? "");
    startDate = dates.startDate;
    endDate = dates.endDate;
    current = dates.current;
    cursor += 1;
  }

  let location = "";
  if (
    cursor < lines.length &&
    !isDateRangeLike(lines[cursor] ?? "") &&
    !/^[•*\-]/.test(lines[cursor] ?? "") &&
    !isSectionBoundaryLine(lines[cursor] ?? "") &&
    /,|\bRemote\b|\bRemoto\b/i.test(lines[cursor] ?? "")
  ) {
    location = lines[cursor] ?? "";
    cursor += 1;
  }

  const description = lines.slice(cursor).join("\n").trim();
  if (!title && !company && !description) return null;

  return {
    title,
    company,
    location,
    startDate,
    endDate,
    current,
    description,
  };
}

function splitMergedExperienceEntry(
  entry: ImportedExperienceEntry,
): ImportedExperienceEntry[] {
  const cleanedDescription = stripNonExperienceTail(entry.description);
  const lines = cleanedDescription
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return [{ ...entry, description: cleanedDescription }];
  }

  const startIndexes: number[] = [];
  for (let i = 0; i < lines.length; i += 1) {
    const roleLine = lines[i] ?? "";
    if (!isLikelyRoleLine(roleLine)) continue;
    const window = lines.slice(i + 1, i + 4);
    if (!window.some((line) => isDateRangeLike(line))) continue;
    startIndexes.push(i);
  }

  const hasManyDates = lines.filter((line) => isDateRangeLike(line)).length > 1;
  if (startIndexes.length === 0 || !hasManyDates) {
    return [{ ...entry, description: cleanedDescription }];
  }

  const results: ImportedExperienceEntry[] = [];

  const preludeDescription = lines.slice(0, startIndexes[0]).join("\n").trim();
  if (entry.title || entry.company || preludeDescription) {
    results.push({
      ...entry,
      description: preludeDescription,
    });
  }

  for (let i = 0; i < startIndexes.length; i += 1) {
    const start = startIndexes[i] ?? 0;
    const end = startIndexes[i + 1] ?? lines.length;
    const block = lines.slice(start, end);
    const parsed = parseExperienceBlock(block);
    if (parsed) {
      results.push(parsed);
    }
  }

  const cleaned = results
    .map((item) => ({
      ...item,
      description: stripNonExperienceTail(item.description),
    }))
    .filter((item) => item.title || item.company || item.description);

  return cleaned.length > 0
    ? cleaned
    : [{ ...entry, description: cleanedDescription }];
}

function normalizeExperienceEntries(
  entries: ImportedExperienceEntry[],
): ImportedExperienceEntry[] {
  if (entries.length === 0) return entries;

  const cleaned = entries.map((entry) => ({
    ...entry,
    description: stripNonExperienceTail(entry.description),
  }));

  if (cleaned.length === 1) {
    const [onlyEntry] = cleaned;
    if (!onlyEntry) return [];
    return splitMergedExperienceEntry(onlyEntry)
      .slice(0, 15)
      .map((entry) => ({
        ...entry,
        description: normalizeExperienceDescription(entry.description),
      }));
  }

  return cleaned.slice(0, 15).map((entry) => ({
    ...entry,
    description: normalizeExperienceDescription(entry.description),
  }));
}

function asBool(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return (
      normalized === "true" ||
      normalized === "yes" ||
      normalized === "si" ||
      normalized === "actual" ||
      normalized === "present"
    );
  }
  return false;
}

function asStringArray(value: unknown, maxItems: number): string[] {
  if (typeof value === "string") {
    return value
      .split(/[\n,|•]+/)
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, maxItems);
  }
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => asString(item, 450))
    .filter(Boolean)
    .slice(0, maxItems);
}

function sanitizeLinks(value: unknown): ContactLink[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      const record = asRecord(item);
      return {
        label: asString(record.label, 60),
        url: asString(record.url, 300),
      };
    })
    .filter((link) => link.label || link.url)
    .slice(0, 8);
}

export function normalizeImportedCV(value: unknown): ImportedCVPayload {
  const root = asRecord(value);

  const contact = asRecord(root.contact);
  const about = asRecord(root.about);
  const experience = asRecord(root.experience);
  const education = asRecord(root.education);
  const skills = asRecord(root.skills);
  const languages = asRecord(root.languages);

  const rawExperienceEntries = Array.isArray(experience.entries)
    ? experience.entries
        .map((item) => {
          const record = asRecord(item);
          return {
            title: asString(record.title, 160),
            company: asString(record.company, 160),
            location: asString(record.location, 120),
            startDate: asString(record.startDate, 60),
            endDate: asString(record.endDate, 60),
            current: asBool(record.current),
            description: asString(record.description, 8000),
          };
        })
        .filter((entry) => entry.title || entry.company || entry.description)
        .slice(0, 15)
    : [];

  const experienceEntries = normalizeExperienceEntries(rawExperienceEntries);

  const educationEntries = Array.isArray(education.entries)
    ? education.entries
        .map((item) => {
          const record = asRecord(item);
          return {
            degree: asString(record.degree, 180),
            institution: asString(record.institution, 180),
            startDate: asString(record.startDate, 60),
            endDate: asString(record.endDate, 60),
            description: asString(record.description, 3500),
          };
        })
        .filter(
          (entry) => entry.degree || entry.institution || entry.description,
        )
        .slice(0, 12)
    : [];

  const skillCategories = Array.isArray(skills.categories)
    ? skills.categories
        .map((item) => {
          const record = asRecord(item);
          return {
            name: asString(record.name, 80),
            skills: asStringArray(record.skills, 20),
          };
        })
        .filter((category) => category.name || category.skills.length > 0)
        .slice(0, 8)
    : [];

  const languageEntries = Array.isArray(languages.entries)
    ? languages.entries
        .map((item) => {
          const record = asRecord(item);
          return {
            language: asString(record.language, 80),
            level: asString(record.level, 80),
          };
        })
        .filter((entry) => entry.language || entry.level)
        .slice(0, 12)
    : [];

  const language = root.language === "en" ? "en" : "es";
  const experienceDisplayMode =
    experience.displayMode === "timeline" ? "timeline" : "list";
  const skillsDisplayMode =
    skills.displayMode === "categories" ? "categories" : "chips";

  return {
    language,
    title: asString(root.title, 120),
    contact: {
      firstName: asString(contact.firstName, 80),
      lastName: asString(contact.lastName, 80),
      jobTitle: asString(contact.jobTitle, 120),
      email: asString(contact.email, 140),
      phone: asString(contact.phone, 80),
      location: asString(contact.location, 120),
      links: sanitizeLinks(contact.links),
    },
    about: {
      summary: asString(about.summary, 9000),
    },
    experience: {
      displayMode: experienceDisplayMode,
      entries: experienceEntries,
    },
    education: {
      entries: educationEntries,
    },
    skills: {
      displayMode: skillsDisplayMode,
      chips: asStringArray(skills.chips, 60),
      categories: skillCategories,
    },
    languages: {
      entries: languageEntries,
    },
  };
}

function choose(existing: string, incoming: string): string {
  return incoming || existing;
}

function mergeContact(
  existing: ContactData,
  incoming: ImportedCVPayload["contact"],
): ContactData {
  return {
    firstName: choose(existing.firstName, incoming.firstName),
    lastName: choose(existing.lastName, incoming.lastName),
    jobTitle: choose(existing.jobTitle, incoming.jobTitle),
    email: choose(existing.email, incoming.email),
    phone: choose(existing.phone, incoming.phone),
    location: choose(existing.location, incoming.location),
    links: incoming.links.length > 0 ? incoming.links : existing.links,
  };
}

function mergeAbout(
  existing: AboutData,
  incoming: ImportedCVPayload["about"],
): AboutData {
  return {
    summary: choose(existing.summary, incoming.summary),
  };
}

function mergeExperience(
  existing: ExperienceData,
  incoming: ImportedCVPayload["experience"],
): ExperienceData {
  const entries =
    incoming.entries.length > 0
      ? incoming.entries.map((entry) => ({
          id: nanoid(),
          title: entry.title,
          company: entry.company,
          location: entry.location,
          startDate: entry.startDate,
          endDate: entry.current ? "" : entry.endDate,
          current: entry.current,
          description: entry.description,
        }))
      : existing.entries;

  return {
    displayMode: incoming.displayMode ?? existing.displayMode,
    entries,
  };
}

function mergeEducation(
  existing: EducationData,
  incoming: ImportedCVPayload["education"],
): EducationData {
  const entries =
    incoming.entries.length > 0
      ? incoming.entries.map((entry) => ({
          id: nanoid(),
          degree: entry.degree,
          institution: entry.institution,
          startDate: entry.startDate,
          endDate: entry.endDate,
          description: entry.description,
        }))
      : existing.entries;

  return { entries };
}

function mergeSkills(
  existing: SkillsData,
  incoming: ImportedCVPayload["skills"],
): SkillsData {
  const chips =
    incoming.chips.length > 0
      ? incoming.chips.map((label) => ({ id: nanoid(), label }))
      : existing.chips;

  const categories =
    incoming.categories.length > 0
      ? incoming.categories.map((category) => ({
          id: nanoid(),
          name: category.name,
          skills: category.skills,
        }))
      : existing.categories;

  return {
    displayMode: incoming.displayMode ?? existing.displayMode,
    chips,
    categories,
  };
}

function mergeLanguages(
  existing: LanguagesData,
  incoming: ImportedCVPayload["languages"],
): LanguagesData {
  const entries: LanguageEntry[] =
    incoming.entries.length > 0
      ? incoming.entries.map((entry) => ({
          id: nanoid(),
          language: entry.language,
          level: entry.level,
        }))
      : existing.entries;

  return { entries };
}

export function applyImportedDataToCV(
  cv: CVDocument,
  imported: ImportedCVPayload,
): CVDocument {
  const sections = cv.sections.map((section): CVSection => {
    if (section.type === "contact") {
      return {
        ...section,
        data: mergeContact(section.data as ContactData, imported.contact),
      };
    }
    if (section.type === "about") {
      return {
        ...section,
        data: mergeAbout(section.data as AboutData, imported.about),
      };
    }
    if (section.type === "experience") {
      return {
        ...section,
        data: mergeExperience(
          section.data as ExperienceData,
          imported.experience,
        ),
      };
    }
    if (section.type === "education") {
      return {
        ...section,
        data: mergeEducation(section.data as EducationData, imported.education),
      };
    }
    if (section.type === "skills") {
      return {
        ...section,
        data: mergeSkills(section.data as SkillsData, imported.skills),
      };
    }
    if (section.type === "languages") {
      return {
        ...section,
        data: mergeLanguages(section.data as LanguagesData, imported.languages),
      };
    }
    return section;
  });

  return {
    ...cv,
    title: choose(cv.title, imported.title),
    language: imported.language ?? cv.language,
    sections,
    updatedAt: Date.now(),
  };
}
