"use client";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Checkbox } from "~/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Textarea } from "~/components/ui/textarea";
import { Button } from "~/components/ui/button";
import { HelpCircle } from "lucide-react";
import { useState } from "react";
import { Separator } from "~/components/ui/separator";
import {
  Tooltip,
  TooltipProvider,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import Link from "next/link";

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Registration submitted:", formData);
    // Handle form submission
  };

  return (
    <div className="flex-1 space-y-6 p-3 sm:p-4 md:p-6">
      {/* Gradient Header */}
      <div className="from-gradient-blue via-gradient-purple to-gradient-red rounded-lg border-0 bg-gradient-to-br from-25% via-50% to-75% p-12 text-center text-white">
        <h1 className="mb-2 text-3xl font-bold">
          133rd Fiji Principals Association Conference Registration
        </h1>
        <p className="text-lg opacity-90">
          Please fill out this form to register your participation
        </p>
      </div>

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
                      Participant's Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="participantName"
                      placeholder="Enter your full name"
                      value={formData.participantName}
                      onChange={(e) =>
                        handleInputChange("participantName", e.target.value)
                      }
                      required
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
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card>
              <CardHeader className="text-2xl">
                <CardTitle className="font-bold">Payment Information</CardTitle>
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
                    />
                    <Label htmlFor="confirmation" className="text-sm">
                      I confirm my participation at the 133rd FPA Conference
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
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="levy" id="levy" />
                      <Label htmlFor="levy" className="text-sm">
                        Levy of FJD $250 (crossed cheque)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="deposit" id="deposit" />
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
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="veg" id="day1-veg" />
                        <Label htmlFor="day1-veg" className="text-sm">
                          Veg
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="non-veg" id="day1-non-veg" />
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
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="veg" id="day2-conf-veg" />
                        <Label htmlFor="day2-conf-veg" className="text-sm">
                          Veg
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="non-veg"
                          id="day2-conf-non-veg"
                        />
                        <Label htmlFor="day2-conf-non-veg" className="text-sm">
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
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="veg" id="day2-closing-veg" />
                        <Label htmlFor="day2-closing-veg" className="text-sm">
                          Veg
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="non-veg"
                          id="day2-closing-non-veg"
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
                    />
                    <Label htmlFor="finalConfirmation" className="text-sm">
                      I hereby confirm my registration (timestamp will be
                      recorded).
                    </Label>
                  </div>

                  <Button
                    type="submit"
                    className="w-full py-3"
                    disabled={!formData.finalConfirmation}
                  >
                    Submit Registration
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
            <Card className="border-primary bg-blue-50 dark:bg-gradient-to-r dark:from-[#93E3F2] dark:from-25% dark:to-[#00AEE8] dark:to-100%">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-black">
                  Bank Transfer Details
                </CardTitle>
              </CardHeader>
              <CardContent className="text-black">
                <div>
                  <span className="font-bold">Registration Fee:</span>
                  <span className="ml-2">FJD $250</span>
                </div>
                <Separator
                  orientation="horizontal"
                  className="my-4 bg-[#CCCCCC] dark:bg-white/60"
                />
                <div>
                  <span className="font-semibold">Account Name:</span>
                  <span className="ml-2">FIJI PRINCIPALS' ASSOCIATION</span>
                </div>
                <div>
                  <span className="font-semibold">Bank & Branch:</span>
                  <span className="ml-2">BSP, Samabula</span>
                </div>
                <div>
                  <span className="font-semibold">Account Number:</span>
                  <span className="ml-2">10065568</span>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="border-primary bg-blue-50 dark:bg-gradient-to-r dark:from-[#93E3F2] dark:from-25% dark:to-[#00AEE8] dark:to-100%">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-black">
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-black">
                <div>
                  <div className="text-md">
                    <strong>President:</strong> Mr. Vishnu Deo Sharma
                  </div>
                  <div className="text-sm">
                    <strong>Mobile:</strong> 9278360
                  </div>
                  <div className="text-sm">
                    <strong>School:</strong> Bauleva High School
                  </div>
                </div>

                <Separator orientation="horizontal" className="bg-[#CCCCCC] dark:bg-white/60" />

                <div>
                  <div className="text-md">
                    <strong>Secretary:</strong> Mr. Praveen Chand
                  </div>
                  <div className="text-sm">
                    <strong></strong>
                    <strong>Mobile:</strong> 9088290
                  </div>
                  <div className="text-sm">
                    <strong>School:</strong> Nakasi High School
                  </div>
                </div>

                <Separator orientation="horizontal" className="bg-[#CCCCCC] dark:bg-white/60" />

                <div>
                  <div className="font-medium">
                    <strong>Treasurer:</strong> Mr. Pranesh Kumar
                  </div>
                  <div className="text-sm">
                    <strong>Mobile:</strong> 9951318
                  </div>
                  <div className="text-sm">
                    <strong>School:</strong> Saraswati College
                  </div>
                </div>

                <Separator orientation="horizontal" className="bg-[#CCCCCC] dark:bg-white/60" />

                <div>
                  <div className="text-md">
                    <strong>Email: </strong>
                    <Link
                      target="_blank"
                      href="mailto:fijiprincipalsassociation@gmail.com"
                      className="text-blue-800 hover:underline"
                    >
                      fijiprincipalsassociation@gmail.com
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
