import { NavBar } from "~/components/nav-bar";
import SignUpForm from "./Form";

export default function RegisterPage() {
  return (
    <main
      className="bg-background text-foreground min-h-screen md:fixed w-full"
      style={{
        backgroundImage: "url('/images/auth-background.webp')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="fixed inset-0 bg-black/50"></div>

      <div className="relative z-10"></div>
      <NavBar />

      <div className="container mx-auto flex md:h-[calc(100vh-81px)] flex-col items-center justify-center px-4 py-20">
        <SignUpForm />
      </div>
    </main>
  );
}