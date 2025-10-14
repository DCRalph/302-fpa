import ConferenceRegistration from "./Conference";
import { MemberAuth } from "../member-auth";

export default async function Page() {
    return (
        <>
            <MemberAuth />
            <ConferenceRegistration />
        </>
    );
}