// ─────────────────────────────────────────────────────────────
//  Selector de proveedor de IA
//  Cambia esta constante para alternar entre modelos.
//  También se puede sobrescribir sin tocar código con la
//  variable de entorno AI_PROVIDER=openai | anthropic.
// ─────────────────────────────────────────────────────────────
export type AIProvider = "anthropic" | "openai";

const DEFAULT_PROVIDER: AIProvider = "anthropic";

export const AI_MODELS: Record<AIProvider, string> = {
  anthropic: "claude-haiku-5-5",
  openai: "gpt-6-luna",
};

const API_KEY_ENV: Record<AIProvider, string> = {
  anthropic: "ANTHROPIC_API_KEY",
  openai: "OPENAI_API_KEY",
};

export function getAIProvider(): AIProvider {
  const fromEnv = process.env.AI_PROVIDER?.trim().toLowerCase();
  if (fromEnv === "anthropic" || fromEnv === "openai") return fromEnv;
  return DEFAULT_PROVIDER;
}

export function getAIModel(provider: AIProvider = getAIProvider()): string {
  return AI_MODELS[provider];
}

export function getAIApiKey(provider: AIProvider = getAIProvider()): string {
  const envName = API_KEY_ENV[provider];
  const key = process.env[envName];
  if (!key) throw new MissingAIKeyError(envName);
  return key;
}

/** Devuelve un mensaje de error si falta la API key del proveedor activo, o null si está todo bien. */
export function missingAIKeyMessage(): string | null {
  const envName = API_KEY_ENV[getAIProvider()];
  return process.env[envName] ? null : `Missing ${envName}`;
}

export class MissingAIKeyError extends Error {
  constructor(envName: string) {
    super(`Missing ${envName}`);
    this.name = "MissingAIKeyError";
  }
}
