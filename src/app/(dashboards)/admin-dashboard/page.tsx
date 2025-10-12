import AdminDashboard from "./Admin";
import { AdminAuth } from "./admin-auth";

export default async function AdminDashboardPage() {

  return (
    <>
    <AdminAuth />
    <AdminDashboard />
    </>
  )
}
