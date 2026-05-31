import mammoth from "mammoth";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const PDF_MIME = "application/pdf";
const DOCX_MIME =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export type CvExtractErrorCode = "UNSUPPORTED_FORMAT" | "FILE_TOO_LARGE";

export class CvExtractError extends Error {
  readonly code: CvExtractErrorCode;

  constructor(code: CvExtractErrorCode, message: string) {
    super(message);
    this.name = "CvExtractError";
    this.code = code;
  }
}

function getFileExtension(filename: string): string {
  return filename.split(".").pop()?.toLowerCase() ?? "";
}

function isPdf(file: File): boolean {
  return file.type === PDF_MIME || getFileExtension(file.name) === "pdf";
}

function isDocx(file: File): boolean {
  return file.type === DOCX_MIME || getFileExtension(file.name) === "docx";
}

async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  const { PDFParse } = await import("pdf-parse");
  const parser = new PDFParse({ data: buffer });
  try {
    const result = await parser.getText();
    return cleanPlainText(result.text);
  } finally {
    await parser.destroy();
  }
}

async function extractTextFromDocx(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  return cleanPlainText(result.value);
}

function cleanPlainText(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function extractTextFromFile(file: File): Promise<string> {
  if (file.size > MAX_FILE_SIZE) {
    throw new CvExtractError(
      "FILE_TOO_LARGE",
      "File exceeds the 10 MB size limit."
    );
  }

  if (!isPdf(file) && !isDocx(file)) {
    throw new CvExtractError(
      "UNSUPPORTED_FORMAT",
      "Only PDF and DOCX files are supported."
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  if (isPdf(file)) {
    return extractTextFromPdf(buffer);
  }

  return extractTextFromDocx(buffer);
}
