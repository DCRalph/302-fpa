"use client";

// Admin manage members page. Shows stats and a searchable list of members.
// Handles loading, empty and list states so the spinner and 'no members' UI never show together.

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "~/components/ui/tabs";
import { api } from "~/trpc/react";
import { Spinner } from "~/components/ui/spinner";
import {
  Edit,
  Mail,
  Phone,
  Calendar,
  User2,
  Search,
  Users,
  CheckCircle,
  UserX,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

function ApprovalDialog({
  member,
  open,
  onOpenChange,
}: {
  member: { id: string; name: string | null; email: string | null } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const utils = api.useUtils();
  const approveMutation = api.admin.members.approve.useMutation({
    onSuccess: async () => {
      toast.success("Member approved successfully");
      await utils.admin.members.getAll.invalidate();
      await utils.admin.members.getStats.invalidate();
      onOpenChange(false);
    },
    onError: (err) => {
      toast.error(err.message ?? "Failed to approve member");
    },
  });

  if (!member) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Approve Member</DialogTitle>
          <DialogDescription>
            Review member details before approving access to the platform.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <User2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Name:</span>
              <span className="text-sm">{member.name ?? "Not provided"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Email:</span>
              <span className="text-sm">{member.email ?? "Not provided"}</span>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={approveMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={() => approveMutation.mutate({ id: member.id })}
            disabled={approveMutation.isPending}
          >
            {approveMutation.isPending ? (
              <>
                <Spinner className="mr-2 h-4 w-4" />
                Approving...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Approve Member
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function ManageMembersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"approved" | "unapproved">(
    "unapproved"
  );
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<{
    id: string;
    name: string | null;
    email: string | null;
  } | null>(null);

  const { data: approvedMembers, isLoading: isLoadingApproved } =
    api.admin.members.getAll.useQuery(
      {
        search: searchQuery || undefined,
        approved: true,
      },
      { enabled: activeTab === "approved" }
    );

  const { data: unapprovedMembers, isLoading: isLoadingUnapproved } =
    api.admin.members.getAll.useQuery(
      {
        search: searchQuery || undefined,
        approved: false,
      },
      { enabled: activeTab === "unapproved" }
    );

  const { data: stats } = api.admin.members.getStats.useQuery();

  const members = activeTab === "approved" ? approvedMembers : unapprovedMembers;
  const isLoading = activeTab === "approved" ? isLoadingApproved : isLoadingUnapproved;

  const handleApproveClick = (member: {
    id: string;
    name: string | null;
    email: string | null;
  }) => {
    setSelectedMember(member);
    setApprovalDialogOpen(true);
  };

  return (
    <main className="flex-1 space-y-6 p-3 sm:p-4 md:p-8">
      <div className="mb-6 flex items-center gap-4 max-w-7xl mx-auto">
        <div className="bg-primary/10 rounded-lg p-2.5">
          <Users className="text-primary h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Manage Members</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            View and manage all registered members
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-5 max-w-7xl mx-auto">
          <Card className="from-gradient-blue via-gradient-purple to-gradient-red border-0 bg-gradient-to-br from-25% via-50% to-75%">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium text-white">
                Total Members
              </CardTitle>
              <User2 className="text-white" size={24} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {stats.totalMembers}
              </div>
              <p className="text-sm text-white/80">Regular users</p>
            </CardContent>
          </Card>
          <Card className="from-gradient-blue via-gradient-purple to-gradient-red border-0 bg-gradient-to-br from-25% via-50% to-75%">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium text-white">
                Administrators
              </CardTitle>
              <User2 className="text-white" size={24} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {stats.totalAdmins}
              </div>
              <p className="text-sm text-white/80">Admin users</p>
            </CardContent>
          </Card>
          <Card className="from-gradient-blue via-gradient-purple to-gradient-red border-0 bg-gradient-to-br from-25% via-50% to-75%">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium text-white">
                Verified
              </CardTitle>
              <Mail className="text-white" size={24} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {stats.verifiedMembers}
              </div>
              <p className="text-sm text-white/80">Email verified</p>
            </CardContent>
          </Card>
          <Card className="from-gradient-blue via-gradient-purple to-gradient-red border-0 bg-gradient-to-br from-25% via-50% to-75%">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium text-white">
                New Members
              </CardTitle>
              <Calendar className="text-white" size={24} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {stats.recentMembers}
              </div>
              <p className="text-sm text-white/80">Last 30 days</p>
            </CardContent>
          </Card>
          <Card className="from-gradient-blue via-gradient-purple to-gradient-red border-0 bg-gradient-to-br from-25% via-50% to-75%">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium text-white">
                Pending Approval
              </CardTitle>
              <UserX className="text-white" size={24} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {stats.unapprovedMembers ?? 0}
              </div>
              <p className="text-sm text-white/80">Awaiting approval</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filter */}
      <Card className="mb-6 max-w-7xl mx-auto">
        <CardHeader>
          <CardTitle>Search Members</CardTitle>
          <CardDescription>Search by name or email</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Members List with Tabs */}
      <Card className="max-w-7xl mx-auto">
        <CardHeader>
          <CardTitle>
            {activeTab === "approved" ? "Approved Members" : "Unapproved Members"} (
            {members?.length ?? 0})
          </CardTitle>
          <CardDescription>
            {activeTab === "approved"
              ? "Members who have been approved to use the platform"
              : "Members awaiting approval to use the platform"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "approved" | "unapproved")}>
            <TabsList className="mb-6">
              <TabsTrigger value="unapproved">
                Pending Approval ({stats?.unapprovedMembers ?? 0})
              </TabsTrigger>
              <TabsTrigger value="approved">
                Approved ({stats?.totalMembers ?? 0})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="unapproved" className="mt-0">
              {/* loading vs empty: show spinner while loading, otherwise show empty state or the list */}
              {isLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Spinner className="size-10" />
                </div>
              ) : !unapprovedMembers || unapprovedMembers.length === 0 ? (
                <div className="py-12 text-center">
                  <UserX className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                  <h3 className="mb-2 text-xl font-semibold">
                    No unapproved members
                  </h3>
                  <p className="text-muted-foreground">
                    {searchQuery
                      ? "Try adjusting your search"
                      : "All members have been approved"}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {unapprovedMembers.map((member) => (
                    <Card key={member.id} className="border-muted">
                      <CardContent>
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                          <div className="flex-1 space-y-2 min-w-0">
                            <div className="flex items-center gap-3">
                              <div className="flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h3 className="text-base sm:text-lg font-semibold truncate">
                                    {member.name ?? "Unnamed User"}
                                  </h3>
                                  <Badge variant="destructive">
                                    Pending Approval
                                  </Badge>
                                  {member.emailVerified && (
                                    <Badge variant="outline" className="gap-1">
                                      <Mail className="h-3 w-3" />
                                      Verified
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-muted-foreground mt-1 space-y-1 text-sm">
                                  {member.email && (
                                    <p className="flex items-center gap-2">
                                      <Mail className="h-3 w-3" />
                                      {member.email}
                                    </p>
                                  )}
                                  {member.phone && (
                                    <p className="flex items-center gap-2">
                                      <Phone className="h-3 w-3" />
                                      {member.phone}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                              <div className="flex items-center gap-1">
                                <span className="text-muted-foreground">
                                  Joined:
                                </span>{" "}
                                <span className="font-medium">
                                  {new Date(member.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="text-muted-foreground">
                                  Registrations:
                                </span>{" "}
                                <span className="font-medium">
                                  {member._count.registrations}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="text-muted-foreground">
                                  Blog Posts:
                                </span>{" "}
                                <span className="font-medium">
                                  {member._count.blogPosts}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-col xl:flex-row sm:items-end sm:gap-2 min-w-[140px]">
                            <Button
                              variant="default"
                              size="sm"
                              className="w-full sm:w-auto gap-2"
                              onClick={() =>
                                handleApproveClick({
                                  id: member.id,
                                  name: member.name,
                                  email: member.email,
                                })
                              }
                            >
                              <CheckCircle className="h-4 w-4" />
                              Approve
                            </Button>
                            <Link
                              href={`/admin-dashboard/manage-members/${member.id}/edit`}
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full sm:w-auto gap-2"
                              >
                                <Edit className="h-4 w-4" />
                                Edit
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="approved" className="mt-0">
              {/* loading vs empty: show spinner while loading, otherwise show empty state or the list */}
              {isLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Spinner className="size-10" />
                </div>
              ) : !approvedMembers || approvedMembers.length === 0 ? (
                <div className="py-12 text-center">
                  <User2 className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                  <h3 className="mb-2 text-xl font-semibold">
                    No approved members found
                  </h3>
                  <p className="text-muted-foreground">
                    {searchQuery
                      ? "Try adjusting your search"
                      : "No members registered yet"}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {approvedMembers.map((member) => (
                    <Card key={member.id} className="border-muted">
                      <CardContent>
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                          <div className="flex-1 space-y-2 min-w-0">
                            <div className="flex items-center gap-3">
                              <div className="flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h3 className="text-base sm:text-lg font-semibold truncate">
                                    {member.name ?? "Unnamed User"}
                                  </h3>
                                  <Badge
                                    variant={
                                      member.role === "ADMIN"
                                        ? "default"
                                        : "secondary"
                                    }
                                  >
                                    {member.role}
                                  </Badge>
                                  {member.emailVerified && (
                                    <Badge variant="outline" className="gap-1">
                                      <Mail className="h-3 w-3" />
                                      Verified
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-muted-foreground mt-1 space-y-1 text-sm">
                                  {member.email && (
                                    <p className="flex items-center gap-2">
                                      <Mail className="h-3 w-3" />
                                      {member.email}
                                    </p>
                                  )}
                                  {member.phone && (
                                    <p className="flex items-center gap-2">
                                      <Phone className="h-3 w-3" />
                                      {member.phone}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                              <div className="flex items-center gap-1">
                                <span className="text-muted-foreground">
                                  Joined:
                                </span>{" "}
                                <span className="font-medium">
                                  {new Date(member.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="text-muted-foreground">
                                  Registrations:
                                </span>{" "}
                                <span className="font-medium">
                                  {member._count.registrations}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="text-muted-foreground">
                                  Blog Posts:
                                </span>{" "}
                                <span className="font-medium">
                                  {member._count.blogPosts}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-col sm:items-end sm:gap-2 min-w-[140px]">
                            <Link
                              href={`/admin-dashboard/manage-members/${member.id}/edit`}
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full sm:w-auto gap-2"
                              >
                                <Edit className="h-4 w-4" />
                                Edit
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <ApprovalDialog
        member={selectedMember}
        open={approvalDialogOpen}
        onOpenChange={setApprovalDialogOpen}
      />
    </main>
  );
}
