"use client";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import {
  Home,
  ArrowLeft,
  Search,
  HelpCircle,
  Users,
  CalendarCog,
  Activity,
  Plus,
  Calendar,
  BookOpen,
  FileText,
  User
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardNotFound() {
  const pathname = usePathname();

  // Determine if user is in admin or member dashboard
  const isAdminDashboard = pathname?.startsWith("/admin-dashboard");
  const dashboardType = isAdminDashboard ? "Admin" : "Member";
  const dashboardHome = isAdminDashboard ? "/admin-dashboard" : "/member-dashboard";

  return (
    <main className="text-foreground flex">
      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Content */}
        <main className="flex-1 p-3 sm:p-4 md:p-6">
          <div className="mb-4 sm:mb-6 md:mb-8">
            <h2 className="text-foreground mb-1 text-xl sm:text-2xl font-bold">
              Page Not Found
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              The page you&apos;re looking for doesn&apos;t exist in the {dashboardType} Dashboard.
            </p>
          </div>

          <div className="mb-6 sm:mb-8 grid grid-cols-1 gap-3 sm:gap-4 md:gap-6 lg:grid-cols-2">
            {/* Main Not Found Card */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Search className="h-6 w-6" />
                  <span className="text-2xl">404 - Page Not Found</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="py-8 text-center">
                  <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-muted/50">
                    <HelpCircle className="h-12 w-12 text-muted-foreground" />
                  </div>

                  <h3 className="text-foreground mb-2 text-lg font-semibold">
                    Oops! This page doesn&apos;t exist
                  </h3>

                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    The page you&apos;re trying to access might have been moved, deleted, or you might have entered an incorrect URL.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button asChild>
                      <Link href={dashboardHome}>
                        <Home className="mr-2 h-4 w-4" />
                        Go to {dashboardType} Dashboard
                      </Link>
                    </Button>

                    <Button variant="outline" onClick={() => window.history.back()}>
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Go Back
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="text-foreground text-lg font-medium">
                    Quick Navigation
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {isAdminDashboard ? (
                      <>
                        <Link href="/admin-dashboard/manage-members">
                          <Button variant="outline" className="w-full justify-start">
                            <Users className="mr-2 h-4 w-4" />
                            Manage Members
                          </Button>
                        </Link>
                        <Link href="/admin-dashboard/manage-conferences">
                          <Button variant="outline" className="w-full justify-start">
                            <CalendarCog className="mr-2 h-4 w-4" />
                            Manage Conferences
                          </Button>
                        </Link>
                        <Link href="/admin-dashboard/activity">
                          <Button variant="outline" className="w-full justify-start">
                            <Activity className="mr-2 h-4 w-4" />
                            View Activity
                          </Button>
                        </Link>
                        <Link href="/admin-dashboard/manage-conferences/create">
                          <Button variant="outline" className="w-full justify-start">
                            <Plus className="mr-2 h-4 w-4" />
                            Create Conference
                          </Button>
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link href="/member-dashboard/conference-registration">
                          <Button variant="outline" className="w-full justify-start">
                            <Calendar className="mr-2 h-4 w-4" />
                            Conference Registration
                          </Button>
                        </Link>
                        <Link href="/member-dashboard/community-blog">
                          <Button variant="outline" className="w-full justify-start">
                            <BookOpen className="mr-2 h-4 w-4" />
                            Community Blog
                          </Button>
                        </Link>
                        <Link href="/member-dashboard/my-files">
                          <Button variant="outline" className="w-full justify-start">
                            <FileText className="mr-2 h-4 w-4" />
                            My Files
                          </Button>
                        </Link>
                        <Link href="/member-dashboard/profile">
                          <Button variant="outline" className="w-full justify-start">
                            <User className="mr-2 h-4 w-4" />
                            My Profile
                          </Button>
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </main>
  );
}
