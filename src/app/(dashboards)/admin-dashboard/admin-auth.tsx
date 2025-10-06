"use client"

import { authClient } from "~/lib/auth-client" // import the auth client
import { redirect } from "next/navigation";

export function AdminAuth() {
  const {
    data: session,
    isPending, //loading state
  } = authClient.useSession()

  if (isPending) {
    return (
      <div className="flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  if (!session) {
    redirect("/signin");
  }
}
