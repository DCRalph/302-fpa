"use client"

import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { useAuth } from "~/hooks/useAuth";
import { User, Upload, X } from "lucide-react";
// Avatar used for profile images
import { Avatar, AvatarImage, AvatarFallback } from "~/components/ui/avatar";
import { useState, useRef } from "react";
import { api } from "~/trpc/react";
import { toast } from "sonner";

export function ProfileImageTab() {
    const { dbUser } = useAuth();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const uploadProfileImage = api.member.files.uploadProfileImage.useMutation({
        onSuccess: () => {
            toast.success("Profile image updated successfully!");
            setSelectedFile(null);
            setPreviewUrl(null);
            // Refresh the page to show updated image
            window.location.reload();
        },
        onError: (error) => {
            toast.error(error.message || "Failed to update profile image");
        },
    });

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                toast.error("Please select an image file");
                return;
            }

            // Validate file size (5MB limit)
            if (file.size > 5 * 1024 * 1024) {
                toast.error("File size must be less than 5MB");
                return;
            }

            setSelectedFile(file);

            // Create preview URL
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            toast.error("Please select a file first");
            return;
        }

        try {
            // Convert file to base64
            const reader = new FileReader();
            reader.onload = () => {
                const base64Data = reader.result as string;
                const base64 = base64Data.split(',')[1]; // Remove data:image/...;base64, prefix

                if (!base64) {
                    toast.error("Failed to process file");
                    return;
                }

                const mutationData: {
                    filename: string;
                    mimeType?: string;
                    data: string;
                    sizeBytes: number;
                } = {
                    filename: selectedFile.name,
                    data: base64,
                    sizeBytes: selectedFile.size,
                };

                if (selectedFile.type) {
                    mutationData.mimeType = selectedFile.type;
                }

                uploadProfileImage.mutate(mutationData);
            };
            reader.readAsDataURL(selectedFile);
        } catch {
            toast.error("Failed to process file");
        }
    };

    const handleRemoveFile = () => {
        setSelectedFile(null);
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleChooseFile = () => {
        fileInputRef.current?.click();
    };

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
                        <div className="relative">
                            <Avatar className="mx-12 mb-8 h-[137px] w-[137px]">
                                {previewUrl ? (
                                    <AvatarImage src={previewUrl} alt="Preview" />
                                ) : dbUser?.image ? (
                                    <AvatarImage src={dbUser.image} alt={dbUser?.name ?? ""} />
                                ) : (
                                    <AvatarFallback>
                                        <User className="text-muted-foreground" size={48} />
                                    </AvatarFallback>
                                )}
                            </Avatar>
                            {previewUrl && (
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                                    onClick={handleRemoveFile}
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            )}
                        </div>

                        <div className="space-y-5 text-center">
                            <p className="text-foreground">
                                Upload a professional photo to personalize your profile
                            </p>

                            <div className="space-y-3">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />
                                <Button
                                    variant="outline"
                                    onClick={handleChooseFile}
                                    disabled={uploadProfileImage.isPending}
                                >
                                    <Upload className="mr-2 h-4 w-4" />
                                    Choose File
                                </Button>
                                <p className="text-muted-foreground pt-1 text-sm">
                                    Recommended: Square image, at least 200x200px, max 5MB
                                </p>
                            </div>
                        </div>

                        {selectedFile && (
                            <div className="w-full max-w-md space-y-3">
                                <div className="flex items-center justify-between rounded-lg border p-3">
                                    <div className="flex items-center space-x-3">
                                        <div className="h-8 w-8 rounded bg-muted flex items-center justify-center">
                                            <User className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">{selectedFile.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {(selectedFile.size / 1024).toFixed(1)} KB
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleRemoveFile}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                                <Button
                                    onClick={handleUpload}
                                    disabled={uploadProfileImage.isPending}
                                    className="w-full"
                                >
                                    {uploadProfileImage.isPending ? "Uploading..." : "Update Profile Image"}
                                </Button>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )

}