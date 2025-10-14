import MyFilesPage from "./MyFiles";
import { MemberAuth } from "../member-auth";

export default async function Page() {
  return (
    <>
      <MemberAuth />
      <MyFilesPage />
    </>
  );
}