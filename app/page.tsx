"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon, SparklesIcon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { studentIntakeSchema } from "@/lib/validation"

export default function IntakePage() {
  const router = useRouter()
  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [errors, setErrors] = React.useState<{ name?: string; email?: string }>({})
  const [formError, setFormError] = React.useState<string | null>(null)
  const [submitting, setSubmitting] = React.useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    const result = studentIntakeSchema.safeParse({ name, email })
    if (!result.success) {
      const fieldErrors: { name?: string; email?: string } = {}
      for (const issue of result.error.issues) {
        const key = issue.path[0]
        if (key === "name" && !fieldErrors.name) fieldErrors.name = issue.message
        if (key === "email" && !fieldErrors.email) fieldErrors.email = issue.message
      }
      setErrors(fieldErrors)
      return
    }

    setErrors({})
    setFormError(null)
    setSubmitting(true)

    try {
      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data),
      })

      if (!response.ok) throw new Error("Request failed")

      const conversation = (await response.json()) as {
        id: string
        studentName: string
        studentEmail: string
      }

      // Kept in sessionStorage (not the URL) so contact details stay out of the address bar.
      sessionStorage.setItem(
        "welfare.student",
        JSON.stringify({
          conversationId: conversation.id,
          name: conversation.studentName,
          email: conversation.studentEmail,
        })
      )
      router.push("/chat")
    } catch {
      setFormError("Something went wrong starting your conversation. Please try again.")
      setSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background px-4 py-10">
      <div className="flex w-full max-w-md flex-col items-center gap-2 text-center">
        <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <HugeiconsIcon icon={SparklesIcon} size={22} />
        </div>
        <h1 className="font-heading text-xl font-medium">Student Support</h1>
        <p className="text-sm text-muted-foreground">
          Talk to our assistant in your own words. We&apos;ll help with the
          routine things right away, and make sure the important ones reach a
          person.
        </p>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Let&apos;s get you the right help</CardTitle>
          <CardDescription>
            A couple of details first, so someone can follow up if we need to.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Your name</Label>
              <Input
                id="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Alex Morgan"
                autoComplete="name"
                aria-invalid={Boolean(errors.name)}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name}</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@university.ac.uk"
                autoComplete="email"
                aria-invalid={Boolean(errors.email)}
              />
              {errors.email ? (
                <p className="text-xs text-destructive">{errors.email}</p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  We won&apos;t verify this. It&apos;s only so a staff member can
                  reach you.
                </p>
              )}
            </div>

            {formError && (
              <p className="text-xs text-destructive">{formError}</p>
            )}

            <Button
              type="submit"
              size="lg"
              className="mt-1 w-full"
              disabled={submitting}
            >
              {submitting ? "Starting your conversation" : "Start conversation"}
              {!submitting && (
                <HugeiconsIcon
                  icon={ArrowRight01Icon}
                  size={18}
                  data-icon="inline-end"
                />
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <p className="max-w-md px-4 text-center text-xs text-muted-foreground">
        If you&apos;re in immediate danger, call 999. For urgent emotional
        support, Samaritans are available 24/7 on 116 123.
      </p>
    </main>
  )
}
