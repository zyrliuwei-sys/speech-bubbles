import { defineConfig } from 'drizzle-kit';

// Keep D1 migrations separate from the existing PostgreSQL migration history.
export default defineConfig({
  schema: './src/config/db/schema.sqlite.ts',
  out: './drizzle/d1',
  dialect: 'sqlite',
});
