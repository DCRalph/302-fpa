import Image from "next/image";
import Link from "next/link";

import { Button } from "~/components/ui/button";

export function HeroSection() {
  return (
    <section id="home" className="relative">
      <div className="w-80 h-80 bg-pink-300" >
        {/* <Image
          src="/images/hero-img.webp"
          alt="Conference group"
          fill
          priority
          className="object-cover"
        /> */}
      </div>
      <div className="container mx-auto px-4 py-20 md:py-28">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
          Fiji Principals Association
        </h1>
        <p className="mt-2 bg-gradient-to-r from-primary to-sky-500 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent sm:text-5xl md:text-6xl">
          Conference 2025
        </p>
        <p className="mt-6 max-w-3xl text-base leading-7 text-muted-foreground md:text-lg">
          Join educational leaders from across the Pacific for three days of inspiring sessions, networking, and professional development in the heart of Fiji.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Button size="lg"><Link href="/handler/sign-up">Register Now</Link></Button>
          <Button size="lg" variant="ghost" asChild>
            <Link href="#details" className="inline-flex items-center">Learn More <span className="ml-2">→</span></Link>
          </Button>
        </div>
      </div>
    </section>
  );
}


