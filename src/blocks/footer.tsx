import { m } from '@/paraglide/messages.js';
import { SiteFooter, type FooterColumn } from '@/components/site-footer';

export function Footer() {
  const columns: FooterColumn[] = [
    {
      title: m['landing.footer.feature'](),
      links: [
        { label: m['landing.nav.editor'](), href: '/editor' },
        { label: m['landing.nav.features'](), href: '/#features' },
        { label: m['landing.nav.pricing'](), href: '/pricing' },
      ],
    },
    {
      title: m['landing.footer.legal'](),
      links: [
        { label: m['landing.footer.privacy'](), href: '/privacy-policy' },
        { label: m['landing.footer.terms'](), href: '/terms-of-service' },
      ],
    },
  ];

  return (
    <SiteFooter tagline={m['landing.footer.tagline']()} columns={columns} />
  );
}
