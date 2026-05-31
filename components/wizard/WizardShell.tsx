"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import { Step1Personal } from "@/components/wizard/Step1Personal";
import { Step2Experience } from "@/components/wizard/Step2Experience";
import { Step3Education } from "@/components/wizard/Step3Education";
import { Step4Skills } from "@/components/wizard/Step4Skills";
import { StepPreview } from "@/components/wizard/StepPreview";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useWizardStore } from "@/lib/store";
import type { WizardStep } from "@/types/cv";

const STEP_LABELS = ["Kişisel", "Deneyim", "Eğitim", "Yetenekler"] as const;

function StepContent({ step }: { step: WizardStep }) {
  switch (step) {
    case 1:
      return <Step1Personal />;
    case 2:
      return <Step2Experience />;
    case 3:
      return <Step3Education />;
    case 4:
      return <Step4Skills />;
    case 5:
      return <StepPreview />;
    default:
      return null;
  }
}

export function WizardShell() {
  const { step, isDirty, setStep } = useWizardStore();

  const handleNext = () => {
    if (step < 5) setStep((step + 1) as WizardStep);
  };

  const handleBack = () => {
    if (step > 1) setStep((step - 1) as WizardStep);
  };

  const nextLabel =
    step === 4 ? "Önizle" : step === 5 ? "Profili Kaydet" : "İleri";

  const handlePrimaryAction = () => {
    if (step === 5) {
      const blob = new Blob(
        [JSON.stringify(useWizardStore.getState().cvData, null, 2)],
        { type: "application/json" }
      );
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${
        useWizardStore.getState().cvData?.personal.full_name || "cv"
      }-profil.json`;
      link.click();
      URL.revokeObjectURL(url);
      return;
    }
    handleNext();
  };

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8">
      {!isDirty && step <= 4 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100">
          ✨ Veriler AI tarafından dolduruldu — lütfen kontrol edin
        </div>
      )}

      {step <= 4 && (
        <div className="flex flex-wrap gap-2">
          {STEP_LABELS.map((label, index) => {
            const stepNumber = (index + 1) as WizardStep;
            const isDone = step > stepNumber;
            const isActive = step === stepNumber;

            return (
              <div
                key={label}
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  isDone && "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
                  isActive && "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
                  !isDone && !isActive && "bg-muted text-muted-foreground"
                )}
              >
                {isDone && <Check className="h-3.5 w-3.5" />}
                {label}
              </div>
            );
          })}
        </div>
      )}

      <div className="min-h-[400px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <StepContent step={step} />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex justify-between border-t pt-6 print:hidden">
        <Button variant="outline" onClick={handleBack} disabled={step === 1}>
          Geri
        </Button>
        <Button onClick={handlePrimaryAction}>{nextLabel}</Button>
      </div>
    </div>
  );
}
