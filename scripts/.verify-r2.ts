import { randomUUID } from 'node:crypto';
import { AwsClient } from 'aws4fetch';

import { getAllConfigs } from '@/modules/config/service';
import { getStorage } from '@/modules/storage/service';

const c = await getAllConfigs();
console.log(
  JSON.stringify({
    bucket: c.r2_bucket_name || null,
    publicDomain: c.r2_domain || null,
    uploadPath: c.r2_upload_path || 'uploads',
  })
);
const storage = await getStorage();
if (!storage) {
  console.log('R2_NOT_CONFIGURED');
  process.exit(1);
}
const body = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a7WQAAAAASUVORK5CYII=',
  'base64'
);
const result = await storage.uploadFile({
  key: `settings-test/codex-r2-check-${randomUUID()}.png`,
  body,
  contentType: 'image/png',
  disposition: 'inline',
});
console.log(
  JSON.stringify({ upload: result.success, error: result.error || null })
);
if (!result.success || !result.location || !result.url) process.exit(1);
const client = new AwsClient({
  accessKeyId: c.r2_access_key,
  secretAccessKey: c.r2_secret_key,
  region: 'auto',
});
try {
  const head = await client.fetch(result.location, {
    method: 'HEAD',
    signal: AbortSignal.timeout(20000),
  });
  console.log(JSON.stringify({ authenticatedHead: head.status }));
  const imageUrl = new URL(result.url);
  imageUrl.hostname = 'img.speechbubbleswithtext.com';
  const r = await fetch(imageUrl, {
    headers: { Origin: 'https://www.speechbubbleswithtext.com' },
    signal: AbortSignal.timeout(20000),
  });
  const bytes = Buffer.from(await r.arrayBuffer());
  console.log(
    JSON.stringify({
      authenticatedHead: head.status,
      publicRead: r.status,
      exactBytes: body.equals(bytes),
      contentType: r.headers.get('content-type'),
      cors: r.headers.get('access-control-allow-origin'),
    })
  );
} catch {
  console.log('READ_FAILED');
} finally {
  const cleanup = await client.fetch(result.location, {
    method: 'DELETE',
    signal: AbortSignal.timeout(20000),
  });
  console.log(
    JSON.stringify({
      testObjectRemoved: cleanup.ok,
      cleanupStatus: cleanup.status,
    })
  );
}
process.exit(0);
