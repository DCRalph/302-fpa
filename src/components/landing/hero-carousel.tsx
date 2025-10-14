"use client";

import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "~/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { useEffect, useState } from "react";


export const autoplay = Autoplay({ delay: 8000 });

interface HeroCarouselProps {
  images: string[];
  onApiReady?: (api: CarouselApi) => void;
}

export function HeroCarousel({ images, onApiReady }: HeroCarouselProps) {
  const [api, setApi] = useState<CarouselApi | null>(null);


  useEffect(() => {
    if (api && onApiReady) {
      onApiReady(api);
    }
  }, [api, onApiReady]);

  return (
    <Carousel className="relative w-full" plugins={[autoplay]} opts={{ loop: true }} setApi={setApi}>
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

      {/* <Button className="absolute size-8 rounded-full top-1/2 left-4 -translate-y-1/2 md:flex hidden" variant="outline" size="icon" onClick={() => {
        api?.scrollPrev();
        api?.plugins().autoplay.reset();
      }}>
        <ArrowLeft />
      </Button>
      <Button className="absolute size-8 rounded-full top-1/2 right-4 -translate-y-1/2 md:flex hidden" variant="outline" size="icon" onClick={() => {
        api?.scrollNext();
        api?.plugins().autoplay.reset();
      }}>
        <ArrowRight />
      </Button> */}
    </Carousel>
  );
}

