"use client"

import * as React from "react"

import { CaseCard } from "@/components/dashboard/case-card"
import { CasesSkeleton } from "@/components/dashboard/cases-skeleton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { DashboardCase } from "@/lib/types"

export default function DashboardPage() {
  const [cases, setCases] = React.useState<DashboardCase[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [staffName, setStaffName] = React.useState("")

  const loadCases = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/cases")
      if (!response.ok) throw new Error("Request failed")
      const data = (await response.json()) as { cases: DashboardCase[] }
      setCases(data.cases)
    } catch {
      setError("Could not load cases. Please refresh.")
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    setStaffName(localStorage.getItem("welfare.staff") ?? "")
    void loadCases()
  }, [loadCases])

  function handleStaffChange(value: string) {
    setStaffName(value)
    localStorage.setItem("welfare.staff", value)
  }

  function handleUpdated(updated: DashboardCase) {
    setCases((prev) =>
      prev.map((item) => (item.id === updated.id ? updated : item))
    )
  }

  const openCount = cases.filter((item) => item.status !== "resolved").length

  return (
    <div className="min-h-svh bg-background">
      <header className="border-b border-border/60">
        <div className="mx-auto flex w-full max-w-3xl flex-wrap items-end gap-4 px-4 py-4">
          <div className="mr-auto">
            <h1 className="font-heading text-lg font-medium">Staff dashboard</h1>
            <p className="text-xs text-muted-foreground">
              {openCount} open case{openCount === 1 ? "" : "s"}
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="staff">You are</Label>
            <Input
              id="staff"
              value={staffName}
              onChange={(event) => handleStaffChange(event.target.value)}
              placeholder="Your name"
              className="h-8 w-48"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadCases()}
            disabled={loading}
          >
            Refresh
          </Button>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-6">
        {loading ? (
          <CasesSkeleton />
        ) : error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : cases.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No escalated cases yet.
          </p>
        ) : (
          cases.map((item) => (
            <CaseCard
              key={item.id}
              caseItem={item}
              staffName={staffName}
              onUpdated={handleUpdated}
            />
          ))
        )}
      </main>
    </div>
  )
}
