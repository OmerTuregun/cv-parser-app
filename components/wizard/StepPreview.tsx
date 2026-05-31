"use client";

import {
  Award,
  Briefcase,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  Printer,
  Save,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  calcCompletionScore,
  cn,
  getInitials,
  proficiencyToSegments,
} from "@/lib/utils";
import { useWizardStore } from "@/lib/store";
import type { SkillCategory } from "@/types/cv";

const CATEGORY_LABELS: Record<SkillCategory, string> = {
  technical: "Teknik",
  soft: "Kişisel",
  tool: "Araçlar",
  language: "Dil",
};

export function StepPreview() {
  const { cvData, setStep } = useWizardStore();

  if (!cvData) return null;

  const { personal, experiences, education, skills, languages, certifications } =
    cvData;
  const completionScore = calcCompletionScore(cvData);

  const skillsByCategory = skills.reduce<Record<string, typeof skills>>(
    (acc, skill) => {
      const key = skill.category;
      if (!acc[key]) acc[key] = [];
      acc[key].push(skill);
      return acc;
    },
    {}
  );

  const handleSave = () => {
    const blob = new Blob([JSON.stringify(cvData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${personal.full_name || "cv"}-profil.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => window.print();

  return (
    <div className="space-y-6">
      <div className="space-y-2 print:hidden">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Profil Tamamlanma</span>
          <span className="text-muted-foreground">%{completionScore}</span>
        </div>
        <Progress value={completionScore} className="h-2" />
      </div>

      <div
        id="cv-preview"
        className="overflow-hidden rounded-xl border bg-white shadow-sm print:border-0 print:shadow-none"
      >
        <div className="flex min-h-[600px]">
          {/* Sidebar */}
          <aside className="w-[240px] shrink-0 bg-slate-800 p-6 text-white print:bg-slate-800 print:text-white">
            <div className="mb-6 flex flex-col items-center text-center">
              <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-slate-600 text-2xl font-bold">
                {getInitials(personal.full_name) || "?"}
              </div>
              <h2 className="text-lg font-bold leading-tight">
                {personal.full_name || "İsimsiz"}
              </h2>
            </div>

            <div className="space-y-4 text-sm">
              {personal.email && (
                <div className="flex items-start gap-2">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 opacity-70" />
                  <span className="break-all">{personal.email}</span>
                </div>
              )}
              {personal.phone && (
                <div className="flex items-start gap-2">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 opacity-70" />
                  <span>{personal.phone}</span>
                </div>
              )}
              {personal.location && (
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 opacity-70" />
                  <span>
                    {personal.location.city}, {personal.location.country}
                  </span>
                </div>
              )}
            </div>

            {Object.keys(skillsByCategory).length > 0 && (
              <>
                <Separator className="my-5 bg-slate-600" />
                <div className="space-y-4">
                  {Object.entries(skillsByCategory).map(([category, items]) => (
                    <div key={category}>
                      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide opacity-70">
                        {CATEGORY_LABELS[category as SkillCategory] ?? category}
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        {items.map((skill, i) => (
                          <span
                            key={i}
                            className="rounded bg-slate-700 px-2 py-0.5 text-xs"
                          >
                            {skill.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {languages.length > 0 && (
              <>
                <Separator className="my-5 bg-slate-600" />
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wide opacity-70">
                    Diller
                  </h3>
                  {languages.map((lang, i) => {
                    const filled = proficiencyToSegments(lang.proficiency);
                    return (
                      <div key={i}>
                        <div className="mb-1 flex justify-between text-xs">
                          <span>{lang.name}</span>
                          <span className="opacity-70">{lang.proficiency}</span>
                        </div>
                        <div className="flex gap-0.5">
                          {Array.from({ length: 6 }).map((_, seg) => (
                            <div
                              key={seg}
                              className={cn(
                                "h-1.5 flex-1 rounded-sm",
                                seg < filled ? "bg-blue-400" : "bg-slate-600"
                              )}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </aside>

          {/* Main content */}
          <main className="flex-1 p-8">
            {personal.summary && (
              <section className="mb-8">
                <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-500">
                  Özet
                </h3>
                <p className="text-sm leading-relaxed text-slate-700">
                  {personal.summary}
                </p>
              </section>
            )}

            {experiences.length > 0 && (
              <section className="mb-8">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-500">
                  <Briefcase className="h-4 w-4" />
                  Deneyim
                </h3>
                <div className="relative space-y-6 border-l-2 border-slate-200 pl-6">
                  {experiences.map((exp) => (
                    <div key={exp.id} className="relative">
                      <div className="absolute -left-[calc(1.5rem+5px)] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-blue-500" />
                      <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
                        <h4 className="font-semibold text-slate-900">
                          {exp.title}
                        </h4>
                        <span className="text-xs text-slate-500">
                          {exp.start_date}
                          {exp.is_current
                            ? " – Devam"
                            : exp.end_date
                              ? ` – ${exp.end_date}`
                              : ""}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-slate-600">
                        {exp.company}
                        {exp.location && ` · ${exp.location}`}
                      </p>
                      {exp.description && (
                        <p className="mt-2 text-sm text-slate-600">
                          {exp.description}
                        </p>
                      )}
                      {exp.highlights.length > 0 && (
                        <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-slate-600">
                          {exp.highlights.map((h, i) => (
                            <li key={i}>{h}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {education.length > 0 && (
              <section className="mb-8">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-500">
                  <GraduationCap className="h-4 w-4" />
                  Eğitim
                </h3>
                <div className="space-y-4">
                  {education.map((edu) => (
                    <div key={edu.id}>
                      <h4 className="font-semibold text-slate-900">
                        {edu.degree}
                        {edu.field_of_study && ` — ${edu.field_of_study}`}
                      </h4>
                      <p className="text-sm text-slate-600">
                        {edu.institution}
                        {(edu.start_year || edu.end_year) &&
                          ` · ${edu.start_year ?? ""}${edu.end_year ? `–${edu.end_year}` : ""}`}
                      </p>
                      {edu.description && (
                        <p className="mt-1 text-sm text-slate-600">
                          {edu.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {certifications.length > 0 && (
              <section>
                <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-500">
                  <Award className="h-4 w-4" />
                  Sertifikalar
                </h3>
                <div className="space-y-3">
                  {certifications.map((cert, i) => (
                    <div key={i} className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-medium text-slate-900">{cert.name}</p>
                        <p className="text-sm text-slate-600">{cert.issuer}</p>
                      </div>
                      {cert.date && (
                        <Badge variant="outline" className="shrink-0 text-xs">
                          {cert.date}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </main>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 print:hidden">
        <Button variant="outline" onClick={() => setStep(1)}>
          <Pencil className="mr-1 h-4 w-4" />
          Düzenle
        </Button>
        <Button variant="outline" onClick={handleSave}>
          <Save className="mr-1 h-4 w-4" />
          Kaydet
        </Button>
        <Button onClick={handlePrint}>
          <Printer className="mr-1 h-4 w-4" />
          Yazdır
        </Button>
      </div>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #cv-preview,
          #cv-preview * {
            visibility: visible;
          }
          #cv-preview {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
