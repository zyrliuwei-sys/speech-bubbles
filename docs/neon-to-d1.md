# D1 production database

The website stays on Vercel and uses a fresh Cloudflare D1 database. On
2026-10-31 the user explicitly cancelled the Neon data migration and asked to
start with empty D1 data and a new super administrator. The scheduled Neon
follow-up has been deleted. Do not resume that migration or import old data.

## Database

- Name: `speech-bubbles-db`.
- Database ID: `c9c2fb1d-5040-44db-9dd5-37ad9f283742`.
- Cloudflare account: `d7c3d8fa2229ed65b03fd28fc8659989`; region: ENAM.
- Root `wrangler.jsonc` is the gitignored D1 management configuration.
- D1 migrations are generated with `drizzle.d1.config.ts` under `drizzle/d1/`,
  separate from the previous PostgreSQL migration history.
- Initial migration `0000_parched_stranger.sql` creates 23 application tables.
- Default RBAC initialization seeds 29 permissions and four roles.
- Super administrator: `zyrliuwei@gmail.com`, active `super_admin` with `*`.
  Its credential is stored only as a better-auth password hash.

## Vercel connection

Production and preview use these server-only environment variables:

```env
DATABASE_PROVIDER=d1
DATABASE_URL=
D1_ACCOUNT_ID=<account-id>
D1_DATABASE_ID=<database-id>
D1_API_TOKEN=<cloudflare-token-with-d1-edit-permission>
```

`AUTH_SECRET` is unchanged. `src/core/db/d1-http.ts` connects Node/Vercel to
Cloudflare's D1 REST API through Drizzle's SQLite proxy. Workers can still use
the native `DB` binding, but this website is hosted on Vercel.

Keep local credential files private. `data/migrations/neon-d1/d1.env` and the
administrator provisioning record in the same directory are gitignored and
mode 0600. Never print or commit their contents. Any old Neon configuration
backup is historical only and is not a live connection or an import source.

## Validation

- `DATABASE_PROVIDER=d1 pnpm build` passes.
- The D1 HTTP driver tests pass.
- Real better-auth email sign-in and session reads succeed against D1.
- The administrator's wildcard RBAC permission is verified against D1.

After changing Vercel environment variables, redeploy so the runtime and the
generated SQLite schema both use D1. Use `/sign-in` to log in and `/admin` for
the administration panel.
