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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { HelpCircle } from "lucide-react";
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
  const setOpen = isControlled ? onOpenChange : setInternalOpen;

  const [titleLine1, setTitleLine1] = useState(titleObject?.titleLine1 ?? "");
  const [titleLine2, setTitleLine2] = useState(titleObject?.titleLine2 ?? "");
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
      () => changeTitle({ titleLine1, titleLine2, subtitle }),
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
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium" htmlFor="title">
              Title
            </label>
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 rounded-full"
                >
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  <span className="sr-only">Help</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Title Format Guide</DialogTitle>
                  <DialogDescription>
                    Learn how the two title lines appear on the website
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Line 1 (Title)</h4>
                    <p className="text-sm text-muted-foreground">
                      The first line appears as <span className="text-white font-medium">normal white text</span> on the hero section.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Line 2 (Title)</h4>
                    <p className="text-sm text-muted-foreground">
                      The second line appears as <span className="font-medium bg-gradient-to-r from-primary to-primary-tint bg-clip-text text-transparent">fancy green text</span> with a gradient effect on the hero section.
                    </p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <Input
            id="title"
            placeholder="Fiji Principals Association Conference 2025"
            value={titleLine1}
            onChange={(e) => setTitleLine1(e.target.value)}
          />
          <Input
            id="titleLine2"
            placeholder="Conference System"
            value={titleLine2}
            onChange={(e) => setTitleLine2(e.target.value)}
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
            disabled={!titleLine1 || !titleLine2 || !subtitle || isPending}
          >
            {isPending ? "Saving..." : "Save"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export default EditTitle;
