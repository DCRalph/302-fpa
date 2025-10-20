import EmailsPage from "./Emails";
import { AdminAuth } from "../admin-auth";

export default async function Page() {
  return (
    <>
      <AdminAuth />
      <EmailsPage />
    </>
  );
}
