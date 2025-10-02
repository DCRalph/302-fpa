import { NavBar } from "~/components/landing/nav-bar";
import { SignIn } from "@stackframe/stack";

export default function LoginPage() {
  return (
    <main
      className="bg-background text-foreground min-h-screen"
      style={{
        backgroundImage: "url('/images/auth-background.webp')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >

      <div className="absolute inset-0 bg-black/50"></div>

      <div className="relative z-10"></div>
      <NavBar />
 
      <div className="container m-0 mx-auto flex h-[calc(100vh-81px)] items-center justify-center">
        <div className="bg-background w-full max-w-md rounded-lg p-8 shadow-lg z-20">
          <SignIn />
        </div>
      </div>

    </main>
  );
}
