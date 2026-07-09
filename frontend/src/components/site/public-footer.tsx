import Image from 'next/image';
import Link from 'next/link';

import {
  Building2,
  CarFront,
  ChevronRight,
  FileText,
  Landmark,
  Mail,
  MapPin,
  MessageCircle,
  Newspaper,
  Phone,
  ShieldCheck,
  UsersRound,
  Video,
} from 'lucide-react';

import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaWhatsapp,
} from 'react-icons/fa';

const navigationLinks = [
  {
    href: '/',
    label: 'Accueil',
    icon: Landmark,
  },
  {
    href: '/la-federation',
    label: 'La fédération',
    icon: Building2,
  },
  {
    href: '/associations',
    label: 'Associations régionales',
    icon: UsersRound,
  },
  {
    href: '/actualites',
    label: 'Actualités',
    icon: Newspaper,
  },
  {
    href: '/marketplace',
    label: 'Marketplace',
    icon: CarFront,
  },
  {
    href: '/videotheque',
    label: 'Vidéothèque',
    icon: Video,
  },
  {
    href: '/contact',
    label: 'Contact',
    icon: FileText,
  },
];

const contactItems = [
  {
    href: 'tel:+212662666276',
    label: '+212 6 62 66 62 76',
    icon: Phone,
  },
  {
    href: 'mailto:contact@flascam.ma',
    label: 'contact@flascam.ma',
    icon: Mail,
  },
  {
    href: 'https://wa.me/212662666276',
    label: 'WhatsApp',
    icon: MessageCircle,
    external: true,
  },
];

const socialLinks = [
  {
    href: 'https://www.instagram.com/flascam.maroc/',
    label: 'Instagram',
    icon: FaInstagram,
  },
  {
    href: 'https://web.facebook.com/federationloueurs',
    label: 'Facebook',
    icon: FaFacebookF,
  },
  {
    href: 'https://www.linkedin.com/company/flascam-maroc/',
    label: 'LinkedIn',
    icon: FaLinkedinIn,
  },
  {
    href: 'https://wa.me/212662666276',
    label: 'WhatsApp',
    icon: FaWhatsapp,
  },
];

export function PublicFooter() {
  return (
    <footer className="mt-16 bg-[var(--flascam-blue-dark)] text-white">
      <div className="site-container py-12 sm:py-16">
        <div className="grid gap-10 md:grid-cols-2 xl:grid-cols-[1.3fr_0.9fr_0.95fr]">
          <div className="space-y-6">
            <Link
              href="/"
              className="flex items-center gap-4"
              aria-label="Accueil FLASCAM"
            >
              <div className="relative flex h-[92px] w-[92px] shrink-0 items-center justify-center rounded-[1.55rem] border-[5px] border-[var(--flascam-blue)] bg-white shadow-[0_18px_45px_rgba(0,0,0,0.12)]">
                <Image
                  src="/Logo-flascam.png"
                  alt="Logo FLASCAM"
                  width={78}
                  height={78}
                  className="h-[66px] w-auto object-contain"
                />
              </div>

              <div className="min-w-0">
                <p className="text-[29px] font-black uppercase leading-[0.9] tracking-[-0.04em] text-white">
                  FLASCAM
                </p>

                <p className="mt-3 max-w-[260px] text-[15px] font-extrabold uppercase leading-[1.2] tracking-[0.08em] text-[var(--flascam-blue-light)]">
                  Fédération nationale
                </p>
              </div>
            </Link>

            <p className="max-w-md text-sm leading-7 text-white/68">
              Fédération des Loueurs d’Automobiles Sans Chauffeur au Maroc.
              La FLASCAM représente, accompagne et valorise les professionnels
              de la location automobile à travers le Royaume.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/contact"
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 text-sm font-bold text-white transition hover:border-white/25 hover:bg-white/10"
              >
                <ShieldCheck className="h-4 w-4 text-[var(--flascam-blue-light)]" />
                Devenir adhérent
              </Link>

              <Link
                href="/la-federation"
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 text-sm font-bold text-white transition hover:border-white/25 hover:bg-white/10"
              >
                <Building2 className="h-4 w-4 text-[var(--flascam-blue-light)]" />
                Découvrir la fédération
              </Link>
            </div>

            <div className="flex items-center gap-3 pt-1">
              {socialLinks.map((item) => {
                const Icon = item.icon;

                return (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/75 transition hover:-translate-y-0.5 hover:border-white/30 hover:bg-white/10 hover:text-white"
                    aria-label={item.label}
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>

          <div>
            <p className="mb-4 text-sm font-black uppercase tracking-[0.2em] text-[var(--flascam-blue-light)]">
              Navigation
            </p>

            <nav
              className="space-y-3"
              aria-label="Navigation pied de page"
            >
              {navigationLinks.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group flex min-h-11 items-center justify-between rounded-xl px-3 text-sm font-medium text-white/72 transition hover:bg-white/5 hover:text-white"
                  >
                    <span className="flex items-center gap-3">
                      <Icon className="h-4 w-4 shrink-0 text-[var(--flascam-blue-light)]" />
                      {item.label}
                    </span>

                    <ChevronRight className="h-4 w-4 text-white/35 transition group-hover:translate-x-0.5 group-hover:text-[var(--flascam-blue-light)]" />
                  </Link>
                );
              })}
            </nav>
          </div>

          <div>
            <p className="mb-4 text-sm font-black uppercase tracking-[0.2em] text-[var(--flascam-blue-light)]">
              Contact
            </p>

            <div className="space-y-3">
              {contactItems.map((item) => {
                const Icon = item.icon;

                if (item.external) {
                  return (
                    <a
                      key={item.label}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex min-h-11 items-center justify-between rounded-xl px-3 text-sm font-medium text-white/72 transition hover:bg-white/5 hover:text-white"
                    >
                      <span className="flex items-center gap-3">
                        <Icon className="h-4 w-4 shrink-0 text-[var(--flascam-blue-light)]" />
                        {item.label}
                      </span>

                      <ChevronRight className="h-4 w-4 text-white/35 transition group-hover:translate-x-0.5 group-hover:text-[var(--flascam-blue-light)]" />
                    </a>
                  );
                }

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm text-white/72 transition hover:bg-white/5 hover:text-white"
                  >
                    <Icon className="h-4 w-4 shrink-0 text-[var(--flascam-blue-light)]" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}

              <div className="flex items-start gap-3 rounded-xl px-3 py-2 text-sm leading-7 text-white/72">
                <MapPin className="mt-1 h-4 w-4 shrink-0 text-[var(--flascam-blue-light)]" />
                <span>
                  21 rue de Sebta, résidence Raihi, 1er étage n°2,
                  Quartier des Hôpitaux, Casablanca.
                </span>
              </div>

              <Link
                href="/contact"
                className="group flex min-h-11 items-center justify-between rounded-xl px-3 text-sm font-medium text-white/72 transition hover:bg-white/5 hover:text-white"
              >
                <span className="flex items-center gap-3">
                  <MessageCircle className="h-4 w-4 shrink-0 text-[var(--flascam-blue-light)]" />
                  Nous contacter
                </span>

                <ChevronRight className="h-4 w-4 text-white/35 transition group-hover:translate-x-0.5 group-hover:text-[var(--flascam-blue-light)]" />
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-5">
          <div className="flex flex-col gap-3 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {new Date().getFullYear()} FLASCAM. Tous droits réservés.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/admin/login"
                className="transition hover:text-white"
              >
                Espace pro
              </Link>

              <Link
                href="/contact"
                className="transition hover:text-white"
              >
                Contact
              </Link>

              <span className="text-white/25">
                FR
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}