import { cvSchema } from "@/lib/schemas";
import type { CVData } from "@/types/cv";

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "gemma3:12b";

const SYSTEM_PROMPT = `You are an expert CV parser. Extract all information from the provided CV text and return ONLY a valid JSON object. 
No text before or after the JSON. No markdown code blocks. No explanation.
Generate a unique 6-char alphanumeric id for each experience and education entry.
Use null for missing fields.
If no summary exists, write a 2-sentence professional summary based on the CV content.
Set confidence_score between 0 and 1 based on how complete the CV data was.
List missing or unclear fields in the missing_fields array.
Detect the CV language and set it in the language field (e.g. "tr", "en").`;

export async function callClaudeForCV(rawText: string): Promise<CVData> {
  try {
    await fetch(`${OLLAMA_BASE_URL}/api/tags`);
  } catch {
    throw new Error(
      "OLLAMA_NOT_RUNNING: Ollama çalışmıyor. Terminalde \"ollama serve\" komutunu çalıştırın."
    );
  }

  const body = {
    model: OLLAMA_MODEL,
    prompt: `${SYSTEM_PROMPT}\n\nParse this CV and return only JSON:\n\n${rawText}`,
    stream: false,
    format: "json",
    options: {
      temperature: 0.1,
      num_predict: 4096,
    },
  };

  let responseText = "";
  try {
    const res = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    responseText = data.response;
  } catch {
    throw new Error("OLLAMA_REQUEST_FAILED: Ollama isteği başarısız oldu.");
  }

  try {
    const cleaned = responseText.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    return cvSchema.parse(parsed);
  } catch {
    try {
      const retryBody = {
        ...body,
        prompt: `Return ONLY a raw JSON object, absolutely no other text, no markdown, no code blocks.\n\nCV:\n${rawText}`,
      };
      const res = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(retryBody),
      });
      const data = await res.json();
      const cleaned = data.response.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleaned);
      return cvSchema.parse(parsed);
    } catch {
      throw new Error(
        "PARSE_FAILED: CV verisi JSON formatına dönüştürülemedi."
      );
    }
  }
}
