import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const dir = mkdtempSync(join(tmpdir(), 'editor-credits-'));
try {
  const schema = execFileSync(
    'pnpm',
    [
      'exec',
      'drizzle-kit',
      'export',
      '--dialect',
      'sqlite',
      '--schema',
      'src/config/db/schema.sqlite.ts',
    ],
    { encoding: 'utf8' }
  );
  writeFileSync(join(dir, 'schema.sql'), schema);
  writeFileSync(
    join(dir, 'tsconfig.json'),
    JSON.stringify({
      compilerOptions: {
        baseUrl: process.cwd(),
        paths: {
          '@/config/db/schema': [resolve('src/config/db/schema.sqlite.ts')],
          '@/*': [resolve('src/*')],
        },
      },
    })
  );
  execFileSync(
    'pnpm',
    [
      'exec',
      'tsx',
      '--tsconfig',
      join(dir, 'tsconfig.json'),
      'tests/editor-credits.ts',
    ],
    {
      stdio: 'inherit',
      env: {
        ...process.env,
        DATABASE_PROVIDER: 'sqlite',
        DATABASE_URL: `file:${join(dir, 'test.db')}`,
        TEST_SCHEMA_SQL: join(dir, 'schema.sql'),
      },
    }
  );
} finally {
  rmSync(dir, { recursive: true, force: true });
}
