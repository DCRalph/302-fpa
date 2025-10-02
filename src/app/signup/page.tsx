import { NavBar } from "~/components/landing/nav-bar";
import { SignUp } from "@stackframe/stack";

export default function RegisterPage() {
  return (
    <main
      className="bg-background text-foreground min-h-screen fixed w-full"
      style={{
        backgroundImage: "url('/images/auth-background.webp')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >

      <div className="absolute inset-0 bg-black/50"></div>

      <div className="relative z-10"></div>
      <NavBar />
      <div className="container mx-auto flex h-[calc(100vh-81px)] flex-col items-center justify-center px-4 py-20">
        <div className="bg-background w-full max-w-md rounded-lg p-8 shadow-lg z-20">
          <SignUp />
        </div>
      </div>

    </main>
  );
}