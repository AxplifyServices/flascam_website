import type {
  Metadata,
} from 'next';

import Link from 'next/link';

import {
  ArrowLeft,
  Car,
  Handshake,
  ShieldCheck,
} from 'lucide-react';

import {
  PublicFooter,
} from '@/components/site/public-footer';
import {
  PublicHeader,
} from '@/components/site/public-header';

export const metadata: Metadata = {
  title: 'La fédération',
  description:
    'Présentation de FLASCAM, fédération nationale des loueurs automobiles sans chauffeur au Maroc.',
  alternates: {
    canonical: '/la-federation',
  },
  openGraph: {
    title: 'La fédération FLASCAM',
    description:
      'Découvrez le rôle, la mission et le positionnement de FLASCAM au service de la location automobile professionnelle au Maroc.',
    type: 'article',
    locale: 'fr_MA',
  },
};

const pillars = [
  {
    icon: ShieldCheck,
    title: 'Représenter la profession',
    description:
      'Porter une voix commune pour les loueurs automobiles professionnels et leurs associations régionales.',
  },
  {
    icon: Handshake,
    title: 'Fédérer les acteurs',
    description:
      'Créer un cadre national de collaboration entre les associations affiliées, les professionnels et les partenaires.',
  },
  {
    icon: Car,
    title: 'Structurer le secteur',
    description:
      'Centraliser l’information officielle et accompagner la montée en qualité de la profession.',
  },
];

function VehicleLineIcon() {
  return (
    <svg
      viewBox="0 0 640 260"
      className="h-auto w-full max-w-[72px] sm:max-w-[90px]"
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

export default function FederationPage() {
  return (
    <>
      <PublicHeader />

      <main>
        <section className="bg-[var(--ivory)] py-14 sm:py-20">
          <div className="site-container">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--flascam-blue)] hover:text-[var(--flascam-blue-dark)]"
            >
              <ArrowLeft
                size={17}
                aria-hidden="true"
              />

              Retour à l’accueil
            </Link>

            <div className="mt-10 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div>
                <p className="section-eyebrow">
                  La fédération
                </p>

<h1
  className="
    max-w-4xl
    text-3xl
    font-extrabold
    leading-tight
    tracking-[-0.035em]
    text-[var(--flascam-black)]
    sm:text-[2.35rem]
    lg:text-[3rem]
  "
>
  Une organisation nationale pour représenter et structurer la
  location automobile professionnelle.
</h1>

                <p className="section-body">
                  FLASCAM rassemble les associations affiliées de loueurs
                  automobiles sans chauffeur au Maroc. Son rôle est de porter
                  une vision commune, de faciliter la circulation de
                  l’information officielle et de valoriser une profession au
                  cœur de la mobilité nationale.
                </p>
              </div>

<div
  className="
    relative
    overflow-hidden
    rounded-[2rem]
    bg-[var(--flascam-blue-dark)]
    p-7
    text-white
    shadow-[0_26px_80px_rgba(7,53,93,0.18)]
    sm:p-10
  "
>
  <div
    className="
      absolute
      -right-16
      -top-14
      size-52
      rounded-full
      bg-[radial-gradient(circle,rgba(194,145,61,0.28)_0%,rgba(194,145,61,0.12)_42%,transparent_72%)]
      blur-sm
    "
  />

<div className="relative -mt-4 -ml-4 flex justify-start text-[var(--flascam-gold)]">
  <VehicleLineIcon />
</div>

  <p className="relative mt-10 text-xl font-extrabold leading-tight sm:text-2xl">
    Une voix commune, une plateforme nationale, une profession
    mieux organisée.
  </p>
</div>
            </div>
          </div>
        </section>

        <section className="bg-white py-16 sm:py-24">
          <div className="site-container">
            <div className="max-w-5xl">
              <p className="section-eyebrow">
                Rôle et mission
              </p>

<h2
  className="
    max-w-5xl
    text-3xl
    font-extrabold
    leading-tight
    tracking-[-0.035em]
    text-[var(--flascam-black)]
    sm:text-4xl
    lg:text-[3rem]
  "
>
  FLASCAM agit comme point de référence pour les professionnels du
  secteur.
</h2>

              <p className="section-body">
                La fédération n’est pas modélisée depuis l’administration pour
                le moment. Cette page reste volontairement éditoriale et
                hardcodée afin de garantir une présentation stable, claire et
                maîtrisée de l’institution.
              </p>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {pillars.map((pillar) => (
<article
  key={pillar.title}
  tabIndex={0}
  className="
    interactive-card
    rounded-[2rem]
    border
    border-slate-200
    bg-white
    p-7
    outline-none
    shadow-[0_18px_50px_rgba(15,23,42,0.04)]
  "
>
  <div className="relative z-10">
    <pillar.icon
      size={30}
      className="text-[var(--flascam-blue)]"
      aria-hidden="true"
    />

    <h3 className="mt-7 text-xl font-extrabold text-[var(--flascam-black)]">
      {pillar.title}
    </h3>

    <p className="mt-4 text-sm leading-7 text-[var(--flascam-slate)]">
      {pillar.description}
    </p>
  </div>
</article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </>
  );
}