"use client";

import { api } from "~/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Folder, File, Download, Calendar, HardDrive, Tag, User, Image, FileText, Archive, ExternalLink, BookOpen } from "lucide-react";
import Link from "next/link";

const getFileTypeInfo = (type: string) => {
  switch (type) {
    case "PROFILE_IMAGE":
      return { label: "Profile Image", icon: User, variant: "default" as const };
    case "REGISTRATION_ATTACHMENT":
      return { label: "Registration", icon: FileText, variant: "secondary" as const };
    case "BLOG_IMAGE":
      return { label: "Blog Image", icon: Image, variant: "outline" as const };
    case "OTHER":
      return { label: "Other", icon: Archive, variant: "outline" as const };
    default:
      return { label: "Unknown", icon: File, variant: "outline" as const };
  }
};

export default function MyFilesPage() {
  const { data, refetch, isFetching } = api.member.files.list.useQuery();
  const del = api.member.files.delete.useMutation({
    onSuccess: () => refetch(),
  });

  return (
    <div className="flex-1 space-y-6 p-3 sm:p-4 md:p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">My Files</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isFetching ? (
            <p className="text-sm text-muted-foreground">Refreshing...</p>
          ) : (data ?? []).length === 0 ? (
            <div className="text-center py-8">
              <Folder className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No files yet</h3>
              <p className="text-sm text-muted-foreground">Your uploaded files will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {(data ?? []).map((file) => {
                const typeInfo = getFileTypeInfo(file.type);
                const TypeIcon = typeInfo.icon;

                return (
                  <div key={file.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1 min-w-0">
                        <TypeIcon className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium text-sm truncate">{file.filename}</h4>
                            <Badge variant={typeInfo.variant} className="text-xs">
                              {typeInfo.label}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <HardDrive className="h-3 w-3" />
                              <span>{(file.sizeBytes / 1024).toFixed(1)} KB</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Tag className="h-3 w-3" />
                              <span>{file.mimeType}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span>{new Date(file.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          {file.registration && (
                            <div className="mt-2 space-y-1">
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="text-xs">
                                  Conference Registration
                                </Badge>
                                <Badge
                                  variant={
                                    file.registration.status === "confirmed" ? "default" :
                                      file.registration.status === "pending" ? "secondary" : "destructive"
                                  }
                                  className="text-xs"
                                >
                                  {file.registration.status}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <ExternalLink className="h-3 w-3" />
                                <Link
                                  href="/member-dashboard/conference-registration"
                                  className="hover:text-foreground transition-colors underline"
                                >
                                  {file.registration.conference?.name ?? "Conference Registration"}
                                </Link>
                              </div>
                            </div>
                          )}
                          {file.type === "BLOG_IMAGE" && (
                            <div className="mt-2 space-y-1">
                              <Badge variant="outline" className="text-xs">
                                Blog Post Image
                              </Badge>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <BookOpen className="h-3 w-3" />
                                {file.blogPost ? (
                                  <Link
                                    href={`/member-dashboard/community-blog/${file.blogPost.id}`}
                                    className="hover:text-foreground transition-colors underline"
                                  >
                                    {file.blogPost.title}
                                  </Link>
                                ) : (
                                  <Link
                                    href="/member-dashboard/community-blog"
                                    className="hover:text-foreground transition-colors underline"
                                  >
                                    View Blog Posts
                                  </Link>
                                )}
                              </div>
                            </div>
                          )}
                          {file.type === "PROFILE_IMAGE" && (
                            <div className="mt-2 space-y-1">
                              <Badge variant="default" className="text-xs">
                                Profile Image
                              </Badge>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <User className="h-3 w-3" />
                                <Link
                                  href="/member-dashboard/profile"
                                  className="hover:text-foreground transition-colors underline"
                                >
                                  View Profile
                                </Link>
                              </div>
                            </div>
                          )}
                          {!file.registration && file.type !== "BLOG_IMAGE" && file.type !== "PROFILE_IMAGE" && (
                            <div className="mt-2">
                              <Badge variant="outline" className="text-xs">
                                Standalone File
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="flex items-center space-x-1"
                        >
                          <a href={`/api/files/${file.id}/download`} target="_blank" rel="noreferrer">
                            <Download className="h-3 w-3" />
                            <span>Download</span>
                          </a>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => del.mutate({ id: file.id })}
                          className="text-destructive hover:text-destructive"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
