import PaymentDetails from "./PaymentDetails";
import { MemberAuth } from "../member-auth";

export default async function Page() {
  return (
    <>
      <MemberAuth />
      <PaymentDetails />
    </>
  );
}

