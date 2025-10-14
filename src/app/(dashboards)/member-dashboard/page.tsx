import MemberDashboard from "./Member";
import { MemberAuth } from "./member-auth";

export default async function Page() {
    return (
        <>
            <MemberAuth />
            <MemberDashboard />
        </>
    );
}