import MyPostsPage from "./MyPosts";
import { MemberAuth } from "../../member-auth";

export default async function Page() {
  return (
    <>
      <MemberAuth />
      <MyPostsPage />
    </>
  );
}