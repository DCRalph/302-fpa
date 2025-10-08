"use client";

import { User, Mail, Phone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { useAuth } from "~/hooks/useAuth";
import Image from "next/image";
import { useState } from "react";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";

export default function Profile() {
  const { dbUser } = useAuth();

  const [activeTab, setActiveTab] = useState("basic-info");
  const [formData, setFormData] = useState({
    fullName: dbUser?.name,
    phone: dbUser?.phone,
    school: "Yoobee College of Creative Innovation",
    email: dbUser?.email,
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleUpdateDetails = () => {
    console.log("Updating profile details:", formData);
    // Handle form submission
  };

  return (
    <div className="flex-1 space-y-6 p-3 sm:p-4 md:p-6">
      {/* Gradient Profile Header */}
      <div className="w-full">
        <Card className="from-gradient-blue via-gradient-purple to-gradient-red border-0 bg-gradient-to-r from-25% via-50% to-75% py-12 text-white shadow-lg">
          <CardContent className="mx-auto justify-center text-center lg:mx-0 lg:flex lg:justify-start lg:text-left">
            <div className="flex justify-center">
              {dbUser?.image ? (
                <Image
                  src={dbUser.image}
                  alt=""
                  className="mx-12 mb-4 h-[137px] w-[137px] rounded-full"
                  width={137}
                  height={137}
                />
              ) : (
                <div className="bg-muted flex h-8 w-8 items-center justify-center rounded-full">
                  <User className="text-muted-foreground h-4 w-4" />
                </div>
              )}
            </div>
            <div className="space-y-1 pl-4">
              <h1 className="text-3xl font-bold">{dbUser?.name}</h1>
              <h2 className="text-2xl">
                Yoobee College of Creative Innovation
              </h2>
              <div className="space-y-1">
                <div className="flex items-center space-x-4 pt-2 text-lg">
                  <Mail size={24} />
                  <p>{dbUser?.email}</p>
                </div>
                <div className="flex items-center space-x-4 text-lg">
                  <Phone size={24} />
                  <p>{dbUser?.phone}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Profile Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-2"
      >
        <TabsList className="space-x-4" defaultValue={"basic-info"}>
          <TabsTrigger value="basic-info">Basic Information</TabsTrigger>
          <TabsTrigger value="professional">Professional Profile</TabsTrigger>
          <TabsTrigger value="profile-image">Profile Image</TabsTrigger>
          <TabsTrigger value="change-password">Change Password</TabsTrigger>
        </TabsList>

        {/* Basic Information Tab */}
        <TabsContent value="basic-info" className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
            {/* Form Section */}
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl font-bold">Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">
                        Full Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="fullName"
                        value={`${formData.fullName}`}
                        onChange={(e) =>
                          handleInputChange("fullName", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={`${formData.phone}`}
                        onChange={(e) =>
                          handleInputChange("phone", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="school">School</Label>
                    <Input
                      id="school"
                      value={formData.school}
                      onChange={(e) =>
                        handleInputChange("school", e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={`${formData.email}`}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      className="bg-gray-100"
                      disabled
                    />
                    <p className="text-sm text-gray-500">
                      Email cannot be changed. Contact admin if needed.
                    </p>
                  </div>

                  <Button
                    onClick={handleUpdateDetails}
                    className="bg-slate-800 text-white hover:bg-slate-900"
                  >
                    Update Details
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar - Membership Info */}
            <div className="space-y-6">
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="text-blue-900">
                    Membership Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Badge className="border-green-200 bg-green-100 text-green-800">
                      Active
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="font-medium text-blue-900">Joined</div>
                    <div className="text-sm text-blue-800">26/06/2025</div>
                  </div>

                  <div className="space-y-2">
                    <div className="font-medium text-blue-900">Member ID</div>
                    <div className="text-sm text-blue-800">FPA-SP-2025-001</div>
                  </div>

                  <div className="space-y-2">
                    <div className="font-medium text-blue-900">Role</div>
                    <div className="text-sm text-blue-800">Principal</div>
                  </div>

                  <div className="space-y-2">
                    <div className="font-medium text-blue-900">Region</div>
                    <div className="text-sm text-blue-800">
                      Central Division
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Professional Profile Tab */}
        <TabsContent value="professional" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Professional Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="position">Position</Label>
                  <Input
                    id="position"
                    placeholder="e.g., Principal, Deputy Principal"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="experience">Years of Experience</Label>
                  <Input id="experience" placeholder="e.g., 15" />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="qualification">Highest Qualification</Label>
                  <Input
                    id="qualification"
                    placeholder="e.g., Master of Education"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specialization">Specialization</Label>
                  <Input
                    id="specialization"
                    placeholder="e.g., Educational Leadership"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Professional Bio</Label>
                <textarea
                  id="bio"
                  className="min-h-[120px] w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Tell us about your professional background and experience..."
                />
              </div>

              <Button className="bg-slate-800 text-white hover:bg-slate-900">
                Update Professional Profile
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profile Image Tab */}
        <TabsContent value="profile-image" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Image</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center space-y-6">
                {/* Current Profile Image */}
                <div className="flex h-32 w-32 items-center justify-center rounded-full bg-blue-600">
                  <span className="text-4xl font-bold text-white">SP</span>
                </div>

                <div className="space-y-4 text-center">
                  <p className="text-gray-600">
                    Upload a professional photo to personalize your profile
                  </p>

                  <div className="space-y-2">
                    <Button variant="outline">Choose File</Button>
                    <p className="text-xs text-gray-500">
                      Recommended: Square image, at least 200x200px
                    </p>
                  </div>
                </div>

                <Button className="bg-slate-800 text-white hover:bg-slate-900">
                  Update Profile Image
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Change Password Tab */}
        <TabsContent value="change-password" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="max-w-md space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    placeholder="Enter your current password"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Enter your new password"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your new password"
                  />
                </div>

                <div className="rounded-lg bg-blue-50 p-4">
                  <h4 className="mb-2 font-medium text-blue-900">
                    Password Requirements:
                  </h4>
                  <ul className="space-y-1 text-sm text-blue-800">
                    <li>• At least 8 characters long</li>
                    <li>• Contains at least one uppercase letter</li>
                    <li>• Contains at least one lowercase letter</li>
                    <li>• Contains at least one number</li>
                  </ul>
                </div>

                <Button className="bg-slate-800 text-white hover:bg-slate-900">
                  Update Password
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
