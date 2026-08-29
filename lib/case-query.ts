import { Prisma } from "@/lib/generated/prisma/client"

// Shared shape for returning a case with its full conversation, used by every case route.
export const caseInclude = {
  conversation: {
    select: {
      id: true,
      studentName: true,
      studentEmail: true,
      messages: {
        orderBy: { createdAt: "asc" },
        select: { id: true, role: true, content: true, createdAt: true },
      },
    },
  },
} satisfies Prisma.CaseInclude



/* 
 */

