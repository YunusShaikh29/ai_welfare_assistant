"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Alert02Icon } from "@hugeicons/core-free-icons"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import type { CaseStatus, CaseUrgency, DashboardCase } from "@/lib/types"

const URGENCY_VARIANT: Record<
  CaseUrgency,
  "destructive" | "secondary" | "outline"
> = {
  critical: "destructive",
  high: "destructive",
  medium: "secondary",
  low: "outline",
}

const STATUS_LABEL: Record<CaseStatus, string> = {
  new: "New",
  in_progress: "In progress",
  resolved: "Resolved",
}

const STATUSES: CaseStatus[] = ["new", "in_progress", "resolved"]

export function CaseCard({
  caseItem,
  staffName,
  onUpdated,
}: {
  caseItem: DashboardCase
  staffName: string
  onUpdated: (updated: DashboardCase) => void
}) {
  const [pending, setPending] = React.useState(false)
  const [message, setMessage] = React.useState<string | null>(null)

  async function claim() {
    if (!staffName.trim()) {
      setMessage("Enter your name at the top before claiming.")
      return
    }
    setPending(true)
    setMessage(null)
    try {
      const response = await fetch(`/api/cases/${caseItem.id}/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staff: staffName.trim() }),
      })
      const data = await response.json()

      if (response.status === 409) {
        setMessage(`Already claimed by ${data.claimedBy ?? "someone else"}.`)
        onUpdated({
          ...caseItem,
          claimedBy: data.claimedBy ?? caseItem.claimedBy,
          status: "in_progress",
        })
        return
      }
      if (!response.ok) throw new Error("Request failed")
      onUpdated(data.case as DashboardCase)
    } catch {
      setMessage("Could not claim this case. Please try again.")
    } finally {
      setPending(false)
    }
  }

  async function setStatus(status: CaseStatus) {
    setPending(true)
    setMessage(null)
    try {
      const response = await fetch(`/api/cases/${caseItem.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (!response.ok) throw new Error("Request failed")
      const data = await response.json()
      onUpdated(data.case as DashboardCase)
    } catch {
      setMessage("Could not update the status. Please try again.")
    } finally {
      setPending(false)
    }
  }

  const isResolved = caseItem.status === "resolved"

  return (
    <Card
      className={cn(
        caseItem.safeguarding && "ring-2 ring-destructive/40",
        isResolved && "opacity-70"
      )}
    >
      <CardHeader className="gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {caseItem.safeguarding && (
            <Badge variant="destructive">
              <HugeiconsIcon icon={Alert02Icon} data-icon="inline-start" />
              Safeguarding
            </Badge>
          )}
          <Badge variant={URGENCY_VARIANT[caseItem.urgency]}>
            {caseItem.urgency}
          </Badge>
          <Badge variant="outline">{STATUS_LABEL[caseItem.status]}</Badge>
          <span className="ml-auto text-xs text-muted-foreground">
            {new Date(caseItem.createdAt).toLocaleString()}
          </span>
        </div>

        <div>
          <p className="text-sm font-medium">
            {caseItem.conversation.studentName}
          </p>
          <p className="text-xs text-muted-foreground">
            {caseItem.conversation.studentEmail}
          </p>
        </div>

        <p className="text-sm">{caseItem.summary}</p>
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {caseItem.claimedBy ? (
            <Badge variant="secondary">Claimed by {caseItem.claimedBy}</Badge>
          ) : (
            <Button size="sm" onClick={claim} disabled={pending}>
              Claim
            </Button>
          )}
          <div className="ml-auto flex items-center gap-1">
            {STATUSES.map((status) => (
              <Button
                key={status}
                size="sm"
                variant={caseItem.status === status ? "default" : "outline"}
                disabled={pending || !caseItem.claimedBy}
                onClick={() => setStatus(status)}
              >
                {STATUS_LABEL[status]}
              </Button>
            ))}
          </div>
        </div>

        {message && <p className="text-xs text-destructive">{message}</p>}

        <Separator />

        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            Conversation
          </p>
          <div className="flex max-h-72 flex-col gap-2 overflow-y-auto rounded-lg bg-muted/40 p-3">
            {caseItem.conversation.messages.length === 0 ? (
              <p className="text-xs text-muted-foreground">No messages.</p>
            ) : (
              caseItem.conversation.messages.map((entry) => (
                <p key={entry.id} className="text-sm leading-relaxed">
                  <span
                    className={cn(
                      "mr-2 text-xs font-medium",
                      entry.role === "assistant"
                        ? "text-primary"
                        : "text-foreground"
                    )}
                  >
                    {entry.role === "assistant"
                      ? "Assistant"
                      : caseItem.conversation.studentName}
                    :
                  </span>
                  <span className="whitespace-pre-wrap text-muted-foreground">
                    {entry.content}
                  </span>
                </p>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
