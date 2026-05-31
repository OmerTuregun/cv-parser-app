"use client";

import { Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import { useCVWizardStore } from "@/lib/store";
import { generateId } from "@/lib/utils";
import type { Certification, Education } from "@/types/cv";

const DEGREE_OPTIONS = [
  "Lisans",
  "Yüksek Lisans",
  "Doktora",
  "Ön Lisans",
  "Sertifika",
  "Diğer",
] as const;

function EducationCard({
  education,
  isEditing,
  onEdit,
  onCancel,
  onSave,
  onRemove,
}: {
  education: Education;
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: (fields: Partial<Education>) => void;
  onRemove: () => void;
}) {
  const [draft, setDraft] = useState(education);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (isEditing) setDraft(education);
  }, [isEditing, education]);

  const updateField = <K extends keyof Education>(
    field: K,
    value: Education[K]
  ) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
  };

  if (!isEditing) {
    const yearRange = [education.start_year, education.end_year]
      .filter((y) => y != null)
      .join(" – ");

    return (
      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <div className="min-w-0 flex-1">
            <CardTitle className="text-base">
              {education.institution || "Kurum"}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {[education.degree, education.field_of_study]
                .filter(Boolean)
                .join(" · ")}
            </p>
            {yearRange && (
              <p className="text-xs text-muted-foreground">{yearRange}</p>
            )}
            {education.gpa && (
              <p className="text-xs text-muted-foreground">GPA: {education.gpa}</p>
            )}
          </div>
          <div className="flex shrink-0 gap-1">
            <Button type="button" variant="ghost" size="icon" onClick={onEdit}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </CardHeader>
        {(education.description || confirmDelete) && (
          <CardContent className="space-y-3 pt-0">
            {education.description && (
              <p className="text-sm text-muted-foreground">
                {education.description}
              </p>
            )}
            {confirmDelete && (
              <div className="flex flex-wrap items-center gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm">
                <span>Bu eğitim kaydını silmek istediğinize emin misiniz?</span>
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  onClick={onRemove}
                >
                  Evet, Sil
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setConfirmDelete(false)}
                >
                  İptal
                </Button>
              </div>
            )}
          </CardContent>
        )}
      </Card>
    );
  }

  const degreeValue = DEGREE_OPTIONS.includes(
    draft.degree as (typeof DEGREE_OPTIONS)[number]
  )
    ? draft.degree
    : "Diğer";

  return (
    <Card className="border-primary/40">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-base">Eğitim Düzenle</CardTitle>
        <div className="flex gap-1">
          <Button type="button" size="sm" variant="outline" onClick={onCancel}>
            İptal
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => onSave(draft)}
          >
            Kaydet
          </Button>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label>Kurum</Label>
          <Input
            value={draft.institution}
            onChange={(e) => updateField("institution", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Derece</Label>
          <Select
            value={degreeValue}
            onValueChange={(value) => updateField("degree", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Derece seçin" />
            </SelectTrigger>
            <SelectContent>
              {DEGREE_OPTIONS.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Bölüm / Alan</Label>
          <Input
            value={draft.field_of_study}
            onChange={(e) => updateField("field_of_study", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Başlangıç Yılı</Label>
          <Input
            type="number"
            value={draft.start_year ?? ""}
            onChange={(e) =>
              updateField(
                "start_year",
                e.target.value ? Number(e.target.value) : null
              )
            }
          />
        </div>
        <div className="space-y-2">
          <Label>Bitiş Yılı</Label>
          <Input
            type="number"
            value={draft.end_year ?? ""}
            onChange={(e) =>
              updateField(
                "end_year",
                e.target.value ? Number(e.target.value) : null
              )
            }
          />
        </div>
        <div className="space-y-2">
          <Label>Not Ortalaması (GPA)</Label>
          <Input
            value={draft.gpa ?? ""}
            onChange={(e) => updateField("gpa", e.target.value || null)}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label>Açıklama</Label>
          <Textarea
            value={draft.description ?? ""}
            onChange={(e) => updateField("description", e.target.value || null)}
            rows={2}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function CertificationCard({
  certification,
  isEditing,
  onEdit,
  onCancel,
  onSave,
  onRemove,
}: {
  certification: Certification;
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: (fields: Partial<Certification>) => void;
  onRemove: () => void;
}) {
  const [draft, setDraft] = useState(certification);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (isEditing) setDraft(certification);
  }, [isEditing, certification]);

  const displayName =
    certification.name.startsWith("__draft_") || !certification.name
      ? "Yeni Sertifika"
      : certification.name;

  if (!isEditing) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-base">{displayName}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {certification.issuer}
              {certification.date ? ` · ${certification.date}` : ""}
            </p>
            {certification.credential_id && (
              <p className="text-xs text-muted-foreground">
                Kimlik: {certification.credential_id}
              </p>
            )}
          </div>
          <div className="flex shrink-0 gap-1">
            <Button type="button" variant="ghost" size="icon" onClick={onEdit}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </CardHeader>
        {confirmDelete && (
          <CardContent className="pt-0">
            <div className="flex flex-wrap items-center gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm">
              <span>Bu sertifikayı silmek istediğinize emin misiniz?</span>
              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={onRemove}
              >
                Evet, Sil
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setConfirmDelete(false)}
              >
                İptal
              </Button>
            </div>
          </CardContent>
        )}
      </Card>
    );
  }

  return (
    <Card className="border-primary/40">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-base">Sertifika Düzenle</CardTitle>
        <div className="flex gap-1">
          <Button type="button" size="sm" variant="outline" onClick={onCancel}>
            İptal
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => onSave(draft)}
          >
            Kaydet
          </Button>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label>Sertifika Adı</Label>
          <Input
            value={draft.name.startsWith("__draft_") ? "" : draft.name}
            onChange={(e) =>
              setDraft((prev) => ({ ...prev, name: e.target.value }))
            }
          />
        </div>
        <div className="space-y-2">
          <Label>Veren Kurum</Label>
          <Input
            value={draft.issuer}
            onChange={(e) =>
              setDraft((prev) => ({ ...prev, issuer: e.target.value }))
            }
          />
        </div>
        <div className="space-y-2">
          <Label>Tarih</Label>
          <Input
            value={draft.date ?? ""}
            onChange={(e) =>
              setDraft((prev) => ({
                ...prev,
                date: e.target.value || null,
              }))
            }
            placeholder="YYYY-AA"
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label>Kimlik / Credential ID</Label>
          <Input
            value={draft.credential_id ?? ""}
            onChange={(e) =>
              setDraft((prev) => ({
                ...prev,
                credential_id: e.target.value || null,
              }))
            }
          />
        </div>
      </CardContent>
    </Card>
  );
}

export function Step3Education() {
  const cvData = useCVWizardStore((s) => s.cvData);
  const addEducation = useCVWizardStore((s) => s.addEducation);
  const updateEducation = useCVWizardStore((s) => s.updateEducation);
  const removeEducation = useCVWizardStore((s) => s.removeEducation);
  const addCertification = useCVWizardStore((s) => s.addCertification);
  const updateCertification = useCVWizardStore((s) => s.updateCertification);
  const removeCertification = useCVWizardStore((s) => s.removeCertification);

  const [editingEducationId, setEditingEducationId] = useState<string | null>(
    null
  );
  const [editingCertKey, setEditingCertKey] = useState<string | null>(null);
  const [pendingEducationId, setPendingEducationId] = useState<string | null>(
    null
  );
  const [pendingCertKey, setPendingCertKey] = useState<string | null>(null);

  const education = cvData?.education ?? [];
  const certifications = cvData?.certifications ?? [];

  useEffect(() => {
    if (
      pendingEducationId &&
      education.some((e) => e.id === pendingEducationId)
    ) {
      setEditingEducationId(pendingEducationId);
      setPendingEducationId(null);
    }
  }, [pendingEducationId, education]);

  useEffect(() => {
    if (
      pendingCertKey &&
      certifications.some((c) => c.name === pendingCertKey)
    ) {
      setEditingCertKey(pendingCertKey);
      setPendingCertKey(null);
    }
  }, [pendingCertKey, certifications]);

  const handleAddEducation = () => {
    const prevLen = education.length;
    addEducation();
    const added = useCVWizardStore.getState().cvData?.education[prevLen];
    if (added) setPendingEducationId(added.id);
  };

  const handleAddCertification = () => {
    const draftKey = `__draft_${generateId()}`;
    addCertification({
      name: draftKey,
      issuer: "",
      date: null,
      credential_id: null,
    });
    setPendingCertKey(draftKey);
  };

  if (!cvData) {
    return (
      <p className="text-center text-muted-foreground">
        Eğitim bilgilerini düzenlemek için önce bir CV yükleyin.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold">Eğitim ve Sertifikalar</h2>
        <p className="text-muted-foreground">
          Akademik geçmişinizi ve profesyonel sertifikalarınızı yönetin.
        </p>
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Eğitim</h3>
          <Button
            type="button"
            onClick={handleAddEducation}
            size="sm"
            variant="outline"
          >
            <Plus className="mr-1 h-4 w-4" />
            Eğitim Ekle
          </Button>
        </div>

        {education.length === 0 ? (
          <div className="rounded-lg border border-dashed p-6 text-center text-muted-foreground">
            Henüz eğitim kaydı yok.
          </div>
        ) : (
          <div className="space-y-4">
            {education.map((edu) => (
              <EducationCard
                key={edu.id}
                education={edu}
                isEditing={editingEducationId === edu.id}
                onEdit={() => setEditingEducationId(edu.id)}
                onCancel={() => setEditingEducationId(null)}
                onSave={(fields) => {
                  updateEducation(edu.id, fields);
                  setEditingEducationId(null);
                }}
                onRemove={() => {
                  removeEducation(edu.id);
                  if (editingEducationId === edu.id) setEditingEducationId(null);
                }}
              />
            ))}
          </div>
        )}
      </section>

      <Separator />

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Sertifikalar</h3>
          <Button
            type="button"
            onClick={handleAddCertification}
            size="sm"
            variant="outline"
          >
            <Plus className="mr-1 h-4 w-4" />
            Sertifika Ekle
          </Button>
        </div>

        {certifications.length === 0 ? (
          <div className="rounded-lg border border-dashed p-6 text-center text-muted-foreground">
            Henüz sertifika eklenmedi.
          </div>
        ) : (
          <div className="space-y-4">
            {certifications.map((cert) => (
              <CertificationCard
                key={cert.name}
                certification={cert}
                isEditing={editingCertKey === cert.name}
                onEdit={() => setEditingCertKey(cert.name)}
                onCancel={() => setEditingCertKey(null)}
                onSave={(fields) => {
                  const nextName =
                    fields.name?.trim() ||
                    (cert.name.startsWith("__draft_")
                      ? `Sertifika ${generateId()}`
                      : cert.name);
                  updateCertification(cert.name, { ...fields, name: nextName });
                  setEditingCertKey(null);
                }}
                onRemove={() => {
                  removeCertification(cert.name);
                  if (editingCertKey === cert.name) setEditingCertKey(null);
                }}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
