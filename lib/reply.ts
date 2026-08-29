import { getGroq, GROQ_MODEL } from "@/lib/groq"
import { getResourceById } from "@/lib/knowledge-base"
import type { TriageMessage } from "@/lib/triage"
import type { TriageResult } from "@/lib/triage/schema"

/*
 * Generates the grounded, student-facing reply for a "handle_now" case. Throws if the
 * model is unavailable or returns nothing, so the caller can fall back to a person.
 */
export async function generateHandleNowReply(
  messages: TriageMessage[],
  triage: TriageResult
) {
  const resource = triage.resourceId ? getResourceById(triage.resourceId) : null

  const grounding = resource
    ? `Ground your answer only in this resource. Do not paste it verbatim, and do not add links, facts, or advice it does not support.\nTitle: ${resource.title}\nLink: ${resource.link}\nGuidance: ${resource.guidance}\nRefer to it by name and include the link once.`
    : "You have no specific resource for this. Keep it brief, do not invent links or facts, and if you cannot answer, say a team member will help."

  const system = `You are a warm, calm student support assistant. Reply to the student directly in plain, non-clinical language, in your own words. Acknowledge how they feel, answer what they actually asked, and make the next step obvious. Be concise, two to five short sentences. ${grounding}`

  const groq = getGroq()
  const completion = await groq.chat.completions.create({
    model: GROQ_MODEL,
    temperature: 0.4,
    max_tokens: 350,
    messages: [
      { role: "system", content: system },
      ...messages.map((message) => ({
        role: message.role === "student" ? ("user" as const) : ("assistant" as const),
        content: message.content,
      })),
    ],
  })

  const reply = completion.choices[0]?.message?.content?.trim()
  if (!reply) throw new Error("Empty reply from model")
  return reply
}
