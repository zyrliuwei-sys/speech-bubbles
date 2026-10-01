import { createFileRoute } from '@tanstack/react-router';

import { getAuth } from '@/core/auth';
import {
  createSubmittedSite,
  SubmissionError,
} from '@/modules/submissions/service';
import { enforceMinIntervalRateLimit } from '@/lib/rate-limit';
import { respData, respErr } from '@/lib/resp';

async function POST({ request }: { request: Request }) {
  try {
    const auth = getAuth();
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) return respErr('Unauthorized');

    // Burst guard on top of the daily cap enforced in the service
    const limited = enforceMinIntervalRateLimit(request, {
      intervalMs: 10_000,
      keyPrefix: 'site-submit',
      extraKey: session.user.id,
    });
    if (limited) return limited;

    const body = await request.json().catch(() => ({}));
    const str = (v: unknown) => (typeof v === 'string' ? v : '');
    const site = await createSubmittedSite({
      userId: session.user.id,
      name: str(body.name),
      url: str(body.url),
      category: str(body.category),
      tagline: str(body.tagline),
    });
    return respData({ slug: site.slug });
  } catch (error) {
    if (error instanceof SubmissionError) return respErr(error.code);
    console.error('site submission failed:', error);
    return respErr('Internal error');
  }
}

export const Route = createFileRoute('/api/submissions')({
  server: { handlers: { POST } },
});
