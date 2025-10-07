"use client";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { api } from "~/trpc/react";
import { Download } from "lucide-react";

export default function MyFiles() {
  const filesQuery = api.member.files.listFiles.useQuery();

  return (
    <div className="flex-1 space-y-6 p-3 sm:p-4 md:p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">My Files</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Filename</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filesQuery.data?.length ? (
                  filesQuery.data.map((f) => (
                    <TableRow key={f.id}>
                      <TableCell className="font-medium">{f.filename}</TableCell>
                      <TableCell>{f.mimeType ?? "Unknown"}</TableCell>
                      <TableCell>{f.sizeBytes ? `${(f.sizeBytes / 1024).toFixed(1)} KB` : "-"}</TableCell>
                      <TableCell>{new Date(f.createdAt).toLocaleDateString("en-GB")}</TableCell>
                      <TableCell className="text-right">
                        <Button asChild variant="outline" size="sm">
                          <a href={f.url} target="_blank" rel="noopener noreferrer">
                            <Download className="mr-2 h-4 w-4" /> Download
                          </a>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      {filesQuery.isLoading ? "Loading..." : "No files uploaded yet"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
