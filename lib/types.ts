export type ChatRole = "student" | "assistant"

export interface ChatMessage {
  id: string
  role: ChatRole
  content: string
}

export type CaseStatus = "new" | "in_progress" | "resolved"
export type CaseUrgency = "low" | "medium" | "high" | "critical"

export interface DashboardMessage {
  id: string
  role: ChatRole
  content: string
  createdAt: string
}

export interface DashboardCase {
  id: string
  status: CaseStatus
  urgency: CaseUrgency
  safeguarding: boolean
  summary: string
  claimedBy: string | null
  claimedAt: string | null
  createdAt: string
  conversation: {
    id: string
    studentName: string
    studentEmail: string
    messages: DashboardMessage[]
  }
}
