import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Badge } from "~/components/ui/badge";
import { Search, Heart, Check, X, MessageSquareText } from "lucide-react";
import { useState } from "react";
import { api } from "~/trpc/react";
import { Label } from "@radix-ui/react-dropdown-menu";

export default function CommunityBlog() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all-posts");

  const { data } = api.member.blog.list.useQuery(
    {
      query: searchQuery || undefined,
      categorySlug:
        selectedFilter !== "all-posts" ? selectedFilter : undefined,
      take: 10,
    },
    { keepPreviousData: true },
  );

  const guidelines = [
    {
      text: "Share educational insights and experiences",
      type: "allowed",
    },
    {
      text: "Use clear, professional language",
      type: "allowed",
    },
    {
      text: "Respect intellectual property rights",
      type: "allowed",
    },
    {
      text: "Be constructive and supportive",
      type: "allowed",
    },
    {
      text: "No spam or irrelevant content",
      type: "not-allowed",
    },
  ];

  return (
    <div className="flex-1 space-y-6 p-3 sm:p-4 md:p-6">
      {/* Search and Filter Bar */}
      <div className="grid grid-cols-1 items-end gap-4 lg:grid-cols-6">
        <div className="lg:col-span-3">
          <Label className="py-1 text-sm">Search Posts</Label>
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
            <Input
              placeholder="Search by title, content, or author..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-background py-5 pl-10"
            />
          </div>
        </div>
        <div className="lg:col-span-2">
          <Label className="py-1 text-sm">Filter by Type</Label>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 w-full">
              <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                <SelectTrigger className="w-full bg-background py-5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-posts">All Posts</SelectItem>
                  <SelectItem value="conference-updates">
                    Conference Updates
                  </SelectItem>
                  <SelectItem value="resources">Resources</SelectItem>
                  <SelectItem value="discussions">Discussions</SelectItem>
                  <SelectItem value="announcements">Announcements</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <Button>Search</Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Main Content - Blog Posts */}
        <div className="space-y-6 lg:col-span-3">
          {data?.posts.map((post) => (
            <Card key={post.id} className="overflow-hidden">
              <CardContent className="">
                {/* Author Info */}
                <div className="mb-4 flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200">
                    <span className="text-sm font-medium text-black">
                      {(post.author?.name ?? "?").split(" ").map((n) => n[0]).join("")}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {post.author?.name ?? "Member"}
                    </p>
                    <p className="text-sm text-muted-foreground">&nbsp;</p>
                  </div>
                  <div className="ml-auto">
                    <Badge variant="secondary" className="text-xs">
                      {post.categories?.[0]?.category?.name ?? "General"}
                    </Badge>
                  </div>
                </div>

                {/* Post Content */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground">{post.title}</h3>
                  <p className="text-foreground/70 whitespace-pre-line">{post.content}</p>


                  {/* Post Footer */}
                  <div className="flex items-center justify-between pt-2 ">
                    <div className="flex items-center space-x-4">
                      <Button variant={"ghost"} className="flex items-center space-x-1 text-muted-foreground transition-colors hover:text-foreground">
                        <Heart className="h-4 w-4" />
                        <span className="text-sm">&nbsp;</span>
                      </Button>
                      <Button variant={"ghost"} className="flex items-center space-x-1 text-muted-foreground transition-colors hover:text-foreground">
                        <MessageSquareText className="h-4 w-4" />
                        <span className="text-sm">{post._count?.comments ?? 0}</span>
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">{new Date(post.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* My Posts */}
          <Card className="gap-0">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">My Posts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-base text-foreground/70">
                Share your knowledge with the community
              </p>
              <div className="space-y-2 grid grid-cols-2 gap-4 pt-4">
                <Button>
                  Create a Post
                </Button>
                <Button variant="outline" className="">
                  View my Posts
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Guidelines */}
          <Card className="gap-2">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Guidelines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {guidelines.map((guideline, index) => (
                <div key={index} className="flex items-center space-x-2">
                  {guideline.type === "allowed" ? (
                    <Check className="w-4 flex-shrink-0 text-[#198754]" size={24} />
                  ) : (
                    <X className="w-4 flex-shrink-0 text-[#DC3545]" size={24} />
                  )}
                  <span className="text-sm text-foreground">
                    {guideline.text}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
