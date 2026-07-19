/**
 * Speech Bubbles editor — export entitlement logic.
 *
 * Pure function (no module cross-imports): the API route fetches the user's
 * balance and subscription status via the credits/subscriptions services and
 * passes them in. This keeps the editor module independent per the repo's
 * module rules.
 *
 * Freemium model:
 *  - Not signed in        → free, watermarked, capped at 1280px.
 *  - Active subscription  → HD, no watermark, unlimited (no credit charge).
 *  - Credits on account   → HD, no watermark, costs 1 credit per export.
 *  - Otherwise            → free, watermarked.
 */

export interface ExportEntitlement {
  hd: boolean;
  watermark: boolean;
  /** Credits to deduct for this export (0 if free / subscriber). */
  credits: number;
}

export const HD_EXPORT_CREDIT_COST = 1;

export function resolveExportEntitlement(params: {
  loggedIn: boolean;
  hasActiveSubscription: boolean;
  balance: number;
}): ExportEntitlement {
  if (!params.loggedIn) {
    return { hd: false, watermark: true, credits: 0 };
  }
  if (params.hasActiveSubscription) {
    return { hd: true, watermark: false, credits: 0 };
  }
  if (params.balance >= HD_EXPORT_CREDIT_COST) {
    return { hd: true, watermark: false, credits: HD_EXPORT_CREDIT_COST };
  }
  return { hd: false, watermark: true, credits: 0 };
}
