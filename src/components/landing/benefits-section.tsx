import { api } from "~/trpc/server";
import { type ConferenceWhyJoin } from "~/server/api/routers/home";
import { BenefitsSectionContent } from "./benefits-section-content";


export async function BenefitsSection() {
  const conferenceWhyJoin = await api.home.getConferenceWhyJoin();

  const whyJoin = conferenceWhyJoin?.value ?? null;
  const whyJoinObject = whyJoin ? JSON.parse(whyJoin ?? "[]") as ConferenceWhyJoin[] : null;

  return (
    <BenefitsSectionContent conferenceJoin={whyJoinObject} />
  );
}

