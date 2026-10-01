import { m } from '@/paraglide/messages.js';
import { SiteHeader } from '@/components/site-header';

export function Header() {
  const navLinks = [
    { href: '/#directory', label: m['landing.nav.directory']() },
    { href: '/#categories', label: m['landing.nav.categories']() },
    { href: '/submit', label: m['landing.nav.submit']() },
  ];

  return (
    <SiteHeader
      navLinks={navLinks}
      ctaHref="/submit"
      ctaLabel={m['landing.nav.submit']()}
      signInHref="/sign-in"
      signInLabel={m['common.nav.sign_in']()}
    />
  );
}
