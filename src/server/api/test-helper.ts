// helper.ts
import { db } from '../db';

// the normal tRPC route that's used in the server
import { appRouter } from '~/server/api/root';

// the result of initTRPC.create()… then createCallerFactory is exposed
import { createCallerFactory } from '~/server/api/trpc';

export function makeCaller(opts = {}) {
  const createCaller = createCallerFactory(appRouter);
  const callerOptions = {
    db,
    session: null,
    dbUser: null,
    headers: new Headers(),
    ...opts,
  }

  return createCaller(callerOptions);
}