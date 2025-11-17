import ContactSupport from "./ContactSupport";
import { MemberAuth } from "../member-auth";

export default async function Page() {
  return (
    <>
      <MemberAuth />
      <ContactSupport />
    </>
  );
}

