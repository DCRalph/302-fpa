"use client"

import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { useAuth } from "~/hooks/useAuth";
import { useState } from "react";
import { Badge } from "~/components/ui/badge";

export function BasicInfoTab() {
    const { dbUser } = useAuth();

    const [formData, setFormData] = useState({
        fullName: dbUser?.name,
        phone: dbUser?.phone,
        school: dbUser?.school,
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
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
                {/* Form Section */}
                <div className="lg:col-span-3">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl font-bold">
                                Basic Information
                            </CardTitle>
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
                                    value={`${formData.school}`}
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
                                <p className="text-muted-foreground text-sm">
                                    Email cannot be changed. Contact admin if needed.
                                </p>
                            </div>

                            <Button onClick={handleUpdateDetails}>Update Details</Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar - Membership Info */}
                <div className="space-y-6">
                    <Card className="border-primary bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
                        <CardHeader>
                            <CardTitle className="text-foreground text-base font-bold">
                                Membership Status
                                <div>
                                    <Badge className="mt-2">Active</Badge>
                                </div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <div className="font-semibold">Joined</div>
                                <div className="text-sm">
                                    {dbUser?.createdAt.toLocaleDateString("en-US")}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="font-semibold">User ID</div>
                                <div className="text-sm">{dbUser?.id}</div>
                            </div>

                            <div className="space-y-2">
                                <div className="font-semibold">Role</div>
                                <div className="text-sm">{dbUser?.role}</div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )

}