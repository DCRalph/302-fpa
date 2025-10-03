import { stackServerApp } from "~/stack";
import { api } from "~/trpc/server";
import type { RouterOutputs } from "~/trpc/react";

export interface ServerAuthData {
  stackUser: Awaited<ReturnType<typeof stackServerApp.getUser>>;
  dbUser: RouterOutputs["auth"]["me"];
  isAuthenticated: boolean;
}

export async function ServerAuth(): Promise<ServerAuthData> {
  try {
    const stackUser = await stackServerApp.getUser();

    if (!stackUser) {
      return {
        stackUser: null,
        dbUser: null,
        isAuthenticated: false,
      };
    }


    const dbUser = await api.auth.me();

    return {
      stackUser,
      dbUser,
      isAuthenticated: !!stackUser && !!dbUser,
    };
  } catch (error) {
    console.error("Server auth error:", error);
    return {
      stackUser: null,
      dbUser: null,
      isAuthenticated: false,
    };
  }
}


export async function isAuthenticated(): Promise<boolean> {
  const auth = await ServerAuth();
  return auth.isAuthenticated;
}

export async function requireAuth(): Promise<ServerAuthData> {
  const auth = await ServerAuth();

  if (!auth.isAuthenticated) {
    throw new Error("Authentication required");
  }

  return auth;
}