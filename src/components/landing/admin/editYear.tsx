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

export function EditYear() {
  const [open, setOpen] = useState(false);
  const [year, setYear] = useState("");

  const { data: currentYear } = api.home.getConferenceYear.useQuery(undefined, {
    enabled: open,
  });

  useEffect(() => {
    if (currentYear) setYear(String(currentYear));
  }, [currentYear]);

  const utils = api.useUtils();
  const { mutate: changeYear, isPending } =
    api.admin.editHome.changeConferenceYear.useMutation({
      onSuccess: async () => {
        await utils.home.getConferenceYear.invalidate();
        setOpen(false);
      },
    });

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline">Edit Year</Button>
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Conference Year</SheetTitle>
          <SheetDescription>
            Update the year displayed in the hero section.
          </SheetDescription>
        </SheetHeader>

        <div className="p-4 space-y-2">
          <label className="text-sm font-medium" htmlFor="year">
            Year
          </label>
          <Input
            id="year"
            placeholder="2025"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            inputMode="numeric"
          />
        </div>

        <SheetFooter>
          <Button
            onClick={() => changeYear({ year })}
            disabled={!year || isPending}
          >
            {isPending ? "Saving..." : "Save"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export default EditYear;


