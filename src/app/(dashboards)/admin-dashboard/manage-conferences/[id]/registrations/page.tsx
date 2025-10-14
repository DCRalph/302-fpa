import ConferenceRegistrationsPage from "./ConferenceRegistrations";
import { AdminAuth } from "../../../admin-auth";

export default async function Page() {
  return (
    <>
      <AdminAuth />
      <ConferenceRegistrationsPage />
    </>
  );
}
