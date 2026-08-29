import Groq from "groq-sdk"

export const GROQ_MODEL = process.env.GROQ_MODEL ?? "openai/gpt-oss-120b"

let client: Groq | null = null

// Lazy so a missing key surfaces as a caught error (then a safe fallback), not a crash at import.
export function getGroq(): Groq {
  if (!client) {
    client = new Groq({
      apiKey: process.env.GROQ_API_KEY,
      timeout: 12_000,
      maxRetries: 1,
    })
  }
  return client
}
