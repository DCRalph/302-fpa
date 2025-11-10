"use client";

// Auth provider hook
// Client-only provider that wraps an internal `AuthProviderInner` via dynamic import
// to avoid SSR. It exposes `useAuth()` which returns session + dbUser + status flags.
// Note: this hook triggers a `me` query invalidation whenever the client session
// changes so the UI stays in sync with auth state.

import { createContext, useContext, type ReactNode, Suspense } from "react";
import dynamic from "next/dynamic";
import { api } from "~/trpc/react";
import type { RouterOutputs } from "~/trpc/react";
import type { TRPCClientErrorLike } from "@trpc/client";
import type { AppRouter } from "~/server/api/root";
import { authClient } from "~/lib/auth-client";
import { useEffect } from "react"

type AuthMeOutput = NonNullable<RouterOutputs["auth"]["me"]>;

interface AuthContextValue {
  session: NonNullable<AuthMeOutput["session"]> | null;
  dbUser: AuthMeOutput["dbUser"] | null;
  error: TRPCClientErrorLike<AppRouter> | null;
  isPending: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

function AuthProviderInner({ children }: AuthProviderProps) {
  const me = api.auth.me.useQuery();
  const utils = api.useUtils()
  const { data: sessionData, isPending: isPendingClient } = authClient.useSession();

  useEffect(() => {
    void utils.auth.me.invalidate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionData])

  const session = sessionData ?? null;
  const dbUser = me?.data?.dbUser ?? null;

  const isPending = me.isPending || isPendingClient;
  const isAuthenticated = !!sessionData && dbUser !== null;
  const error = me.error ?? null;

  return (
    <AuthContext.Provider
      value={{
        session,
        dbUser: dbUser ?? null,
        error,
        isPending,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

const AuthProviderClient = dynamic(
  () => Promise.resolve(AuthProviderInner),
  { ssr: false }
);

export function AuthProvider({ children }: AuthProviderProps) {
  return (
    <Suspense fallback={<></>}>
      <AuthProviderClient>{children}</AuthProviderClient>
    </Suspense>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
