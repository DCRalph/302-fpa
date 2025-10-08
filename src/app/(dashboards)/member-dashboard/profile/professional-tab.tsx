"use client"

import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { useAuth } from "~/hooks/useAuth";
import { useState } from "react";
import { Badge } from "lucide-react";
import { Textarea } from "~/components/ui/textarea";

export function ProfessionalTab() {
    const { dbUser } = useAuth();

    return (
        <div className="space-y-6">
            <div className="">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold">
                            Professional Profile
                        </CardTitle>
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
                            <Textarea
                                id="bio"
                                className="min-h-[120px] w-full rounded-md border px-3 py-2 text-base focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                placeholder="Tell us about your professional background and experience..."
                            />
                        </div>

                        <Button>Update Professional Profile</Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )

}