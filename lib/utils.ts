import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { CVData, LanguageProficiency } from "@/types/cv";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const ID_CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

export function generateId(): string {
  let id = "";
  for (let i = 0; i < 6; i++) {
    id += ID_CHARS[Math.floor(Math.random() * ID_CHARS.length)];
  }
  return id;
}

export function calcCompletionScore(data: CVData): number {
  let score = 0;
  const { personal } = data;

  if (personal.full_name.trim()) score += 8;
  if (personal.email?.trim()) score += 6;
  if (personal.phone?.trim()) score += 4;
  if (
    personal.location &&
    (personal.location.city.trim() || personal.location.country.trim())
  ) {
    score += 4;
  }
  if (personal.summary.trim()) score += 8;

  const expPointsPerEntry = 25 / 3;
  for (const exp of data.experiences.slice(0, 3)) {
    let entryRatio = 0;
    if (exp.company.trim()) entryRatio += 0.25;
    if (exp.title.trim()) entryRatio += 0.25;
    if (exp.start_date.trim()) entryRatio += 0.25;
    if (exp.description.trim() || exp.highlights.some((h) => h.trim())) {
      entryRatio += 0.25;
    }
    score += entryRatio * expPointsPerEntry;
  }

  const eduPointsPerEntry = 15 / 2;
  for (const edu of data.education.slice(0, 2)) {
    let entryRatio = 0;
    if (edu.institution.trim()) entryRatio += 1 / 3;
    if (edu.degree.trim()) entryRatio += 1 / 3;
    if (edu.field_of_study.trim()) entryRatio += 1 / 3;
    score += entryRatio * eduPointsPerEntry;
  }

  const skillCount = data.skills.filter((s) => s.name.trim()).length;
  score += Math.min(skillCount / 5, 1) * 15;

  const hasLanguage = data.languages.some((l) => l.name.trim());
  if (hasLanguage) score += 10;

  const hasCertification = data.certifications.some((c) => c.name.trim());
  if (hasCertification) score += 5;

  return Math.round(Math.min(score, 100));
}

function formatDatePart(dateStr: string): string {
  if (!dateStr.trim()) return "";

  if (/^\d{4}$/.test(dateStr)) return dateStr;

  const parsed = new Date(dateStr);
  if (!Number.isNaN(parsed.getTime())) {
    const month = parsed.toLocaleDateString("en-US", { month: "short" });
    const year = parsed.getFullYear();
    if (dateStr.length <= 4) return String(year);
    return `${month} ${year}`;
  }

  return dateStr;
}

export function formatDateRange(
  start: string,
  end: string | null,
  isCurrent: boolean
): string {
  const startFormatted = formatDatePart(start);
  const endFormatted = isCurrent ? "Halen" : end ? formatDatePart(end) : "";

  if (!startFormatted && !endFormatted) return "";
  if (!endFormatted) return startFormatted;
  if (!startFormatted) return endFormatted;
  return `${startFormatted} – ${endFormatted}`;
}

export function getConfidenceColor(score: number): string {
  if (score > 0.8) return "text-green-500";
  if (score > 0.5) return "text-yellow-500";
  return "text-red-500";
}

export function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

const PROFICIENCY_SEGMENTS: Record<LanguageProficiency, number> = {
  A1: 1,
  A2: 2,
  B1: 3,
  B2: 4,
  C1: 5,
  C2: 6,
  native: 6,
};

export function proficiencyToSegments(proficiency: LanguageProficiency): number {
  return PROFICIENCY_SEGMENTS[proficiency];
}
