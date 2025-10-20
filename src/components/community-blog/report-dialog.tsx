"use client"

import * as React from "react"
import { useState } from "react"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from "~/components/ui/alert-dialog"
import { Button } from "~/components/ui/button"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "~/components/ui/select"
import { Textarea } from "~/components/ui/textarea"
import { Label } from "~/components/ui/label"

export type ReportTarget = {
  id: string
  type: "post" | "comment"
}

export type ReportDialogProps = {
  target: ReportTarget | null
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onSubmit?: (payload: { target: ReportTarget; reason: string; details?: string }) => Promise<void> | void
}

const DEFAULT_REASONS = [
  { value: "Spam or advertising" },
  { value: "Harassment or hate" },
  { value: "Misinformation" },
  { value: "Other (explain below)" },
]

export function ReportDialog({ target, open, onOpenChange, onSubmit }: ReportDialogProps) {
  const defaultReason = DEFAULT_REASONS[0]?.value ?? "other"
  const [reason, setReason] = useState<string>(defaultReason)
  const [details, setDetails] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  function reset() {
    setReason(defaultReason)
    setDetails("")
    setIsSubmitting(false)
  }

  async function handleSubmit() {
    if (!target) return
    setIsSubmitting(true)
    try {
      await onSubmit?.({ target, reason, details })
      // close handled by parent via onOpenChange
    } catch (e) {
      // swallow; parent should show errors
      console.error(e)
    } finally {
      setIsSubmitting(false)
      onOpenChange?.(false)
      reset()
    }
  }

  return (
    <AlertDialog open={!!open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Report {target?.type === "post" ? "Post" : "Comment"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            Use this form to tell us why you are reporting this {target?.type}.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="grid gap-2 py-4 space-y-2">
          <div className="space-y-2">
            <Label>Reason <span className="text-red-500">*</span></Label>
            <Select value={reason} onValueChange={(v) => setReason(v)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DEFAULT_REASONS.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="mt-2 space-y-2">
            <Label>Details</Label>
            <Textarea value={details} onChange={(e) => setDetails(e.target.value)} />
          </div>
        </div>

        <AlertDialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange?.(false)
              reset()
            }}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Reporting..." : "Report"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default ReportDialog
