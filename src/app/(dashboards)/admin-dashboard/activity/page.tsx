import ActivityPage from "./Activity";
import { AdminAuth } from "../admin-auth";

export default async function Page() {
  return (
    <>
      <AdminAuth />
      <ActivityPage />
    </>
  );
}
