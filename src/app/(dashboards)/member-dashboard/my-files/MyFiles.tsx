"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

export default function MyFilesPage() {
  const [url, setUrl] = useState("");
  const [filename, setFilename] = useState("");

  const { data, refetch, isFetching } = api.member.files.list.useQuery();
  const addByUrl = api.member.files.addByUrl.useMutation({
    onSuccess: () => refetch(),
  });
  const del = api.member.files.delete.useMutation({
    onSuccess: () => refetch(),
  });

  return (
    <div className="flex-1 space-y-6 p-3 sm:p-4 md:p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Upload by URL</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-3">
          <Input placeholder="https://..." value={url} onChange={(e) => setUrl(e.target.value)} />
          <Input placeholder="filename.ext" value={filename} onChange={(e) => setFilename(e.target.value)} />
          <Button onClick={() => addByUrl.mutate({ url, filename })} disabled={!url || !filename || addByUrl.isPending}>
            {addByUrl.isPending ? "Adding..." : "Add"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">My Files</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {(data ?? []).map((f) => (
            <div key={f.id} className="flex items-center justify-between rounded border p-2">
              <a href={f.url} target="_blank" rel="noreferrer" className="truncate">{f.filename}</a>
              <Button variant="outline" size="sm" onClick={() => del.mutate({ id: f.id })}>
                Delete
              </Button>
            </div>
          ))}
          {isFetching && <p className="text-sm text-muted-foreground">Refreshing...</p>}
        </CardContent>
      </Card>
    </div>
  );
}
