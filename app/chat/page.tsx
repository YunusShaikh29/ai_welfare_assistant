"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { SparklesIcon } from "@hugeicons/core-free-icons"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { MessageBubble } from "@/components/chat/message-bubble"
import { MessageComposer } from "@/components/chat/message-composer"
import { TypingIndicator } from "@/components/chat/typing-indicator"
import type { ChatMessage } from "@/lib/types"

interface Student {
  conversationId?: string
  name: string
  email: string
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  return (
    parts
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "?"
  )
}

export default function ChatPage() {
  const router = useRouter()
  const [student, setStudent] = React.useState<Student | null>(null)
  const [messages, setMessages] = React.useState<ChatMessage[]>([])
  const [isSending, setIsSending] = React.useState(false)
  const scrollRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const raw = sessionStorage.getItem("welfare.student")
    if (!raw) {
      router.replace("/")
      return
    }

    const parsed = JSON.parse(raw) as Student
    setStudent(parsed)

    const firstName = parsed.name.trim().split(/\s+/)[0]
    const greeting: ChatMessage = {
      id: "greeting",
      role: "assistant",
      content: `Hi ${firstName}, I'm the student support assistant. Tell me what's going on in your own words, and I'll help you work out the next step. If it's something that needs a person, I'll make sure you reach one.`,
    }
    setMessages([greeting])
    
    async function loadHistory(conversationId: string) {
      try {
        const response = await fetch(`/api/conversations/${conversationId}`)
        if (!response.ok) return
        const data = (await response.json()) as { messages: ChatMessage[] }
        if (data.messages.length > 0) {
          setMessages([greeting, ...data.messages])
        }
      } catch (error) {
        console.error("Failed to load conversation history:", error)
      }
    }
    if (parsed.conversationId) void loadHistory(parsed.conversationId)
  }, [router])

  React.useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    })
  }, [messages, isSending])

  function handleSend(text: string) {
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "student", content: text },
    ])
    setIsSending(true)

    void sendMessage(text)
  }

  async function sendMessage(text: string) {
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: student?.conversationId,
          message: text,
        }),
      })

      if (!response.ok) throw new Error("Request failed")

      const data = (await response.json()) as { reply: string }
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "assistant", content: data.reply },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            "Sorry, something went wrong on our side. Please try again in a moment. If this is urgent, you can call the Samaritans free 24/7 on 116 123, or 999 if you are in immediate danger.",
        },
      ])
    } finally {
      setIsSending(false)
    }
  }

  const studentInitials = student ? getInitials(student.name) : "?"

  return (
    <div className="flex h-svh flex-col bg-background">
      <header className="border-b border-border/60">
        <div className="mx-auto flex w-full max-w-2xl items-center gap-3 px-4 py-3">
          <Avatar size="sm">
            <AvatarFallback className="bg-primary/10 text-primary">
              <HugeiconsIcon icon={SparklesIcon} size={15} />
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">
              Student Support Assistant
            </p>
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="size-1.5 rounded-full bg-primary" />
              Here to help
            </p>
          </div>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-6">
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              studentInitials={studentInitials}
            />
          ))}
          {isSending && <TypingIndicator />}
        </div>
      </div>

      <div className="border-t border-border/60 bg-background">
        <div className="mx-auto w-full max-w-2xl px-4 py-3">
          <MessageComposer
            onSend={handleSend}
            disabled={isSending}
          />
          <p className="mt-2 px-1 text-center text-[11px] text-muted-foreground">
            If you&apos;re in immediate danger, call 999. For urgent emotional
            support, Samaritans are available 24/7 on 116 123.
          </p>
        </div>
      </div>
    </div>
  )
}
