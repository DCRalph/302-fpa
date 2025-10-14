import EditPostPage from "./EditPost";
import { MemberAuth } from "../../../member-auth";

export default async function Page() {
  return (
    <>
      <MemberAuth />
      <EditPostPage />
    </>
  );
}