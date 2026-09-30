import { CATEGORIES } from '@/config/sites';
import { m } from '@/paraglide/messages.js';
import { SiteFooter, type FooterColumn } from '@/components/site-footer';

import { categoryHref, categoryLabel } from './nav-i18n';

export function Footer() {
  const columns: FooterColumn[] = [
    {
      title: m['landing.footer.browse'](),
      links: [
        { label: m['landing.nav.directory'](), href: '/#directory' },
        { label: m['landing.nav.categories'](), href: '/#categories' },
        { label: m['landing.nav.submit'](), href: '/submit' },
      ],
    },
    {
      title: m['landing.footer.categories'](),
      links: CATEGORIES.slice(0, 5).map((c) => ({
        label: categoryLabel(c.slug),
        href: categoryHref(c.slug),
      })),
    },
    {
      title: m['landing.footer.more'](),
      links: CATEGORIES.slice(5).map((c) => ({
        label: categoryLabel(c.slug),
        href: categoryHref(c.slug),
      })),
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
