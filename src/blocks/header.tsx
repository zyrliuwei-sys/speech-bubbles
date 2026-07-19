import { m } from '@/paraglide/messages.js';
import { SiteHeader } from '@/components/site-header';

export function Header() {
  const navLinks = [
    { href: '/editor', label: m['landing.nav.editor']() },
    { href: '/#features', label: m['landing.nav.features']() },
    { href: '/#how-it-works', label: m['landing.nav.how_it_works']() },
    { href: '/pricing', label: m['landing.nav.pricing']() },
    { href: '/blog', label: m['landing.nav.blog']() },
  ];

  return (
    <SiteHeader
      navLinks={navLinks}
      ctaHref="/editor"
      ctaLabel={m['landing.hero.cta']()}
    />
  );
}
