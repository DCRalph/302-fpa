import { api } from "~/trpc/server";
import { type ConferenceTitle } from "~/server/api/routers/home";
import { HeroSectionContent } from "./hero-section-content";


export async function HeroSection() {
  const { dbUser } = await api.auth.me();
  const conferenceTitle = await api.home.getConferenceTitle();
  const isAdmin = dbUser?.role === "ADMIN";


  const title = conferenceTitle?.value ?? null;
  const titleObject = title ? JSON.parse(title) as ConferenceTitle : null;

  return (
    <HeroSectionContent titleObject={titleObject} isAdmin={isAdmin} />
  );
}

