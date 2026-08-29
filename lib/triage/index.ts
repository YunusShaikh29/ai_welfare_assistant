import { getGroq, GROQ_MODEL } from "@/lib/groq"
import { applyHouseRules } from "@/lib/triage/house-rules"
import { buildTriageSystemPrompt } from "@/lib/triage/prompt"
import {
  modelTriageSchema,
  type ModelTriage,
  type TriageResult,
} from "@/lib/triage/schema"

export interface TriageMessage {
  role: "student" | "assistant"
  content: string
}

export interface TriageInput {
  messages: TriageMessage[]
}

function lastStudentMessage(messages: TriageMessage[]): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === "student") return messages[i].content
  }
  return ""
}

// Parse and validate a raw model response; returns null on anything invalid.
export function parseModelResponse(
  content: string | null | undefined
): ModelTriage | null {
  if (!content) return null

  let parsed: unknown
  try {
    parsed = JSON.parse(content)
  } catch {
    return null
  }

  const result = modelTriageSchema.safeParse(parsed)
  return result.success ? result.data : null
}

async function callModel(messages: TriageMessage[]): Promise<ModelTriage | null> {
  const groq = getGroq()

  const completion = await groq.chat.completions.create({
    model: GROQ_MODEL,
    temperature: 0,
    max_tokens: 500,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: buildTriageSystemPrompt() },
      ...messages.map((message) => ({
        role: message.role === "student" ? ("user" as const) : ("assistant" as const),
        content: message.content,
      })),
    ],
  })

  return parseModelResponse(completion.choices[0]?.message?.content)
}

export type ModelCaller = (messages: TriageMessage[]) => Promise<ModelTriage | null>

/*
 * Triage a message using the model, then enforce the house rules in code. On any model
 * failure (invalid JSON, schema mismatch, timeout, or unavailable) it falls back to a
 * safe escalate, while the code-side crisis and injection checks still run.
 * `callModelFn` is injectable so tests and probes can stub the model deterministically.
 */
export async function runTriage(
  input: TriageInput,
  callModelFn: ModelCaller = callModel
): Promise<TriageResult> {
  const text = lastStudentMessage(input.messages)

  let model: ModelTriage | null = null
  try {
    model = await callModelFn(input.messages)
  } catch {
    model = null
  }

  return applyHouseRules(model, text)
}
