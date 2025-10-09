"use client"

import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { useAuth } from "~/hooks/useAuth";

export function ChangePasswordTab() {
    const { dbUser } = useAuth();

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">Change Password</CardTitle>
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

                        <div className="border-primary rounded-lg border bg-gradient-to-br from-blue-50 to-purple-50 p-4 dark:from-blue-950/20 dark:to-purple-950/20">
                            <h4 className="mb-2 font-medium">Password Requirements:</h4>
                            <ul className="text-foreground list-disc space-y-1 pl-4 text-sm">
                                <li>At least 8 characters long</li>
                                <li>Contains at least one uppercase letter</li>
                                <li>Contains at least one lowercase letter</li>
                                <li>Contains at least one number</li>
                            </ul>
                        </div>

                        <Button>Update Password</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )

}