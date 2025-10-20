import FilesPage from "./Files";
import { AdminAuth } from "../admin-auth";

export default async function Page() {
  return (
    <>
      <AdminAuth />
      <FilesPage />
    </>
  );
}

