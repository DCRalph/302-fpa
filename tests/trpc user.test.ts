import { expect, test, beforeAll } from 'vitest';
import { randomUUID } from 'crypto';
import { auth } from '~/lib/auth';
import { db } from '~/server/db';
import { makeCaller } from '~/server/api/test-helper';

// If your auth uses fetch internally, ensure a global fetch (node >= 18 usually ok)
// globalThis.Headers is also available in node >= 18.

test('trpc test: auth.me endpoint', async () => {
  await db.account.deleteMany({ where: { accountId: 'test@test.com' } });
  await db.user.deleteMany({ where: { email: 'test@test.com' } });

  const passwordRaw = 'vitest-' + randomUUID();
  const hashedPassword = await (await auth.$context).password.hash(passwordRaw);

  const user = await db.user.create({
    data: {
      email: 'test@test.com',
      name: 'Vitest Test User',
      emailVerified: true,
      role: 'USER',
      accounts: {
        create: {
          id: randomUUID(),
          providerId: 'credential',
          accountId: 'test@test.com',
          password: hashedPassword,
        },
      },
    },
  });

  await db.session.deleteMany({ where: { userId: user.id } });

  // Perform sign-in
  const signInRes = await auth.api.signInEmail({
    body: { email: 'test@test.com', password: passwordRaw },
  });

  // Prefer Set-Cookie if auth.api.signInEmail returns a Response-like or provides headers.
  // If your function returns a plain object, use signInRes.token and recreate the cookie.
  // Better Auth default cookie name is "better-auth.session_token" (check your config).
  const cookieValue = `better-auth.session_token=${signInRes.token}; Path=/; HttpOnly; SameSite=Lax`;

  // Provide headers to getSession. Some implementations accept { headers } or a Request.
  const headers = new Headers();
  headers.set('cookie', cookieValue);

  console.log('headers', headers);

  const session = await auth.api.getSession({ headers });

  console.log('session', session);

  // expect(session?.user?.email ?? session?.email).toBe('test@test.com');

  const caller = makeCaller({
    dbUser: user,
    session,
    headers,
  });

  const res = await caller.auth.me();
  expect(res.dbUser?.email).toEqual('test@test.com');
});