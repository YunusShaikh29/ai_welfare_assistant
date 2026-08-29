import { HugeiconsIcon } from "@hugeicons/react"
import { SparklesIcon } from "@hugeicons/core-free-icons"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import type { ChatMessage } from "@/lib/types"

export function MessageBubble({
  message,
  studentInitials,
}: {
  message: ChatMessage
  studentInitials: string
}) {
  const isAssistant = message.role === "assistant"

  return (
    <div
      className={cn(
        "flex w-full items-end gap-3",
        isAssistant ? "justify-start" : "justify-end"
      )}
    >
      {isAssistant && (
        <Avatar size="sm" className="mb-0.5">
          <AvatarFallback className="bg-primary/10 text-primary">
            <HugeiconsIcon icon={SparklesIcon} size={14} />
          </AvatarFallback>
        </Avatar>
      )}

      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap",
          isAssistant
            ? "rounded-bl-sm bg-muted text-foreground"
            : "rounded-br-sm bg-primary text-primary-foreground"
        )}
      >
        {message.content}
      </div>

      {!isAssistant && (
        <Avatar size="sm" className="mb-0.5">
          <AvatarFallback>{studentInitials}</AvatarFallback>
        </Avatar>
      )}
    </div>
  )
}
