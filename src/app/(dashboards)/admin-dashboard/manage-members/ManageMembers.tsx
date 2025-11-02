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
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function ManageMembersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: members, isLoading } = api.admin.members.getAll.useQuery({
    search: searchQuery || undefined,
  });
  const { data: stats } = api.admin.members.getStats.useQuery();

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
        <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto">
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

      {/* Members List */}
      <Card className="max-w-7xl mx-auto">
        <CardHeader>
          <CardTitle>All Members ({members?.length ?? 0})</CardTitle>
          <CardDescription>
            Manage member accounts and permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* loading vs empty: show spinner while loading, otherwise show empty state or the list */}
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <Spinner className="size-10" />
            </div>
          ) : !members || members.length === 0 ? (
            <div className="py-12 text-center">
              <User2 className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
              <h3 className="mb-2 text-xl font-semibold">No members found</h3>
              <p className="text-muted-foreground">
                {searchQuery
                  ? "Try adjusting your search"
                  : "No members registered yet"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {members.map((member) => (
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
        </CardContent>
      </Card>
    </main>
  );
}
