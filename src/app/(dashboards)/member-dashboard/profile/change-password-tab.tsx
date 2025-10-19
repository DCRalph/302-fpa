"use client";

import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { useRouter } from 'nextjs-toploader/app';
import { useState } from "react";
import { authClient } from "~/lib/auth-client";
import { CheckCircle, Shield, Key, Plus } from "lucide-react";
import { FaGoogle, FaGithub, FaFacebook, FaTwitter, FaLink } from "react-icons/fa";

export function ChangePasswordTab() {
  const utils = api.useUtils();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get user profile data including password status and OAuth connections
  const { data: profileData, isLoading: profileLoading } = api.member.profile.get.useQuery();

  const changePasswordMutation = api.member.profile.changePassword.useMutation({
    onSuccess: async () => {
      await utils.member.profile.get.invalidate();
      await utils.auth.me.invalidate();
      toast.success("Password updated successfully");
      router.push("/member-dashboard/profile");
    },
    onError: (err) => {
      toast.error((err as { message?: string })?.message ?? "Failed to update password");
    },
    onSettled: () => {
      setIsSubmitting(false);
    }
  });

  const setPasswordMutation = api.member.profile.setPassword?.useMutation({
    onSuccess: async () => {
      await utils.member.profile.get.invalidate();
      await utils.auth.me.invalidate();
      toast.success("Password set successfully");
      router.push("/member-dashboard/profile");
    },
    onError: (err) => {
      toast.error((err as { message?: string })?.message ?? "Failed to set password");
    },
    onSettled: () => {
      setIsSubmitting(false);
    }
  });

  const [changePasswordData, setChangePasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [setPasswordData, setSetPasswordData] = useState({
    password: "",
    confirmPassword: "",
  });

  // Password validation functions
  const validatePassword = (password: string) => {
    return {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
    };
  };

  const getPasswordValidation = (password: string) => {
    const validation = validatePassword(password);
    return {
      ...validation,
      allValid: Object.values(validation).every(Boolean),
    };
  };

  const getRequirementStyle = (isValid: boolean, password: string) => {
    if (!password) {
      return 'text-gray-500 dark:text-gray-400';
    }
    return isValid ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
  };

  const getRequirementDotStyle = (isValid: boolean, password: string) => {
    if (!password) {
      return 'bg-gray-400';
    }
    return isValid ? 'bg-green-500' : 'bg-red-500';
  };

  const handleChangePasswordInput = (field: string, value: string) => {
    setChangePasswordData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSetPasswordInput = (field: string, value: string) => {
    setSetPasswordData((prev) => ({ ...prev, [field]: value }));
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (changePasswordData.newPassword !== changePasswordData.confirmPassword) {
      toast.error("Confirm Password must match New Password");
      setIsSubmitting(false);
      return;
    }

    changePasswordMutation.mutate({
      newPassword: changePasswordData.newPassword,
      currentPassword: changePasswordData.currentPassword,
    });
  };

  const handleSetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (setPasswordData.password !== setPasswordData.confirmPassword) {
      toast.error("Confirm Password must match Password");
      setIsSubmitting(false);
      return;
    }

    setPasswordMutation?.mutate({
      password: setPasswordData.password,
    });
  };

  const handleLinkGoogleAccount = async () => {
    try {
      // Use Better Auth's linkSocial method to link Google account
      const { data, error } = await authClient.linkSocial({
        provider: "google",
        callbackURL: "/member-dashboard/profile"
      });

      if (error) {
        toast.error(error.message ?? 'Failed to link Google account');
        return;
      }

      if (data?.url) {
        // Redirect to Google OAuth flow
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error linking Google account:', error);
      toast.error('Failed to link Google account');
    }
  };

  if (profileLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const hasPassword = profileData?.hasPassword ?? false;

  const getProviderDisplayName = (providerId: string) => {
    switch (providerId) {
      case "google":
        return "Google";
      case "github":
        return "GitHub";
      case "facebook":
        return "Facebook";
      case "twitter":
        return "Twitter";
      default:
        return providerId.charAt(0).toUpperCase() + providerId.slice(1);
    }
  };

  const getProviderIcon = (providerId: string) => {
    switch (providerId) {
      case "google":
        return <FaGoogle />;
      case "github":
        return <FaGithub />;
      case "facebook":
        return <FaFacebook />;
      case "twitter":
        return <FaTwitter />;
      default:
        return <FaLink />;
    }
  };

  return (
    <div className="space-y-6">
      {/* OAuth Connections Section */}
      {profileData?.accounts && profileData?.accounts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <Shield className="h-6 w-6" />
              Connected Accounts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Your account is connected to the following services:
            </p>
            <div className="space-y-3">
              {profileData?.accounts.map((connection: { id: string; providerId: string; createdAt: Date }) => (
                <div
                  key={connection.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {getProviderIcon(connection.providerId)}
                    </span>
                    <div>
                      <p className="font-medium">
                        {getProviderDisplayName(connection.providerId)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Connected {new Date(connection.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Connected
                  </Badge>
                </div>
              ))}

              {/* Add Google Account Button */}
              {!profileData?.accounts.some((account: { providerId: string }) => account.providerId === "google") && (
                <div className="p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        <FaGoogle />
                      </span>
                      <div>
                        <p className="font-medium">Google Account</p>
                        <p className="text-sm text-muted-foreground">
                          Link your Google account for easy sign-in
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={handleLinkGoogleAccount}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Link Account
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Password Management Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <Key className="h-6 w-6" />
            Password Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {hasPassword ? (
            // User has a password - show change password form
            <div>
              <div className="mb-4 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                  <CheckCircle className="h-4 w-4" />
                  <span className="font-medium">Password is set</span>
                </div>
                <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                  You can change your password below.
                </p>
              </div>

              <form onSubmit={handleChangePasswordSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        placeholder="Enter your current password"
                        value={changePasswordData.currentPassword}
                        onChange={(e) => handleChangePasswordInput("currentPassword", e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        placeholder="Enter your new password"
                        value={changePasswordData.newPassword}
                        onChange={(e) => handleChangePasswordInput("newPassword", e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
                      <Input
                        id="confirmNewPassword"
                        type="password"
                        placeholder="Confirm your new password"
                        value={changePasswordData.confirmPassword}
                        onChange={(e) => handleChangePasswordInput("confirmPassword", e.target.value)}
                        required
                      />
                    </div>

                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Updating..." : "Update Password"}
                    </Button>
                  </div>

                  <div className="border-primary rounded-lg border bg-gradient-to-br from-blue-50 to-purple-50 p-4 dark:from-blue-950/20 dark:to-purple-950/20 h-fit">
                    <h4 className="mb-3 font-medium text-lg">Password Requirements:</h4>
                    <ul className="space-y-2 text-sm">
                      <li className={`flex items-center gap-2 ${getRequirementStyle(getPasswordValidation(changePasswordData.newPassword).length, changePasswordData.newPassword)}`}>
                        <div className={`w-2 h-2 rounded-full ${getRequirementDotStyle(getPasswordValidation(changePasswordData.newPassword).length, changePasswordData.newPassword)}`}></div>
                        At least 8 characters long
                      </li>
                      <li className={`flex items-center gap-2 ${getRequirementStyle(getPasswordValidation(changePasswordData.newPassword).uppercase, changePasswordData.newPassword)}`}>
                        <div className={`w-2 h-2 rounded-full ${getRequirementDotStyle(getPasswordValidation(changePasswordData.newPassword).uppercase, changePasswordData.newPassword)}`}></div>
                        Contains at least one uppercase letter
                      </li>
                      <li className={`flex items-center gap-2 ${getRequirementStyle(getPasswordValidation(changePasswordData.newPassword).lowercase, changePasswordData.newPassword)}`}>
                        <div className={`w-2 h-2 rounded-full ${getRequirementDotStyle(getPasswordValidation(changePasswordData.newPassword).lowercase, changePasswordData.newPassword)}`}></div>
                        Contains at least one lowercase letter
                      </li>
                      <li className={`flex items-center gap-2 ${getRequirementStyle(getPasswordValidation(changePasswordData.newPassword).number, changePasswordData.newPassword)}`}>
                        <div className={`w-2 h-2 rounded-full ${getRequirementDotStyle(getPasswordValidation(changePasswordData.newPassword).number, changePasswordData.newPassword)}`}></div>
                        Contains at least one number
                      </li>
                    </ul>
                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        <strong>Tip:</strong> Use a combination of letters, numbers, and symbols for better security.
                      </p>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          ) : (
            // User doesn't have a password - show set password form
            <div>
              <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
                  <Key className="h-4 w-4" />
                  <span className="font-medium">No password set</span>
                </div>
                <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
                  {profileData?.accounts && profileData?.accounts.length > 0
                    ? "You're currently signed in with a social account. You can set a password to also sign in with email and password."
                    : "Set a password to secure your account."
                  }
                </p>
              </div>

              <form onSubmit={handleSetPasswordSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        value={setPasswordData.password}
                        onChange={(e) => handleSetPasswordInput("password", e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Confirm your password"
                        value={setPasswordData.confirmPassword}
                        onChange={(e) => handleSetPasswordInput("confirmPassword", e.target.value)}
                        required
                      />
                    </div>

                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Setting..." : "Set Password"}
                    </Button>
                  </div>

                  <div className="border-primary rounded-lg border bg-gradient-to-br from-blue-50 to-purple-50 p-4 dark:from-blue-950/20 dark:to-purple-950/20 h-fit">
                    <h4 className="mb-3 font-medium text-lg">Password Requirements:</h4>
                    <ul className="space-y-2 text-sm">
                      <li className={`flex items-center gap-2 ${getRequirementStyle(getPasswordValidation(setPasswordData.password).length, setPasswordData.password)}`}>
                        <div className={`w-2 h-2 rounded-full ${getRequirementDotStyle(getPasswordValidation(setPasswordData.password).length, setPasswordData.password)}`}></div>
                        At least 8 characters long
                      </li>
                      <li className={`flex items-center gap-2 ${getRequirementStyle(getPasswordValidation(setPasswordData.password).uppercase, setPasswordData.password)}`}>
                        <div className={`w-2 h-2 rounded-full ${getRequirementDotStyle(getPasswordValidation(setPasswordData.password).uppercase, setPasswordData.password)}`}></div>
                        Contains at least one uppercase letter
                      </li>
                      <li className={`flex items-center gap-2 ${getRequirementStyle(getPasswordValidation(setPasswordData.password).lowercase, setPasswordData.password)}`}>
                        <div className={`w-2 h-2 rounded-full ${getRequirementDotStyle(getPasswordValidation(setPasswordData.password).lowercase, setPasswordData.password)}`}></div>
                        Contains at least one lowercase letter
                      </li>
                      <li className={`flex items-center gap-2 ${getRequirementStyle(getPasswordValidation(setPasswordData.password).number, setPasswordData.password)}`}>
                        <div className={`w-2 h-2 rounded-full ${getRequirementDotStyle(getPasswordValidation(setPasswordData.password).number, setPasswordData.password)}`}></div>
                        Contains at least one number
                      </li>
                    </ul>
                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        <strong>Tip:</strong> Use a combination of letters, numbers, and symbols for better security.
                      </p>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
