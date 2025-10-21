"use client";

import type { ReportAction } from "@prisma/client";

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "~/components/ui/dialog";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";

export type ResolveDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action: ReportAction | null | undefined;
  onActionChange: (action: ReportAction) => void;
  note: string;
  onNoteChange: (note: string) => void;
  onConfirm: () => void | Promise<void>;
  confirmDisabled?: boolean;
};

export function ResolveDialog({
  open,
  onOpenChange,
  action,
  onActionChange,
  note,
  onNoteChange,
  onConfirm,
  confirmDisabled,
}: ResolveDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Resolve report</DialogTitle>
          <DialogDescription>
            Review and take action on this report.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label>
              Action <span className="text-destructive">*</span>
            </Label>
            <Select
              value={action ?? undefined}
              onValueChange={(v) => onActionChange(v as ReportAction)}
            >
              <SelectTrigger className="mt-1 w-full">
                <SelectValue placeholder="Select an action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CONTENT_DELETED">Delete content</SelectItem>
                <SelectItem value="REPORT_DISMISSED">Dismiss Report</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Admin note</Label>
            <Textarea
              value={note}
              onChange={(e) => onNoteChange(e.target.value)}
              placeholder="Optional note for the user or record"
              className="mt-1 min-h-[120px]"
            />
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
          <Button
            className="ml-2"
            onClick={onConfirm}
            disabled={!action || !!confirmDisabled}
          >
            Resolve
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ResolveDialog;
