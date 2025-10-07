import { NavBar } from "~/components/nav-bar";
import SignInForm from "./Form";

export default function LoginPage() {
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

      <div className="container m-0 mx-auto flex md:h-[calc(100vh-81px)] items-center justify-center px-4 py-20">
        <SignInForm />
      </div>
    </main>
  );
}
