"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { SentIcon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

export function MessageComposer({
  onSend,
  disabled,
}: {
  onSend: (text: string) => void
  disabled?: boolean
}) {
  const [value, setValue] = React.useState("")
  const canSend = value.trim().length > 0 && !disabled

  function submit() {
    if (!canSend) return
    onSend(value.trim())
    setValue("")
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      submit()
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-end gap-2">
        <Textarea
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message…"
          rows={1}
          disabled={disabled}
          className="max-h-40 min-h-11 flex-1"
        />
        <Button
          type="button"
          size="icon-lg"
          onClick={submit}
          disabled={!canSend}
          aria-label="Send message"
          className="shrink-0"
        >
          <HugeiconsIcon icon={SentIcon} size={18} />
        </Button>
      </div>
      <p className="px-1 text-[11px] text-muted-foreground">
        Enter to send · Shift + Enter for a new line
      </p>
    </div>
  )
}
