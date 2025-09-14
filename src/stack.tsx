import "server-only";

import { StackServerApp } from "@stackframe/stack";

export const stackServerApp = new StackServerApp({
  tokenStore: "nextjs-cookie",
  urls: {
    signIn: "/handler/auth/sign-in",
    signUp: "/handler/auth/sign-up",
  },
});
