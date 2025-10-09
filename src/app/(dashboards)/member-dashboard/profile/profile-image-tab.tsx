"use client"

import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { useAuth } from "~/hooks/useAuth";
import { User } from "lucide-react";
import Image from "next/image";

export function ProfileImageTab() {
    const { dbUser } = useAuth();

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">
                        Profile Image
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex flex-col items-center space-y-6">
                        {/* Current Profile Image */}
                        {dbUser?.image ? (
                            <Image
                                src={dbUser.image}
                                alt=""
                                className="mx-12 mb-8 h-[137px] w-[137px] rounded-full"
                                width={137}
                                height={137}
                            />
                        ) : (
                            <div className="bg-muted flex h-[137px] w-[137px] items-center justify-center rounded-full">
                                <User className="text-muted-foreground" size={48} />
                            </div>
                        )}

                        <div className="space-y-5 text-center">
                            <p className="text-foreground">
                                Upload a professional photo to personalize your profile
                            </p>

                            <div className="space-y-3">
                                <Button variant="outline">Choose File</Button>
                                <p className="text-muted-foreground pt-1 text-sm">
                                    Recommended: Square image, at least 200x200px
                                </p>
                            </div>
                        </div>

                        <Button>Update Profile Image</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )

}