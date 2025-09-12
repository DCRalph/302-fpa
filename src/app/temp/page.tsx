"use client";

import { useState } from "react";
import { UserButton } from "@stackframe/stack";
import { useUser } from "@stackframe/stack";
import { api } from "~/trpc/react";
import { ThemeToggle } from "~/components/theme-toggle";

export default function TempPage() {
  const [inputText, setInputText] = useState("");
  const user = useUser();
  
  const hello = api.default.hello.useQuery(
    { text: inputText || "World" },
    { enabled: true }
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b">
        <div className="container mx-auto flex items-center justify-between p-4">
          <h1 className="text-2xl font-bold">Example Page</h1>
          <div className="flex items-center gap-2">
            <UserButton />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto p-8">
        <div className="max-w-2xl mx-auto space-y-8">
          <section>
            <h2 className="text-3xl font-bold mb-4">Welcome to the Example Page</h2>
            <p className="text-muted-foreground mb-4">
              This is a demonstration page showing various features of the application.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-semibold">User Authentication</h3>
            {user ? (
              <div className="p-4 border rounded-lg">
                <p className="text-green-600 dark:text-green-400">
                  ✅ You are logged in as: {user.displayName || user.primaryEmail}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  User ID: {user.id}
                </p>
              </div>
            ) : (
              <div className="p-4 border rounded-lg">
                <p className="text-amber-600 dark:text-amber-400">
                  ⚠️ You are not logged in
                </p>
              </div>
            )}
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-semibold">tRPC Integration</h3>
            <div className="space-y-2">
              <label htmlFor="greeting-input" className="block text-sm font-medium">
                Enter text for greeting:
              </label>
              <input
                id="greeting-input"
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Enter some text..."
                className="w-full p-2 border rounded-md bg-background"
              />
            </div>
            <div className="p-4 border rounded-lg">
              {hello.isLoading ? (
                <p className="text-muted-foreground">Loading...</p>
              ) : hello.error ? (
                <p className="text-red-600 dark:text-red-400">
                  Error: {hello.error.message}
                </p>
              ) : (
                <p className="text-blue-600 dark:text-blue-400">
                  🚀 {hello.data?.greeting}
                </p>
              )}
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-semibold">Theme System</h3>
            <p className="text-muted-foreground">
              Use the theme toggle in the header to switch between light, dark, and system themes.
              Your preference will be saved to your user profile if you're logged in.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-semibold">Features Demonstrated</h3>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Stack Auth integration with user authentication</li>
              <li>tRPC client-side queries with real-time updates</li>
              <li>Theme system with persistence</li>
              <li>Responsive design with Tailwind CSS</li>
              <li>TypeScript integration throughout</li>
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
}
