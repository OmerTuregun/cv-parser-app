import { z } from "zod";

export const cvSchema = z.object({
  personal: z.object({
    full_name: z.string(),
    email: z.string().email().nullable(),
    phone: z.string().nullable(),
    location: z
      .object({
        city: z.string(),
        country: z.string(),
      })
      .nullable(),
    linkedin_url: z.string().nullable(),
    website: z.string().nullable(),
    summary: z.string(),
  }),
  experiences: z.array(
    z.object({
      id: z.string(),
      company: z.string(),
      title: z.string(),
      employment_type: z.enum([
        "full-time",
        "part-time",
        "freelance",
        "internship",
        "other",
      ]),
      start_date: z.string(),
      end_date: z.string().nullable(),
      is_current: z.boolean(),
      location: z.string().nullable(),
      description: z.string(),
      highlights: z.array(z.string()),
    })
  ),
  education: z.array(
    z.object({
      id: z.string(),
      institution: z.string(),
      degree: z.string(),
      field_of_study: z.string(),
      start_year: z.number().nullable(),
      end_year: z.number().nullable(),
      gpa: z.string().nullable(),
      description: z.string().nullable(),
    })
  ),
  skills: z.array(
    z.object({
      name: z.string(),
      level: z.enum(["beginner", "intermediate", "advanced", "expert"]),
      category: z.enum(["technical", "soft", "tool", "language"]),
    })
  ),
  languages: z.array(
    z.object({
      name: z.string(),
      proficiency: z.enum(["A1", "A2", "B1", "B2", "C1", "C2", "native"]),
    })
  ),
  certifications: z.array(
    z.object({
      name: z.string(),
      issuer: z.string(),
      date: z.string().nullable(),
      credential_id: z.string().nullable(),
    })
  ),
  meta: z.object({
    confidence_score: z.number(),
    missing_fields: z.array(z.string()),
    language: z.string(),
  }),
});

export const personalSchema = cvSchema.shape.personal;
export const experienceSchema = cvSchema.shape.experiences.element;
export const educationSchema = cvSchema.shape.education.element;
export const skillSchema = cvSchema.shape.skills.element;
export const languageSchema = cvSchema.shape.languages.element;
export const certificationSchema = cvSchema.shape.certifications.element;
