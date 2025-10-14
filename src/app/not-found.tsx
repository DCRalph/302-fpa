import Link from "next/link";
import { Button } from "~/components/ui/button";
import { NavBar } from "~/components/nav-bar";
import { SiteFooter } from "~/components/site-footer";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <NavBar />

      <main className="flex flex-1 flex-col items-center justify-center px-4 py-16">
        <div className="mx-auto max-w-2xl text-center">
          {/* 404 Number */}
          <div className="mb-8">
            <h1 className="text-9xl font-bold tracking-tight text-primary md:text-[12rem]">
              404
            </h1>
          </div>

          {/* Error Message */}
          <div className="mb-8 space-y-3">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Page Not Found
            </h2>
            <p className="text-lg text-muted-foreground md:text-xl">
              Oops! The page you&apos;re looking for doesn&apos;t exist or has been moved.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button asChild variant="primary" size="lg">
              <Link href="/">
                Go to Homepage
              </Link>
            </Button>
          </div>

          {/* Helpful Links */}
          <div className="mt-12">
            <p className="mb-4 text-sm text-muted-foreground">
              You might be interested in:
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <Link
                href="/"
                className="text-primary hover:underline"
              >
                Home
              </Link>
              <span className="text-muted-foreground">•</span>
              <Link
                href="/member-dashboard"
                className="text-primary hover:underline"
              >
                Member Dashboard
              </Link>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

