"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
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
    { enabled: !!emailId && open }
  );

  if (!email) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="text-sm font-medium text-gray-600">To:</label>
                <p className="text-sm">{email.to}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">From:</label>
                <p className="text-sm">{email.from}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Subject:</label>
                <p className="text-sm font-medium">{email.subject}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Sent:</label>
                <p className="text-sm">{format(new Date(email.createdAt), "PPp")}</p>
              </div>
              {email.replyTo && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Reply To:</label>
                  <p className="text-sm">{email.replyTo}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-600">Provider:</label>
                <Badge variant="outline" className="text-xs">
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
                <div className="border rounded-lg p-4 bg-white">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-semibold">HTML Email Content</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newWindow = window.open('', '_blank');
                        if (newWindow) {
                          newWindow.document.write(email.html);
                          newWindow.document.close();
                        }
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Open in New Tab
                    </Button>
                  </div>
                  <div
                    className="border rounded p-4 max-h-96 overflow-auto"
                    dangerouslySetInnerHTML={{ __html: email.html }}
                  />
                </div>
              </TabsContent>

              <TabsContent value="text" className="mt-4">
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h3 className="font-semibold mb-4">Plain Text Content</h3>
                  <pre className="whitespace-pre-wrap text-sm font-mono bg-white p-4 rounded border max-h-96 overflow-auto">
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
  const [sortBy, setSortBy] = useState<"createdAt" | "to" | "subject">("createdAt");
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
    <div className="flex-1 space-y-6 p-3 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-2">Email Management</h2>
        <p className="text-muted-foreground">
          View and manage all emails sent through the system.
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Emails</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEmails}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.emailsToday}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.emailsThisWeek}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.emailsThisMonth}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Search */}
      <div className="max-w-7xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Email List</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search emails by recipient, subject, or sender..."
                    value={search}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={sortBy} onValueChange={(value: "createdAt" | "to" | "subject") => setSortBy(value)}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt">Date</SelectItem>
                    <SelectItem value="to">Recipient</SelectItem>
                    <SelectItem value="subject">Subject</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortOrder} onValueChange={(value: "asc" | "desc") => setSortOrder(value)}>
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
              <div className="text-center py-8 text-muted-foreground">
                No emails found.
              </div>
            ) : (
              <div className="space-y-2">
                {emailsData?.emails.map((email) => (
                  <div
                    key={email.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleEmailClick(email.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium truncate">{email.to}</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900 truncate">{email.subject}</p>
                      <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(email.createdAt), "MMM d, yyyy 'at' h:mm a")}
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
                  Showing {((page - 1) * 20) + 1} to {Math.min(page * 20, emailsData.pagination.totalCount)} of {emailsData.pagination.totalCount} emails
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
