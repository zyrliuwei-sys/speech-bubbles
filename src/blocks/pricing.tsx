import { useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  Check,
  Globe,
  Image as ImageIcon,
  Palette,
  Sparkles,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';

import { useSession } from '@/core/auth/client';
import { useRouter } from '@/core/i18n/navigation';
import { pricingCatalog } from '@/config/pricing';
import { apiPost } from '@/lib/api-client';
import { m } from '@/paraglide/messages.js';
import { usePublicConfig } from '@/hooks/use-public-config';
import {
  PaymentProviderModal,
  type PaymentProvider,
} from '@/components/payment-provider-modal';
import {
  PricingTable,
  type PricingGroup,
  type PricingPlan,
} from '@/components/pricing-table';

const ALL_PROVIDERS: PaymentProvider[] = [
  'stripe',
  'creem',
  'paypal',
  'alipay',
  'wechat',
];

export function Pricing({ title }: { title?: string } = {}) {
  const router = useRouter();
  const { data: session } = useSession();

  const { data: configsData } = usePublicConfig();
  const configs = configsData ?? {};
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingPlan, setPendingPlan] = useState<PricingPlan | null>(null);
  const [loadingProvider, setLoadingProvider] =
    useState<PaymentProvider | null>(null);

  const enabledProviders = useMemo<PaymentProvider[]>(
    () => ALL_PROVIDERS.filter((p) => configs[`${p}_enabled`] === 'true'),
    [configs]
  );

  const freeFeatures = [
    { icon: Palette, label: m['landing.pricing.feature_all_bubbles']() },
    { icon: ImageIcon, label: m['landing.pricing.feature_max_1280']() },
    { icon: Globe, label: m['landing.pricing.feature_browser_edit']() },
    { icon: Check, label: m['landing.pricing.feature_watermark']() },
  ];
  const paidFeatures = (credits: number) => [
    {
      icon: Zap,
      label: m['landing.pricing.monthly_credits']({ count: credits }),
    },
    { icon: Check, label: m['landing.pricing.feature_no_watermark']() },
    { icon: Sparkles, label: m['landing.pricing.feature_hd_export']() },
    { icon: Palette, label: m['landing.pricing.feature_all_fonts']() },
  ];

  const groups: PricingGroup[] = [
    {
      key: 'monthly',
      label: m['landing.pricing.monthly'](),
      plans: [
        {
          id: 'free',
          name: m['landing.pricing.free'](),
          description: m['landing.pricing.free_desc'](),
          price: '$0',
          features: freeFeatures,
          productId: 'free',
          priceInCents: 0,
          currency: 'usd',
          credits: 0,
          buttonText: m['landing.pricing.free_cta'](),
        },
        ...[
          {
            product: pricingCatalog.starter_monthly,
            name: m['landing.pricing.starter'](),
            description: m['landing.pricing.starter_desc'](),
          },
          {
            product: pricingCatalog.pro_monthly,
            name: m['landing.pricing.pro'](),
            description: m['landing.pricing.pro_desc'](),
            featured: true,
          },
          {
            product: pricingCatalog.studio_monthly,
            name: m['landing.pricing.studio'](),
            description: m['landing.pricing.studio_desc'](),
          },
        ].map(({ product, name, description, featured }) => ({
          id: product.productId,
          productId: product.productId,
          name,
          description,
          price: `$${product.priceInCents / 100}`,
          priceInCents: product.priceInCents,
          currency: product.currency,
          credits: product.credits,
          plan: product.plan,
          features: paidFeatures(product.credits),
          featured,
          badge: featured ? m['landing.pricing.popular']() : undefined,
          interval: m['landing.pricing.per_month'](),
          buttonText: m['landing.pricing.subscribe'](),
        })),
      ],
    },
  ];

  const checkoutMutation = useMutation({
    mutationFn: ({
      plan,
      provider,
    }: {
      plan: PricingPlan;
      provider: PaymentProvider;
    }) =>
      apiPost<{ checkout_url?: string }>('/api/payment/checkout', {
        product_id: plan.productId,
        product_name: plan.productName || plan.name,
        plan_name: plan.plan?.name || plan.name,
        price: plan.priceInCents,
        currency: plan.currency || 'usd',
        type: plan.plan ? 'subscription' : 'one-time',
        description: plan.name,
        plan: plan.plan,
        credits: plan.credits,
        credits_valid_days: plan.creditsValidDays,
        payment_provider: provider,
      }),
    onSuccess: (data) => {
      if (!data?.checkout_url) {
        toast.error('Checkout failed');
        setLoadingProvider(null);
        return;
      }
      window.location.href = data.checkout_url;
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Checkout failed');
      setLoadingProvider(null);
    },
  });

  function startCheckout(plan: PricingPlan, provider: PaymentProvider) {
    setLoadingProvider(provider);
    checkoutMutation.mutate({ plan, provider });
  }

  async function handleCheckout(plan: PricingPlan) {
    // Free tier — no payment, just open the editor.
    if (plan.productId === 'free' || !plan.priceInCents) {
      router.push('/editor');
      return;
    }

    if (!session?.user) {
      const redirect = encodeURIComponent(
        typeof window !== 'undefined' ? window.location.pathname : '/pricing'
      );
      router.push(`/sign-in?redirect=${redirect}`);
      return;
    }

    const selectEnabled = configs.select_payment_enabled === 'true';
    const defaultProvider = (configs.default_payment_provider ||
      enabledProviders[0] ||
      'stripe') as PaymentProvider;

    if (selectEnabled && enabledProviders.length > 1) {
      setPendingPlan(plan);
      setModalOpen(true);
      return;
    }

    await startCheckout(plan, defaultProvider);
  }

  function handleProviderSelect(provider: PaymentProvider) {
    if (!pendingPlan) return;
    startCheckout(pendingPlan, provider);
  }

  return (
    <section
      id="pricing"
      className="border-border border-t px-4 py-24 sm:py-32"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 text-center">
          <h2 className="font-serif text-4xl font-normal tracking-tight sm:text-5xl">
            {title ?? m['landing.pricing.title']()}
          </h2>
          <p className="text-muted-foreground mt-5">
            {m['landing.pricing.description']()}
          </p>
        </div>
        <PricingTable groups={groups} onCheckout={handleCheckout} />
        <p className="text-muted-foreground mt-8 text-center text-sm">
          {m['landing.pricing.billing_note']()}
        </p>
      </div>

      <PaymentProviderModal
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) {
            setPendingPlan(null);
            setLoadingProvider(null);
          }
        }}
        providers={enabledProviders.length ? enabledProviders : ['stripe']}
        loadingProvider={loadingProvider}
        onSelect={handleProviderSelect}
        planName={pendingPlan?.name}
        price={pendingPlan?.price}
      />
    </section>
  );
}
