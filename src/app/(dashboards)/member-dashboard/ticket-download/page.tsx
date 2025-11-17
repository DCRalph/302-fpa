import TicketDownload from "./TicketDownload";
import { MemberAuth } from "../member-auth";

export default async function Page() {
  return (
    <>
      <MemberAuth />
      <TicketDownload />
    </>
  );
}

