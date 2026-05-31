"use client";

import { Plus, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useCVWizardStore } from "@/lib/store";
import { cn, proficiencyToSegments } from "@/lib/utils";
import type {
  LanguageProficiency,
  Skill,
  SkillCategory,
  SkillLevel,
} from "@/types/cv";

const SKILL_LEVELS: SkillLevel[] = [
  "beginner",
  "intermediate",
  "advanced",
  "expert",
];

const SKILL_LEVEL_LABELS: Record<SkillLevel, string> = {
  beginner: "Başlangıç",
  intermediate: "Orta",
  advanced: "İleri",
  expert: "Uzman",
};

const LEVEL_DOT_COLORS: Record<SkillLevel, string> = {
  beginner: "bg-slate-400",
  intermediate: "bg-amber-500",
  advanced: "bg-blue-500",
  expert: "bg-emerald-500",
};

const CATEGORY_LABELS: Record<SkillCategory, string> = {
  technical: "Teknik",
  soft: "Kişisel / Yumuşak",
  tool: "Araçlar",
  language: "Dil Becerileri",
};

const CATEGORY_ORDER: SkillCategory[] = [
  "technical",
  "soft",
  "tool",
  "language",
];

const LANGUAGE_LEVELS: LanguageProficiency[] = [
  "A1",
  "A2",
  "B1",
  "B2",
  "C1",
  "C2",
  "native",
];

const PROFICIENCY_LABELS: Record<LanguageProficiency, string> = {
  A1: "A1 – Başlangıç",
  A2: "A2 – Temel",
  B1: "B1 – Orta Alt",
  B2: "B2 – Orta Üst",
  C1: "C1 – İleri",
  C2: "C2 – Yetkin",
  native: "Ana Dil",
};

const LANGUAGE_FLAGS: Record<string, string> = {
  türkçe: "🇹🇷",
  turkish: "🇹🇷",
  english: "🇬🇧",
  ingilizce: "🇬🇧",
  german: "🇩🇪",
  almanca: "🇩🇪",
  french: "🇫🇷",
  fransızca: "🇫🇷",
  spanish: "🇪🇸",
  ispanyolca: "🇪🇸",
  arabic: "🇸🇦",
  arapça: "🇸🇦",
  russian: "🇷🇺",
  rusça: "🇷🇺",
  chinese: "🇨🇳",
  çince: "🇨🇳",
  japanese: "🇯🇵",
  japonca: "🇯🇵",
};

function languageFlag(name: string): string {
  return LANGUAGE_FLAGS[name.trim().toLowerCase()] ?? "🌐";
}

function LevelDot({ level }: { level: SkillLevel }) {
  return (
    <span
      className={cn(
        "inline-block h-2.5 w-2.5 shrink-0 rounded-full",
        LEVEL_DOT_COLORS[level]
      )}
      title={SKILL_LEVEL_LABELS[level]}
    />
  );
}

function ProficiencyBar({ proficiency }: { proficiency: LanguageProficiency }) {
  const filled = proficiencyToSegments(proficiency);
  return (
    <div className="flex gap-0.5" title={PROFICIENCY_LABELS[proficiency]}>
      {Array.from({ length: 6 }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "h-2 w-4 rounded-sm",
            i < filled ? "bg-primary" : "bg-muted"
          )}
        />
      ))}
    </div>
  );
}

function SkillLevelPopover({
  skillName,
  level,
  onSelect,
  onClose,
}: {
  skillName: string;
  level: SkillLevel;
  onSelect: (level: SkillLevel) => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute left-0 top-full z-50 mt-1 min-w-[160px] rounded-md border bg-popover p-2 shadow-md"
      role="dialog"
      aria-label={`${skillName} seviye seçici`}
    >
      <p className="mb-2 px-1 text-xs font-medium text-muted-foreground">
        Seviye Seçin
      </p>
      <div className="space-y-1">
        {SKILL_LEVELS.map((lvl) => (
          <button
            key={lvl}
            type="button"
            className={cn(
              "flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-accent",
              lvl === level && "bg-accent"
            )}
            onClick={() => {
              onSelect(lvl);
              onClose();
            }}
          >
            <LevelDot level={lvl} />
            {SKILL_LEVEL_LABELS[lvl]}
          </button>
        ))}
      </div>
    </div>
  );
}

