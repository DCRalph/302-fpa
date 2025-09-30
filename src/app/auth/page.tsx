"use client";

import { useState } from "react";
import { UserButton, OAuthButtonGroup, SelectedTeamSwitcher, UserAvatar, useUser } from "@stackframe/stack";
import { api } from "~/trpc/react";
import { ThemeToggle } from "~/components/theme-toggle";
import Link from "next/link";
import { Moon } from "lucide-react";

export default function TempPage() {
  const [inputText, setInputText] = useState("");
  const user = useUser();

  const hello = api.default.hello.useQuery(
    { text: inputText || "World" },
    { enabled: true }
  );

  const auth = api.auth.me.useQuery();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b">
        <div className="container mx-auto flex items-center justify-between p-4">
          <h1 className="text-2xl font-bold">Auth Test Page</h1>
          <Link href="/" className="text-muted-foreground hover:text-foreground">Home</Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <UserButton />
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
                  ✅ You are logged in as: {user.displayName ?? user.primaryEmail}
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
            <h3 className="text-xl font-semibold">Stack Auth Widgets</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 border rounded-lg space-y-3">
                <h4 className="font-semibold">User Button</h4>
                <p className="text-sm text-muted-foreground">Account menu with sign-in/out and settings.</p>
                {/* eslint-disable-next-line @typescript-eslint/no-unused-vars */}
                <UserButton showUserInfo extraItems={[{ text: "Extra Item example", icon: <Moon className="size-4" />, onClick: () => { let x; } }]} />
              </div>
              <div className="p-4 border rounded-lg space-y-3">
                <h4 className="font-semibold">User Avatar</h4>
                <p className="text-sm text-muted-foreground">Avatar rendered from Stack user profile.</p>
                <div className="flex items-center gap-3">
                  <UserAvatar user={user ?? undefined} />
                  {/* <span className="text-sm text-muted-foreground">{user ? (user.displayName ?? user.primaryEmail) : "Not signed in"}</span> */}
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-semibold">OAuth Providers</h3>
            {user ? (
              <p className="text-sm text-muted-foreground">You are signed in. Sign-in/sign-up buttons are hidden.</p>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                <div className="p-4 border rounded-lg space-y-3">
                  <h4 className="font-semibold">Sign in</h4>
                  <OAuthButtonGroup type="sign-in" />
                </div>
                <div className="p-4 border rounded-lg space-y-3">
                  <h4 className="font-semibold">Sign up</h4>
                  <OAuthButtonGroup type="sign-up" />
                </div>
              </div>
            )}
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-semibold">Teams</h3>
            <div className="p-4 border rounded-lg space-y-3">
              <p className="text-sm text-muted-foreground">Switch the currently selected team (if enabled for your project).</p>
              <SelectedTeamSwitcher allowNull nullLabel="No team" />
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-semibold">User Details</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Stack User (useUser)</h4>
                {user ? (
                  <div className="text-sm">
                    <p><span className="text-muted-foreground">ID:</span> {user.id}</p>
                    <p><span className="text-muted-foreground">Name:</span> {user.displayName ?? "—"}</p>
                    <p><span className="text-muted-foreground">Email:</span> {user.primaryEmail ?? "—"}</p>
                    <p><span className="text-muted-foreground">Client metadata:</span><br /> {JSON.stringify(user.clientMetadata) ?? "—"}</p>
                    <p><span className="text-muted-foreground">Client readonly metadata :</span><br /> {JSON.stringify(user.clientReadOnlyMetadata) ?? "—"}</p>

                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No Stack user (not signed in).</p>
                )}
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">DB User (tRPC)</h4>
                {auth.isLoading ? (
                  <p className="text-sm text-muted-foreground">Loading...</p>
                ) : auth.error ? (
                  <p className="text-sm text-red-600 dark:text-red-400">{auth.error.message}</p>
                ) : auth.data ? (
                  <div className="text-sm">
                    <p><span className="text-muted-foreground">ID:</span> {auth.data.id}</p>
                    <p><span className="text-muted-foreground">Name:</span> {auth.data.name ?? "—"}</p>
                    <p><span className="text-muted-foreground">Email:</span> {auth.data.email ?? "—"}</p>
                    <p><span className="text-muted-foreground">Role:</span> {auth.data.role ?? "—"}</p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No DB user found.</p>
                )}
              </div>
            </div>
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
            <ThemeToggle />
          </section>

        </div>
      </main>
    </div>
  );
}
