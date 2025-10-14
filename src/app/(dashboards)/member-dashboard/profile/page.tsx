import Profile from "./Profile";
import { MemberAuth } from "../member-auth";

export default async function Page() {
  return (
    <>
      <MemberAuth />
      <Profile />
    </>
  );
}