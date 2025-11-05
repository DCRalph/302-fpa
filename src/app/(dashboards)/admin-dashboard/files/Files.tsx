"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Label } from "~/components/ui/label";
import { api } from "~/trpc/react";
import { format } from "date-fns";
import {
  Search,
  File,
  Eye,
  Calendar,
  User,
  Download,
  Edit,
  Trash2,
  Upload,
  HardDrive,
  FileText,
  Image,
  Archive,
  Video,
  Music,
  ExternalLink,
  BookOpen,
  Folder,
} from "lucide-react";
import Link from "next/link";
import { Spinner } from "~/components/ui/spinner";
import { toast } from "sonner";
import DeleteDialog from "~/components/delete-dialog";

interface FileModalProps {
  fileId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function FileModal({ fileId, open, onOpenChange }: FileModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ filename: "", mimeType: "" });

  // Dialogs
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const { data: file, isLoading } = api.admin.files.getById.useQuery(
    { id: fileId! },
    { enabled: !!fileId && open },
  );

  const utils = api.useUtils();
  const updateMutation = api.admin.files.update.useMutation({
    onSuccess: () => {
      toast.success("File updated successfully");
      setIsEditing(false);
      void utils.admin.files.getAll.invalidate();
      void utils.admin.files.getById.invalidate({ id: fileId! });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = api.admin.files.delete.useMutation({
    onSuccess: () => {
      toast.success("File deleted successfully");
      onOpenChange(false);
      void utils.admin.files.getAll.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleEdit = () => {
    if (file) {
      setEditData({
        filename: file.filename,
        mimeType: file.mimeType ?? "",
      });
      setIsEditing(true);
    }
  };

  const handleSave = () => {
    if (fileId) {
      updateMutation.mutate({
        id: fileId,
        ...editData,
      });
    }
  };

  const handleDelete = () => {
    if (fileId) {
      deleteMutation.mutate({ id: fileId });
    }
  };

  const handleDownload = async () => {
    if (fileId) {
      try {
        // Use the new API route for downloading
        const response = await fetch(`/api/files/${fileId}/download`);

        if (!response.ok) {
          throw new Error(`Download failed: ${response.status}`);
        }

        // Get the filename from the Content-Disposition header
        const contentDisposition = response.headers.get("content-disposition");
        const filename = contentDisposition
          ? (contentDisposition.split("filename=")[1]?.replace(/"/g, "") ??
            "download")
          : "download";

        // Create blob and download
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success("File downloaded successfully");
      } catch (error) {
        console.error("Download error:", error);
        toast.error("Failed to download file");
      }
    }
  };

  const getFileIcon = (mimeType: string | null) => {
    if (!mimeType) return <File className="h-4 w-4" />;
    // eslint-disable-next-line
    if (mimeType.startsWith("image/")) return <Image className="h-4 w-4" />;
    if (mimeType.startsWith("video/")) return <Video className="h-4 w-4" />;
    if (mimeType.startsWith("audio/")) return <Music className="h-4 w-4" />;
    if (mimeType.includes("zip") || mimeType.includes("rar"))
      return <Archive className="h-4 w-4" />;
    if (mimeType.includes("pdf") || mimeType.includes("document"))
      return <FileText className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  if (!file) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-4xl overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getFileIcon(file.mimeType)}
            File Details
          </DialogTitle>
          <p className="text-muted-foreground text-sm">
            View and manage file information
          </p>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Spinner />
          </div>
        ) : (
          <div className="space-y-6">
            {/* File Header Info */}
            <div className="bg-muted/50 grid grid-cols-1 gap-6 rounded-lg p-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-muted-foreground text-sm font-medium">
                  Filename
                </Label>
                {isEditing ? (
                  <Input
                    value={editData.filename}
                    onChange={(e) =>
                      setEditData((prev) => ({
                        ...prev,
                        filename: e.target.value,
                      }))
                    }
                    className="mt-1"
                  />
                ) : (
                  <p className="text-sm font-medium">{file.filename}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground text-sm font-medium">
                  MIME Type
                </Label>
                {isEditing ? (
                  <Input
                    value={editData.mimeType}
                    onChange={(e) =>
                      setEditData((prev) => ({
                        ...prev,
                        mimeType: e.target.value,
                      }))
                    }
                    className="mt-1"
                  />
                ) : (
                  <p className="text-sm">{file.mimeType ?? "Unknown"}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground text-sm font-medium">
                  File Size
                </Label>
                <p className="text-sm">
                  {Math.round((file.sizeBytes / 1024) * 100) / 100} KB
                </p>
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground text-sm font-medium">
                  Uploaded
                </Label>
                <p className="text-sm">
                  {format(new Date(file.createdAt), "PPp")}
                </p>
              </div>
              {file.registration && (
                <>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground text-sm font-medium">
                      Attached to Registration
                    </Label>
                    <div className="flex items-center gap-2">
                      <p className="text-sm">
                        {file.registration.name} ({file.registration.email})
                      </p>
                      <Link
                        href={`/admin-dashboard/manage-conferences/${file.registration.conference?.id ?? ""}/registrations?registrationId=${file.registration.id}`}
                        className="text-blue-600 transition-colors hover:text-blue-800"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground text-sm font-medium">
                      Conference
                    </Label>
                    <p className="text-sm">
                      {file.registration.conference?.name ?? "N/A"}
                    </p>
                  </div>
                </>
              )}
              {file.blogPost && (
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-sm font-medium">
                    Blog Post
                  </Label>
                  <div className="flex items-center gap-2">
                    <p className="text-sm">{file.blogPost.title}</p>
                    <Link
                      href={`/member-dashboard/community-blog/${file.blogPost.id}`}
                      className="text-blue-600 transition-colors hover:text-blue-800"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </div>
                  <p className="text-muted-foreground text-xs">
                    Status: {file.blogPost.published ? "Published" : "Draft"}
                  </p>
                </div>
              )}
              {!file.registration && !file.blogPost && (
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-sm font-medium">
                    File Type
                  </Label>
                  <p className="text-sm">
                    {file.type === "PROFILE_IMAGE"
                      ? "Profile Image"
                      : file.type === "BLOG_IMAGE"
                        ? "Blog Image"
                        : file.type === "REGISTRATION_ATTACHMENT"
                          ? "Registration Attachment"
                          : "Other"}
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              {isEditing ? (
                <>
                  <Button
                    onClick={handleSave}
                    disabled={updateMutation.isPending}
                  >
                    {updateMutation.isPending ? <Spinner /> : "Save Changes"}
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <Button onClick={handleDownload}>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                  <Button variant="outline" onClick={handleEdit}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Details
                  </Button>
                  <Button
                    variant="destructive"
                    disabled={deleteMutation.isPending}
                    onClick={() => setOpenDeleteDialog(true)}
                  >
                    {deleteMutation.isPending ? (
                      <Spinner />
                    ) : (
                      <Trash2 className="mr-2 h-4 w-4" />
                    )}
                    Delete File
                  </Button>
                </>
              )}

              {/* Delete dialog */}
              <DeleteDialog
                open={openDeleteDialog}
                title="Delete this File?"
                description="This action cannot be undone. This will permanently delete your file and remove it from the system."
                onOpenChange={setOpenDeleteDialog}
                onDelete={handleDelete}
              />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

interface UploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function UploadModal({ open, onOpenChange }: UploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [filename, setFilename] = useState("");
  const [registrationId, setRegistrationId] = useState("");

  const utils = api.useUtils();
  const uploadMutation = api.admin.files.upload.useMutation({
    onSuccess: () => {
      toast.success("File uploaded successfully");
      onOpenChange(false);
      setFile(null);
      setFilename("");
      setRegistrationId("");
      void utils.admin.files.getAll.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFilename(selectedFile.name);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString("base64");

      uploadMutation.mutate({
        filename: filename ?? file.name,
        mimeType: file.type,
        data: base64,
        registrationId: registrationId ?? undefined,
        fileType: "OTHER", // Default to OTHER for admin uploads
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to process file");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Upload File</DialogTitle>
          <p className="text-muted-foreground text-sm">
            Upload a new file to the system
          </p>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="file">Select File</Label>
            <Input
              id="file"
              type="file"
              onChange={handleFileSelect}
              className="mt-1"
            />
            {file && (
              <p className="text-muted-foreground text-xs">
                Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="filename">Filename</Label>
            <Input
              id="filename"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="Enter custom filename (optional)"
              className="mt-1"
            />
            <p className="text-muted-foreground text-xs">
              Leave empty to use the original filename
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="registrationId">Registration ID (Optional)</Label>
            <Input
              id="registrationId"
              value={registrationId}
              onChange={(e) => setRegistrationId(e.target.value)}
              placeholder="Enter registration ID to attach file"
              className="mt-1"
            />
            <p className="text-muted-foreground text-xs">
              Link this file to a specific registration
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleUpload}
              disabled={!file || uploadMutation.isPending}
              className="flex-1"
            >
              {uploadMutation.isPending ? <Spinner /> : "Upload File"}
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function FilesPage() {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<
    "createdAt" | "filename" | "sizeBytes" | "mimeType"
  >("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [mimeType, setMimeType] = useState<string>("");
  const [page, setPage] = useState(1);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  const { data: filesData, isLoading } = api.admin.files.getAll.useQuery({
    page,
    limit: 20,
    search: search || undefined,
    sortBy,
    sortOrder,
    mimeType: mimeType || undefined,
  });

  const { data: stats } = api.admin.files.getStats.useQuery();
  const { data: mimeTypes } = api.admin.files.getMimeTypes.useQuery();

  const handleFileClick = (fileId: string) => {
    setSelectedFileId(fileId);
    setModalOpen(true);
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const getFileIcon = (mimeType: string | null) => {
    if (!mimeType) return <File className="h-4 w-4" />;
    // eslint-disable-next-line
    if (mimeType.startsWith("image/")) return <Image className="h-4 w-4" />;
    if (mimeType.startsWith("video/")) return <Video className="h-4 w-4" />;
    if (mimeType.startsWith("audio/")) return <Music className="h-4 w-4" />;
    if (mimeType.includes("zip") || mimeType.includes("rar"))
      return <Archive className="h-4 w-4" />;
    if (mimeType.includes("pdf") || mimeType.includes("document"))
      return <FileText className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileTypeInfo = (type: string) => {
    switch (type) {
      case "PROFILE_IMAGE":
        return { label: "Profile Image", variant: "default" as const };
      case "REGISTRATION_ATTACHMENT":
        return { label: "Registration", variant: "secondary" as const };
      case "BLOG_IMAGE":
        return { label: "Blog Image", variant: "outline" as const };
      case "OTHER":
        return { label: "Other", variant: "outline" as const };
      default:
        return { label: "Unknown", variant: "outline" as const };
    }
  };

  return (
    <div className="flex-1 space-y-6 p-3 sm:p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 rounded-lg p-2.5">
              <Folder className="text-primary h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                File Management
              </h1>
              <p className="text-muted-foreground mt-1">
                View and manage all files uploaded to the system.
              </p>
            </div>
          </div>
          <Button
            onClick={() => setUploadModalOpen(true)}
            className="w-full sm:w-auto"
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload File
          </Button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="from-gradient-blue via-gradient-purple to-gradient-red border-0 bg-gradient-to-br from-25% via-50% to-75%">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">
                  Total Files
                </CardTitle>
                <File className="h-4 w-4 text-white/80" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {stats.totalFiles.toLocaleString()}
                </div>
                <p className="text-xs text-white/80">All time</p>
              </CardContent>
            </Card>
            <Card className="from-gradient-blue via-gradient-purple to-gradient-red border-0 bg-gradient-to-br from-25% via-50% to-75%">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">
                  Total Size
                </CardTitle>
                <HardDrive className="h-4 w-4 text-white/80" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {stats.totalSizeMB.toLocaleString()} MB
                </div>
                <p className="text-xs text-white/80">Storage used</p>
              </CardContent>
            </Card>
            <Card className="from-gradient-blue via-gradient-purple to-gradient-red border-0 bg-gradient-to-br from-25% via-50% to-75%">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">
                  This Week
                </CardTitle>
                <Calendar className="h-4 w-4 text-white/80" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {stats.filesThisWeek}
                </div>
                <p className="text-xs text-white/80">Uploads this week</p>
              </CardContent>
            </Card>
            <Card className="from-gradient-blue via-gradient-purple to-gradient-red border-0 bg-gradient-to-br from-25% via-50% to-75%">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">
                  This Month
                </CardTitle>
                <Calendar className="h-4 w-4 text-white/80" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {stats.filesThisMonth}
                </div>
                <p className="text-xs text-white/80">Uploads this month</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle>File List</CardTitle>
            <p className="text-muted-foreground text-sm">
              Browse and manage all uploaded files
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Search and Filters */}
            <div className="flex flex-col gap-4 lg:flex-row">
              <div className="flex-1">
                <div className="relative">
                  <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
                  <Input
                    placeholder="Search files by name or type..."
                    value={search}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Select value={mimeType} onValueChange={setMimeType}>
                  <SelectTrigger className="w-full sm:w-[160px]">
                    <SelectValue placeholder="File Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {mimeTypes?.map(
                      (type) =>
                        type && (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ),
                    )}
                  </SelectContent>
                </Select>
                <div className="flex space-x-2">
                  <Select
                    value={sortBy}
                    onValueChange={(
                      value: "createdAt" | "filename" | "sizeBytes" | "mimeType",
                    ) => setSortBy(value)}
                  >
                    <SelectTrigger className="w-[75%] sm:w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="createdAt">Date</SelectItem>
                      <SelectItem value="filename">Name</SelectItem>
                      <SelectItem value="sizeBytes">Size</SelectItem>
                      <SelectItem value="mimeType">Type</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={sortOrder}
                    onValueChange={(value: "asc" | "desc") => setSortOrder(value)}
                  >
                    <SelectTrigger className="w-[50%] sm:w-[100px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="desc">Desc</SelectItem>
                      <SelectItem value="asc">Asc</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* File List */}
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center gap-2">
                  <Spinner />
                </div>
              </div>
            ) : filesData?.files.length === 0 ? (
              <div className="py-12 text-center">
                <File className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                <h3 className="mb-2 text-lg font-medium">No files found</h3>
                <p className="text-muted-foreground mb-4">
                  {search || mimeType
                    ? "Try adjusting your search or filters"
                    : "Get started by uploading your first file"}
                </p>
                {!search && !mimeType && (
                  <Button onClick={() => setUploadModalOpen(true)}>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload File
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {filesData?.files.map((file) => {
                  const typeInfo = getFileTypeInfo(
                    (file.type as string) ?? "OTHER",
                  );

                  return (
                    <div
                      key={file.id}
                      className="hover:bg-muted/50 group flex cursor-pointer items-center justify-between rounded-lg border p-4 transition-colors"
                      onClick={() => handleFileClick(file.id)}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex items-center gap-3">
                          <div className="flex-shrink-0">
                            {getFileIcon(file.mimeType)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="truncate text-sm font-medium">
                                {file.filename}
                              </span>
                              <Badge
                                variant={typeInfo.variant}
                                className="text-xs"
                              >
                                {typeInfo.label}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                {file.mimeType ?? "Unknown"}
                              </Badge>
                            </div>
                            <div className="text-muted-foreground mt-1 flex items-center gap-4 text-xs">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {format(
                                  new Date(file.createdAt),
                                  "MMM d, yyyy 'at' h:mm a",
                                )}
                              </span>
                              <span className="flex items-center gap-1">
                                <HardDrive className="h-3 w-3" />
                                {formatFileSize(file.sizeBytes)}
                              </span>
                              {file.registration && (
                                <span className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  <Link
                                    href={`/admin-dashboard/manage-conferences/${file.registration.conference?.id ?? ""}/registrations?registrationId=${file.registration.id}`}
                                    className="hover:text-foreground underline transition-colors"
                                  >
                                    {file.registration.name ?? "Unknown"}
                                  </Link>
                                </span>
                              )}
                              {file.blogPost && (
                                <span className="flex items-center gap-1">
                                  <BookOpen className="h-3 w-3" />
                                  <Link
                                    href={`/member-dashboard/community-blog/${file.blogPost.id}`}
                                    className="hover:text-foreground underline transition-colors"
                                  >
                                    {file.blogPost.title}
                                  </Link>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {filesData && filesData.pagination.totalPages > 1 && (
              <div className="flex flex-col items-center justify-between gap-4 border-t pt-6 sm:flex-row">
                <div className="text-muted-foreground text-sm">
                  Showing {(page - 1) * 20 + 1} to{" "}
                  {Math.min(page * 20, filesData.pagination.totalCount)} of{" "}
                  {filesData.pagination.totalCount.toLocaleString()} files
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground text-sm">Page</span>
                    <span className="text-sm font-medium">{page}</span>
                    <span className="text-muted-foreground text-sm">
                      of {filesData.pagination.totalPages}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={page >= filesData.pagination.totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* File Modal */}
      <FileModal
        fileId={selectedFileId}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />

      {/* Upload Modal */}
      <UploadModal open={uploadModalOpen} onOpenChange={setUploadModalOpen} />
    </div>
  );
}
