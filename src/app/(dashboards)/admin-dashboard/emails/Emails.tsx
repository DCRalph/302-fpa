"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
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
import { api } from "~/trpc/react";
import { format } from "date-fns";
import { Search, Mail, Eye, Calendar, User, Tag } from "lucide-react";
import { Spinner } from "~/components/ui/spinner";

interface EmailModalProps {
  emailId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function EmailModal({ emailId, open, onOpenChange }: EmailModalProps) {
  const { data: email, isLoading } = api.admin.emails.getById.useQuery(
    { id: emailId! },
    { enabled: !!emailId && open },
  );

  if (!email) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] max-w-4xl overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Details
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Spinner />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Email Header Info */}
            <div className="grid grid-cols-1 gap-4 rounded-lg border p-4 md:grid-cols-2">
              <div>
                <label className="text-foreground/60 text-sm font-medium">
                  To:
                </label>
                <p className="text-sm">{email.to}</p>
              </div>
              <div>
                <label className="text-foreground/60 text-sm font-medium">
                  Sent:
                </label>
                <p className="text-sm">
                  {format(new Date(email.createdAt), "PPp")}
                </p>
              </div>
              {email.replyTo && (
                <div>
                  <label className="text-foreground/60 text-sm font-medium">
                    Reply To:
                  </label>
                  <p className="text-sm">{email.replyTo}</p>
                </div>
              )}
              <div>
                <label className="text-foreground/60 text-sm font-medium">
                  Provider:
                </label>
                <Badge variant="outline" className="ml-2 text-xs">
                  {email.provider}
                </Badge>
              </div>
            </div>

            {/* Email Content Tabs */}
            <Tabs defaultValue="html" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="html">HTML Version</TabsTrigger>
                <TabsTrigger value="text">Text Version</TabsTrigger>
              </TabsList>

              <TabsContent value="html" className="mt-4">
                <div className="bg-background rounded-lg border p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-semibold">HTML Email Content</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newWindow = window.open("", "_blank");
                        if (newWindow) {
                          newWindow.document.write(email.html);
                          newWindow.document.close();
                        }
                      }}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Open in New Tab
                    </Button>
                  </div>
                  <div className="bg-background max-h-96 overflow-auto rounded border p-4 dark:bg-[#0b1220]">
                    <div
                      className="email-preview w-full"
                      dangerouslySetInnerHTML={{
                        __html:
                          `<style>
                                /* Force readable colors in dark mode for common text elements without touching backgrounds.
                                   This overrides inline color declarations (via !important) but does NOT set background-color
                                   so CTAs and hero backgrounds in email HTML are preserved. */
                                .dark .email-preview, .email-preview.dark { color: #e5e7eb !important; }

                                /* Common text-bearing elements */
                                .dark .email-preview p,
                                .dark .email-preview div,
                                .dark .email-preview span,
                                .dark .email-preview td,
                                .dark .email-preview th,
                                .dark .email-preview li,
                                .dark .email-preview small,
                                .dark .email-preview strong,
                                .dark .email-preview b,
                                .dark .email-preview em { color: #e5e7eb !important; }

                                /* Links */
                                .dark .email-preview a { color: #60a5fa !important; }

                                /* Headings retain stronger contrast */
                                .dark .email-preview h1,
                                .dark .email-preview h2,
                                .dark .email-preview h3,
                                .dark .email-preview h4,
                                .dark .email-preview h5,
                                .dark .email-preview h6 { color: #ffffff !important; }

                                /* Blockquote and code/table treatment */
                                .dark .email-preview blockquote { border-left-color: rgba(255,255,255,0.06) !important; color: #d1d5db !important; }
                                .dark .email-preview table,
                                .dark .email-preview pre,
                                .dark .email-preview code { background: rgba(255,255,255,0.03) !important; color: #e5e7eb !important; }

                                /* Images responsive */
                                .email-preview img { max-width:100% !important; height:auto !important; display:block !important; }

                                /* Preserve button/CTA backgrounds: don't override background-color; ensure text inherits readable color. */
                                .dark .email-preview a[role="button"],
                                .dark .email-preview a[class*="btn"],
                                .dark .email-preview .button,
                                .dark .email-preview button { color: inherit !important; }
                              </style>` + (email.html || ""),
                      }}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="text" className="mt-4">
                <div className="bg-background/60 rounded-lg border p-4">
                  <h3 className="mb-4 font-semibold">Plain Text Content</h3>
                  <pre className="bg-background max-h-96 overflow-auto rounded border p-4 font-mono text-sm whitespace-pre-wrap">
                    {email.text}
                  </pre>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function EmailsPage() {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"createdAt" | "to" | "subject">(
    "createdAt",
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const { data: emailsData, isLoading } = api.admin.emails.getAll.useQuery({
    page,
    limit: 20,
    search: search || undefined,
    sortBy,
    sortOrder,
  });

  const { data: stats } = api.admin.emails.getStats.useQuery();

  const handleEmailClick = (emailId: string) => {
    setSelectedEmailId(emailId);
    setModalOpen(true);
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1); // Reset to first page when searching
  };

  return (
    <div className="flex-1 space-y-6 p-3 sm:p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center gap-4">
          <div className="bg-primary/10 rounded-lg p-2.5">
            <Mail className="text-primary h-6 w-6" />
          </div>
          <div>
            <h2 className="text-3xl font-bold">Email Management</h2>
            <p className="text-muted-foreground mt-1">
              View and manage all emails sent through the system.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 md:grid-cols-4">
          <Card className="from-gradient-blue via-gradient-purple to-gradient-red border-0 bg-gradient-to-br from-25% via-50% to-75%">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">
                Total Emails
              </CardTitle>
              <Mail className="h-4 w-4 text-white/80" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {stats.totalEmails}
              </div>
            </CardContent>
          </Card>
          <Card className="from-gradient-blue via-gradient-purple to-gradient-red border-0 bg-gradient-to-br from-25% via-50% to-75%">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">
                Today
              </CardTitle>
              <Calendar className="h-4 w-4 text-white/80" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {stats.emailsToday}
              </div>
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
                {stats.emailsThisWeek}
              </div>
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
                {stats.emailsThisMonth}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Search */}
      <div className="mx-auto max-w-7xl">
        <Card>
          <CardHeader>
            <CardTitle>Email List</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search and Filters */}
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="flex-1">
                <div className="relative">
                  <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
                  <Input
                    placeholder="Search emails by recipient, subject, or sender..."
                    value={search}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select
                  value={sortBy}
                  onValueChange={(value: "createdAt" | "to" | "subject") =>
                    setSortBy(value)
                  }
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt">Date</SelectItem>
                    <SelectItem value="to">Recipient</SelectItem>
                    <SelectItem value="subject">Subject</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={sortOrder}
                  onValueChange={(value: "asc" | "desc") => setSortOrder(value)}
                >
                  <SelectTrigger className="w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">Desc</SelectItem>
                    <SelectItem value="asc">Asc</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Email List */}
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Spinner />
              </div>
            ) : emailsData?.emails.length === 0 ? (
              <div className="text-muted-foreground py-8 text-center">
                No emails found.
              </div>
            ) : (
              <div className="space-y-2">
                {emailsData?.emails.map((email) => (
                  <div
                    key={email.id}
                    className="hover:bg-muted flex cursor-pointer items-center justify-between rounded-lg border p-4 transition-colors"
                    onClick={() => handleEmailClick(email.id)}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="truncate text-sm font-medium">
                          {email.to}
                        </span>
                      </div>
                      <p className="text-foreground/90 truncate text-sm font-medium">
                        {email.subject}
                      </p>
                      <div className="text-foreground/60 mt-1 flex items-center gap-4 text-xs">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(
                            new Date(email.createdAt),
                            "MMM d, yyyy 'at' h:mm a",
                          )}
                        </span>
                        <span className="flex items-center gap-1">
                          <Tag className="h-3 w-3" />
                          {email.provider}
                        </span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {emailsData && emailsData.pagination.totalPages > 1 && (
              <div className="flex items-center justify-between pt-4">
                <div className="text-sm text-gray-500">
                  Showing {(page - 1) * 20 + 1} to{" "}
                  {Math.min(page * 20, emailsData.pagination.totalCount)} of{" "}
                  {emailsData.pagination.totalCount} emails
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={page >= emailsData.pagination.totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Email Modal */}
      <EmailModal
        emailId={selectedEmailId}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  );
}
