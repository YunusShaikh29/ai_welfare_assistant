import { NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"
import { studentIntakeSchema } from "@/lib/validation"

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 })
  }

  const parsed = studentIntakeSchema.safeParse(body)
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

  try {
    const conversation = await prisma.conversation.create({
      data: {
        studentName: parsed.data.name,
        studentEmail: parsed.data.email,
      },
      select: { id: true, studentName: true, studentEmail: true },
    })

    return NextResponse.json(conversation, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: "Could not start the conversation. Please try again." },
      { status: 500 }
    )
  }
}
