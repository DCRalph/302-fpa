"use client";

import Image from "next/image";
import Link from "next/link";

import { Button } from "~/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "~/components/ui/carousel";

import Autoplay from "embla-carousel-autoplay"


import { ArrowRight } from "lucide-react";
import { montserrat } from "~/components/fonts";
import { api } from "~/trpc/react";

const autoplay = Autoplay({ delay: 8000 })
const images = ["/images/hero-img.webp", "/images/hero-img2.webp"]

export function HeroSection() {
  const { data: conferenceYear } = api.home.getConferenceYear.useQuery(); 

  return (
    <section id="home" className="relative w-full bg-black">
      <Carousel className="relative w-full" plugins={[autoplay]} opts={{ loop: true }}>
        <CarouselContent>
          {images.map(
            (src, i) => (
              <CarouselItem key={i} className="relative h-[526px]">
                <Image
                  src={src}
                  alt="Conference group"
                  fill
                  priority
                  className="object-cover brightness-25"
                />
              </CarouselItem>
            ),
          )}
        </CarouselContent>
        <CarouselPrevious className="top-1/2 left-4 -translate-y-1/2 md:flex hidden" />
        <CarouselNext className="top-1/2 right-4 -translate-y-1/2 md:flex hidden" />
      </Carousel>
      <div className="absolute h-full inset-0 z-10 container mx-auto flex flex-col justify-center items-center text-center">
        <h1
          className={`${montserrat.className} text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl`}
        >
          Fiji Principals Association
        </h1>
        <p
          className={`${montserrat.className} from-primary mt-3 bg-gradient-to-r from-15% to-primary-tint to-70% bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl md:text-6xl`}
        >
          Conference {conferenceYear}
        </p>
        <p className="mt-10 max-w-3xl text-base leading-7 text-gray-300 md:text-lg">
          Join educational leaders from across the Pacific for three days of
          inspiring sessions, networking, and professional development in the
          heart of Fiji.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Button size="lg" className="flex" asChild>
            <Link href="/handler/sign-up">Register Now</Link>
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
      </div>
    </section>
  );
}
