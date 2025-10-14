import CommunityBlog from "./Blog";
import { MemberAuth } from "../member-auth";

export default async function Page() {
  return (
    <>
      <MemberAuth />
      <CommunityBlog />
    </>
  );
}