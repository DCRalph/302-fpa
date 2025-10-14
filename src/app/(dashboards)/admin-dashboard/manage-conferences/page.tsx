import ManageConferencesPage from "./ManageConferences";
import { AdminAuth } from "../admin-auth";

export default async function Page() {
  return (
    <>
      <AdminAuth />
      <ManageConferencesPage />
    </>
  );
}
