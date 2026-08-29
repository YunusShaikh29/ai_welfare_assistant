import { NextResponse } from "next/server"
import { z } from "zod"

import { caseInclude } from "@/lib/case-query"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"

const statusSchema = z.object({
  status: z.enum(["new", "in_progress", "resolved"]),
})

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 })
  }

  const parsed = statusSchema.safeParse(body)
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

  const existing = await prisma.case.findUnique({
    where: { id },
    select: { id: true },
  })
  if (!existing) {
    return NextResponse.json({ error: "Case not found." }, { status: 404 })
  }

  const updated = await prisma.case.update({
    where: { id },
    data: { status: parsed.data.status },
    include: caseInclude,
  })
  return NextResponse.json({ case: updated })
}
