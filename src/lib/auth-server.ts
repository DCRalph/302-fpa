import { api } from "~/trpc/server";
import type { RouterOutputs } from "~/trpc/react";

type AuthMeOutput = RouterOutputs["auth"]["me"];
type SessionUser = NonNullable<AuthMeOutput["session"]>["user"];

export interface ServerAuthData {
  stackUser: SessionUser | null;
  dbUser: AuthMeOutput["dbUser"] | null;
  isAuthenticated: boolean;
}

export async function ServerAuth(): Promise<ServerAuthData> {
  try {
    const data = await api.auth.me();

    const session = data?.session ?? null;
    const stackUser = session?.user ?? null;
    const dbUser = data?.dbUser ?? null;

    return {
      stackUser,
      dbUser,
      isAuthenticated: !!session && !!dbUser,
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