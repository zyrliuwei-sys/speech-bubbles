import { drizzle } from 'drizzle-orm/d1';

import { createD1HttpDb } from './d1-http';
import type { DbConfig } from './types';

// Minimal D1Database type to avoid pulling in @cloudflare/workers-types globally
type D1Database = {
  prepare(query: string): any;
  batch(statements: any[]): Promise<any[]>;
  exec(query: string): Promise<any>;
  dump(): Promise<ArrayBuffer>;
};

// D1 singleton instance
let d1DbInstance:
  | ReturnType<typeof drizzle>
  | ReturnType<typeof createD1HttpDb>
  | null = null;

/**
 * Resolve the D1 binding named `DB` (see wrangler.jsonc `d1_databases`).
 *
 * On Cloudflare Workers the binding env is stashed on `globalThis.__CF_ENV__`
 * by the server entry (src/server.ts, via `cloudflare:workers`). Nitro's
 * cloudflare presets also expose it as `globalThis.__env__` — check both.
 */
function getD1Binding(): D1Database | undefined {
  const g = globalThis as any;
  const env = g.__CF_ENV__ ?? g.__env__;
  const binding = env?.DB;
  return binding as D1Database | undefined;
}

export function createD1Db(config: DbConfig) {
  if (d1DbInstance) return d1DbInstance;

  const binding = getD1Binding();
  d1DbInstance = binding ? drizzle(binding) : createD1HttpDb(config);
  return d1DbInstance;
}
