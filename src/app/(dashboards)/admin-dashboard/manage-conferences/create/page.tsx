import CreateConferencePage from "./CreateConference";
import { AdminAuth } from "../../admin-auth";

export default async function Page() {
  return (
    <>
      <AdminAuth />
      <CreateConferencePage />
    </>
  );
}
