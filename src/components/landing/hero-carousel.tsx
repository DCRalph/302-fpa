"use client";

import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "~/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

const autoplay = Autoplay({ delay: 8000 });
const images = ["/images/hero-img.webp", "/images/hero-img2.webp"];

export function HeroCarousel() {
  return (
    <Carousel className="relative w-full" plugins={[autoplay]} opts={{ loop: true }}>
      <CarouselContent>
        {images.map((src, i) => (
          <CarouselItem key={i} className="relative h-[526px]">
            <Image
              src={src}
              alt="Conference group"
              fill
              priority
              className="object-cover brightness-25"
            />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="top-1/2 left-4 -translate-y-1/2 md:flex hidden" />
      <CarouselNext className="top-1/2 right-4 -translate-y-1/2 md:flex hidden" />
    </Carousel>
  );
}

