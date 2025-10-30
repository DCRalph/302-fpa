"use client";

import { HeroCarousel } from "./hero-carousel";
import { type ConferenceTitle } from "~/server/api/routers/home";
import { montserrat } from "~/components/fonts";
import { Button } from "~/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { useState, useEffect } from "react";
import type { CarouselApi } from "~/components/ui/carousel";

import { api } from "~/trpc/react";

const images = ["/images/hero-img.webp", "/images/hero-img2.webp"];


export function HeroSectionContent({ titleObject: initialTitleObject = null }: { titleObject?: ConferenceTitle | null }) {

  const [carouselApi, setApi] = useState<CarouselApi | null>(null);

  const [current, setCurrent] = useState(0);

  const titleQuery = api.home.getConferenceTitle.useQuery();

  const remoteValue = titleQuery.data?.value ?? null;
  const parsedTitleObject = remoteValue
    ? (JSON.parse(remoteValue) as ConferenceTitle)
    : initialTitleObject;

  useEffect(() => {
    if (!carouselApi) return;

    const handler = () => {
      setCurrent(carouselApi.selectedScrollSnap() ?? 0);
    };

    carouselApi.on("select", handler);
    return () => {
      carouselApi.off("select", handler);
    };
  }, [carouselApi]);

  return (
    <section id="home" className="relative w-full bg-black">
      <HeroCarousel images={images} onApiReady={setApi} />
      <div className="absolute h-full inset-0 z-10 container mx-auto flex flex-col justify-center items-center text-center">
        <h1
          className={`${montserrat.className} text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl`}
        >
          {parsedTitleObject?.title}
        </h1>
        {/* <p
          className={`${montserrat.className} from-primary mt-3 bg-gradient-to-r from-15% to-primary-tint to-70% bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl md:text-6xl`}
        >
          Conference {conferenceTitle ?? "20.."}
        </p> */}
        <p className="mt-10 max-w-3xl text-base leading-7 text-gray-300 md:text-lg">
          {parsedTitleObject?.subtitle}
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Button size="lg" variant={"primary"} className="flex" asChild>
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
        </div>

        <div className="mt-8 flex justify-center gap-2">
          {images.map((_, index) => (
            <Button
              key={index}
              variant="outline"
              size="icon"
              className={`h-3 w-3 rounded-full p-2 transition-all border-none ${index === current ? "!bg-primary w-6" : "bg-muted-foreground dark:bg-muted"
                }`}
              onClick={() => {
                if (carouselApi) {
                  carouselApi.scrollTo(index);
                  carouselApi.plugins().autoplay.reset();
                }
              }}
            >
              <span className="sr-only">Go to slide {index + 1}</span>
            </Button>
          ))}
        </div>
      </div>
    </section>
  );
}