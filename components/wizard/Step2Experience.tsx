"use client";

import {
  DndContext,
  closestCenter,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pencil, Plus, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCVWizardStore } from "@/lib/store";
import { cn, formatDateRange } from "@/lib/utils";
import type { EmploymentType, Experience } from "@/types/cv";

const EMPLOYMENT_LABELS: Record<EmploymentType, string> = {
  "full-time": "Tam Zamanlı",
  "part-time": "Yarı Zamanlı",
  freelance: "Serbest",
  internship: "Staj",
  other: "Diğer",
};

function HighlightsInput({
  highlights,
  onChange,
}: {
  highlights: string[];
  onChange: (highlights: string[]) => void;
}) {
  const [draft, setDraft] = useState("");

  const addHighlight = () => {
    const value = draft.trim();
    if (!value || highlights.includes(value)) return;
    onChange([...highlights, value]);
    setDraft("");
  };

  return (
    <div className="space-y-2">
      <Label>Öne Çıkanlar</Label>
      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Madde ekleyin ve Enter'a basın"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addHighlight();
            }
          }}
        />
        <Button type="button" variant="outline" size="sm" onClick={addHighlight}>
          Ekle
        </Button>
      </div>
      {highlights.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {highlights.map((item, index) => (
            <Badge key={`${item}-${index}`} variant="secondary" className="gap-1">
              {item}
              <button
                type="button"
                className="rounded-full hover:bg-muted"
                onClick={() => onChange(highlights.filter((_, i) => i !== index))}
                aria-label="Kaldır"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

function ExperienceCard({
  experience,
  isEditing,
  onEdit,
  onCancel,
  onSave,
  onRemove,
  dragHandleProps,
}: {
  experience: Experience;
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: (fields: Partial<Experience>) => void;
  onRemove: () => void;
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>;
}) {
  const [draft, setDraft] = useState(experience);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (isEditing) setDraft(experience);
  }, [isEditing, experience]);

  const updateField = <K extends keyof Experience>(
    field: K,
    value: Experience[K]
  ) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
  };

  if (!isEditing) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-start gap-2 space-y-0 pb-2">
          {dragHandleProps && (
            <button
              type="button"
              className="mt-1 cursor-grab text-muted-foreground active:cursor-grabbing"
              {...dragHandleProps}
            >
              <GripVertical className="h-5 w-5" />
            </button>
          )}
          <div className="min-w-0 flex-1">
            <CardTitle className="text-base">
              {experience.title || "Pozisyon"}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {experience.company}
              {experience.location ? ` · ${experience.location}` : ""}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDateRange(
                experience.start_date,
                experience.end_date,
                experience.is_current
              )}
              {experience.employment_type
                ? ` · ${EMPLOYMENT_LABELS[experience.employment_type]}`
                : ""}
            </p>
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
        <CardContent className="space-y-3 pt-0">
          {experience.description && (
            <p className="text-sm">{experience.description}</p>
          )}
          {experience.highlights.length > 0 && (
            <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
              {experience.highlights.map((h, i) => (
                <li key={i}>{h}</li>
              ))}
            </ul>
          )}
          {confirmDelete && (
            <div className="flex flex-wrap items-center gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm">
              <span>Bu deneyimi silmek istediğinize emin misiniz?</span>
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
      </Card>
    );
  }

  return (
    <Card className="border-primary/40">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-base">Deneyim Düzenle</CardTitle>
        <div className="flex gap-1">
          <Button type="button" size="sm" variant="outline" onClick={onCancel}>
            İptal
          </Button>
          <Button type="button" size="sm" onClick={() => onSave(draft)}>
            Kaydet
          </Button>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>İş Unvanı</Label>
          <Input
            value={draft.title}
            onChange={(e) => updateField("title", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Şirket</Label>
          <Input
            value={draft.company}
            onChange={(e) => updateField("company", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Çalışma Türü</Label>
          <Select
            value={draft.employment_type}
            onValueChange={(value) =>
              updateField("employment_type", value as EmploymentType)
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(EMPLOYMENT_LABELS) as EmploymentType[]).map(
                (type) => (
                  <SelectItem key={type} value={type}>
                    {EMPLOYMENT_LABELS[type]}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Konum</Label>
          <Input
            value={draft.location ?? ""}
            onChange={(e) => updateField("location", e.target.value || null)}
          />
        </div>
        <div className="space-y-2">
          <Label>Başlangıç Tarihi</Label>
          <Input
            value={draft.start_date}
            onChange={(e) => updateField("start_date", e.target.value)}
            placeholder="YYYY-AA"
          />
        </div>
        <div className="space-y-2">
          <Label>Bitiş Tarihi</Label>
          <Input
            value={draft.end_date ?? ""}
            onChange={(e) => updateField("end_date", e.target.value || null)}
            placeholder="YYYY-AA"
            disabled={draft.is_current}
          />
        </div>
        <div className="flex items-center gap-2 sm:col-span-2">
          <Checkbox
            id={`current-${experience.id}`}
            checked={draft.is_current}
            onCheckedChange={(checked) => {
              setDraft((prev) => ({
                ...prev,
                is_current: checked === true,
                end_date: checked === true ? null : prev.end_date,
              }));
            }}
          />
          <Label htmlFor={`current-${experience.id}`}>
            Halen burada çalışıyorum
          </Label>
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label>Açıklama</Label>
          <Textarea
            value={draft.description}
            onChange={(e) => updateField("description", e.target.value)}
            rows={3}
          />
        </div>
        <div className="sm:col-span-2">
          <HighlightsInput
            highlights={draft.highlights}
            onChange={(highlights) => updateField("highlights", highlights)}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function SortableExperienceCard(props: {
  experience: Experience;
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: (fields: Partial<Experience>) => void;
  onRemove: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.experience.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(isDragging && "opacity-60")}
    >
      <ExperienceCard
        {...props}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}

export function Step2Experience() {
  const cvData = useCVWizardStore((s) => s.cvData);
  const addExperience = useCVWizardStore((s) => s.addExperience);
  const updateExperience = useCVWizardStore((s) => s.updateExperience);
  const removeExperience = useCVWizardStore((s) => s.removeExperience);
  const reorderExperiences = useCVWizardStore((s) => s.reorderExperiences);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingEditId, setPendingEditId] = useState<string | null>(null);

  const experiences = cvData?.experiences ?? [];

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (pendingEditId && experiences.some((e) => e.id === pendingEditId)) {
      setEditingId(pendingEditId);
      setPendingEditId(null);
    }
  }, [pendingEditId, experiences]);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = experiences.findIndex((e) => e.id === active.id);
      const newIndex = experiences.findIndex((e) => e.id === over.id);
      if (oldIndex < 0 || newIndex < 0) return;

      const ids = experiences.map((e) => e.id);
      const [moved] = ids.splice(oldIndex, 1);
      ids.splice(newIndex, 0, moved);
      reorderExperiences(ids);
    },
    [experiences, reorderExperiences]
  );

  const handleAdd = () => {
    const prevCount = experiences.length;
    addExperience();
    const added = useCVWizardStore.getState().cvData?.experiences[prevCount];
    if (added) setPendingEditId(added.id);
  };

  if (!cvData) {
    return (
      <p className="text-center text-muted-foreground">
        Deneyim eklemek için önce bir CV yükleyin.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">İş Deneyimi</h2>
          <p className="text-muted-foreground">
            İş geçmişinizi ekleyin, düzenleyin veya sıralayın.
          </p>
        </div>
        <Button type="button" onClick={handleAdd} size="sm">
          <Plus className="mr-1 h-4 w-4" />
          Deneyim Ekle
        </Button>
      </div>

      {experiences.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
          Henüz deneyim eklenmedi. &quot;+ Deneyim Ekle&quot; ile başlayın.
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={experiences.map((e) => e.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4">
              {experiences.map((exp) => (
                <SortableExperienceCard
                  key={exp.id}
                  experience={exp}
                  isEditing={editingId === exp.id}
                  onEdit={() => setEditingId(exp.id)}
                  onCancel={() => setEditingId(null)}
                  onSave={(fields) => {
                    updateExperience(exp.id, fields);
                    setEditingId(null);
                  }}
                  onRemove={() => {
                    removeExperience(exp.id);
                    if (editingId === exp.id) setEditingId(null);
                  }}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
