"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
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
  Music
} from "lucide-react";
import { Spinner } from "~/components/ui/spinner";
import { toast } from "sonner";

interface FileModalProps {
  fileId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function FileModal({ fileId, open, onOpenChange }: FileModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ filename: "", mimeType: "" });

  const { data: file, isLoading } = api.admin.files.getById.useQuery(
    { id: fileId! },
    { enabled: !!fileId && open }
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
    if (fileId && confirm("Are you sure you want to delete this file?")) {
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
        const contentDisposition = response.headers.get('content-disposition');
        const filename = contentDisposition
          ? contentDisposition.split('filename=')[1]?.replace(/"/g, '') ?? 'download'
          : 'download';

        // Create blob and download
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
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
    if (mimeType.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (mimeType.startsWith('video/')) return <Video className="h-4 w-4" />;
    if (mimeType.startsWith('audio/')) return <Music className="h-4 w-4" />;
    if (mimeType.includes('zip') || mimeType.includes('rar')) return <Archive className="h-4 w-4" />;
    if (mimeType.includes('pdf') || mimeType.includes('document')) return <FileText className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  if (!file) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getFileIcon(file.mimeType)}
            File Details
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-muted/50 rounded-lg">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Filename</Label>
                {isEditing ? (
                  <Input
                    value={editData.filename}
                    onChange={(e) => setEditData(prev => ({ ...prev, filename: e.target.value }))}
                    className="mt-1"
                  />
                ) : (
                  <p className="text-sm font-medium">{file.filename}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">MIME Type</Label>
                {isEditing ? (
                  <Input
                    value={editData.mimeType}
                    onChange={(e) => setEditData(prev => ({ ...prev, mimeType: e.target.value }))}
                    className="mt-1"
                  />
                ) : (
                  <p className="text-sm">{file.mimeType ?? 'Unknown'}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">File Size</Label>
                <p className="text-sm">{Math.round((file.sizeBytes / 1024) * 100) / 100} KB</p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Uploaded</Label>
                <p className="text-sm">{format(new Date(file.createdAt), "PPp")}</p>
              </div>
              {file.registration && (
                <>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Attached to Registration</Label>
                    <p className="text-sm">{file.registration.name} ({file.registration.email})</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Conference</Label>
                    <p className="text-sm">{file.registration.conference?.name ?? 'N/A'}</p>
                  </div>
                </>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              {isEditing ? (
                <>
                  <Button onClick={handleSave} disabled={updateMutation.isPending}>
                    {updateMutation.isPending ? <Spinner /> : 'Save Changes'}
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <Button onClick={handleDownload}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button variant="outline" onClick={handleEdit}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Details
                  </Button>
                  <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
                    {deleteMutation.isPending ? <Spinner /> : <Trash2 className="h-4 w-4 mr-2" />}
                    Delete File
                  </Button>
                </>
              )}
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
      const base64 = Buffer.from(arrayBuffer).toString('base64');

      uploadMutation.mutate({
        filename: filename ?? file.name,
        mimeType: file.type,
        data: base64,
        registrationId: registrationId ?? undefined,
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
          <p className="text-sm text-muted-foreground">
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
              <p className="text-xs text-muted-foreground">
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
            <p className="text-xs text-muted-foreground">
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
            <p className="text-xs text-muted-foreground">
              Link this file to a specific registration
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button onClick={handleUpload} disabled={!file || uploadMutation.isPending} className="flex-1">
              {uploadMutation.isPending ? <Spinner /> : 'Upload File'}
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
  const [sortBy, setSortBy] = useState<"createdAt" | "filename" | "sizeBytes" | "mimeType">("createdAt");
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
    if (mimeType.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (mimeType.startsWith('video/')) return <Video className="h-4 w-4" />;
    if (mimeType.startsWith('audio/')) return <Music className="h-4 w-4" />;
    if (mimeType.includes('zip') || mimeType.includes('rar')) return <Archive className="h-4 w-4" />;
    if (mimeType.includes('pdf') || mimeType.includes('document')) return <FileText className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">File Management</h1>
            <p className="text-muted-foreground mt-1">
              View and manage all files uploaded to the system.
            </p>
          </div>
          <Button onClick={() => setUploadModalOpen(true)} className="w-full sm:w-auto">
            <Upload className="h-4 w-4 mr-2" />
            Upload File
          </Button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-0 bg-gradient-to-br from-gradient-blue from-25% via-gradient-purple via-50% to-gradient-red to-75%">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">Total Files</CardTitle>
                <File className="h-4 w-4 text-white/80" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats.totalFiles.toLocaleString()}</div>
                <p className="text-xs text-white/80">All time</p>
              </CardContent>
            </Card>
            <Card className="border-0 bg-gradient-to-br from-gradient-blue from-25% via-gradient-purple via-50% to-gradient-red to-75%">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">Total Size</CardTitle>
                <HardDrive className="h-4 w-4 text-white/80" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats.totalSizeMB.toLocaleString()} MB</div>
                <p className="text-xs text-white/80">Storage used</p>
              </CardContent>
            </Card>
            <Card className="border-0 bg-gradient-to-br from-gradient-blue from-25% via-gradient-purple via-50% to-gradient-red to-75%">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">This Week</CardTitle>
                <Calendar className="h-4 w-4 text-white/80" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats.filesThisWeek}</div>
                <p className="text-xs text-white/80">Uploads this week</p>
              </CardContent>
            </Card>
            <Card className="border-0 bg-gradient-to-br from-gradient-blue from-25% via-gradient-purple via-50% to-gradient-red to-75%">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">This Month</CardTitle>
                <Calendar className="h-4 w-4 text-white/80" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats.filesThisMonth}</div>
                <p className="text-xs text-white/80">Uploads this month</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle>File List</CardTitle>
            <p className="text-sm text-muted-foreground">
              Browse and manage all uploaded files
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Search and Filters */}
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search files by name or type..."
                    value={search}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Select value={mimeType} onValueChange={setMimeType}>
                  <SelectTrigger className="w-full sm:w-[160px]">
                    <SelectValue placeholder="File Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {mimeTypes?.map((type) => type && (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={(value: "createdAt" | "filename" | "sizeBytes" | "mimeType") => setSortBy(value)}>
                  <SelectTrigger className="w-full sm:w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt">Date</SelectItem>
                    <SelectItem value="filename">Name</SelectItem>
                    <SelectItem value="sizeBytes">Size</SelectItem>
                    <SelectItem value="mimeType">Type</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortOrder} onValueChange={(value: "asc" | "desc") => setSortOrder(value)}>
                  <SelectTrigger className="w-full sm:w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">Desc</SelectItem>
                    <SelectItem value="asc">Asc</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* File List */}
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center gap-2">
                  <Spinner />
                  <p className="text-sm text-muted-foreground">Loading files...</p>
                </div>
              </div>
            ) : filesData?.files.length === 0 ? (
              <div className="text-center py-12">
                <File className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No files found</h3>
                <p className="text-muted-foreground mb-4">
                  {search || mimeType ? "Try adjusting your search or filters" : "Get started by uploading your first file"}
                </p>
                {!search && !mimeType && (
                  <Button onClick={() => setUploadModalOpen(true)}>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload File
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {filesData?.files.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors group"
                    onClick={() => handleFileClick(file.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex-shrink-0">
                          {getFileIcon(file.mimeType)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium truncate">{file.filename}</span>
                            <Badge variant="secondary" className="text-xs">
                              {file.mimeType ?? 'Unknown'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(file.createdAt), "MMM d, yyyy 'at' h:mm a")}
                            </span>
                            <span className="flex items-center gap-1">
                              <HardDrive className="h-3 w-3" />
                              {formatFileSize(file.sizeBytes)}
                            </span>
                            {file.registration && (
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {file.registration.name}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {filesData && filesData.pagination.totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t">
                <div className="text-sm text-muted-foreground">
                  Showing {((page - 1) * 20) + 1} to {Math.min(page * 20, filesData.pagination.totalCount)} of {filesData.pagination.totalCount.toLocaleString()} files
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
                    <span className="text-sm text-muted-foreground">Page</span>
                    <span className="text-sm font-medium">{page}</span>
                    <span className="text-sm text-muted-foreground">of {filesData.pagination.totalPages}</span>
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
      <UploadModal
        open={uploadModalOpen}
        onOpenChange={setUploadModalOpen}
      />
    </div>
  );
}

