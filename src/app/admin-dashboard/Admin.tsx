"use client";

import { useAuth } from "~/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import {
  Users,
  UserCheck,
  School2,
  DollarSign,
  CheckCircle,
  CreditCard,
  UserPlus,
} from "lucide-react";
import { Separator } from "@radix-ui/react-separator";
import { Badge } from "~/components/ui/badge";

export default function AdminDashboardPage() {
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
      title: "Users",
      value: "234",
      subtitle: "Total Members",
      icon: Users,
    },
    {
      title: "Conference",
      value: "124",
      subtitle: "Registered Members",
      icon: UserPlus,
    },
    {
      title: "Total Payments",
      value: "$31,000",
      subtitle: "Collected",
      icon: DollarSign,
    },
  ];

  const recentActivity = [
    {
      icon: CheckCircle,
      title: "John Doe registered for the APC 2025",
      time: "2 days ago",
    },
    {
      icon: CreditCard,
      title: "New payment recieved: $250 from Bob Ross",
      time: "4 days ago",
    },
    {
      icon: UserPlus,
      title: "New member added: Jane Smith",
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
          </div>

          {/* Stats Cards */}
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
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
            {/* Upcoming Conference */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 mx-auto">
                  <span className="text-2xl">
                    Upcoming Conference
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="py-6 text-center">
                  <h3 className="text-foreground text-2xl">
                    133rd Fiji Principals Association
                    Conference
                  </h3>
                  <div className="text-foreground space-y-2 pt-6 text-md">
                    <p>
                      <strong>Date:</strong> 17th - 19th September 2025
                    </p>
                    <p>
                      <strong>Capacity:</strong> 135/200 Spaces Remaining
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    View Details
                  </Button>
                  <Button size="sm" className="flex-1">
                    Manage Sessions
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
                      <activity.icon
                        className="text-primary w-5 flex-shrink-0"
                        size={24}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-md text-foreground font-medium">
                          {activity.title}
                        </p>
                        <p className="text-muted-foreground text-sm">
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Conference Registrations */}
          <div className="mb-8 grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span className="text-2xl">
                    Recent Conference Registrations
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <span className="text-muted-foreground">
                    No recent registrations
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </main>
  );
}
