"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "~/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi
} from "~/components/ui/carousel";

import { ArrowRight } from "lucide-react";
import { montserrat } from "~/components/fonts";


export function HeroSection() {
  // const [api, setApi] = useState<CarouselApi>()
  // const [current, setCurrent] = useState(0)
  // const [count, setCount] = useState(0)

  // useEffect(() => {
  //   if (!api) {
  //     return
  //   }
 
  //   setCount(api.slideNodes().length)
  //   setCurrent(api.selectedScrollSnap() + 1)
 
  //   api.on("select", () => {
  //     setCurrent(api.selectedScrollSnap() + 1)
  //   })
  // }, [api])

  return (
    <section id="home" className="relative w-full bg-black">
      {/* <div className="w-full h-64"> */}
        <Carousel
        opts={{ loop: true  }}
        // setApi={setApi}
        className="w-full"
        >
          <CarouselContent className="w-full -ml-0">
            {[
              "/images/hero-img.webp",
              "/images/hero-img.webp",
              "/images/hero-img.webp",
            ].map((src, i) => (
              <CarouselItem key={`hero-${i}`} className="w-full h-[28rem] bg-black">
                <Image
                  src={src}
                  alt="Conference group"
                  fill
                  priority={i === 0}
                  className="h-64 w-full opacity-10 object-cover"
                />
                {/* <div className="w-full h-full bg-red-500"> */}
                  {/* <h1>{src}</h1> */}
                {/* </div> */}
              </CarouselItem>
            ))}
          </CarouselContent>
          {/* <CarouselNext  />
          <CarouselPrevious /> */}
        </Carousel>
      {/* </div> */}
      <div className="absolute h-full inset-0 z-10 container mx-auto flex flex-col justify-center items-center text-center">
        <h1
          className={`${montserrat.className} text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl`}
        >
          Fiji Principals Association
        </h1>
        <p
          className={`${montserrat.className} bg-gradient-to-r from-primary from-15% to-[#32C83C] to-70% bg-clip-text mt-3 text-4xl font-bold tracking-tight text-transparent sm:text-5xl md:text-6xl`}
        >
          Conference 2025
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
