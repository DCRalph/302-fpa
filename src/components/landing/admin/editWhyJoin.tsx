"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";

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
import { type ConferenceWhyJoin } from "~/server/api/routers/home";
import { handleTRPCMutation } from "~/lib/toast";
import { Textarea } from "~/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { DynamicIcon } from "~/components/DynamicIcon";
import { Label } from "~/components/ui/label";

// Common Lucide icon names for the dropdown
const ICON_OPTIONS = [
  "Users",
  "Network",
  "Lightbulb",
  "Shield",
  "Award",
  "BookOpen",
  "Target",
  "Sparkles",
  "TrendingUp",
  "Globe",
  "Briefcase",
  "GraduationCap",
  "Heart",
  "Star",
  "Zap",
];

export default function EditWhyJoin({
  whyJoinItems,
  open: controlledOpen,
  onOpenChange,
}: {
  whyJoinItems: ConferenceWhyJoin[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined && onOpenChange !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? onOpenChange! : setInternalOpen;

  const [items, setItems] = useState<ConferenceWhyJoin[]>(whyJoinItems);
  useEffect(() => setItems(whyJoinItems), [whyJoinItems, open]);

  const utils = api.useUtils();
  const { mutateAsync: changeConferenceWhyJoin, isPending } =
    api.admin.editHome.changeConferenceWhyJoin.useMutation({
      onSuccess: async () => {
        await utils.home.getConferenceWhyJoin.invalidate();
        setOpen(false);
      },
    });

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        title: "",
        description: "",
        icon: {
          type: "lucide",
          name: "Users",
          props: { className: "mx-auto mb-8 mt-4 h-10 w-10 text-[#667EEA]" },
        },
      },
    ]);
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateItem = (
    index: number,
    field: keyof ConferenceWhyJoin,
    value: string,
  ) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  };

  const updateIcon = (index: number, iconName: string) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              icon: {
                ...item.icon,
                name: iconName,
              },
            }
          : item,
      ),
    );
  };

  const handleSave = () => {
    void handleTRPCMutation(
      () => changeConferenceWhyJoin({ items }),
      "Why Join saved successfully",
      "Failed to save why join",
    );
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent
        side="right"
        className="w-full overflow-y-auto sm:max-w-2xl"
      >
        <SheetHeader>
          <SheetTitle>Why Join Cards</SheetTitle>
          <SheetDescription>
            Edit the benefits cards displayed on the landing page.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 p-4">
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground text-sm">
              {items.length} {items.length === 1 ? "card" : "cards"}
            </p>
            <Button onClick={addItem} size="sm" variant="outline">
              <Plus className="mr-1 h-4 w-4" />
              Add Card
            </Button>
          </div>

          {items.map((item, index) => (
            <div
              key={index}
              className="bg-card space-y-3 rounded-lg border p-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm font-medium">
                  Card {index + 1}
                </span>
                <Button
                  onClick={() => removeItem(index)}
                  size="sm"
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium">Title</Label>
                <Input
                  value={item.title}
                  onChange={(e) => updateItem(index, "title", e.target.value)}
                  placeholder="e.g., Professional Development"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                <Textarea
                  value={item.description}
                  onChange={(e) =>
                    updateItem(index, "description", e.target.value)
                  }
                  placeholder="Brief description of the benefit..."
                  className="bg-background border-input focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 min-h-[80px] w-full resize-none rounded-md border p-3 text-sm focus-visible:ring-[3px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="icon" className="text-sm font-medium">Icon</Label>
                <Select
                  value={item.icon.name}
                  onValueChange={(val) => updateIcon(index, val)}
                >
                  <SelectTrigger className="bg-background border-input focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 h-9 w-full rounded-md border px-3 text-sm focus-visible:ring-[3px]">
                    <div className="flex items-center gap-2">
                      <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {ICON_OPTIONS.map((iconName) => (
                      <SelectItem key={iconName} value={iconName}>
                        <div className="flex items-center gap-2">
                          <DynamicIcon type="lucide" name={iconName} props={{ className: 'h-4 w-4 text-muted-foreground' }} />
                          <span>{iconName}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ))}

          <div className="flex items-center justify-between">
            <p className="text-muted-foreground text-sm">
              {items.length} {items.length === 1 ? "card" : "cards"}
            </p>
            <Button onClick={addItem} size="sm" variant="outline">
              <Plus className="mr-1 h-4 w-4" />
              Add Card
            </Button>
          </div>

          {items.length === 0 && (
            <div className="text-muted-foreground py-8 text-center">
              No cards yet. Click &quot;Add Card&quot; to create one.
            </div>
          )}
        </div>

        <SheetFooter className="px-4 pb-4">
          <Button onClick={handleSave} disabled={isPending}>
            {isPending ? "Saving..." : "Save"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
