"use client";

import { createContext, useContext, type ReactNode, Suspense } from "react";
import dynamic from "next/dynamic";
import { api } from "~/trpc/react";
import type { RouterOutputs } from "~/trpc/react";
import type { TRPCClientErrorLike } from "@trpc/client";
import type { AppRouter } from "~/server/api/root";
import { authClient } from "~/lib/auth-client";

type AuthMeOutput = NonNullable<RouterOutputs["auth"]["me"]>;

interface AuthContextValue {
  stackUser: NonNullable<AuthMeOutput["session"]>["user"] | null;
  dbUser: AuthMeOutput["dbUser"] | null;
  error: TRPCClientErrorLike<AppRouter> | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

function AuthProviderInner({ children }: AuthProviderProps) {
  const me = api.auth.me.useQuery();
  const { data: sessionData, isPending } = authClient.useSession();

  const stackUser = sessionData?.user ?? null;
  const dbUser = me?.data?.dbUser ?? null;

  const isLoading = me.isLoading || isPending;
  const isAuthenticated = !!sessionData && dbUser !== null;
  const error = me.error ?? null;

  return (
    <AuthContext.Provider
      value={{
        stackUser,
        dbUser: dbUser ?? null,
        error,
        isLoading,
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
