"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, FileText, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useWizardStore } from "@/lib/store";
import type { CVData } from "@/types/cv";

const ACCEPTED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const LOADING_STEPS = [
  { progress: 0, message: "Dosya yükleniyor..." },
  { progress: 25, message: "Metin çıkarılıyor..." },
  { progress: 55, message: "AI analiz yapıyor..." },
  { progress: 85, message: "Profil oluşturuluyor..." },
  { progress: 100, message: "Tamamlandı!" },
] as const;

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function UploadZone() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loadingIndex, setLoadingIndex] = useState(0);

  const {
    uploadState,
    uploadError,
    setCvData,
    setUploadState,
    setUploadError,
    setFileName,
    setStep,
  } = useWizardStore();

  const isLoading =
    uploadState === "uploading" || uploadState === "parsing";

  useEffect(() => {
    if (!isLoading) {
      setLoadingIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setLoadingIndex((prev) =>
        prev < LOADING_STEPS.length - 1 ? prev + 1 : prev
      );
    }, 1800);

    return () => clearInterval(interval);
  }, [isLoading]);

  const validateAndSelect = useCallback(
    (file: File | null) => {
      if (!file) return;

      if (!ACCEPTED_TYPES.includes(file.type)) {
        setUploadError("Lütfen PDF veya DOCX dosyası yükleyin.");
        setSelectedFile(null);
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setUploadError("Dosya boyutu en fazla 10 MB olabilir.");
        setSelectedFile(null);
        return;
      }

      setUploadError(null);
      setSelectedFile(file);
    },
    [setUploadError]
  );

  const handleAnalyze = useCallback(async () => {
    if (!selectedFile) return;

    setUploadError(null);
    setUploadState("uploading");
    setLoadingIndex(0);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch("/api/parse-cv", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "CV analiz edilemedi.");
      }

      const data = (result.data ?? result) as CVData;
      setCvData(data);
      setFileName(selectedFile.name);
      setStep(1);
      router.push("/wizard");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "CV analiz edilemedi.";
      setUploadError(message);
      setUploadState("error");
    }
  }, [
    selectedFile,
    router,
    setCvData,
    setFileName,
    setStep,
    setUploadError,
    setUploadState,
  ]);

  const handleRetry = useCallback(() => {
    setUploadError(null);
    setUploadState("idle");
    void handleAnalyze();
  }, [handleAnalyze, setUploadError, setUploadState]);

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragging(false);
      if (!isLoading) {
        validateAndSelect(event.dataTransfer.files[0] ?? null);
      }
    },
    [isLoading, validateAndSelect]
  );

  const onDragOver = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      if (!isLoading) setIsDragging(true);
    },
    [isLoading]
  );

  const onDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  }, []);

  const handleChangeFile = useCallback(() => {
    setSelectedFile(null);
    setUploadError(null);
    fileInputRef.current?.click();
  }, [setUploadError]);

  const currentLoading = LOADING_STEPS[loadingIndex];

  return (
    <div className="mx-auto w-full max-w-xl space-y-6">
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => !isLoading && !selectedFile && fileInputRef.current?.click()}
        className={cn(
          "flex min-h-64 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 transition-colors",
          isDragging
            ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
            : "border-muted-foreground/30 hover:border-muted-foreground/50",
          isLoading && "pointer-events-none opacity-80",
          selectedFile && !isLoading && "cursor-default"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="hidden"
          onChange={(event) => {
            validateAndSelect(event.target.files?.[0] ?? null);
            event.target.value = "";
          }}
        />

        {isLoading ? (
          <div className="w-full max-w-sm space-y-4 text-center">
            <Upload className="mx-auto h-12 w-12 animate-pulse text-blue-500" />
            <p className="text-lg font-medium">{currentLoading.message}</p>
            <Progress value={currentLoading.progress} className="h-2" />
            <p className="text-sm text-muted-foreground">
              %{currentLoading.progress}
            </p>
          </div>
        ) : selectedFile ? (
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700 dark:bg-green-950 dark:text-green-300">
              <CheckCircle2 className="h-4 w-4" />
              Dosya seçildi
            </div>
            <div className="flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{selectedFile.name}</span>
              <span className="text-muted-foreground">
                ({formatFileSize(selectedFile.size)})
              </span>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleChangeFile();
              }}
              className="text-sm text-blue-600 underline-offset-4 hover:underline"
            >
              Değiştir
            </button>
          </div>
        ) : (
          <>
            <Upload className="mb-4 h-12 w-12 text-muted-foreground" />
            <h2 className="text-xl font-semibold">CV&apos;nizi yükleyin</h2>
            <p className="mt-2 max-w-sm text-center text-sm text-muted-foreground">
              Dosyanızı sürükleyip bırakın veya tıklayarak seçin
            </p>
            <Badge variant="secondary" className="mt-4">
              PDF · DOCX
            </Badge>
          </>
        )}
      </div>

      {!isLoading && selectedFile && (
        <Button
          className="w-full"
          size="lg"
          onClick={() => void handleAnalyze()}
        >
          CV&apos;mi Analiz Et
        </Button>
      )}

      {uploadError && (
        <div className="space-y-3 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3">
          <p className="text-sm text-destructive">{uploadError}</p>
          {selectedFile && (
            <Button variant="outline" size="sm" onClick={handleRetry}>
              Tekrar Dene
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
