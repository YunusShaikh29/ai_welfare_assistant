import type {
  ModelTriage,
  TriageResult,
  Urgency,
} from "@/lib/triage/schema"

// Passive risk and self-neglect: a human is needed, and urgent support (Samaritans) is appropriate.
const CRISIS_PATTERNS: RegExp[] = [
  /\bno point\b/i,
  /point (of|in) (anything|everything|living|life|going on|it all)/i,
  /don'?t (really )?see the point/i,
  /can'?t (see|find) (the|a|any) point/i,
  /haven'?t (left|been out of) (my |the )?room/i,
  /haven'?t eaten|not eaten|stopped eating/i,
  /can'?t (cope|go on|keep going|carry on)/i,
  /feel(ing)? (so |really |very |completely )?(low|hopeless|empty|numb|worthless)/i,
  /giving up|given up on/i,
  /breaking down|falling apart/i,
]

// Explicit intent or immediate danger to life: surface 999 and the Samaritans at once.
const DANGER_PATTERNS: RegExp[] = [
  /kill(ing)? myself|kill myself/i,
  /end (my life|it all|my own life|things)/i,
  /take my (own )?life/i,
  /want to die|wish i (was|were) dead|better off dead/i,
  /suicid/i,
  /overdose|take all (my|the) pills/i,
  /hurt(ing)? myself|harm(ing)? myself|self[-\s]?harm/i,
  /hang myself|jump off|jump in front/i,
]

// Attempts to override the assistant's instructions or force a triage outcome.
const INJECTION_PATTERNS: RegExp[] = [
  /ignore (all |your |the |any )?(previous|prior|above|earlier|preceding) (instructions|prompts|messages|rules)/i,
  /disregard (all |your |the )?(previous|prior|above )?(instructions|rules)/i,
  /forget (your|the|all|previous) (instructions|rules)/i,
  /mark (this|it|the (case|conversation)) (as )?(resolved|closed|low|fine)/i,
  /set (the )?(priority|urgency) to low/i,
  /you are now|pretend (to|you)|act as (if|though|a)/i,
  /system prompt|reveal your (prompt|instructions|system)/i,
  /override (the |your )?(rules|instructions|safety|triage)/i,
]

// Explicit request to reach a real person, which should route to a human rather than repeat a signpost.
const HUMAN_REQUEST_PATTERNS: RegExp[] = [
  /(talk|speak|chat|connect) (to|with) (a |an )?(someone|somebody|person|human|counsel?lor|advisor|adviser|staff|member|real person|actual person)/i,
  /want (to (talk|speak)|a human|a person|someone to talk|to talk to (a )?(person|human|someone))/i,
  /(can|could|may) i (talk|speak) (to|with)/i,
  /(get|have|reach|contact|see) (me )?(a |an )?(human|person|real person|counsel?lor|adviser|advisor)/i,
  /talk to a real person|speak to a real person/i,
]

export function detectCrisis(text: string): boolean {
  return CRISIS_PATTERNS.some((pattern) => pattern.test(text))
}

export function detectDanger(text: string): boolean {
  return DANGER_PATTERNS.some((pattern) => pattern.test(text))
}

export function detectManipulation(text: string): boolean {
  return INJECTION_PATTERNS.some((pattern) => pattern.test(text))
}

export function detectHumanRequest(text: string): boolean {
  return HUMAN_REQUEST_PATTERNS.some((pattern) => pattern.test(text))
}

const URGENCY_RANK: Record<Urgency, number> = {
  low: 0,
  medium: 1,
  high: 2,
  critical: 3,
}

export function maxUrgency(a: Urgency, b: Urgency): Urgency {
  return URGENCY_RANK[a] >= URGENCY_RANK[b] ? a : b
}

/**
 * Enforces the house rules in code, overriding the model. `model` is null when the
 * model was invalid, slow, or unavailable, in which case we start from a safe escalate.
 */
export function applyHouseRules(
  model: ModelTriage | null,
  text: string
): TriageResult {
  const danger = detectDanger(text)
  const crisisRisk = detectCrisis(text)
  const modelSafeguard = model?.safeguarding ?? false
  const manipulation = detectManipulation(text) || (model?.manipulation ?? false)
  const humanRequest = detectHumanRequest(text)
  const outOfScope = model?.outOfScope ?? false
  const usedFallback = model === null

  const category = model?.category ?? "other"
  const urgency = model?.urgency ?? "high"
  const summary = model?.summary ?? null
  const resourceId = model?.resourceId ?? null
  const reasoning = model?.reasoning ?? null

  // Immediate danger: escalate and surface emergency support at once, never ask questions first.
  if (danger) {
    return {
      category,
      urgency: "critical",
      safeguarding: true,
      disposition: "escalate",
      emergency: true,
      immediateDanger: true,
      manipulation,
      outOfScope: false,
      clarifyingQuestion: null,
      summary,
      resourceId,
      reasoning,
      usedFallback,
      raw: model,
    }
  }

  // Crisis or risk: always a human, never an automated close; share Samaritans when there are risk signals.
  if (crisisRisk || modelSafeguard) {
    return {
      category,
      urgency: maxUrgency(urgency, "high"),
      safeguarding: true,
      disposition: "escalate",
      emergency: crisisRisk,
      immediateDanger: false,
      manipulation,
      outOfScope: false,
      clarifyingQuestion: null,
      summary,
      resourceId,
      reasoning,
      usedFallback,
      raw: model,
    }
  }

  // Manipulation or junk: refuse to follow embedded instructions, do not auto-resolve or downgrade.
  if (manipulation) {
    return {
      category: "other",
      urgency: "medium",
      safeguarding: false,
      disposition: "handle_now",
      emergency: false,
      immediateDanger: false,
      manipulation: true,
      outOfScope: false,
      clarifyingQuestion: null,
      summary: null,
      resourceId: null,
      reasoning:
        reasoning ??
        "Manipulation or junk detected; declined without following any embedded instruction.",
      usedFallback,
      raw: model,
    }
  }

  // Explicit request to talk to a person: route to a human instead of repeating a self-referral.
  if (humanRequest) {
    return {
      category,
      urgency: maxUrgency(urgency, "medium"),
      safeguarding: modelSafeguard,
      disposition: "escalate",
      emergency: false,
      immediateDanger: false,
      manipulation: false,
      outOfScope: false,
      clarifyingQuestion: null,
      summary,
      resourceId,
      reasoning,
      usedFallback,
      raw: model,
    }
  }

  // Outside the student support scope: decline politely, do not clarify forever or escalate junk to staff.
  if (outOfScope) {
    return {
      category: "other",
      urgency: "low",
      safeguarding: false,
      disposition: "handle_now",
      emergency: false,
      immediateDanger: false,
      manipulation: false,
      outOfScope: true,
      clarifyingQuestion: null,
      summary: null,
      resourceId: null,
      reasoning:
        reasoning ?? "Request is outside the student support scope; declined.",
      usedFallback,
      raw: model,
    }
  }

  // Immigration is regulated, so it always goes to a person even if the model wanted to handle it.
  let disposition = model?.disposition ?? "escalate"
  if (category === "visa") disposition = "escalate"

  return {
    category,
    urgency,
    safeguarding: false,
    disposition,
    emergency: false,
    immediateDanger: false,
    manipulation: false,
    outOfScope: false,
    clarifyingQuestion: disposition === "clarify" ? model?.clarifyingQuestion ?? null : null,
    summary,
    resourceId,
    reasoning,
    usedFallback,
    raw: model,
  }
}
