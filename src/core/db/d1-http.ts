import { drizzle, type AsyncRemoteCallback } from 'drizzle-orm/sqlite-proxy';

import type { DbConfig } from './types';

type Query = {
  sql: string;
  params: unknown[];
  method: Parameters<AsyncRemoteCallback>[2];
};

type D1Response = {
  success: boolean;
  result?: {
    success: boolean;
    results?: { columns: string[]; rows: unknown[][] };
  }[];
};

/** Connect Node hosts to D1 without exposing a Cloudflare token to the client. */
export function createD1HttpDb(config: DbConfig) {
  const {
    d1_account_id: account,
    d1_database_id: database,
    d1_api_token: token,
  } = config;
  if (!account || !database || !token) {
    throw new Error(
      'D1 requires a Workers DB binding or D1_ACCOUNT_ID, D1_DATABASE_ID and D1_API_TOKEN on the server.'
    );
  }
  const endpoint = `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(account)}/d1/database/${encodeURIComponent(database)}/raw`;

  async function execute(queries: Query[]) {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        batch: queries.map(({ sql, params }) => ({ sql, params })),
      }),
      cache: 'no-store',
      signal: AbortSignal.timeout(15_000),
    });
    // Cloudflare errors can contain SQL and data. Keep them out of responses
    // and logs; Drizzle adds the query context when needed on the server.
    if (!response.ok) throw new Error(`D1 request failed (${response.status})`);
    const payload = (await response.json()) as D1Response;
    if (
      !payload.success ||
      payload.result?.length !== queries.length ||
      payload.result.some((result) => !result.success)
    ) {
      throw new Error('D1 query failed');
    }
    return payload.result.map((result, index) => {
      const rows = result.results?.rows ?? [];
      // sqlite-proxy expects one flat row for .get(), and row arrays for
      // .all()/.values(). Preserve column order, including duplicate names.
      return { rows: queries[index].method === 'get' ? rows[0] : rows };
    });
  }

  return drizzle(
    async (sql, params, method) =>
      (await execute([{ sql, params, method }]))[0],
    execute
  );
}
