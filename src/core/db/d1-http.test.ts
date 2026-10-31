import assert from 'node:assert/strict';
import { mock, test } from 'node:test';
import { eq, sql } from 'drizzle-orm';

import { user } from '../../config/db/schema.sqlite';
import { createD1HttpDb } from './d1-http';

const config = {
  database_provider: 'd1',
  database_url: '',
  d1_account_id: 'test-account',
  d1_database_id: 'test-database',
  d1_api_token: 'test-server-token',
};

test('D1 preserves column order and maps dates and booleans for auth', async () => {
  const fetchMock = mock.method(
    globalThis,
    'fetch',
    async (url: RequestInfo | URL, options?: RequestInit) => {
      assert.equal(
        url,
        'https://api.cloudflare.com/client/v4/accounts/test-account/d1/database/test-database/raw'
      );
      assert.equal(
        new Headers(options?.headers).get('Authorization'),
        'Bearer test-server-token'
      );
      const { batch } = JSON.parse(String(options?.body));
      assert.deepEqual(batch[0].params, ['u1']);
      assert.match(batch[0].sql, /where "user"\."id" = \?/);
      return Response.json({
        success: true,
        result: [
          { success: true, results: { rows: [['u1', 1, 1793404800123]] } },
        ],
      });
    }
  );
  try {
    const db = createD1HttpDb(config);
    const [row] = await db
      .select({
        id: user.id,
        verified: user.emailVerified,
        created: user.createdAt,
      })
      .from(user)
      .where(eq(user.id, 'u1'));
    assert.deepEqual(row, {
      id: 'u1',
      verified: true,
      created: new Date(1793404800123),
    });
  } finally {
    fetchMock.mock.restore();
  }
});

test('D1 get returns undefined for an empty result', async () => {
  const fetchMock = mock.method(globalThis, 'fetch', async () =>
    Response.json({
      success: true,
      result: [{ success: true, results: { rows: [] } }],
    })
  );
  try {
    assert.equal(
      await createD1HttpDb(config).select().from(user).get(),
      undefined
    );
  } finally {
    fetchMock.mock.restore();
  }
});

test('D1 sends a batch as one request and preserves values and get shapes', async () => {
  const fetchMock = mock.method(
    globalThis,
    'fetch',
    async (_url: RequestInfo | URL, options?: RequestInit) => {
      const { batch } = JSON.parse(String(options?.body));
      assert.equal(batch.length, 2);
      return Response.json({
        success: true,
        result: [
          { success: true, results: { rows: [['u1']] } },
          { success: true, results: { rows: [['u2']] } },
        ],
      });
    }
  );
  try {
    const db = createD1HttpDb(config);
    const result = await db.batch([
      db.select({ id: user.id }).from(user),
      db.select({ id: user.id }).from(user),
    ]);
    assert.deepEqual(result, [[{ id: 'u1' }], [{ id: 'u2' }]]);
    assert.equal(fetchMock.mock.callCount(), 1);
  } finally {
    fetchMock.mock.restore();
  }
});

test('D1 rejects HTTP and query failures without including secrets or response data', async () => {
  let ok = false;
  const fetchMock = mock.method(globalThis, 'fetch', async () =>
    ok
      ? Response.json({
          success: false,
          errors: [{ message: 'private database data' }],
        })
      : new Response('private database data', { status: 403 })
  );
  try {
    const db = createD1HttpDb(config);
    await assert.rejects(db.values(sql`select 1`), (error: Error) => {
      assert.equal((error.cause as Error).message, 'D1 request failed (403)');
      assert.doesNotMatch(
        String(error.cause),
        /private database data|test-server-token/
      );
      return true;
    });
    ok = true;
    await assert.rejects(db.values(sql`select 1`), (error: Error) => {
      assert.equal((error.cause as Error).message, 'D1 query failed');
      return true;
    });
  } finally {
    fetchMock.mock.restore();
  }
});
