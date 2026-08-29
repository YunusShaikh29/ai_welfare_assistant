export type ChatRole = "student" | "assistant"

export interface ChatMessage {
  id: string
  role: ChatRole
  content: string
}
