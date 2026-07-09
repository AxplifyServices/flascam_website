import type {
  Metadata,
} from 'next';

import Link from 'next/link';

import {
  ArrowRight,
  BadgeCheck,
  Building2,
  FileCheck2,
  Leaf,
  ShieldCheck,
  UsersRound,
} from 'lucide-react';

import {
  PublicFooter,
} from '@/components/site/public-footer';
import {
  PublicHeader,
} from '@/components/site/public-header';

export const metadata: Metadata = {
  title: 'Accueil',
  description:
    'FLASCAM représente les loueurs automobiles sans chauffeur au Maroc, accompagne la structuration du secteur et valorise la labellisation des professionnels.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'FLASCAM - Fédération des loueurs automobiles sans chauffeur au Maroc',
    description:
      'Découvrez la fédération nationale dédiée à la représentation, la labellisation et la professionnalisation des loueurs automobiles sans chauffeur au Maroc.',
    type: 'website',
    locale: 'fr_MA',
  },
};

const heroStats = [
  {
    value: '+2 000',
    label: 'adhérents représentés',
  },
  {
    value: '80 000',
    label: 'véhicules dans le secteur',
  },
  {
    value: '2013',
    label: 'année de création',
  },
];

const focusItems = [
  {
    icon: ShieldCheck,
    title: 'Représenter',
    description:
      'Porter la voix des loueurs automobiles sans chauffeur auprès des institutions et partenaires.',
  },
  {
    icon: BadgeCheck,
    title: 'Labelliser',
    description:
      'Valoriser les professionnels engagés dans une démarche de confiance, de conformité et de qualité.',
  },
  {
    icon: Leaf,
    title: 'Préparer l’avenir',
    description:
      'Accompagner le secteur vers une mobilité plus responsable, notamment hybride et électrique.',
  },
];

const quickLinks = [
  {
    href: '/la-federation',
    label: 'Découvrir la fédération',
    description:
      'Rôle, mission, positionnement et vision nationale de la FLASCAM.',
  },
  {
    href: '/associations',
    label: 'Associations régionales',
    description:
      'Un espace dédié aux relais régionaux et aux associations affiliées.',
  },
  {
    href: '/actualites',
    label: 'Actualités du secteur',
    description:
      'Événements, communiqués et informations importantes pour la profession.',
  },
];

function VehicleLineIcon({
  className = '',
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 640 260"
      className={`h-auto w-full ${className}`}
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M92 164C102 111 139 86 200 80L260 74C290 52 323 42 365 42L459 45C506 49 544 66 580 95L613 106C631 112 640 128 640 150V165C640 174 635 179 626 179H561"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M92 164H176"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
      />

      <path
        d="M243 179H493"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
      />

      <circle
        cx="208"
        cy="179"
        r="34"
        stroke="white"
        strokeWidth="6"
      />

      <circle
        cx="528"
        cy="179"
        r="34"
        stroke="white"
        strokeWidth="6"
      />

      <circle
        cx="208"
        cy="179"
        r="12"
        fill="currentColor"
      />

      <circle
        cx="528"
        cy="179"
        r="12"
        fill="currentColor"
      />
    </svg>
  );
}

function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[var(--ivory)] py-12 sm:py-16 lg:py-24">
      <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-[rgba(15,95,159,0.08)] blur-3xl" />

      <div className="site-container relative grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <p className="section-eyebrow">
            Fédération nationale
          </p>

<h1 className="mt-4 max-w-5xl text-3xl font-extrabold leading-[1.08] tracking-[-0.045em] text-[var(--flascam-black)] sm:text-4xl lg:text-[3.2rem]">
  Unir, défendre et professionnaliser les loueurs automobiles sans chauffeur au Maroc.
</h1>

          <p className="section-body max-w-3xl">
            La FLASCAM représente les professionnels de la location automobile sans chauffeur,
            accompagne la structuration du secteur et renforce la confiance entre loueurs,
            clients, partenaires et institutions.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/la-federation"
              className="inline-flex h-[3.25rem] items-center justify-center gap-2 rounded-full bg-[var(--flascam-blue-dark)] px-7 font-semibold !text-white shadow-[0_18px_40px_rgba(7,53,93,0.22)] transition hover:bg-[var(--flascam-blue)]"
            >
              Découvrir la fédération
              <ArrowRight size={18} aria-hidden="true" />
            </Link>

            <Link
              href="/contact"
              className="inline-flex h-[3.25rem] items-center justify-center rounded-full border border-[var(--flascam-border)] bg-white px-7 font-semibold text-[var(--flascam-blue-dark)] transition hover:border-[var(--flascam-blue)] hover:text-[var(--flascam-blue)]"
            >
              Devenir adhérent
            </Link>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[2rem] bg-[var(--flascam-blue-dark)] p-7 text-white shadow-[0_26px_80px_rgba(7,53,93,0.18)] sm:p-10">
          <div className="absolute -right-20 -top-20 size-56 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.18)_0%,rgba(255,255,255,0.08)_38%,transparent_72%)] blur-2xl" />
          <div className="absolute -bottom-28 -left-20 size-72 rounded-full bg-[radial-gradient(circle,rgba(15,95,159,0.46)_0%,rgba(15,95,159,0.18)_42%,transparent_70%)] blur-sm" />

