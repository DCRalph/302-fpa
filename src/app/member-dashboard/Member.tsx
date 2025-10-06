"use client";

import { useAuth } from "~/lib/auth";
import { redirect } from "next/navigation";
import {
  CheckCircle,
  DollarSign,
  Calendar,
  FileText,
  CreditCard,
  ChevronDown,
  Bell,
  BookOpen,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";

export default function MemberDashboardPage() {
  const { stackUser, dbUser, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!stackUser || !dbUser) {
    redirect("/signin");
  }

  const memberStats = [
    {
      title: "Registration Status",
      value: "Registered",
      subtitle: "2025 Conference",
      icon: CheckCircle,
    },
    {
      title: "Payment Status",
      value: "Paid",
      subtitle: "$250 Conference Fee",
      icon: DollarSign,
    },
    {
      title: "Community Blog",
      value: "3",
      subtitle: "Blog Posts",
      icon: BookOpen,
    },
    {
      title: "Documents",
      value: "2",
      subtitle: "Files Uploaded",
      icon: FileText,
    },
  ];

  const recentActivity = [
    {
      icon: CheckCircle,
      title: "Successfully registered for APC 2025",
      time: "2 days ago",
    },
    {
      icon: CreditCard,
      title: "Payment of $250 processed",
      time: "2 days ago",
    },
    {
      icon: Calendar,
      title: "Booked session: Leadership in Education",
      time: "1 week ago",
    },
    {
      icon: FileText,
      title: "Uploaded conference presentation",
      time: "1 week ago",
    },
  ];

  return (
    <main className="text-foreground flex">
      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Content */}
        <main className="flex-1 p-6">
          <div className="mb-8">
            <h2 className="text-foreground mb-1 text-2xl font-bold">
              Welcome back, Stephen Prosser!
            </h2>
            <p className="text-muted-foreground text-md">
              Here's what's happening with your conference registration.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {memberStats.map((stat, index) => (
              <Card
                key={index}
                className="from-gradient-blue via-gradient-purple to-gradient-red border-0 bg-gradient-to-br from-25% via-50% to-75% text-white shadow-lg"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-white/80">{stat.title}</p>
                      <p className="mt-1 text-2xl font-bold">{stat.value}</p>
                      <p className="mt-1 text-sm text-white/80">
                        {stat.subtitle}
                      </p>
                    </div>
                    <stat.icon className="h-8 w-8 text-white/80" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Conference Registration Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span className="text-2xl">Conference Registration Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="py-6 text-center">
                  <CheckCircle className="mx-auto mb-4 h-12 w-12 text-[#198754]" />
                  <h3 className="text-lg font-semibold text-foreground">
                    You're all set!
                  </h3>
                  <p className="mb-4 mt-2 text-muted-foreground">
                    You're registered for the 133rd Fiji Principals Association
                    Conference
                  </p>
                  <div className="space-y-2 text-sm text-foreground">
                    <p>
                      <strong>Date:</strong> 17th - 19th September 2025
                    </p>
                    <p>
                      <strong>Registration ID:</strong> FPA2025-SP-001
                    </p>
                    <p>
                      <strong>Payment Status:</strong>{" "}
                      <Badge className="text-white bg-[#198754] text-sm ml-1">
                        Paid
                      </Badge>
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    View Details
                  </Button>
                  <Button size="sm" className="flex-1">
                    Download Ticket
                  </Button>
                </div>
              </CardContent>
            </Card>
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span className="text-2xl">Recent Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <activity.icon className="w-5 flex-shrink-0 text-primary" size={24} />
                      <div className="min-w-0 flex-1">
                        <p className="text-md text-foreground font-medium">
                          {activity.title}
                        </p>
                        <p className="text-sm text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Blog Posts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <div className="flex w-full items-center justify-between">
                    <span className="text-2xl">Recent Blog Posts</span>
                    <div className="flex items-center space-x-2">
                      <Button variant={"outline"}>View All</Button>
                      <Button>Create Post</Button>
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-muted-foreground">No blog posts yet</p>
                </div>
              </CardContent>
            </Card>

            {/* Recent Files */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <div className="flex w-full items-center justify-between">
                    <span className="text-2xl">Recent Files</span>
                    <div className="flex items-center space-x-2">
                      <Button variant={"outline"}>View All</Button>
                      <Button>Upload File</Button>
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-muted-foreground">No files uploaded yet</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </main>
  );
}
