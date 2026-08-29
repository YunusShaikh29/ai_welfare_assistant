import { z } from "zod"

export const CATEGORIES = [
  "academic",
  "financial",
  "visa",
  "housing",
  "health",
  "other",
] as const

export const URGENCIES = ["low", "medium", "high", "critical"] as const

export const DISPOSITIONS = ["handle_now", "clarify", "escalate"] as const

export type Category = (typeof CATEGORIES)[number]
export type Urgency = (typeof URGENCIES)[number]
export type Disposition = (typeof DISPOSITIONS)[number]

// Shape we ask the model for and validate before trusting any of it.
export const modelTriageSchema = z.object({
  category: z.enum(CATEGORIES),
  urgency: z.enum(URGENCIES),
  safeguarding: z.boolean(),
  disposition: z.enum(DISPOSITIONS),
  manipulation: z.boolean().default(false),
  resourceId: z.string().trim().max(60).nullable().default(null),
  clarifyingQuestion: z.string().trim().max(300).nullable().default(null),
  summary: z.string().trim().max(800).nullable().default(null),
  reasoning: z.string().trim().max(600).nullable().default(null),
})

export type ModelTriage = z.infer<typeof modelTriageSchema>

// Final decision after code-side validation and house rules have been applied.
export interface TriageResult {
  category: Category
  urgency: Urgency
  safeguarding: boolean
  disposition: Disposition
  emergency: boolean // share the Samaritans line
  immediateDanger: boolean // share 999
  manipulation: boolean
  clarifyingQuestion: string | null
  summary: string | null
  resourceId: string | null
  reasoning: string | null
  usedFallback: boolean // model was invalid, slow, or unavailable
  raw: unknown
}
