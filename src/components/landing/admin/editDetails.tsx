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
import { type ConferenceDetails } from "~/server/api/routers/home";

export default function EditDetails({ detailsObject }: { detailsObject: ConferenceDetails | null }) {
  const [open, setOpen] = useState(false);

  const [details, setDetails] = useState<ConferenceDetails>(detailsObject ?? { conferenceTitle: "", rows: [], included: [], contacts: [] });

  const utils = api.useUtils();
  const { mutate, isPending } = api.admin.editHome.changeConferenceDetails.useMutation({
    onSuccess: async () => {
      await utils.home.getConferenceDetails.invalidate();
      setOpen(false);
    },
  });

  const addRow = () => {
    setDetails(prev => ({
      ...prev,
      rows: [...prev.rows, { label: "", value: "" }]
    }));
  };

  const removeRow = (index: number) => {
    setDetails(prev => ({
      ...prev,
      rows: prev.rows.filter((_, i) => i !== index)
    }));
  };

  const updateRow = (index: number, field: 'label' | 'value', value: string) => {
    setDetails(prev => ({
      ...prev,
      rows: prev.rows.map((row, i) =>
        i === index ? { ...row, [field]: value } : row
      )
    }));
  };

  const addIncluded = () => {
    setDetails(prev => ({
      ...prev,
      included: [...prev.included, ""]
    }));
  };

  const removeIncluded = (index: number) => {
    setDetails(prev => ({
      ...prev,
      included: prev.included.filter((_, i) => i !== index)
    }));
  };

  const updateIncluded = (index: number, value: string) => {
    setDetails(prev => ({
      ...prev,
      included: prev.included.map((item, i) => i === index ? value : item)
    }));
  };

  const addContact = () => {
    setDetails(prev => ({
      ...prev,
      contacts: [...prev.contacts, { role: "", name: "", phone: "" }]
    }));
  };

  const removeContact = (index: number) => {
    setDetails(prev => ({
      ...prev,
      contacts: prev.contacts.filter((_, i) => i !== index)
    }));
  };

  const updateContact = (index: number, field: keyof ConferenceDetails['contacts'][0], value: string) => {
    setDetails(prev => ({
      ...prev,
      contacts: prev.contacts.map((contact, i) =>
        i === index ? { ...contact, [field]: value } : contact
      )
    }));
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline">Edit Details</Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Conference Details</SheetTitle>
          <SheetDescription>
            Edit the conference details using the form below.
          </SheetDescription>
        </SheetHeader>

        <div className="p-4 space-y-6">
          {/* Conference Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Conference Title</label>
            <Input
              value={details.conferenceTitle}
              onChange={(e) => setDetails(prev => ({ ...prev, conferenceTitle: e.target.value }))}
              placeholder="e.g., 133rd Fiji Principals Association Conference"
            />
          </div>

          {/* Rows Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Details Rows</label>
              <Button onClick={addRow} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-1" />
                Add Row
              </Button>
            </div>
            {details.rows.map((row, index) => (
              <div key={index} className="flex gap-2 items-start p-3 border rounded-md">
                <div className="flex-1 space-y-2">
                  <Input
                    value={row.label}
                    onChange={(e) => updateRow(index, 'label', e.target.value)}
                    placeholder="Label (e.g., Date)"
                  />
                  <Input
                    value={row.value}
                    onChange={(e) => updateRow(index, 'value', e.target.value)}
                    placeholder="Value (e.g., 17th - 19th of September 2025)"
                  />
                </div>
                <Button
                  onClick={() => removeRow(index)}
                  size="sm"
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* Included Items */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Included Items</label>
              <Button onClick={addIncluded} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-1" />
                Add Item
              </Button>
            </div>
            {details.included.map((item, index) => (
              <div key={index} className="flex gap-2 items-center">
                <Input
                  value={item}
                  onChange={(e) => updateIncluded(index, e.target.value)}
                  placeholder="e.g., Official Opening Ceremony"
                />
                <Button
                  onClick={() => removeIncluded(index)}
                  size="sm"
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* Contacts */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Contacts</label>
              <Button onClick={addContact} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-1" />
                Add Contact
              </Button>
            </div>
            {details.contacts.map((contact, index) => (
              <div key={index} className="flex gap-2 items-start p-3 border rounded-md">
                <div className="flex-1 space-y-2">
                  <Input
                    value={contact.role}
                    onChange={(e) => updateContact(index, 'role', e.target.value)}
                    placeholder="Role (e.g., President)"
                  />
                  <Input
                    value={contact.name ?? ""}
                    onChange={(e) => updateContact(index, 'name', e.target.value)}
                    placeholder="Name (optional)"
                  />
                  <Input
                    value={contact.phone ?? ""}
                    onChange={(e) => updateContact(index, 'phone', e.target.value)}
                    placeholder="Phone (optional)"
                  />
                  <Input
                    value={contact.email ?? ""}
                    onChange={(e) => updateContact(index, 'email', e.target.value)}
                    placeholder="Email (optional)"
                  />
                </div>
                <Button
                  onClick={() => removeContact(index)}
                  size="sm"
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <SheetFooter className="px-4 pb-4">
          <Button onClick={() => mutate(details)} disabled={isPending}>
            {isPending ? "Saving..." : "Save"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}


