import { NextResponse } from "next/server"
import { z } from "zod"

import { Prisma } from "@/lib/generated/prisma/client"
import { prisma } from "@/lib/prisma"
import { generateHandleNowReply } from "@/lib/reply"
import { runTriage, type TriageMessage } from "@/lib/triage"
import { maxUrgency } from "@/lib/triage/house-rules"
import type { Disposition, TriageResult } from "@/lib/triage/schema"

export const runtime = "nodejs"

const bodySchema = z.object({
  conversationId: z.uuid(),
  message: z.string().trim().min(1, "Message cannot be empty.").max(4000),
})

const MANIPULATION_REPLY =
  "I'm here to help with student support questions like money, housing, visas, academic issues, or wellbeing. I can't action that request, but if there's something you need help with, tell me what's going on and I'll do my best."

function composeEscalationMessage(triage: TriageResult): string {
  const parts = [
    "Thank you for telling me. This is something I'd like a member of the team to help you with, so I'm passing it to them now and they'll follow up by email.",
  ]
  if (triage.immediateDanger) {
    parts.push("If you are in immediate danger right now, please call 999.")
  }
  if (triage.emergency) {
    parts.push(
      "If you need to talk to someone straight away, the Samaritans are free and confidential, available 24/7 on 116 123."
    )
  }
  return parts.join(" ")
}

function fallbackSummary(history: TriageMessage[]): string {
  const lastStudent = [...history].reverse().find((m) => m.role === "student")
  return lastStudent
    ? `Student enquiry needing a person: "${lastStudent.content.slice(0, 300)}"`
    : "Student enquiry needing a person."
}

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 })
  }

  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Validation failed.",
        issues: parsed.error.issues.map((issue) => ({
          field: issue.path[0],
          message: issue.message,
        })),
      },
      { status: 400 }
    )
  }

  const { conversationId, message } = parsed.data

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  })
  if (!conversation) {
    return NextResponse.json(
      { error: "Conversation not found." },
      { status: 404 }
    )
  }

  const studentMessage = await prisma.message.create({
    data: { conversationId, role: "student", content: message },
  })

  const history: TriageMessage[] = [
    ...conversation.messages.map((m) => ({
      role: m.role as TriageMessage["role"],
      content: m.content,
    })),
    { role: "student", content: message },
  ]

  const triage = await runTriage({ messages: history })

  await prisma.triage.create({
    data: {
      messageId: studentMessage.id,
      category: triage.category,
      urgency: triage.urgency,
      safeguarding: triage.safeguarding,
      disposition: triage.disposition,
      usedFallback: triage.usedFallback,
      rawModel:
        triage.raw == null
          ? Prisma.JsonNull
          : (triage.raw as Prisma.InputJsonValue),
    },
  })

  let disposition: Disposition = triage.disposition
  let reply = ""

  if (triage.manipulation) {
    reply = MANIPULATION_REPLY
  } else if (disposition === "handle_now") {
    try {
      reply = await generateHandleNowReply(history, triage)
    } catch {
      // If we cannot produce a grounded answer, route to a person rather than guessing.
      disposition = "escalate"
    }
  }

  if (disposition === "clarify") {
    reply =
      triage.clarifyingQuestion?.trim() ||
      "Could you tell me a little more about what's going on, so I can point you to the right help?"
  }

  let caseId: string | null = null
  if (disposition === "escalate") {
    reply = composeEscalationMessage(triage)

    // One open case per conversation: update the existing open case instead of creating a duplicate.
    const openCase = await prisma.case.findFirst({
      where: { conversationId, status: { not: "resolved" } },
      orderBy: { createdAt: "desc" },
    })

    if (openCase) {
      const newSummary = triage.summary?.trim()
      const updated = await prisma.case.update({
        where: { id: openCase.id },
        data: {
          urgency: maxUrgency(openCase.urgency, triage.urgency),
          safeguarding: openCase.safeguarding || triage.safeguarding,
          summary:
            newSummary && newSummary !== openCase.summary
              ? `${openCase.summary}\n\nUpdate: ${newSummary}`
              : openCase.summary,
        },
        select: { id: true },
      })
      caseId = updated.id
    } else {
      const created = await prisma.case.create({
        data: {
          conversationId,
          status: "new",
          urgency: triage.urgency,
          safeguarding: triage.safeguarding,
          summary: triage.summary?.trim() || fallbackSummary(history),
        },
        select: { id: true },
      })
      caseId = created.id
    }
  }

  await prisma.message.create({
    data: { conversationId, role: "assistant", content: reply },
  })

  return NextResponse.json({
    reply,
    caseId,
    triage: {
      category: triage.category,
      urgency: triage.urgency,
      safeguarding: triage.safeguarding,
      disposition,
      emergency: triage.emergency,
      immediateDanger: triage.immediateDanger,
      usedFallback: triage.usedFallback,
    },
  })
}
