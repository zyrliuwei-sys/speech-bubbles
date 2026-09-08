// Run with a temporary SQLite database and schema alias (see test runner).
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createClient } from '@libsql/client';

import {
  AITaskStatus,
  createTask,
  findTask,
  updateTask,
} from '@/modules/ai-tasks/service';
import { getBalance, grantForNewUser } from '@/modules/credits/service';

const client = createClient({ url: process.env.DATABASE_URL! });
await client.executeMultiple(
  readFileSync(process.env.TEST_SCHEMA_SQL!, 'utf8')
);
await client.execute(
  "INSERT INTO user (id, name, email) VALUES ('test-user', 'Test', 'test@example.test')"
);
await grantForNewUser({ userId: 'test-user' });
await grantForNewUser({ userId: 'test-user' });
assert.equal(await getBalance('test-user'), 100, 'signup grant is idempotent');
const generate = () =>
  createTask({
    userId: 'test-user',
    mediaType: 'image',
    provider: 'kie',
    model: 'nano-banana-2-lite',
    prompt: 'rabbit',
    costCredits: 21,
  });
const tasks = [];
for (let i = 0; i < 4; i++) tasks.push(await generate());
assert.equal(await getBalance('test-user'), 16);
await assert.rejects(generate, /Insufficient credits/);
assert.equal(await getBalance('test-user'), 16);
await updateTask({ taskId: tasks[0].id, status: AITaskStatus.FAILED });
await updateTask({ taskId: tasks[0].id, status: AITaskStatus.FAILED });
assert.equal(await getBalance('test-user'), 37, 'failure refunds only once');
await updateTask({ taskId: tasks[1].id, status: AITaskStatus.SUCCESS });
await updateTask({ taskId: tasks[1].id, status: AITaskStatus.FAILED });
assert.equal(
  await getBalance('test-user'),
  37,
  'successful task cannot later refund'
);
assert.equal((await findTask(tasks[1].id)).status, 'success');
await generate();
assert.equal(await getBalance('test-user'), 16);
// Exercise the actual auth hook, not just the grant helper.
const { getAuth } = await import('@/core/auth');
const auth = getAuth({ email_auth_enabled: 'true' });
const signup = await auth.api.signUpEmail({
  body: {
    email: 'new-signup@example.test',
    password: 'test-only-password-123',
    name: 'New user',
  },
});
assert.equal(
  await getBalance(signup.user.id),
  100,
  'auth signup grants 100 credits'
);
await auth.api.signInEmail({
  body: {
    email: 'new-signup@example.test',
    password: 'test-only-password-123',
  },
});
assert.equal(
  await getBalance(signup.user.id),
  100,
  'sign-in does not grant again'
);
client.close();
console.log(
  'PASS: welcome credits, duplicate signup, 21-credit charge, insufficient balance, failure refund, terminal-state protection'
);
