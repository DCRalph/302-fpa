"use client";

import { api } from "~/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Folder, File, Download, Calendar, HardDrive, Tag } from "lucide-react";

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
              {(data ?? []).map((file) => (
                <div key={file.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1 min-w-0">
                      <File className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{file.filename}</h4>
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
                          <div className="mt-2">
                            <Badge variant="secondary" className="text-xs">
                              {file.registration.conference?.name}
                            </Badge>
                            <Badge
                              variant={
                                file.registration.status === "confirmed" ? "default" :
                                  file.registration.status === "pending" ? "secondary" : "destructive"
                              }
                              className="text-xs ml-1"
                            >
                              {file.registration.status}
                            </Badge>
                          </div>
                        )}
                        {!file.registration && (
                          <div className="mt-2">
                            <Badge variant="outline" className="text-xs">
                              Not attached to registration
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
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
