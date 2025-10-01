"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";

import { Button } from "~/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "~/components/ui/carousel";

export function HeroSection() {
  useEffect(() => {
    // no-op placeholder to keep this as a client component if needed later
  }, []);

  return (
    <section id="home" className="relative w-full bg-black">
      <div className="absolute inset-0">
        <Carousel
          // opts={{ loop: true }}
          // className="h-32 w-32"
        >
          <CarouselContent>
            {["/images/hero-img.webp", "/images/hero-img.webp", "/images/hero-img.webp"].map((src, i) => (
              <CarouselItem key={`hero-${i}`}>
                <Image
                  src={src}
                  alt="Conference group"
                  fill
                  priority={i === 0}
                  className="object-cover w-64 h-64"
                />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
      <div className="container mx-auto px-4 py-20 md:py-28 relative z-10">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-white">
          Fiji Principals Association
        </h1>
        <p className="mt-2 bg-gradient-to-r from-primary to-sky-500 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent sm:text-5xl md:text-6xl">
          Conference 2025
        </p>
        <p className="mt-6 max-w-3xl text-base leading-7 text-gray-300 md:text-lg">
          Join educational leaders from across the Pacific for three days of inspiring sessions, networking, and professional development in the heart of Fiji.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Button size="lg"><Link href="/handler/sign-up">Register Now</Link></Button>
          <Button size="lg" variant="ghost" asChild>
            <Link href="#details" className="inline-flex items-center text-white">Learn More</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}


