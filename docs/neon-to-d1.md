# Neon → Cloudflare D1 migration

The website stays on Vercel. D1 is accessed from the server through Cloudflare's
REST API using `DATABASE_PROVIDER=d1`, `D1_ACCOUNT_ID`, `D1_DATABASE_ID`, and
`D1_API_TOKEN`. A Workers `DB` binding remains supported. Keep `AUTH_SECRET`
and any `CONFIG_ENCRYPTION_KEY` unchanged during the migration.

## Prepared on 2026-10-31

- Target: `speech-bubbles-db`, D1 ID `c9c2fb1d-5040-44db-9dd5-37ad9f283742`.
- Cloudflare account: `d7c3d8fa2229ed65b03fd28fc8659989`; region: ENAM.
- Source: Neon project `bold-wildflower-90871554`, production branch
  `br-misty-surf-axk4k484`. Source reads currently fail with quota error `53000`.
- Neon reports `consumption_period_end=2026-11-01T00:00:00Z`, which is
  2026-11-01 08:00 Asia/Shanghai. Recheck access after that time.
- Production Vercel configuration is backed up to
  `data/migrations/neon-d1/vercel-production.env` (gitignored, mode 0600).
- Root `wrangler.jsonc` is the gitignored D1 management configuration.
- D1 schema: `drizzle/d1/0000_parched_stranger.sql`, generated with
  `drizzle.d1.config.ts`. It creates 23 tables and indexes, with no DROP or DELETE.
  This history is separate from existing PostgreSQL migrations.
- No production schema, data, or Vercel environment has been switched yet.

## Export, convert, and validate

When source reads are available, export a consistent read-only snapshot:

```sh
node --import tsx scripts/migrate-neon-to-d1.ts export \
  --source-env data/migrations/neon-d1/vercel-production.env \
  --snapshot data/migrations/neon-d1/neon-20261101.json

node --import tsx scripts/migrate-neon-to-d1.ts prepare \
  --snapshot data/migrations/neon-d1/neon-20261101.json
```

The prepare step converts booleans and the correct seconds/milliseconds for each
timestamp column, validates all data against a local SQLite database, checks
foreign keys, and creates `schema.sql`, `data.sql`, and `manifest.json` under
`data/migrations/neon-d1/prepared/`. It preserves IDs, password hashes, OAuth
credentials, credits, orders, roles, sessions, and config values. It rejects
unknown tables, column mismatches, invalid values, or SQL statements exceeding
the import size limit. Existing backup/preparation files are never overwritten.

The SQL files and local SQLite database contain sensitive data. Keep them in
the gitignored `data/` directory. Never print their contents or commit them.

## Reviewed production steps

Before the final export, pause writes to the source site so registrations,
sessions, submissions, and payments cannot race the snapshot. Review the actual
source schema and row counts, then obtain the production migration review
required by `AGENTS.md` before applying SQL to D1.

1. Apply the reviewed D1 schema with
   `pnpm exec wrangler d1 migrations apply speech-bubbles-db --remote`.
2. Import only the actual exported data, never the validation fixture:
   `pnpm exec wrangler d1 execute speech-bubbles-db --remote --file data/migrations/neon-d1/prepared/data.sql`.
3. Save the D1 credentials in a private target env file. Verify all row counts,
   sorted-row SHA-256 checksums, and foreign keys with:

   ```sh
   node --import tsx scripts/migrate-neon-to-d1.ts verify \
     --target-env data/migrations/neon-d1/d1.env
   ```

4. Test a Vercel preview built with `DATABASE_PROVIDER=d1` and the D1 credentials.
   Preserve the source auth/encryption secrets. Verify config loading, email and
   configured social login, session reads, admin access, and site submissions.
5. After production approval, change the Vercel production database variables
   and redeploy. Retest the public config and login endpoints before resuming
   writes.
6. Keep Neon and the original Vercel env backup for rollback. If any writes have
   reached D1 after cutover, reconcile them before reverting to Neon.

Do not deploy the website to Cloudflare Workers; the user chose Vercel hosting.
Do not delete or reset Neon. Do not use `data/local.db`, which is an old local
database, as a replacement for the complete Neon export.
