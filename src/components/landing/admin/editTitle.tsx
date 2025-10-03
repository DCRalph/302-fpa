"use client";

import { useEffect, useState } from "react";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import { api } from "~/trpc/react";
import { type ConferenceTitle } from "~/server/api/routers/home";

export function EditYear({ titleObject }: { titleObject: ConferenceTitle | null }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(titleObject?.title ?? "");
  const [subtitle, setSubtitle] = useState(titleObject?.subtitle ?? "");


  const utils = api.useUtils();
  const { mutate: changeTitle, isPending } =
    api.admin.editHome.changeConferenceTitle.useMutation({
      onSuccess: async () => {
        await utils.home.getConferenceTitle.invalidate();
        setOpen(false);
      },
    });

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline">Edit Title</Button>
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Conference Title</SheetTitle>
          <SheetDescription>
            Update the year displayed in the hero section.
          </SheetDescription>
        </SheetHeader>

        <div className="p-4 space-y-2">
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

        <div className="p-4 space-y-2">
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
            onClick={() => changeTitle({ title, subtitle })}
            disabled={!title || !subtitle || isPending}
          >
            {isPending ? "Saving..." : "Save"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export default EditYear;


