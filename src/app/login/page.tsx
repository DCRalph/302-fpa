import { NavBar } from "~/components/landing/nav-bar";
import { SiteFooter } from "~/components/landing/site-footer";

export default function LoginPage() {
    return <main className="min-h-screen bg-background text-foreground">
        <NavBar />
        <div className="container mx-auto flex flex-col items-center justify-center py-20 px-4">
            <h1 className="text-3xl font-bold mb-6">Login Page</h1>
            <p className="text-lg text-muted-foreground">This is a placeholder for the login page.</p>
        </div>
        <SiteFooter />
    </main>;
}