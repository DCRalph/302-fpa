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
  "Zap"
];

export default function EditWhyJoin({ whyJoinItems }: { whyJoinItems: ConferenceWhyJoin[] }) {
  const [open, setOpen] = useState(false);

  const [items, setItems] = useState<ConferenceWhyJoin[]>(whyJoinItems);
  useEffect(() => setItems(whyJoinItems), [whyJoinItems, open]);

  const utils = api.useUtils();
  const { mutateAsync: changeConferenceWhyJoin, isPending } = api.admin.editHome.changeConferenceWhyJoin.useMutation({
    onSuccess: async () => {
      await utils.home.getConferenceWhyJoin.invalidate();
      setOpen(false);
    },
  });

  const addItem = () => {
    setItems(prev => [
      ...prev,
      {
        title: "",
        description: "",
        icon: {
          type: "lucide",
          name: "Users",
          props: { className: "mx-auto mb-8 mt-4 h-10 w-10 text-[#667EEA]" }
        }
      }
    ]);
  };

  const removeItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof ConferenceWhyJoin, value: string) => {
    setItems(prev => prev.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const updateIcon = (index: number, iconName: string) => {
    setItems(prev => prev.map((item, i) =>
      i === index
        ? {
          ...item,
          icon: {
            ...item.icon,
            name: iconName
          }
        }
        : item
    ));
  };


  const handelSave = () => {
    void handleTRPCMutation(() => changeConferenceWhyJoin({ items }), "Why Join saved successfully", "Failed to save why join");
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline">Edit Why Join</Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Why Join Cards</SheetTitle>
          <SheetDescription>
            Edit the benefits cards displayed on the landing page.
          </SheetDescription>
        </SheetHeader>

        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {items.length} {items.length === 1 ? 'card' : 'cards'}
            </p>
            <Button onClick={addItem} size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-1" />
              Add Card
            </Button>
          </div>

          {items.map((item, index) => (
            <div key={index} className="p-4 border rounded-lg space-y-3 bg-card">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
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
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={item.title}
                  onChange={(e) => updateItem(index, 'title', e.target.value)}
                  placeholder="e.g., Professional Development"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <textarea
                  value={item.description}
                  onChange={(e) => updateItem(index, 'description', e.target.value)}
                  placeholder="Brief description of the benefit..."
                  className="bg-background border-input focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] dark:bg-input/30 w-full min-h-[80px] rounded-md border p-3 text-sm resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Icon</label>
                <select
                  value={item.icon.name}
                  onChange={(e) => updateIcon(index, e.target.value)}
                  className="bg-background border-input focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] dark:bg-input/30 w-full h-9 rounded-md border px-3 text-sm"
                >
                  {ICON_OPTIONS.map(iconName => (
                    <option key={iconName} value={iconName}>
                      {iconName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {items.length} {items.length === 1 ? 'card' : 'cards'}
            </p>
            <Button onClick={addItem} size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-1" />
              Add Card
            </Button>
          </div>

          {items.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No cards yet. Click &quot;Add Card&quot; to create one.
            </div>
          )}
        </div>

        <SheetFooter className="px-4 pb-4">
          <Button onClick={handelSave} disabled={isPending}>
            {isPending ? "Saving..." : "Save"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}


