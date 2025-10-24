import { expect, test } from 'vitest';
import { makeCaller } from '~/server/api/test-helper';

test('basic trpc test. hello endpoint', async () => {
  const caller = makeCaller();

  const res = await caller.default.hello({ text: 'world' });
  expect(res.greeting).toEqual('Hello world');
});