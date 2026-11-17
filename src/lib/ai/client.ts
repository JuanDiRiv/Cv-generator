import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import {
  getAIApiKey,
  getAIModel,
  getAIProvider,
  type AIProvider,
} from "./config";

export type AIEffort = "low" | "medium" | "high";

export interface AIPdfInput {
  /** PDF en base64 (sin prefijo data:) */
  base64: string;
  filename: string;
}

export interface GenerateJSONRequest {
  system: string;
  user: string;
  pdf?: AIPdfInput;
  maxTokens?: number;
  /** Solo aplica a Claude: cuánto razona el modelo antes de responder. */
  effort?: AIEffort;
}

/**
 * Envía un system + user prompt al proveedor activo y devuelve el JSON parseado.
 * Los prompts deben pedir explícitamente "Return strict JSON".
 */
export async function generateJSON<T = unknown>(
  req: GenerateJSONRequest,
): Promise<T> {
  const provider = getAIProvider();
  const raw =
    provider === "anthropic"
      ? await callAnthropic(req, provider)
      : await callOpenAI(req, provider);
  return parseJSONLoose<T>(raw);
}

async function callAnthropic(
  req: GenerateJSONRequest,
  provider: AIProvider,
): Promise<string> {
  const client = new Anthropic({ apiKey: getAIApiKey(provider) });

  const content: Anthropic.ContentBlockParam[] = [];
  if (req.pdf) {
    content.push({
      type: "document",
      source: {
        type: "base64",
        media_type: "application/pdf",
        data: req.pdf.base64,
      },
    });
  }
  content.push({ type: "text", text: req.user });

  // Streaming + finalMessage evita timeouts HTTP en respuestas largas (p. ej. import de PDF).
  const message = await client.messages
    .stream({
      model: getAIModel(provider),
      max_tokens: req.maxTokens ?? 16000,
      system: `${req.system}\nRespond with the JSON object only, without markdown code fences.`,
      output_config: { effort: req.effort ?? "medium" },
      messages: [{ role: "user", content }],
    })
    .finalMessage();

  if (message.stop_reason === "refusal") {
    throw new Error("El modelo rechazó la solicitud.");
  }
  if (message.stop_reason === "max_tokens") {
    throw new Error("La respuesta del modelo quedó truncada (max_tokens).");
  }

  const text = message.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");
  if (!text.trim()) throw new Error("El modelo devolvió una respuesta vacía");
  return text;
}

async function callOpenAI(
  req: GenerateJSONRequest,
  provider: AIProvider,
): Promise<string> {
  const client = new OpenAI({ apiKey: getAIApiKey(provider) });

  const userContent: OpenAI.Chat.ChatCompletionContentPart[] = [
    { type: "text", text: req.user },
  ];
  if (req.pdf) {
    userContent.push({
      type: "file",
      file: {
        filename: req.pdf.filename,
        file_data: `data:application/pdf;base64,${req.pdf.base64}`,
      },
    });
  }

  const completion = await client.chat.completions.create({
    model: getAIModel(provider),
    ...(req.maxTokens ? { max_completion_tokens: req.maxTokens } : {}),
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: req.system },
      { role: "user", content: req.pdf ? userContent : req.user },
    ],
  });

  const text = completion.choices[0]?.message?.content;
  if (!text) throw new Error("El modelo devolvió una respuesta vacía");
  return text;
}

/** Parsea JSON tolerando bloques ```json ... ``` o texto alrededor del objeto. */
export function parseJSONLoose<T>(raw: string): T {
  const trimmed = raw.trim();
  try {
    return JSON.parse(trimmed) as T;
  } catch {
    const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1];
    if (fenced) return JSON.parse(fenced.trim()) as T;
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start !== -1 && end > start) {
      return JSON.parse(trimmed.slice(start, end + 1)) as T;
    }
    throw new Error("La respuesta del modelo no es JSON válido");
  }
}
