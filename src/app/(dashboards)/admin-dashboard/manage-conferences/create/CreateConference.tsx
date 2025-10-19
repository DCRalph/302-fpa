"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from 'nextjs-toploader/app';
import { Plus, Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";

type ContactForm = {
  name: string;
  email: string;
  phone: string;
  school: string;
};

export default function CreateConferencePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    startDate: "",
    endDate: "",
    registrationStartDate: "",
    registrationEndDate: "",
    priceCents: "",
    currency: "FJD",
    bankTransferAccountName: "",
    bankTransferBranch: "",
    bankTransferAccountNumber: "",
    maxRegistrations: "",
    isActive: true,
  });

  const [contacts, setContacts] = useState<ContactForm[]>([
    { name: "", email: "", phone: "", school: "" },
  ]);

  const createConferenceMutation = api.admin.conference.create.useMutation({
    onSuccess: (data) => {
      toast.success("Conference created successfully");
      router.push(`/admin-dashboard/manage-conferences/${data.id}`);
    },
    onError: (err) => {
      toast.error(err.message ?? "Failed to create conference");
    },
  });

  const handleInputChange = (field: string, value: string | boolean | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleContactChange = (index: number, field: keyof ContactForm, value: string) => {
    setContacts((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index]!, [field]: value };
      return updated;
    });
  };

  const addContact = () => {
    setContacts((prev) => [...prev, { name: "", email: "", phone: "", school: "" }]);
  };

  const removeContact = (index: number) => {
    if (contacts.length === 1) {
      toast.error("At least one contact is required");
      return;
    }
    setContacts((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.name || !formData.description || !formData.location) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Filter out empty contacts
    const validContacts = contacts.filter((c) => c.name.trim() !== "");

    if (validContacts.length === 0) {
      toast.error("At least one contact with a name is required");
      return;
    }

    createConferenceMutation.mutate({
      name: formData.name,
      description: formData.description,
      location: formData.location,
      startDate: new Date(formData.startDate),
      endDate: new Date(formData.endDate),
      registrationStartDate: new Date(formData.registrationStartDate),
      registrationEndDate: new Date(formData.registrationEndDate),
      priceCents: parseInt(formData.priceCents) * 100, // Convert to cents
      currency: formData.currency,
      bankTransferAccountName: formData.bankTransferAccountName,
      bankTransferBranch: formData.bankTransferBranch,
      bankTransferAccountNumber: formData.bankTransferAccountNumber,
      maxRegistrations: formData.maxRegistrations ? parseInt(formData.maxRegistrations) : 0,
      isActive: formData.isActive,
      contacts: validContacts,
    });
  };

  return (
    <main className="flex-1 p-3 sm:p-4 md:p-6">
      <div className="mb-6">
        <Link href="/admin-dashboard/manage-conferences">
          <Button variant="ghost" className="mb-4 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Conferences
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Create New Conference</h1>
        <p className="text-muted-foreground mt-1">
          Fill in the details below to create a new conference
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>General conference details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Conference Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g., Annual Conference 2025"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">
                Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Brief description of the conference"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                rows={4}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">
                Location <span className="text-red-500">*</span>
              </Label>
              <Input
                id="location"
                placeholder="e.g., Suva, Fiji"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                required
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => handleInputChange("isActive", checked as boolean)}
              />
              <Label htmlFor="isActive" className="text-sm font-normal">
                Set as active conference (will be visible to members)
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Dates */}
        <Card>
          <CardHeader>
            <CardTitle>Dates</CardTitle>
            <CardDescription>Conference and registration dates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="startDate">
                  Conference Start Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="startDate"
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange("startDate", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">
                  Conference End Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="endDate"
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange("endDate", e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="registrationStartDate">
                  Registration Start Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="registrationStartDate"
                  type="datetime-local"
                  value={formData.registrationStartDate}
                  onChange={(e) => handleInputChange("registrationStartDate", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="registrationEndDate">
                  Registration End Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="registrationEndDate"
                  type="datetime-local"
                  value={formData.registrationEndDate}
                  onChange={(e) => handleInputChange("registrationEndDate", e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing</CardTitle>
            <CardDescription>Registration fee and payment details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="priceCents">
                  Registration Fee <span className="text-red-500">*</span>
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="currency"
                    value={formData.currency}
                    onChange={(e) => handleInputChange("currency", e.target.value)}
                    className="w-20"
                    placeholder="FJD"
                  />
                  <Input
                    id="priceCents"
                    type="number"
                    placeholder="250.00"
                    value={formData.priceCents}
                    onChange={(e) => handleInputChange("priceCents", e.target.value)}
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxRegistrations">
                  Max Registrations (0 = unlimited)
                </Label>
                <Input
                  id="maxRegistrations"
                  type="number"
                  placeholder="0"
                  value={formData.maxRegistrations}
                  onChange={(e) => handleInputChange("maxRegistrations", e.target.value)}
                  min="0"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bank Transfer Details */}
        <Card>
          <CardHeader>
            <CardTitle>Bank Transfer Details</CardTitle>
            <CardDescription>Payment information for bank transfers</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bankTransferAccountName">
                Account Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="bankTransferAccountName"
                placeholder="Fiji Principals Association"
                value={formData.bankTransferAccountName}
                onChange={(e) => handleInputChange("bankTransferAccountName", e.target.value)}
                required
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="bankTransferBranch">
                  Bank & Branch <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="bankTransferBranch"
                  placeholder="ANZ Bank, Suva Branch"
                  value={formData.bankTransferBranch}
                  onChange={(e) => handleInputChange("bankTransferBranch", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bankTransferAccountNumber">
                  Account Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="bankTransferAccountNumber"
                  placeholder="1234567890"
                  value={formData.bankTransferAccountNumber}
                  onChange={(e) => handleInputChange("bankTransferAccountNumber", e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>People to contact for conference inquiries</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {contacts.map((contact, index) => (
              <Card key={index} className="border-muted">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">Contact {index + 1}</h4>
                      {contacts.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeContact(index)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor={`contact-name-${index}`}>
                          Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id={`contact-name-${index}`}
                          placeholder="John Doe"
                          value={contact.name}
                          onChange={(e) => handleContactChange(index, "name", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`contact-email-${index}`}>Email</Label>
                        <Input
                          id={`contact-email-${index}`}
                          type="email"
                          placeholder="john@example.com"
                          value={contact.email}
                          onChange={(e) => handleContactChange(index, "email", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor={`contact-phone-${index}`}>Phone</Label>
                        <Input
                          id={`contact-phone-${index}`}
                          placeholder="+679 1234567"
                          value={contact.phone}
                          onChange={(e) => handleContactChange(index, "phone", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`contact-school-${index}`}>School</Label>
                        <Input
                          id={`contact-school-${index}`}
                          placeholder="School Name"
                          value={contact.school}
                          onChange={(e) => handleContactChange(index, "school", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            <Button type="button" variant="outline" onClick={addContact} className="w-full gap-2">
              <Plus className="h-4 w-4" />
              Add Another Contact
            </Button>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex gap-4">
          <Button type="submit" disabled={createConferenceMutation.isPending} className="flex-1">
            {createConferenceMutation.isPending ? "Creating..." : "Create Conference"}
          </Button>
          <Link href="/admin-dashboard/manage-conferences" className="flex-1">
            <Button type="button" variant="outline" className="w-full">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </main>
  );
}

