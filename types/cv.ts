import { z } from "zod";
import { cvSchema } from "@/lib/schemas";

export type CVData = z.infer<typeof cvSchema>;
export type Personal = CVData["personal"];
export type Experience = CVData["experiences"][number];
export type Education = CVData["education"][number];
export type Skill = CVData["skills"][number];
export type Language = CVData["languages"][number];
export type Certification = CVData["certifications"][number];
export type Meta = CVData["meta"];

export type EmploymentType = Experience["employment_type"];
export type SkillLevel = Skill["level"];
export type SkillCategory = Skill["category"];
export type LanguageProficiency = Language["proficiency"];

export type WizardStep = 1 | 2 | 3 | 4 | 5;
export type UploadState = "idle" | "uploading" | "parsing" | "done" | "error";
