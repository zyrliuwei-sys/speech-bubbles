import { createHash } from 'node:crypto';
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { parseArgs, parseEnv } from 'node:util';
import { createClient } from '@libsql/client';
import { getTableColumns, getTableName, is, sql, Table } from 'drizzle-orm';
import { getTableConfig } from 'drizzle-orm/sqlite-core';
import postgres from 'postgres';

import * as schema from '../src/config/db/schema.sqlite';
import { createD1HttpDb } from '../src/core/db/d1-http';

// Run with `pnpm exec tsx scripts/migrate-neon-to-d1.ts <export|prepare|verify>`.
// All source access is read-only. Production D1 imports are deliberately a
// separate reviewed step; this script never changes Vercel or the source DB.
const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: {
    'source-env': { type: 'string' },
    snapshot: { type: 'string' },
    output: { type: 'string', default: 'data/migrations/neon-d1/prepared' },
    'target-env': { type: 'string' },
  },
});

type Value = string | number | boolean | null;
type Snapshot = {
  version: 1;
  exportedAt: string;
  tables: { name: string; columns: string[]; rows: Record<string, Value>[] }[];
};

const tables = Object.values(schema).filter((value) => is(value, Table));
const tableMap = new Map<string, Table>(
  tables.map((table) => [getTableName(table), table])
);
const quote = (name: string) => `"${name.replaceAll('"', '""')}"`;
const checksum = (rows: unknown[][]) =>
  createHash('sha256')
    .update(
      rows
        .map((row) => JSON.stringify(row))
        .sort()
        .join('\n')
    )
    .digest('hex');

async function privateWrite(path: string, content: string) {
  await mkdir(dirname(path), { recursive: true, mode: 0o700 });
  await writeFile(path, content, { mode: 0o600, flag: 'wx' });
}

function required(name: keyof typeof values) {
  const value = values[name];
  if (!value) throw new Error(`Missing --${name}`);
  return value;
}

function orderedTables() {
  const ordered: Table[] = [];
  const visiting = new Set<string>();
  const visited = new Set<string>();
  function visit(table: Table) {
    const name = getTableName(table);
    if (visited.has(name)) return;
    if (visiting.has(name))
      throw new Error(`Foreign key cycle involving ${name}`);
    visiting.add(name);
    for (const fk of getTableConfig(table).foreignKeys) {
      visit(fk.reference().foreignTable);
    }
    visiting.delete(name);
    visited.add(name);
    ordered.push(table);
  }
  tables.forEach(visit);
  return ordered;
}

async function exportSource() {
  const env = parseEnv(await readFile(required('source-env'), 'utf8'));
  if (!env.DATABASE_URL) throw new Error('Source DATABASE_URL is missing');
  const client = postgres(env.DATABASE_URL, {
    max: 1,
    prepare: false,
    connect_timeout: 10,
    connection: { timezone: 'UTC' },
  });
  try {
    const snapshot: Snapshot = {
      version: 1,
      exportedAt: new Date().toISOString(),
      tables: [],
    };
    await client.begin(
      'isolation level repeatable read read only',
      async (tx) => {
        const sourceTables = await tx`
        select table_name from information_schema.tables
        where table_schema = 'public' and table_type = 'BASE TABLE'
        order by table_name
      `;
        for (const { table_name: name } of sourceTables) {
          if (name === '__drizzle_migrations') continue;
          if (!tableMap.has(name))
            throw new Error(`Unmapped source table: ${name}`);
          const columns = await tx`
          select column_name from information_schema.columns
          where table_schema = 'public' and table_name = ${name}
          order by ordinal_position
        `;
          const rows = await tx`select * from ${tx('public')}.${tx(name)}`;
          snapshot.tables.push({
            name,
            columns: columns.map((column) => column.column_name),
            rows: JSON.parse(JSON.stringify(rows)),
          });
          console.log(`${name}: ${rows.length} rows exported`);
        }
      }
    );
    for (const name of ['user', 'account', 'config']) {
      if (!snapshot.tables.some((table) => table.name === name)) {
        throw new Error(`Required source table missing: ${name}`);
      }
    }
    await privateWrite(required('snapshot'), JSON.stringify(snapshot));
    console.log(`Read-only snapshot saved: ${required('snapshot')}`);
  } finally {
    await client.end({ timeout: 3 });
  }
}

function literal(value: unknown): string {
  if (value === null) return 'NULL';
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  if (typeof value === 'string') {
    if (value.includes('\0'))
      return `CAST(X'${Buffer.from(value).toString('hex')}' AS TEXT)`;
    return `'${value.replaceAll("'", "''")}'`;
  }
  throw new Error('Value cannot be represented in SQLite');
}

