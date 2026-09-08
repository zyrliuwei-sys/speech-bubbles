// Run with a temporary SQLite database and schema alias (see test runner).
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createClient } from '@libsql/client';

import {
  AITaskStatus,
  createTask,
  findTask,
  getImageHistory,
  saveTaskImage,
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
const tasks: { id: string }[] = [];
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
const savedImage = 'data:image/png;base64,iVBORw0KGgo=';
await saveTaskImage(tasks[1].id, 'test-user', savedImage);
await saveTaskImage(tasks[1].id, 'test-user', 'should-not-overwrite');
assert.equal(
  JSON.parse((await findTask(tasks[1].id)).taskResult).imageDataUrl,
  savedImage,
  'image bytes persist and cannot be overwritten'
);
await assert.rejects(
  () => saveTaskImage(tasks[1].id, signup.user.id, savedImage),
  /Task not found/
);
await assert.rejects(
  () => saveTaskImage(tasks[0].id, 'test-user', savedImage),
  /Task has failed/
);
for (let i = 0; i < 15; i++) {
  const task = await createTask({
    userId: 'test-user',
    mediaType: 'image',
    provider: 'kie',
    model: 'nano-banana-2-lite',
    prompt: `frame ${i}`,
    costCredits: 0,
  });
  await saveTaskImage(task.id, 'test-user', savedImage);
}
const firstPage = await getImageHistory('test-user', 'nano-banana-2-lite', 1);
const secondPage = await getImageHistory('test-user', 'nano-banana-2-lite', 2);
assert.equal(firstPage.items.length, 12);
assert.equal(firstPage.hasMore, true);
assert.ok(
  secondPage.items.length > 0,
  'older frames remain accessible after 12'
);
assert.equal(
  new Set(
    [...firstPage.items, ...secondPage.items].map(
      (item: { id: string }) => item.id
    )
  ).size,
  firstPage.items.length + secondPage.items.length
);
assert.ok(
  firstPage.items.every((item: object) => !('taskResult' in item)),
  'list does not download all image bytes'
);
assert.deepEqual(
  (await getImageHistory(signup.user.id, 'nano-banana-2-lite', 1)).items,
  [],
  'history is private to the account'
);
const reconnected = createClient({ url: process.env.DATABASE_URL! });
const persisted = await reconnected.execute({
  sql: 'SELECT task_result FROM ai_task WHERE id = ?',
  args: [tasks[1].id],
});
assert.equal(
  JSON.parse(String(persisted.rows[0].task_result)).imageDataUrl,
  savedImage,
  'image survives a new connection'
);
reconnected.close();
console.log(
  'PASS: durable images, immutable saves, account isolation, paginated full history'
);
client.close();
console.log(
  'PASS: welcome credits, duplicate signup, 21-credit charge, insufficient balance, failure refund, terminal-state protection'
);