function SkillChip({
  skill,
  onLevelChange,
  onRemove,
}: {
  skill: Skill;
  onLevelChange: (level: SkillLevel) => void;
  onRemove: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <div className="inline-flex items-center gap-1 rounded-full border bg-card py-1.5 pl-3 pr-1 text-sm shadow-sm">
        <button
          type="button"
          className="inline-flex items-center gap-2 transition-colors hover:text-primary"
          onClick={() => setOpen((v) => !v)}
        >
          <LevelDot level={skill.level} />
          <span>{skill.name}</span>
        </button>
        <button
          type="button"
          className="rounded-full p-1 hover:bg-muted"
          onClick={() => onRemove()}
          aria-label="Yeteneği kaldır"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
      {open && (
        <SkillLevelPopover
          skillName={skill.name}
          level={skill.level}
          onSelect={onLevelChange}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}

export function Step4Skills() {
  const cvData = useCVWizardStore((s) => s.cvData);
  const addSkill = useCVWizardStore((s) => s.addSkill);
  const removeSkill = useCVWizardStore((s) => s.removeSkill);
  const updateSkill = useCVWizardStore((s) => s.updateSkill);
  const addLanguage = useCVWizardStore((s) => s.addLanguage);
  const removeLanguage = useCVWizardStore((s) => s.removeLanguage);
  const updateLanguage = useCVWizardStore((s) => s.updateLanguage);

  const [skillName, setSkillName] = useState("");
  const [skillLevel, setSkillLevel] = useState<SkillLevel>("intermediate");
  const [skillCategory, setSkillCategory] = useState<SkillCategory>("technical");

  const [languageName, setLanguageName] = useState("");
  const [languageProficiency, setLanguageProficiency] =
    useState<LanguageProficiency>("B2");

  const skills = cvData?.skills ?? [];
  const languages = cvData?.languages ?? [];

  const handleAddSkill = () => {
    if (!skillName.trim() || !cvData) return;
    addSkill({
      name: skillName.trim(),
      level: skillLevel,
      category: skillCategory,
    });
    setSkillName("");
  };

  const handleAddLanguage = () => {
    if (!languageName.trim() || !cvData) return;
    addLanguage({
      name: languageName.trim(),
      proficiency: languageProficiency,
    });
    setLanguageName("");
  };

  const grouped = CATEGORY_ORDER.map((category) => ({
    category,
    label: CATEGORY_LABELS[category],
    skills: skills.filter((skill) => skill.category === category),
  })).filter((g) => g.skills.length > 0);

  if (!cvData) {
    return (
      <p className="text-center text-muted-foreground">
        Yetenekleri düzenlemek için önce bir CV yükleyin.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold">Yetenekler ve Diller</h2>
        <p className="text-muted-foreground">
          Yeteneklerinizi kategorilere göre düzenleyin ve dil yeterliliğinizi belirtin.
        </p>
      </div>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Yetenekler</h3>

        <div className="grid gap-4 sm:grid-cols-4">
          <div className="space-y-2 sm:col-span-2">
            <Label>Yetenek Adı</Label>
            <Input
              value={skillName}
              onChange={(e) => setSkillName(e.target.value)}
              placeholder="ör. TypeScript"
              onKeyDown={(e) => e.key === "Enter" && handleAddSkill()}
            />
          </div>
          <div className="space-y-2">
            <Label>Seviye</Label>
            <Select
              value={skillLevel}
              onValueChange={(v) => setSkillLevel(v as SkillLevel)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SKILL_LEVELS.map((level) => (
                  <SelectItem key={level} value={level}>
                    <span className="flex items-center gap-2">
                      <LevelDot level={level} />
                      {SKILL_LEVEL_LABELS[level]}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Kategori</Label>
            <Select
              value={skillCategory}
              onValueChange={(v) => setSkillCategory(v as SkillCategory)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_ORDER.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {CATEGORY_LABELS[cat]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button type="button" onClick={handleAddSkill} size="sm" variant="outline">
          <Plus className="mr-1 h-4 w-4" />
          Yetenek Ekle
        </Button>

        {skills.length === 0 ? (
          <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            Henüz yetenek eklenmedi.
          </div>
        ) : (
          <div className="space-y-6">
            {grouped.map(({ category, label, skills: categorySkills }) => (
              <div key={category} className="space-y-3">
                <h4 className="text-sm font-semibold text-muted-foreground">
                  {label}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {categorySkills.map((skill) => (
                    <SkillChip
                      key={skill.name}
                      skill={skill}
                      onLevelChange={(level) =>
                        updateSkill(skill.name, { level })
                      }
                      onRemove={() => removeSkill(skill.name)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          {SKILL_LEVELS.map((lvl) => (
            <span key={lvl} className="inline-flex items-center gap-1">
              <LevelDot level={lvl} />
              {SKILL_LEVEL_LABELS[lvl]}
            </span>
          ))}
        </div>
      </section>

      <Separator />

      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Diller</h3>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2 sm:col-span-2">
            <Label>Dil</Label>
            <Input
              value={languageName}
              onChange={(e) => setLanguageName(e.target.value)}
              placeholder="ör. İngilizce"
              onKeyDown={(e) => e.key === "Enter" && handleAddLanguage()}
            />
          </div>
          <div className="space-y-2">
            <Label>Yeterlilik (CEFR)</Label>
            <Select
              value={languageProficiency}
              onValueChange={(v) =>
                setLanguageProficiency(v as LanguageProficiency)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGE_LEVELS.map((level) => (
                  <SelectItem key={level} value={level}>
                    {PROFICIENCY_LABELS[level]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          type="button"
          onClick={handleAddLanguage}
          size="sm"
          variant="outline"
        >
          <Plus className="mr-1 h-4 w-4" />
          Dil Ekle
        </Button>

        {languages.length > 0 ? (
          <ul className="space-y-3">
            {languages.map((lang) => (
              <li
                key={lang.name}
                className="flex flex-wrap items-center gap-3 rounded-lg border p-3"
              >
                <span className="text-2xl" aria-hidden>
                  {languageFlag(lang.name)}
                </span>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium">{lang.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {PROFICIENCY_LABELS[lang.proficiency]}
                    </span>
                  </div>
                  <ProficiencyBar proficiency={lang.proficiency} />
                </div>
                <Select
                  value={lang.proficiency}
                  onValueChange={(v) =>
                    updateLanguage(lang.name, {
                      proficiency: v as LanguageProficiency,
                    })
                  }
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGE_LEVELS.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeLanguage(lang.name)}
                  aria-label="Dili kaldır"
                >
                  <X className="h-4 w-4 text-destructive" />
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            Henüz dil eklenmedi.
          </div>
        )}
      </section>
    </div>
  );
}
