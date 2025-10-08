"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Checkbox } from "~/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Textarea } from "~/components/ui/textarea";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import {
  CircleX,
  HelpCircle,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { useState } from "react";
import { Separator } from "~/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import Link from "next/link";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { type ConferenceContact } from "@prisma/client";
import { z } from "zod";

export default function ConferenceRegistration() {
  const [formData, setFormData] = useState({
    participantName: "",
    school: "",
    email: "",
    mobile: "",
    participationConfirmation: false,
    paymentMethod: "levy",
    day1Dietary: "veg",
    day2ConferenceDietary: "veg",
    day2ClosingDietary: "veg",
    remit1: "",
    remit2: "",
    finalConfirmation: false,
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const { data: conference, isLoading: conferenceLoading } =
    api.member.registration.getLatestConference.useQuery();

  // Check if user already has a registration for this conference
  const { data: existingRegistration } =
    api.member.registration.getMyRegistrationForConference.useQuery(
      { conferenceId: conference?.id ?? "" },
      { enabled: !!conference?.id },
    );

  const utils = api.useUtils();
  const submitRegistration = api.member.registration.submit.useMutation({
    onSuccess: async () => {
      toast.success("Registration submitted successfully");
      await utils.member.dashboard.getMemberDashboard.invalidate();
      await utils.member.registration.getMyLatest.invalidate();
      await utils.member.registration.getMyRegistrationForConference.invalidate();
    },
    onError: (err) => {
      toast.error(err.message ?? "Failed to submit registration");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!conference?.id) {
      toast.error("No active conference found");
      return;
    }

    submitRegistration.mutate({
      conferenceId: conference.id,
      participantName: formData.participantName,
      school: formData.school,
      email: formData.email,
      mobile: formData.mobile,
      paymentMethod: formData.paymentMethod as "levy" | "deposit",
      dietary: {
        day1: formData.day1Dietary as "veg" | "non-veg",
        day2Conference: formData.day2ConferenceDietary as "veg" | "non-veg",
        day2Closing: formData.day2ClosingDietary as "veg" | "non-veg",
      },
      remits: [formData.remit1, formData.remit2].filter(Boolean),
      finalConfirmation: formData.finalConfirmation,
    });
  };

  let isRegistrationOpen = true;

  if (!conference) {
    isRegistrationOpen = false;
  }

  const now = new Date();

  if (conference?.registrationStartDate && conference?.registrationEndDate) {
    isRegistrationOpen =
      conference.registrationStartDate <= now &&
      conference.registrationEndDate >= now;
  }

  return (
    <div className="flex-1 space-y-6 p-3 sm:p-4 md:p-6">
      {/* Gradient Header */}
      <div className="from-gradient-blue via-gradient-purple to-gradient-red rounded-lg border-0 bg-gradient-to-br from-25% via-50% to-75% p-12 text-center text-white">
        {conferenceLoading ? (
          <>
            <h1 className="mb-2 text-3xl font-bold">Loading Conference...</h1>
            <p className="text-lg opacity-90">Please wait</p>
          </>
        ) : conference ? (
          <>
            <h1 className="mb-2 text-3xl font-bold">{conference.name}</h1>
            <p className="text-lg opacity-90">{conference.description}</p>
            {conference.location && (
              <p className="text-base opacity-80">
                Location: {conference.location}
              </p>
            )}
            {conference.startDate && conference.endDate && (
              <p className="text-base opacity-80">
                Conference Date:{" "}
                {new Date(conference.startDate).toLocaleDateString()} -{" "}
                {new Date(conference.endDate).toLocaleDateString()}
              </p>
            )}
            {conference.registrationStartDate &&
              conference.registrationEndDate && (
                <p className="text-base opacity-80">
                  Registration Period:{" "}
                  {new Date(
                    String(conference.registrationStartDate),
                  ).toLocaleDateString()}{" "}
                  -{" "}
                  {new Date(
                    String(conference.registrationEndDate),
                  ).toLocaleDateString()}
                </p>
              )}
          </>
        ) : (
          <>
            <h1 className="mb-2 text-3xl font-bold">Conference Registration</h1>
            <p className="text-lg opacity-90">
              No active conference with open registration at the moment
            </p>
            <p className="mt-2 text-sm opacity-75">
              Please check back later or contact the association for more
              information
            </p>
          </>
        )}
      </div>

      {/* Registration Closed Notice */}
      {!conferenceLoading && !isRegistrationOpen && !existingRegistration && (
        <Card className="border-red-500 bg-red-50 dark:bg-red-950">
          <CardContent>
            <div className="mx-auto flex max-w-md flex-col items-center text-center">
              {/* icon */}
              <CircleX className="mb-2 text-xl font-bold text-red-700 dark:text-red-300" />
              <h2 className="mb-2 text-xl font-bold text-red-700 dark:text-red-300">
                Registration Not Available
              </h2>
              <p className="text-red-600 dark:text-red-400">
                Registration is currently not open. Please check the
                registration period above or contact the association for
                assistance.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Existing Registration Status */}
      {existingRegistration && (
        <div className="relative grid h-full grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column - Registration Status */}
          <div className="space-y-6 lg:col-span-2">
            <Card className="border-primary">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-3">
                      Your Registration Status
                      {existingRegistration.status === "confirmed" && (
                        <Badge variant="default" className="gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Confirmed
                        </Badge>
                      )}
                      {existingRegistration.status === "pending" && (
                        <Badge variant="secondary" className="gap-1">
                          <Clock className="h-3 w-3" />
                          Pending Review
                        </Badge>
                      )}
                      {existingRegistration.status === "cancelled" && (
                        <Badge variant="destructive" className="gap-1">
                          <XCircle className="h-3 w-3" />
                          Cancelled
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      Submitted on{" "}
                      {new Date(
                        existingRegistration.createdAt,
                      ).toLocaleDateString()}{" "}
                      at{" "}
                      {new Date(
                        existingRegistration.createdAt,
                      ).toLocaleTimeString()}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Status Messages */}
                {existingRegistration.status === "pending" && (
                  <div className="flex items-start gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900 dark:bg-yellow-950">
                    <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-600 dark:text-yellow-400" />
                    <div>
                      <h3 className="font-semibold text-yellow-900 dark:text-yellow-100">
                        Registration Under Review
                      </h3>
                      <p className="text-muted-foreground mt-1 text-sm">
                        Your registration is currently being reviewed by the
                        administrators. You will be notified once your
                        registration is approved. Please check back later.
                      </p>
                    </div>
                  </div>
                )}

                {existingRegistration.status === "confirmed" && (
                  <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" />
                    <div>
                      <h3 className="font-semibold text-green-900 dark:text-green-100">
                        Registration Confirmed!
                      </h3>
                      <p className="text-muted-foreground mt-1 text-sm">
                        Your registration has been approved. Please ensure
                        payment is completed before the conference date.
                      </p>
                    </div>
                  </div>
                )}

                {existingRegistration.status === "cancelled" && (
                  <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">
                    <XCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" />
                    <div>
                      <h3 className="font-semibold text-red-900 dark:text-red-100">
                        Registration Cancelled
                      </h3>
                      <p className="text-muted-foreground mt-1 text-sm">
                        This registration has been cancelled. If you believe
                        this is an error, please contact the administrators.
                      </p>
                    </div>
                  </div>
                )}

                {/* Registration Details */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label className="text-muted-foreground text-xs">
                      Name
                    </Label>
                    <p className="font-medium">{existingRegistration.name}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">
                      Email
                    </Label>
                    <p className="font-medium">{existingRegistration.email}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">
                      Phone
                    </Label>
                    <p className="font-medium">{existingRegistration.phone}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">
                      School
                    </Label>
                    <p className="font-medium">{existingRegistration.school}</p>
                  </div>
                </div>

                <Separator />

                {/* Payment Information */}
                <div>
                  <h3 className="mb-3 font-semibold">Payment Information</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label className="text-muted-foreground text-xs">
                        Payment Status
                      </Label>
                      <div className="mt-1">
                        <Badge
                          variant={
                            existingRegistration.paymentStatus === "paid"
                              ? "default"
                              : existingRegistration.paymentStatus === "pending"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {existingRegistration.paymentStatus}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">
                        Registration Fee
                      </Label>
                      <p className="font-medium">
                        {existingRegistration.currency} $
                        {((existingRegistration.priceCents ?? 0) / 100).toFixed(
                          2,
                        )}
                      </p>
                    </div>
                    {existingRegistration.payments &&
                      existingRegistration.payments.length > 0 && (
                        <div>
                          <Label className="text-muted-foreground text-xs">
                            Amount Paid
                          </Label>
                          <p className="font-medium text-green-600">
                            {existingRegistration.currency} $
                            {(
                              existingRegistration.payments
                                .filter((p) => p.status === "succeeded")
                                .reduce((sum, p) => sum + p.amountCents, 0) /
                              100
                            ).toFixed(2)}
                          </p>
                        </div>
                      )}
                  </div>
                </div>

                {/* Conference Details */}
                {existingRegistration.conference && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="mb-3 font-semibold">Conference Details</h3>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <Label className="text-muted-foreground text-xs">
                            Conference
                          </Label>
                          <p className="font-medium">
                            {existingRegistration.conference.name}
                          </p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground text-xs">
                            Dates
                          </Label>
                          <p className="font-medium">
                            {new Date(
                              existingRegistration.conference.startDate,
                            ).toLocaleDateString()}{" "}
                            -{" "}
                            {new Date(
                              existingRegistration.conference.endDate,
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Action Buttons */}
                <Separator />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      const element = document.getElementById(
                        "bank-details-section",
                      );
                      element?.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                      });
                    }}
                  >
                    View Payment Details
                  </Button>
                  {existingRegistration.status === "confirmed" &&
                    existingRegistration.paymentStatus === "unpaid" && (
                      <Button size="sm" className="flex-1">
                        Make Payment
                      </Button>
                    )}
                  {existingRegistration.status === "pending" && (
                    <Button
                      variant="secondary"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        const element =
                          document.getElementById("contact-section");
                        element?.scrollIntoView({
                          behavior: "smooth",
                          block: "center",
                        });
                      }}
                    >
                      Contact Support
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Information Panels */}
          <div className="h-full">
            <div className="sticky top-20 space-y-6">
              {/* Bank Transfer Details */}
              <Card
                id="bank-details-section"
                className="border-primary bg-blue-50 dark:bg-gradient-to-r dark:from-[#93E3F2] dark:from-25% dark:to-[#00AEE8] dark:to-100%"
              >
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-black">
                    Bank Transfer Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-black">
                  <div>
                    <span className="font-bold">Registration Fee:</span>
                    <span className="ml-2">
                      {conference
                        ? `${conference.currency} $${(conference.priceCents / 100).toFixed(2)}`
                        : "TBD"}
                    </span>
                  </div>
                  <Separator
                    orientation="horizontal"
                    className="my-4 bg-[#CCCCCC] dark:bg-white/60"
                  />
                  <div>
                    <span className="font-semibold">Account Name:</span>
                    <span className="ml-2">
                      {conference?.bankTransferAccountName ?? "TBD"}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold">Bank & Branch:</span>
                    <span className="ml-2">
                      {conference?.bankTransferBranch ?? "TBD"}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold">Account Number:</span>
                    <span className="ml-2">
                      {conference?.bankTransferAccountNumber}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card
                id="contact-section"
                className="border-primary bg-blue-50 dark:bg-gradient-to-r dark:from-[#93E3F2] dark:from-25% dark:to-[#00AEE8] dark:to-100%"
              >
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-black">
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-black">
                  {conference?.contacts && conference.contacts.length > 0 ? (
                    <>
                      {conference.contacts.map((contact, index: number) => (
                        <RegistrationContactRow
                          contact={contact}
                          index={index}
                          key={index}
                        />
                      ))}
                    </>
                  ) : (
                    <div className="text-center text-sm opacity-75">
                      <p>Contact information not available at this time.</p>
                      <p className="mt-2">
                        Please email{" "}
                        <Link
                          target="_blank"
                          href="mailto:fijiprincipalsassociation@gmail.com"
                          className="text-blue-800 hover:underline"
                        >
                          fijiprincipalsassociation@gmail.com
                        </Link>
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {!existingRegistration && (
        <div className="relative grid h-full grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column - Registration Form */}
          <div className="space-y-6 lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Participant Information */}
              <Card>
                <CardHeader className="text-2xl">
                  <CardTitle className="font-bold">
                    Participant Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="participantName">
                        {`Participant's Name `}
                        <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="participantName"
                        placeholder="Enter your full name"
                        value={formData.participantName}
                        onChange={(e) =>
                          handleInputChange("participantName", e.target.value)
                        }
                        required
                        disabled={!isRegistrationOpen}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="school">
                        School <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="school"
                        placeholder="Enter your school"
                        value={formData.school}
                        onChange={(e) =>
                          handleInputChange("school", e.target.value)
                        }
                        required
                        disabled={!isRegistrationOpen}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="email">
                        Email <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email address"
                        value={formData.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        required
                        disabled={!isRegistrationOpen}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mobile">
                        Mobile <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="mobile"
                        placeholder="Enter your mobile number"
                        value={formData.mobile}
                        onChange={(e) =>
                          handleInputChange("mobile", e.target.value)
                        }
                        required
                        disabled={!isRegistrationOpen}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Information */}
              <Card>
                <CardHeader className="text-2xl">
                  <CardTitle className="font-bold">
                    Payment Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <Label className="text-md font-semibold">
                      Participation Confirmation
                    </Label>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="confirmation"
                        checked={formData.participationConfirmation}
                        onCheckedChange={(checked) =>
                          handleInputChange(
                            "participationConfirmation",
                            checked as boolean,
                          )
                        }
                        disabled={!isRegistrationOpen}
                      />
                      <Label htmlFor="confirmation" className="text-sm">
                        {conference
                          ? `I confirm my participation at the ${conference.name}`
                          : "No conference available"}
                      </Label>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-md font-semibold">
                      Payment Method
                    </Label>
                    <RadioGroup
                      value={formData.paymentMethod}
                      onValueChange={(value) =>
                        handleInputChange("paymentMethod", value)
                      }
                      disabled={!isRegistrationOpen}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="levy"
                          id="levy"
                          disabled={!isRegistrationOpen}
                        />
                        <Label htmlFor="levy" className="text-sm">
                          Levy of{" "}
                          {conference
                            ? `${conference.currency} $${(conference.priceCents / 100).toFixed(2)}`
                            : "FJD $250"}{" "}
                          (crossed cheque)
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="deposit"
                          id="deposit"
                          disabled={!isRegistrationOpen}
                        />
                        <Label htmlFor="deposit" className="text-sm">
                          Deposit levy in FPA Account
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                </CardContent>
              </Card>

              {/* Dietary Preferences */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl font-bold">
                    Dietary Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <Label className="text-lg font-semibold">
                      Day 1 - Official Opening
                    </Label>
                    <RadioGroup
                      value={formData.day1Dietary}
                      onValueChange={(value) =>
                        handleInputChange("day1Dietary", value)
                      }
                      disabled={!isRegistrationOpen}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value="veg"
                            id="day1-veg"
                            disabled={!isRegistrationOpen}
                          />
                          <Label htmlFor="day1-veg" className="text-sm">
                            Veg
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value="non-veg"
                            id="day1-non-veg"
                            disabled={!isRegistrationOpen}
                          />
                          <Label htmlFor="day1-non-veg" className="text-sm">
                            Non-veg
                          </Label>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-lg font-semibold">
                      Day 2 - Conference
                    </Label>
                    <RadioGroup
                      value={formData.day2ConferenceDietary}
                      onValueChange={(value) =>
                        handleInputChange("day2ConferenceDietary", value)
                      }
                      disabled={!isRegistrationOpen}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value="veg"
                            id="day2-conf-veg"
                            disabled={!isRegistrationOpen}
                          />
                          <Label htmlFor="day2-conf-veg" className="text-sm">
                            Veg
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value="non-veg"
                            id="day2-conf-non-veg"
                            disabled={!isRegistrationOpen}
                          />
                          <Label
                            htmlFor="day2-conf-non-veg"
                            className="text-sm"
                          >
                            Non-veg
                          </Label>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-lg font-semibold">
                      Day 2 - Closing
                    </Label>
                    <RadioGroup
                      value={formData.day2ClosingDietary}
                      onValueChange={(value) =>
                        handleInputChange("day2ClosingDietary", value)
                      }
                      disabled={!isRegistrationOpen}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value="veg"
                            id="day2-closing-veg"
                            disabled={!isRegistrationOpen}
                          />
                          <Label htmlFor="day2-closing-veg" className="text-sm">
                            Veg
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value="non-veg"
                            id="day2-closing-non-veg"
                            disabled={!isRegistrationOpen}
                          />
                          <Label
                            htmlFor="day2-closing-non-veg"
                            className="text-sm"
                          >
                            Non-veg
                          </Label>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>
                </CardContent>
              </Card>

              {/* Remits (Optional) */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-4 text-2xl font-bold">
                    <span>Remits (Optional)</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle
                          className="text-foreground/70 hover:text-foreground cursor-pointer"
                          size={24}
                        />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs text-sm">
                        <p>
                          A formal proposal, suggestion, or recommendation
                          submitted by a member for consideration at the
                          conference.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="remit1">Remit 1</Label>
                    <Textarea
                      id="remit1"
                      placeholder="Please provide your first remit or suggestion for the conference"
                      value={formData.remit1}
                      onChange={(e) =>
                        handleInputChange("remit1", e.target.value)
                      }
                      rows={4}
                      disabled={!isRegistrationOpen}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="remit2">Remit 2</Label>
                    <Textarea
                      id="remit2"
                      placeholder="Please provide your second remit or suggestion for the conference"
                      value={formData.remit2}
                      onChange={(e) =>
                        handleInputChange("remit2", e.target.value)
                      }
                      rows={4}
                      disabled={!isRegistrationOpen}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Final Confirmation and Submit */}
              <Card>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="finalConfirmation"
                        checked={formData.finalConfirmation}
                        onCheckedChange={(checked) =>
                          handleInputChange(
                            "finalConfirmation",
                            checked as boolean,
                          )
                        }
                        disabled={!isRegistrationOpen}
                      />
                      <Label htmlFor="finalConfirmation" className="text-sm">
                        I hereby confirm my registration (timestamp will be
                        recorded).
                      </Label>
                    </div>

                    <Button
                      type="submit"
                      className="w-full py-3"
                      disabled={
                        !formData.finalConfirmation ||
                        !isRegistrationOpen ||
                        conferenceLoading ||
                        submitRegistration.isPending
                      }
                    >
                      {conferenceLoading
                        ? "Loading..."
                        : submitRegistration.isPending
                          ? "Submitting..."
                          : !isRegistrationOpen
                            ? "Registration Not Available"
                            : "Submit Registration"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </form>
          </div>

          {/* Right Column - Information Panels */}
          <div className="h-full">
            <div className="sticky top-20 space-y-6">
              {/* Bank Transfer Details */}
              <Card
                id="bank-details-section"
                className="border-primary bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20"
              >
                <CardHeader>
                  <CardTitle className="text-foreground text-2xl font-bold">
                    Bank Transfer Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-foreground">
                  <div>
                    <span className="font-bold">Registration Fee:</span>
                    <span className="ml-2">
                      {conference
                        ? `${conference.currency} $${(conference.priceCents / 100).toFixed(2)}`
                        : "TBD"}
                    </span>
                  </div>
                  <Separator
                    orientation="horizontal"
                    className="my-4 bg-[#CCCCCC] dark:bg-white/60"
                  />
                  <div>
                    <span className="font-semibold">Account Name:</span>
                    <span className="ml-2">
                      {conference?.bankTransferAccountName ?? "TBD"}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold">Bank & Branch:</span>
                    <span className="ml-2">
                      {conference?.bankTransferBranch ?? "TBD"}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold">Account Number:</span>
                    <span className="ml-2">
                      {conference?.bankTransferAccountNumber}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card
                id="contact-section"
                className="border-primary bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20"
              >
                <CardHeader>
                  <CardTitle className="text-foreground text-2xl font-bold">
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-foreground">
                  {conference?.contacts && conference.contacts.length > 0 ? (
                    <>
                      {conference.contacts.map((contact, index: number) => (
                        <RegistrationContactRow
                          contact={contact}
                          index={index}
                          key={index}
                        />
                      ))}
                    </>
                  ) : (
                    <div className="text-center text-sm opacity-75">
                      <p>Contact information not available at this time.</p>
                      <p className="mt-2">
                        Please email{" "}
                        <Link
                          target="_blank"
                          href="mailto:fijiprincipalsassociation@gmail.com"
                          className="text-blue-800 hover:underline"
                        >
                          fijiprincipalsassociation@gmail.com
                        </Link>
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const fieldsSchema = z.object({
  email: z.string().optional(),
  phone: z.string().optional(),
  school: z.string().optional(),
});

function RegistrationContactRow({
  contact,
  index,
}: {
  contact: ConferenceContact;
  index: number;
}) {
  const { data: fields, success } = fieldsSchema.safeParse(contact.fields);

  if (!success) {
    return null;
  }

  return (
    <div key={contact.id || index}>
      {index > 0 && (
        <Separator
          orientation="horizontal"
          className="mb-4 bg-[#CCCCCC] dark:bg-white/60"
        />
      )}
      <div>
        <div className="text-md">
          <strong>{contact.name}</strong>
        </div>

        {fields.phone && (
          <div className="text-sm">
            <strong>Phone:</strong> {fields.phone}
          </div>
        )}
        {fields.school && (
          <div className="text-sm">
            <strong>School:</strong> {fields.school}
          </div>
        )}
        {fields.email && (
          <div className="text-sm">
            <strong>Email:</strong>{" "}
            <Link
              target="_blank"
              href={`mailto:${fields.email}`}
              className="text-blue-800 hover:underline"
            >
              {fields.email}
            </Link>
          </div>
        )}
        {fields.phone && (
          <div className="text-sm">
            <strong>Phone:</strong> {fields.phone}
          </div>
        )}
      </div>
    </div>
  );
}
