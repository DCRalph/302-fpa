"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "~/components/ui/button";
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
import { type WhyJoin } from "~/server/api/routers/home";

export default function EditWhyJoin() {
  const [open, setOpen] = useState(false);
  const { data } = api.home.getConferenceWhyJoin.useQuery(undefined, {
    enabled: open,
  });

  const initial = useMemo(() => {
    const raw = data?.value ?? "[]";
    try {
      return JSON.stringify(JSON.parse(raw), null, 2);
    } catch {
      return "[]";
    }
  }, [data?.value]);

  const [json, setJson] = useState(initial);
  useEffect(() => setJson(initial), [initial, open]);

  const utils = api.useUtils();
  const { mutate, isPending } = api.admin.editHome.changeConferenceWhyJoin.useMutation({
    onSuccess: async () => {
      await utils.home.getConferenceWhyJoin.invalidate();
      setOpen(false);
    },
  });

  function onSave() {
    try {
      const parsed = JSON.parse(json) as WhyJoin[];
      mutate({ items: parsed });
    } catch {
      alert("Invalid JSON. Please fix and try again.");
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline">Edit Why Join</Button>
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Why Join Cards</SheetTitle>
          <SheetDescription>
            Edit the array of cards as JSON. Ensure it matches the WhyJoin shape.
          </SheetDescription>
        </SheetHeader>

        <div className="p-4 space-y-2">
          <label className="text-sm font-medium" htmlFor="whyjoin-json">
            JSON
          </label>
          <textarea
            id="whyjoin-json"
            className="bg-background border-input focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] dark:bg-input/30 w-full min-h-[360px] rounded-md border p-3 font-mono text-sm"
            value={json}
            onChange={(e) => setJson(e.target.value)}
          />
        </div>

        <SheetFooter>
          <Button onClick={onSave} disabled={isPending}>
            {isPending ? "Saving..." : "Save"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}


