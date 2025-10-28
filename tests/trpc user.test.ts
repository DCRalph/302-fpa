import { expect, test, beforeAll } from 'vitest';
import { randomUUID } from 'crypto';
import { auth } from '~/lib/auth';
import { authClient } from '~/lib/auth-client';
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
    returnHeaders: true,
  });

  const signInHeaders = new Headers(signInRes.headers);
  const signInCookie = signInHeaders.get('Set-Cookie');
  const signInCookieAuthToken = signInCookie?.split(';').find(cookie => cookie.trim().startsWith('auth_token='));
  const signInCookieAuthTokenValue = signInCookieAuthToken?.split('=')[1];



  const cookieValue = `auth_token=${signInCookieAuthTokenValue};`;
  // Provide headers to getSession. Some implementations accept { headers } or a Request.
  const headers = new Headers();
  headers.set('Cookie', cookieValue);
  console.log('headers', headers);

  const session = await auth.api.getSession({ headers });

  console.log('session', session);

  expect(session).not.toBeNull();
  expect(session?.user.email).toBe('test@test.com');


  const caller = makeCaller({
    dbUser: user,
    session,
    headers,
  });

  const res = await caller.auth.me();
  expect(res.dbUser?.email).toEqual('test@test.com');
});
