"use client";

import { createContext, useContext, type ReactNode, Suspense } from "react";
import dynamic from "next/dynamic";
import { type useUser } from "@stackframe/stack";
import { api } from "~/trpc/react";
import type { RouterOutputs } from "~/trpc/react";
import type { TRPCClientErrorLike } from "@trpc/client";
import type { AppRouter } from "~/server/api/root";

type AuthMeOutput = NonNullable<RouterOutputs["auth"]["me"]>;

interface AuthContextValue {
  stackUser: ReturnType<typeof useUser>;
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
  const data = api.auth.me.useQuery();

  const stackUser = data?.data?.stackUser ?? null;
  const dbUser = data?.data?.dbUser ?? null;

  const isLoading = data.isLoading;
  const isAuthenticated = dbUser !== null;
  const error = data.error ?? null;

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
