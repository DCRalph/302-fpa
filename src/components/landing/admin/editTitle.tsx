"use client";

import { useState } from "react";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";
import { api } from "~/trpc/react";
import { type ConferenceTitle } from "~/server/api/routers/home";
import { handleTRPCMutation } from "~/lib/toast";

export function EditTitle({
  titleObject,
  open: controlledOpen,
  onOpenChange,
}: {
  titleObject: ConferenceTitle | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined && onOpenChange !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? onOpenChange! : setInternalOpen;

  const [title, setTitle] = useState(titleObject?.title ?? "");
  const [subtitle, setSubtitle] = useState(titleObject?.subtitle ?? "");

  const utils = api.useUtils();
  
  const { mutateAsync: changeTitle, isPending } =
    api.admin.editHome.changeConferenceTitle.useMutation({
      onSuccess: async () => {
        await utils.home.getConferenceTitle.invalidate();
        await utils.home.invalidate();
        setOpen(false);
      },
    });

  const handleSave = () => {
    void handleTRPCMutation(
      () => changeTitle({ title, subtitle }),
      "Title saved successfully",
      "Failed to save title",
    );
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Conference Title</SheetTitle>
          <SheetDescription>
            Update the year displayed in the hero section.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-2 p-4">
          <label className="text-sm font-medium" htmlFor="title">
            Title
          </label>
          <Input
            id="title"
            placeholder="Fiji Principals Association Conference 2025"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="space-y-2 p-4">
          <label className="text-sm font-medium" htmlFor="subtitle">
            Subtitle
          </label>
          <Input
            id="subtitle"
            placeholder="Join educational leaders from across the Pacific for three days of inspiring sessions, networking, and professional development in the heart of Fiji."
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
          />
        </div>

        <SheetFooter>
          <Button
            onClick={handleSave}
            disabled={!title || !subtitle || isPending}
          >
            {isPending ? "Saving..." : "Save"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export default EditTitle;