async function prepare() {
  const snapshot = JSON.parse(
    await readFile(required('snapshot'), 'utf8')
  ) as Snapshot;
  if (snapshot.version !== 1 || !Array.isArray(snapshot.tables))
    throw new Error('Invalid snapshot');
  for (const source of snapshot.tables) {
    if (!tableMap.has(source.name))
      throw new Error(`Unmapped source table: ${source.name}`);
  }
  const output = resolve(values.output!);
  await mkdir(output, { recursive: true, mode: 0o700 });
  // Never overwrite a prepared database or partially replace a backup.
  await privateWrite(`${output}/local.db`, '');
  const local = createClient({ url: `file:${output}/local.db` });
  try {
    const migrationFiles = (await readdir('drizzle/d1'))
      .filter((file) => file.endsWith('.sql'))
      .sort();
    if (!migrationFiles.length)
      throw new Error('Generate D1 schema with drizzle.d1.config.ts first');
    const schemaSql = (
      await Promise.all(
        migrationFiles.map((file) => readFile(`drizzle/d1/${file}`, 'utf8'))
      )
    ).join('\n');
    await local.executeMultiple(schemaSql);
    await local.execute('PRAGMA foreign_keys = ON');
    const inserts: string[] = ['PRAGMA defer_foreign_keys = ON;'];
    const manifest: {
      table: string;
      columns: string[];
      rows: number;
      sha256: string;
    }[] = [];
    for (const table of orderedTables()) {
      const name = getTableName(table);
      const columns = Object.values(getTableColumns(table));
      const source = snapshot.tables.find((entry) => entry.name === name);
      if (source) {
        const expected = columns.map((column) => column.name).sort();
        if (
          JSON.stringify([...source.columns].sort()) !==
          JSON.stringify(expected)
        ) {
          throw new Error(
            `Column mismatch in ${name}; reconcile the schemas before migrating`
          );
        }
      }
      const rows = (source?.rows ?? []).map((row) =>
        columns.map((column) => {
          const value = row[column.name];
          if (value === undefined)
            throw new Error(`Missing ${name}.${column.name}`);
          if (value === null) return null;
          if (column.dataType === 'date') {
            const date = new Date(value as string);
            if (!Number.isFinite(date.getTime()))
              throw new Error(`Invalid date in ${name}.${column.name}`);
            // Some custom tables use seconds; core auth uses milliseconds.
            return column.mapToDriverValue(date);
          }
          if (column.dataType === 'boolean') {
            if (typeof value !== 'boolean')
              throw new Error(`Invalid boolean in ${name}.${column.name}`);
            return column.mapToDriverValue(value);
          }
          return value;
        })
      );
      const prefix = `INSERT INTO ${quote(name)} (${columns.map((column) => quote(column.name)).join(',')}) VALUES `;
      for (const row of rows) {
        const statement = `${prefix}(${row.map(literal).join(',')});`;
        if (Buffer.byteLength(statement) > 95_000)
          throw new Error(
            `Row in ${name} exceeds D1 SQL import size; use a parameterized import`
          );
        inserts.push(statement);
      }
      for (let offset = 0; offset < rows.length; offset += 100) {
        await local.batch(
          rows.slice(offset, offset + 100).map((row) => ({
            sql: `${prefix}(${columns.map(() => '?').join(',')})`,
            args: row as (string | number | null)[],
          })),
          'write'
        );
      }
      const actual = await local.execute(
        `SELECT ${columns.map((column) => quote(column.name)).join(',')} FROM ${quote(name)}`
      );
      if (
        checksum(actual.rows.map((row) => Array.from(row))) !== checksum(rows)
      )
        throw new Error(`Local data mismatch in ${name}`);
      manifest.push({
        table: name,
        columns: columns.map((column) => column.name),
        rows: rows.length,
        sha256: checksum(rows),
      });
      console.log(`${name}: ${rows.length} rows converted and verified`);
    }
    const fk = await local.execute('PRAGMA foreign_key_check');
    if (fk.rows.length) throw new Error('Foreign key validation failed');
    await privateWrite(`${output}/schema.sql`, schemaSql);
    await privateWrite(`${output}/data.sql`, inserts.join('\n'));
    await privateWrite(
      `${output}/manifest.json`,
      JSON.stringify(
        { exportedAt: snapshot.exportedAt, tables: manifest },
        null,
        2
      )
    );
    console.log(
      `Prepared SQL, local SQLite verification, and checksums: ${output}`
    );
  } finally {
    local.close();
  }
}

async function verify() {
  const env = parseEnv(await readFile(required('target-env'), 'utf8'));
  const target = createD1HttpDb({
    database_provider: 'd1',
    database_url: '',
    d1_account_id: env.D1_ACCOUNT_ID,
    d1_database_id: env.D1_DATABASE_ID,
    d1_api_token: env.D1_API_TOKEN,
  });
  const manifest = JSON.parse(
    await readFile(resolve(values.output!, 'manifest.json'), 'utf8')
  ) as {
    tables: {
      table: string;
      columns: string[];
      rows: number;
      sha256: string;
    }[];
  };
  for (const entry of manifest.tables) {
    const rows = await target.values(
      sql.raw(
        `SELECT ${entry.columns.map(quote).join(',')} FROM ${quote(entry.table)}`
      )
    );
    if (rows.length !== entry.rows || checksum(rows) !== entry.sha256)
      throw new Error(`Remote data mismatch in ${entry.table}`);
    console.log(`${entry.table}: ${rows.length} rows, checksum verified`);
  }
  const fk = await target.values(sql.raw('PRAGMA foreign_key_check'));
  if (fk.length) throw new Error('Remote foreign key validation failed');
}

try {
  if (positionals[0] === 'export') await exportSource();
  else if (positionals[0] === 'prepare') await prepare();
  else if (positionals[0] === 'verify') await verify();
  else throw new Error('Use export, prepare or verify');
} catch (error) {
  // Never print a source connection string, query parameters or row values.
  console.error(error instanceof Error ? error.message : 'Migration failed');
  process.exitCode = 1;
}
