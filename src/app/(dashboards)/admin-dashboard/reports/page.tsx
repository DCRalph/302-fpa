import { MemberAuth } from "../../member-dashboard/member-auth";
import ReportsPage from "./Reports";

export default function Page() {
    return (
        <>
            <MemberAuth />
            <ReportsPage />
        </>
    )
}