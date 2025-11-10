"use client";

// Member files list page. Shows uploaded files and context-aware actions (download, delete).
// UI is responsive: items stack on small screens and actions become full-width for touch devices.
import { api } from "~/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Folder, File, Download, Calendar, HardDrive, Tag, User, Image, FileText, Archive, ExternalLink, BookOpen, Trash } from "lucide-react";
import Link from "next/link";
import { type RouterOutputs } from "~/trpc/react";
import { useState } from "react";
import DeleteDialog from "~/components/delete-dialog";

type File = RouterOutputs["member"]["files"]["list"][number];


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
  const utils = api.useUtils();
  const { data, refetch, isFetching } = api.member.files.list.useQuery();
  const deleteFileMutation = api.member.files.delete.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.member.files.list.invalidate(),
        utils.member.registration.getRegistrationFiles.invalidate(),
        refetch()
      ]);
    },
  });

  // Accept the file object directly (button passes `file`) and guard before mutating.
  const handleDeleteFile = (file: File) => {
    deleteFileMutation.mutate({ id: file.id });
  };

  // Delete dialog state
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);

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
                  <div key={file.id} className="border rounded-lg p-3 sm:p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <TypeIcon className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h4 className="font-medium text-sm truncate max-w-full">{file.filename}</h4>
                            <Badge variant={typeInfo.variant} className="text-[10px] sm:text-xs">
                              {typeInfo.label}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <HardDrive className="h-3 w-3" />
                              <span>{(file.sizeBytes / 1024).toFixed(1)} KB</span>
                            </div>
                            <div className="flex items-center gap-1 min-w-0">
                              <Tag className="h-3 w-3" />
                              <span className="truncate max-w-[200px] sm:max-w-none">{file.mimeType}</span>
                            </div>
                            <div className="flex items-center gap-1">
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
                      {/* Actions: on mobile use a 2-column grid; on larger screens show inline buttons aligned to the right */}
                      <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:space-x-2 sm:ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="flex items-center justify-center gap-1 w-full sm:w-auto"
                        >
                          <a href={`/api/files/${file.id}/download`} target="_blank" rel="noreferrer">
                            <Download className="h-3 w-3" />
                            <span>Download</span>
                          </a>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={deleteFileMutation.isPending}
                          onClick={() => setDeleteDialogOpen(true)}
                          className="w-full sm:w-auto text-destructive hover:text-destructive"
                        >
                          <Trash className="h-3 w-3" />
                          {deleteFileMutation.isPending ? 'Deleting...' : 'Delete'}
                        </Button>

                        <DeleteDialog
                          open={isDeleteDialogOpen}
                          onOpenChange={setDeleteDialogOpen}
                          title="Confirm Delete"
                          description={`Are you sure you want to delete the file "${file.filename}"? This action cannot be undone.`}
                          onDelete={() => handleDeleteFile(file)}
                        />
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
