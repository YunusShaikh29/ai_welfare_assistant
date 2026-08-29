import { NextResponse } from "next/server"
import { z } from "zod"

import { caseInclude } from "@/lib/case-query"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"

const claimSchema = z.object({
  staff: z.string().trim().min(1, "Staff name is required.").max(80),
})

export async function POST(
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

  const parsed = claimSchema.safeParse(body)
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

  // Atomic guarded claim: the `claimedBy: null` filter makes concurrent claims mutually exclusive.
  const result = await prisma.case.updateMany({
    where: { id, claimedBy: null },
    data: {
      claimedBy: parsed.data.staff,
      claimedAt: new Date(),
      status: "in_progress",
    },
  })

  if (result.count === 0) {
    const existing = await prisma.case.findUnique({
      where: { id },
      select: { claimedBy: true },
    })
    if (!existing) {
      return NextResponse.json({ error: "Case not found." }, { status: 404 })
    }
    return NextResponse.json(
      { error: "Already claimed.", claimedBy: existing.claimedBy },
      { status: 409 }
    )
  }

  const updated = await prisma.case.findUnique({
    where: { id },
    include: caseInclude,
  })
  return NextResponse.json({ case: updated })
}
