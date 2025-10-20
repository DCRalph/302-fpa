"use client";

import { useState } from "react";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Badge } from "~/components/ui/badge";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction,
} from "~/components/ui/alert-dialog";
import { api } from "~/trpc/react";
import { Check } from "lucide-react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from "~/components/ui/dialog";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "~/components/ui/select";

export default function ReportPage() {
    const [take] = useState(20);
    const [filter, setFilter] = useState<"all" | "post" | "comment">("all");
    const [selectedReport, setSelectedReport] = useState<string | null>(null);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

    const utils = api.useUtils();

    const { data } = api.member.blog.getReports.useQuery({ take });

    const deleteReport = api.member.blog.deleteReport.useMutation({
        onSuccess: () => {
            void utils.member.blog.getReports.invalidate();
        },
    });

    // Resolve/close dialog state
    const [openResolveDialog, setOpenResolveDialog] = useState(false);
    const [selectedResolveReport, setSelectedResolveReport] = useState<string | null>(null);
    const [resolveNote, setResolveNote] = useState("");
    const [resolveAction, setResolveAction] = useState<string | null>(null);

    const handleResolve = (id: string) => {
        setSelectedResolveReport(id);
        setResolveNote("");
        setOpenResolveDialog(true);
    };

    const confirmResolve = () => {
        // TODO: wire up to backend mutation to mark report closed/resolved and save admin note
        // For now this is UI-only: close dialog and reset state
        // Example: resolveReport.mutate({ id: selectedResolveReport, note: resolveNote })
        // reference selectedResolveReport so the compiler doesn't warn about it being unused
        void selectedResolveReport;
        setOpenResolveDialog(false);
        setSelectedResolveReport(null);
        setResolveNote("");
    };

    const confirmDelete = () => {
        if (!selectedReport) return;
        deleteReport.mutate({ id: selectedReport });
        setOpenDeleteDialog(false);
        setSelectedReport(null);
    };

    return (
        <div className="flex-1 space-y-6 p-3 sm:p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <h2 className="text-3xl font-bold">Reports</h2>
                <p className="text-muted-foreground">
                    Reports submitted about posts or comments.
                </p>
            </div>

            <div className="max-w-7xl mx-auto">
                {/* Filters */}
                <div className="mb-4 w-full">
                    <Tabs
                        value={filter}
                        onValueChange={(v: string) => setFilter(v as "all" | "post" | "comment")}
                    >
                        <TabsList>
                            <TabsTrigger value="all">All</TabsTrigger>
                            <TabsTrigger value="post">Posts</TabsTrigger>
                            <TabsTrigger value="comment">Comments</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                <div className="grid gap-4">
                    {data?.reports && data.reports.length > 0 ? (
                        data.reports
                            .filter((r) => {
                                if (filter === "all") return true;
                                return filter === "post" ? !!r.post : !!r.comment;
                            })
                            .map((r) => (
                                <Card key={r.id} className="overflow-hidden">
                                    <CardContent className="flex gap-4 items-start">
                                        {/* Left: icon / avatar placeholder */}
                                        <div className="flex-shrink-0">
                                            <div className="h-12 w-12 rounded-md bg-muted flex items-center justify-center text-muted-foreground">
                                                {r.post ? "P" : r.comment ? "C" : "?"}
                                            </div>
                                        </div>

                                        {/* Main content */}
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <div className="text-foreground font-semibold">
                                                        {r.post?.title ?? (r.comment ? `${r.comment.content.slice(0, 80)}${r.comment.content.length > 80 ? "..." : ""}` : "(no title)")}
                                                    </div>
                                                    <div className="text-muted-foreground text-sm mt-1">
                                                        Reported by <span className="text-foreground font-medium">{r.user?.name ?? "Unknown"}</span>
                                                        {" • "}
                                                        <span>Author: </span>
                                                        <span className="text-foreground font-medium">{r.post?.author?.name ?? r.comment?.author?.name ?? "Unknown"}</span>
                                                    </div>
                                                    <div className="text-muted-foreground text-sm mt-1">
                                                        {new Date(r.createdAt).toLocaleString()}
                                                    </div>

                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <Badge variant="secondary" className="text-xs">
                                                        {r.post ? "Post" : r.comment ? "Comment" : "Other"}
                                                    </Badge>
                                                    {/* <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={() => handleDelete(r.id)}
                                                        title="Delete report"
                                                    >
                                                        <Trash2 className="text-destructive h-4 w-4" />
                                                    </Button> */}
                                                </div>
                                            </div>

                                            <div className="mt-3 flex items-center gap-3">
                                                <div className="text-sm text-muted-foreground">Reason:</div>
                                                <div className="text-foreground font-medium text-sm">{r.reason}</div>
                                            </div>
                                            <div className="mt-3 flex items-center gap-3 justify-between">
                                                <div className="prose prose-blog dark:prose-invert text-foreground/80 mt-3 max-w-full">
                                                    <Markdown remarkPlugins={[remarkGfm]}>{r.details ?? "No additional details provided."}</Markdown>
                                                </div>

                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleResolve(r.id)}
                                                    className="ml-2"
                                                >
                                                    <Check className="h-4 w-4" /> Resolve
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                    ) : (
                        <Card>
                            <CardContent className="py-12 text-center">
                                <div className="mx-auto max-w-md">
                                    <h3 className="text-foreground mb-2 text-lg font-semibold">
                                        No reports found
                                    </h3>
                                    <p className="text-muted-foreground mb-4">There are no reports matching the selected filter.</p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            {/* Delete confirmation dialog */}
            <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete report?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this report? This action cannot be
                            undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setOpenDeleteDialog(false)}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive hover:bg-destructive/80"
                            onClick={confirmDelete}
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Resolve dialog (admin note) */}
            <Dialog open={openResolveDialog} onOpenChange={setOpenResolveDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Resolve report</DialogTitle>
                        <DialogDescription>
                            Add an admin note explaining the resolution. This note will be saved with the
                            activity and can be shown in the activity feed.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Label>
                                Action <span className="text-destructive">*</span>
                            </Label>
                            <Select
                                value={resolveAction ?? undefined}
                                onValueChange={(v) => setResolveAction(v)}
                            >
                                <SelectTrigger className="w-full mt-1">
                                    <SelectValue placeholder="Select an action" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="delete">Delete content</SelectItem>
                                    <SelectItem value="dismiss">Dismiss Report</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Admin note</Label>
                            <Textarea
                                value={resolveNote}
                                onChange={(e) => setResolveNote(e.target.value)}
                                placeholder="Optional note for the user or record"
                                className="min-h-[120px] mt-1"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="ghost">Cancel</Button>
                        </DialogClose>
                        <Button className="bg-primary ml-2" onClick={confirmResolve} disabled={!resolveAction}>
                            Resolve
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
