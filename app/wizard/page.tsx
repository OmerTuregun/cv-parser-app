"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { WizardShell } from "@/components/wizard/WizardShell";
import { useWizardStore } from "@/lib/store";

export default function WizardPage() {
  const router = useRouter();
  const cvData = useWizardStore((s) => s.cvData);

  useEffect(() => {
    if (!cvData) {
      router.replace("/");
    }
  }, [cvData, router]);

  if (!cvData) {
    return null;
  }

  return (
    <main className="min-h-screen bg-background px-4 py-12">
      <div className="mx-auto mb-10 max-w-3xl text-center">
        <h1 className="text-3xl font-bold tracking-tight">CV Düzenleyici</h1>
        <p className="mt-2 text-muted-foreground">
          Bilgilerinizi kontrol edin, düzenleyin ve profilinizi oluşturun.
        </p>
      </div>
      <WizardShell />
    </main>
  );
}
