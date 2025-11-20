import EditPostPage from "./EditPost";
import { MemberAuth } from "../../../member-auth";
import notFound from "../../../../not-found";
import { api } from "~/trpc/server";

interface BlogPostPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function Page({ params }: BlogPostPageProps) {
  const post = await api.member.blog.getById({ id: (await params).id });

  if (!post) {
    notFound();
  }

  return (
    <>
      <MemberAuth />
      <EditPostPage post={post} />
    </>
  );
}
