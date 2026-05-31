"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { UploadZone } from "@/components/cv-upload/UploadZone";
import { useWizardStore } from "@/lib/store";

export default function HomePage() {
  const router = useRouter();
  const cvData = useWizardStore((s) => s.cvData);

  useEffect(() => {
    if (cvData) {
      router.replace("/wizard");
    }
  }, [cvData, router]);

  if (cvData) {
    return null;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      <div className="mb-10 max-w-xl text-center">
        <h1 className="text-3xl font-bold tracking-tight">CV Analiz Aracı</h1>
        <p className="mt-3 text-muted-foreground">
          CV&apos;nizi yükleyin, yapay zeka bilgilerinizi otomatik çıkarsın ve
          adım adım düzenleyin.
        </p>
      </div>
      <UploadZone />
    </main>
  );
}
