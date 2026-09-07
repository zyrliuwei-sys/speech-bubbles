import postgres from 'postgres';

const url = process.env.DATABASE_URL!;
const client = postgres(url, { prepare: false, max: 1 });
const rows = await client`select key, value from config where key like 'paypal%' or key = 'default_payment_provider'`;
for (const r of rows) {
  const v = r.key.includes('secret') ? r.value.slice(0, 6) + '...' : r.value;
  console.log(`${r.key} = ${v}`);
}
await client.end();
