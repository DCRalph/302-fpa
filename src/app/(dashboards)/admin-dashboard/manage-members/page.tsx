import ManageMembersPage from "./ManageMembers";
import { AdminAuth } from "../admin-auth";

export default async function Page() {
  return (
    <>
      <AdminAuth />
      <ManageMembersPage />
    </>
  );
}
