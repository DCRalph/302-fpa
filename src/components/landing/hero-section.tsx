import Link from "next/link";
import { Button } from "~/components/ui/button";
import { ArrowRight } from "lucide-react";
import { montserrat } from "~/components/fonts";
import { api } from "~/trpc/server";
import EditTitle from "~/components/landing/admin/editTitle";
import { ServerAuth } from "~/lib/auth-server";
import { HeroCarousel } from "./hero-carousel";
import { type ConferenceTitle } from "~/server/api/routers/home";

export async function HeroSection() {
  const { dbUser } = await ServerAuth();
  const conferenceTitle = await api.home.getConferenceTitle();
  const isAdmin = dbUser?.role === "ADMIN";


  const title = conferenceTitle?.value ?? null;
  const titleObject = title ? JSON.parse(title) as ConferenceTitle : null;

  return (
    <section id="home" className="relative w-full bg-black">
      <HeroCarousel />
      <div className="absolute h-full inset-0 z-10 container mx-auto flex flex-col justify-center items-center text-center">
        <h1
          className={`${montserrat.className} text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl`}
        >
          {titleObject?.title}
        </h1>
        {/* <p
          className={`${montserrat.className} from-primary mt-3 bg-gradient-to-r from-15% to-primary-tint to-70% bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl md:text-6xl`}
        >
          Conference {conferenceTitle ?? "20.."}
        </p> */}
        <p className="mt-10 max-w-3xl text-base leading-7 text-gray-300 md:text-lg">
          {titleObject?.subtitle}
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Button size="lg" className="flex" asChild>
            <Link href="/signup">Register Now</Link>
          </Button>
          <Button size="lg" variant="ghost" asChild>
            <Link
              href="#details"
              className="inline-flex items-center text-white"
            >
              Learn More
              <ArrowRight />
            </Link>
          </Button>
          {isAdmin && <EditTitle titleObject={titleObject} />}
        </div>
      </div>
    </section>
  );
}
