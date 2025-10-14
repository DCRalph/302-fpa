import EditMemberPage from "./EditMember";
import { AdminAuth } from "../../../admin-auth";

export default async function Page() {
  return (
    <>
      <AdminAuth />
      <EditMemberPage />
    </>
  );
}
