import { NextRequest, NextResponse } from "next/server";
import { callClaudeForCV } from "@/lib/anthropic";
import { CvExtractError, extractTextFromFile } from "@/lib/cv-parser";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 5;

const PDF_MIME = "application/pdf";
const DOCX_MIME =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

const rateLimitMap = new Map<string, number[]>();

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = (rateLimitMap.get(ip) ?? []).filter(
    (t) => now - t < RATE_LIMIT_WINDOW_MS
  );

  if (timestamps.length >= RATE_LIMIT_MAX) {
    rateLimitMap.set(ip, timestamps);
    return true;
  }

  timestamps.push(now);
  rateLimitMap.set(ip, timestamps);
  return false;
}

function getFileExtension(filename: string): string {
  return filename.split(".").pop()?.toLowerCase() ?? "";
}

function isSupportedUpload(file: File): boolean {
  const ext = getFileExtension(file.name);
  return (
    file.type === PDF_MIME ||
    file.type === DOCX_MIME ||
    ext === "pdf" ||
    ext === "docx"
  );
}

export async function POST(request: NextRequest) {
  const startedAt = Date.now();

  try {
    const ip = getClientIp(request);
    if (isRateLimited(ip)) {
      return NextResponse.json(
        {
          error: "RATE_LIMITED",
          message: "Too many requests. Maximum 5 uploads per minute.",
        },
        { status: 429 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        {
          error: "NO_FILE",
          message: "No file provided. Send multipart/form-data with a 'file' field.",
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: "FILE_TOO_LARGE",
          message: "File exceeds the 10 MB size limit.",
        },
        { status: 413 }
      );
    }

    if (!isSupportedUpload(file)) {
      return NextResponse.json(
        {
          error: "UNSUPPORTED_FORMAT",
          message: "Only PDF and DOCX files are supported.",
        },
        { status: 415 }
      );
    }

    let rawText: string;
    try {
      rawText = await extractTextFromFile(file);
    } catch (error) {
      if (error instanceof CvExtractError) {
        const status = error.code === "FILE_TOO_LARGE" ? 413 : 415;
        return NextResponse.json(
          { error: error.code, message: error.message },
          { status }
        );
      }
      const message =
        error instanceof Error
          ? error.message
          : "Failed to extract text from file.";
      return NextResponse.json({ error: "EXTRACT_FAILED", message }, { status: 422 });
    }

    if (!rawText.trim()) {
      return NextResponse.json(
        {
          error: "EMPTY_TEXT",
          message: "Could not extract any text from the uploaded file.",
        },
        { status: 422 }
      );
    }

    let data;
    try {
      data = await callClaudeForCV(rawText);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to parse CV with AI.";

      if (message.includes("OLLAMA_NOT_RUNNING")) {
        return NextResponse.json(
          {
            error: "OLLAMA_NOT_RUNNING",
            message:
              "Ollama çalışmıyor. Lütfen terminalde ollama serve komutunu çalıştırın.",
          },
          { status: 503 }
        );
      }

      if (message.includes("PARSE_FAILED")) {
        return NextResponse.json(
          {
            error: "PARSE_FAILED",
            message: "CV okunamadı. Lütfen farklı bir dosya deneyin.",
          },
          { status: 422 }
        );
      }

      if (message.includes("OLLAMA_REQUEST_FAILED")) {
        return NextResponse.json(
          {
            error: "OLLAMA_REQUEST_FAILED",
            message: "Ollama isteği başarısız oldu. Lütfen tekrar deneyin.",
          },
          { status: 502 }
        );
      }

      return NextResponse.json(
        { error: "AI_PARSE_ERROR", message },
        { status: 502 }
      );
    }

    const durationMs = Date.now() - startedAt;
    console.log(
      file.name,
      file.size,
      durationMs,
      data.meta.confidence_score
    );

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error("POST /api/parse-cv error:", error);
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred.";
    return NextResponse.json(
      { error: "INTERNAL_ERROR", message },
      { status: 500 }
    );
  }
}
