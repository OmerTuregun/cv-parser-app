"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { personalSchema } from "@/lib/schemas";
import { useCVWizardStore } from "@/lib/store";
import type { Personal } from "@/types/cv";

const SUMMARY_MAX = 500;

const formSchema = personalSchema.extend({
  email: z.union([z.string().email(), z.literal("")]).nullable(),
  city: z.string().optional(),
  country: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

function toPersonalPatch(values: FormValues): Partial<Personal> {
  return {
    full_name: values.full_name ?? "",
    email: values.email ? values.email : null,
    phone: values.phone || null,
    location:
      values.city || values.country
        ? {
            city: values.city ?? "",
            country: values.country ?? "",
          }
        : null,
    linkedin_url: values.linkedin_url || null,
    website: values.website || null,
    summary: values.summary ?? "",
  };
}

export function Step1Personal() {
  const cvData = useCVWizardStore((s) => s.cvData);
  const updatePersonal = useCVWizardStore((s) => s.updatePersonal);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const personal = cvData?.personal;

  const {
    register,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: "",
      email: "",
      phone: "",
      city: "",
      country: "",
      linkedin_url: "",
      website: "",
      summary: "",
    },
  });

  useEffect(() => {
    if (!personal) return;
    reset({
      full_name: personal.full_name,
      email: personal.email ?? "",
      phone: personal.phone ?? "",
      city: personal.location?.city ?? "",
      country: personal.location?.country ?? "",
      linkedin_url: personal.linkedin_url ?? "",
      website: personal.website ?? "",
      summary: personal.summary,
    });
  }, [personal, reset]);

  const watched = useWatch({ control });
  const summaryLength = (watched.summary ?? "").length;

  useEffect(() => {
    if (!cvData) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      updatePersonal(toPersonalPatch(watched as FormValues));
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [watched, updatePersonal, cvData]);

  if (!cvData) {
    return (
      <p className="text-center text-muted-foreground">
        Kişisel bilgileri düzenlemek için önce bir CV yükleyin.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Kişisel Bilgiler</h2>
        <p className="text-muted-foreground">
          İletişim bilgilerinizi ve profil özetinizi gözden geçirin.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="full_name">Ad Soyad *</Label>
          <Input id="full_name" {...register("full_name")} />
          {errors.full_name && (
            <p className="text-sm text-destructive">{errors.full_name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">E-posta</Label>
          <Input id="email" type="email" {...register("email")} />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Telefon</Label>
          <Input id="phone" {...register("phone")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="city">Şehir</Label>
          <Input id="city" {...register("city")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="country">Ülke</Label>
          <Input id="country" {...register("country")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="linkedin_url">LinkedIn URL</Label>
          <Input id="linkedin_url" {...register("linkedin_url")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="website">Kişisel Website</Label>
          <Input id="website" {...register("website")} />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="summary">Profil Özeti</Label>
            <span
              className={`text-xs ${
                summaryLength > SUMMARY_MAX
                  ? "text-destructive"
                  : "text-muted-foreground"
              }`}
            >
              {summaryLength}/{SUMMARY_MAX}
            </span>
          </div>
          <Textarea
            id="summary"
            rows={5}
            maxLength={SUMMARY_MAX}
            {...register("summary")}
            placeholder="Profesyonel geçmişinize kısa bir genel bakış..."
          />
        </div>
      </div>
    </div>
  );
}
