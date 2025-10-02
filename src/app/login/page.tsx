import { NavBar } from "~/components/landing/nav-bar";
import { SiteFooter } from "~/components/landing/site-footer";
import { SignIn } from "@stackframe/stack";

export default function LoginPage() {
  return (
    <main
      className="bg-background text-foreground min-h-screen"
      style={{
        backgroundImage: "url('/images/auth_background.webp')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <NavBar />
      <div className="container mx-auto flex flex-col items-center justify-center px-4 py-20">
        <div className="bg-background w-full max-w-md rounded-lg p-8 shadow-lg">
          <SignIn />
        </div>
      </div>

      <SiteFooter />
    </main>
  );
}