<div className="relative -mr6 -mt-5 flex justify-end text-white">
  <VehicleLineIcon className="max-w-[125px] sm:max-w-[155px]" />
</div>

          <p className="relative mt-8 max-w-md text-2xl font-extrabold leading-tight sm:text-3xl">
            Une plateforme nationale pour structurer un secteur clé de la mobilité et du tourisme.
          </p>

          <div className="relative mt-8 grid gap-3 sm:grid-cols-3">
            {heroStats.map((stat) => (
<div
  key={stat.label}
  className="interactive-card-dark rounded-2xl border border-white/[0.12] bg-white/[0.08] p-4 outline-none"
>
                <p className="text-2xl font-extrabold">
                  {stat.value}
                </p>
                <p className="mt-2 text-xs font-semibold leading-5 text-white/78">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          <p className="relative mt-5 text-xs leading-6 text-white/65">
            Chiffres issus des prises de parole publiques et annuaires professionnels. À confirmer
            par la fédération avant publication définitive.
          </p>
        </div>
      </div>
    </section>
  );
}

function FederationPreview() {
  return (
    <section
      className="bg-white py-16 sm:py-24"
      aria-labelledby="home-federation-title"
    >
      <div className="site-container grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
          {focusItems.map((item) => (
<article
  key={item.title}
  className="interactive-card rounded-[1.5rem] border border-slate-200 bg-white p-6 outline-none shadow-[0_18px_50px_rgba(15,23,42,0.04)]"
>
              <item.icon
                size={28}
                className="text-[var(--flascam-blue)]"
                aria-hidden="true"
              />

              <h2 className="mt-5 text-lg font-extrabold text-[var(--flascam-black)]">
                {item.title}
              </h2>

              <p className="mt-3 text-sm leading-7 text-[var(--flascam-slate)]">
                {item.description}
              </p>
            </article>
          ))}
        </div>

        <div>
          <p className="section-eyebrow">
            Rôle de la FLASCAM
          </p>

          <h2
            id="home-federation-title"
            className="mt-4 max-w-4xl text-3xl font-extrabold leading-tight tracking-[-0.035em] text-[var(--flascam-black)] sm:text-4xl lg:text-[3.25rem]"
          >
            La voix unifiée de la location automobile professionnelle au Maroc.
          </h2>

          <p className="section-body">
            La FLASCAM fédère les loueurs automobiles sans chauffeur, soutient les actions
            collectives et accompagne les professionnels dans les enjeux de conformité,
            de qualité de service, de visibilité et de transition durable.
          </p>

          <p className="section-body">
            Elle agit comme point de référence pour les professionnels, les associations
            régionales, les partenaires économiques et les institutions concernées par la
            mobilité, le tourisme et l’automobile.
          </p>
        </div>
      </div>
    </section>
  );
}

function AccessSection() {
  return (
    <section className="bg-[var(--ivory)] py-16 sm:py-24">
      <div className="site-container">
        <div className="max-w-4xl">
          <p className="section-eyebrow">
            Accès rapide
          </p>

          <h2 className="mt-4 text-3xl font-extrabold leading-tight tracking-[-0.035em] text-[var(--flascam-black)] sm:text-4xl lg:text-[3rem]">
            Un parcours simple pour comprendre, adhérer et suivre l’actualité de la profession.
          </h2>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {quickLinks.map((item) => (
<Link
  key={item.href}
  href={item.href}
  className="interactive-card group rounded-[1.75rem] border border-slate-200 bg-white p-6 outline-none shadow-[0_18px_50px_rgba(15,23,42,0.04)]"
>
              <div className="flex size-12 items-center justify-center rounded-2xl bg-[var(--flascam-blue-light)] text-[var(--flascam-blue)]">
                {item.href === '/la-federation' && <Building2 size={24} aria-hidden="true" />}
                {item.href === '/associations' && <UsersRound size={24} aria-hidden="true" />}
                {item.href === '/actualites' && <FileCheck2 size={24} aria-hidden="true" />}
              </div>

              <h3 className="mt-6 text-xl font-extrabold text-[var(--flascam-black)] group-hover:text-[var(--flascam-blue)]">
                {item.label}
              </h3>

              <p className="mt-3 text-sm leading-7 text-[var(--flascam-slate)]">
                {item.description}
              </p>

              <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[var(--flascam-blue)]">
                Consulter
                <ArrowRight size={16} aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <PublicHeader />

      <main>
        <HeroSection />
        <FederationPreview />
        <AccessSection />
      </main>

      <PublicFooter />
    </>
  );
}