"use client";

import { createContext, useContext, type ReactNode, Suspense } from "react";
import dynamic from "next/dynamic";
import { useUser } from "@stackframe/stack";
import { api } from "~/trpc/react";
import type { RouterOutputs } from "~/trpc/react";
import type { TRPCClientErrorLike } from "@trpc/client";
import type { AppRouter } from "~/server/api/root";



interface AuthContextValue {
  stackUser: ReturnType<typeof useUser>;
  dbUser: RouterOutputs["auth"]["me"];
  error: TRPCClientErrorLike<AppRouter> | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

function AuthProviderInner({ children }: AuthProviderProps) {
  const stackUser = useUser();
  const dbUser = api.auth.me.useQuery(
    undefined,
    {
      enabled: !!stackUser,
      staleTime: 1000 * 60 * 5,
    }
  );

  const isLoading = !stackUser || dbUser.isLoading;
  const isAuthenticated = !!stackUser && !!dbUser.data;
  const error = dbUser.error ?? null;

  return (
    <AuthContext.Provider
      value={{
        stackUser,
        dbUser: dbUser.data ?? null,
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
