import { NextResponse } from "next/server"

import { caseInclude } from "@/lib/case-query"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"

export async function GET() {
  const rows = await prisma.case.findMany({
    orderBy: [
      { safeguarding: "desc" },
      { urgency: "desc" },
      { createdAt: "asc" },
    ],
    include: caseInclude,
  })

  // Keep resolved cases at the bottom while preserving the priority order above.
  const active = rows.filter((row) => row.status !== "resolved")
  const resolved = rows.filter((row) => row.status === "resolved")

  return NextResponse.json({ cases: [...active, ...resolved] })
}
