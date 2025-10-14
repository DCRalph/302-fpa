import ViewConferencePage from "./ViewConference";
import { AdminAuth } from "../../admin-auth";

export default async function Page() {
  return (
    <>
      <AdminAuth />
      <ViewConferencePage />
    </>
  );
}
