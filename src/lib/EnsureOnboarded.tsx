import { redirect } from "next/navigation";
import { ServerAuth } from "./auth-server";


export async function EnsureOnboarded() {
  const { dbUser } = await ServerAuth();


  if (!dbUser?.onboardedAt) {
    redirect("/onboarding");
  }

  return null;
}