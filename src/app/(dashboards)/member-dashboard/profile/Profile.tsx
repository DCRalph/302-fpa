"use client";

import { User, Mail, Phone, IdCard, ImageIcon, Lock, UserIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { useAuth } from "~/hooks/useAuth";
import Image from "next/image";
import { useState } from "react";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import { Textarea } from "~/components/ui/textarea";
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
                <div className="bg-muted flex h-8 w-8 items-center justify-center rounded-full">
                  <User className="text-muted-foreground h-4 w-4" />
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
                  <Phone size={24} />
                  <p>{dbUser?.phone}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-muted-foreground/30">
        <div className="flex overflow-x-auto no-scrollbar whitespace-nowrap w-full">
          <button
            onClick={() => setActiveTab("basic-info")}
            className={`px-4 py-2 font-medium ${activeTab === "basic-info"
              ? "border-b-2 border-primary text-foreground"
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
            className={`px-4 py-2 font-medium ${activeTab === "professional"
              ? "border-b-2 border-primary text-foreground"
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
            className={`px-4 py-2 font-medium ${activeTab === "profile-image"
              ? "border-b-2 border-primary text-foreground"
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
            className={`px-4 py-2 font-medium ${activeTab === "change-password"
              ? "border-b-2 border-primary text-foreground"
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
