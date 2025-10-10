"use client";

import {
  User,
  Mail,
  Phone,
  IdCard,
  ImageIcon,
  Lock,
  UserIcon,
} from "lucide-react";
import { Card, CardContent } from "~/components/ui/card";
import { useAuth } from "~/hooks/useAuth";
import Image from "next/image";
import { useState } from "react";
import { BasicInfoTab } from "./basic-info-tab";
import { ProfessionalTab } from "./professional-tab";
import { ProfileImageTab } from "./profile-image-tab";
import { ChangePasswordTab } from "./change-password-tab";

export default function Profile() {
  const { dbUser } = useAuth();

  // Tabs
  const [activeTab, setActiveTab] = useState<
    "basic-info" | "professional" | "profile-image" | "change-password"
  >("basic-info");

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
                <div className="bg-gray-200 mx-12 flex h-[137px] w-[137px] items-center justify-center rounded-full">
                  <User className="text-gray-700" size={48} />
                </div>
              )}
            </div>
            <div className="space-y-1 pl-4">
              <h1 className="text-3xl font-bold">{dbUser?.name}</h1>
              <h2 className="text-2xl">{dbUser?.school}</h2>
              <div className="space-y-1">
                <div className="flex items-center space-x-4 pt-2 text-lg">
                  <Mail size={24} />
                  <p>{dbUser?.email}</p>
                </div>
                <div className="flex items-center space-x-4 text-lg">
                  {dbUser?.phone && <Phone size={24} />} 
                  <p>{dbUser?.phone}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-muted-foreground/30 mb-6 border-b">
        <div className="no-scrollbar flex w-full overflow-x-auto whitespace-nowrap">
          <button
            onClick={() => setActiveTab("basic-info")}
            className={`px-4 py-2 font-medium ${
              activeTab === "basic-info"
                ? "border-primary text-foreground border-b-2"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="flex items-center">
              <UserIcon size={18} className="mr-2" />
              Basic Information
            </span>
          </button>
          <button
            onClick={() => setActiveTab("professional")}
            className={`px-4 py-2 font-medium ${
              activeTab === "professional"
                ? "border-primary text-foreground border-b-2"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="flex items-center">
              <IdCard size={18} className="mr-2" />
              Professional Profile
            </span>
          </button>
          <button
            onClick={() => setActiveTab("profile-image")}
            className={`px-4 py-2 font-medium ${
              activeTab === "profile-image"
                ? "border-primary text-foreground border-b-2"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="flex items-center">
              <ImageIcon size={18} className="mr-2" />
              Profile Image
            </span>
          </button>
          <button
            onClick={() => setActiveTab("change-password")}
            className={`px-4 py-2 font-medium ${
              activeTab === "change-password"
                ? "border-primary text-foreground border-b-2"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="flex items-center">
              <Lock size={18} className="mr-2" />
              Change Password
            </span>
          </button>
        </div>
      </div>

      <div className="rounded-xl backdrop-blur-sm">
        {/* Basic Info Tab */}
        {activeTab === "basic-info" && <BasicInfoTab />}

        {/* Professional Profile Tab */}
        {activeTab === "professional" && <ProfessionalTab />}

        {/* Profile Image Tab */}
        {activeTab === "profile-image" && <ProfileImageTab />}

        {/* Change Password Tab */}
        {activeTab === "change-password" && <ChangePasswordTab />}
      </div>
    </div>
  );
}
