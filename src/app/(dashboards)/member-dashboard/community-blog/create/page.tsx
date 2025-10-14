import CreatePostPage from "./CreatePost";
import { MemberAuth } from "../../member-auth";

export default async function Page() {
  return (
    <>
      <MemberAuth />
      <CreatePostPage />
    </>
  );
}