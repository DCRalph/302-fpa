import { notFound } from "next/navigation";
import { api } from "~/trpc/server";
import BlogPost from "./BlogPost";

interface BlogPostPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  try {
    const post = await api.member.blog.getById({ id: (await params).id });

    if (!post) {
      notFound();
    }

    return <BlogPost post={post} />;
  } catch {
    notFound();
  }
}
