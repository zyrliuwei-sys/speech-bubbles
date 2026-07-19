import { createFileRoute } from '@tanstack/react-router';

import { getAuth } from '@/core/auth';
import { consume, getBalance } from '@/modules/credits/service';
import { resolveExportEntitlement } from '@/modules/editor/service';
import { getCurrentSubscription } from '@/modules/subscriptions/service';
import { respData, respErr } from '@/lib/resp';

/**
 * POST /api/editor/export
 * Returns the export entitlement for the current user (and, for credit-based
 * HD exports, deducts the credit). The actual image is rendered client-side;
 * this endpoint only governs HD / watermark gating.
 */
async function POST({ request }: { request: Request }) {
  try {
    const auth = getAuth();
    const session = await auth.api.getSession({ headers: request.headers });
    const user = session?.user;

    if (!user) {
      // Anonymous users always get the free, watermarked tier.
      return respData(
        resolveExportEntitlement({
          loggedIn: false,
          hasActiveSubscription: false,
          balance: 0,
        })
      );
    }

    const [sub, balance] = await Promise.all([
      getCurrentSubscription(user.id),
      getBalance(user.id),
    ]);

    const entitlement = resolveExportEntitlement({
      loggedIn: true,
      hasActiveSubscription: !!sub,
      balance,
    });

    if (entitlement.credits > 0) {
      const result = await consume({
        userId: user.id,
        userEmail: user.email,
        credits: entitlement.credits,
        scene: 'editor_export',
        description: 'HD export — Speech Bubbles editor',
      });
      if (!result.success) {
        // Balance changed under us — fall back to the free tier rather than failing.
        return respData({ hd: false, watermark: true, credits: 0 });
      }
    }

    const newBalance = await getBalance(user.id);
    return respData({ ...entitlement, credits: newBalance });
  } catch (error: any) {
    return respErr(error?.message || 'Failed to resolve export entitlement');
  }
}

export const Route = createFileRoute('/api/editor/export')({
  server: {
    handlers: { POST },
  },
});
