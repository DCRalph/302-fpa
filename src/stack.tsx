import "server-only";

import { StackClientApp, StackServerApp } from "@stackframe/stack";

export const stackServerApp = new StackServerApp({
  tokenStore: "nextjs-cookie",
  urls: {
    signIn: "/signin",
    signUp: "/signup",
    afterSignOut: "/",
    afterSignIn: "/member-dashboard",
    home: "/?singedOut=true",
  },
});
