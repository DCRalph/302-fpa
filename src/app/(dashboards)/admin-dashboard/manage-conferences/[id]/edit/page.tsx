import EditConferencePage from "./EditConference";
import { AdminAuth } from "../../../admin-auth";

export default async function Page() {
  return (
    <>
      <AdminAuth />
      <EditConferencePage />
    </>
  );
}
