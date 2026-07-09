import type {
  Metadata,
} from 'next';

import Link from 'next/link';

import {
  ArrowRight,
  Building2,
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
  title: 'Accueil',
  description:
    'FLASCAM fédère les associations de loueurs automobiles sans chauffeur au Maroc et centralise l’information officielle du secteur.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'FLASCAM - Fédération nationale de la location automobile',
    description:
      'Présentation de la fédération nationale des loueurs automobiles sans chauffeur au Maroc.',
    type: 'website',
    locale: 'fr_MA',
  },
};

function VehicleLineIcon() {
  return (
    <svg
      viewBox="0 0 640 260"
      className="h-auto w-full max-w-[520px]"
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

function FederationPreview() {
  return (
    <section
      className="bg-[var(--ivory)] py-16 sm:py-24"
      aria-labelledby="home-federation-title"
    >
      <div
        className="
          site-container
          grid
          gap-10
          lg:grid-cols-[0.95fr_1.05fr]
          lg:items-center
        "
      >
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
              -right-20
              -top-20
              size-56
              rounded-full
              bg-[radial-gradient(circle,rgba(194,145,61,0.36)_0%,rgba(194,145,61,0.14)_42%,transparent_70%)]
              blur-sm
            "
          />

          <div
            className="
              absolute
              -bottom-28
              -left-20
              size-72
              rounded-full
              bg-[radial-gradient(circle,rgba(255,255,255,0.18)_0%,rgba(255,255,255,0.08)_38%,transparent_72%)]
              blur-2xl
            "
          />

          <div className="relative text-[var(--flascam-gold)]">
            <VehicleLineIcon />
          </div>

          <p className="relative mt-10 max-w-md text-3xl font-extrabold leading-tight sm:text-4xl">
            Une fédération nationale au service de la profession.
          </p>

          <div className="relative mt-8 grid gap-3 sm:grid-cols-3">
            {[
              {
                icon: ShieldCheck,
                label: 'Représenter',
              },
              {
                icon: Handshake,
                label: 'Fédérer',
              },
              {
                icon: ShieldCheck,
                label: 'Structurer',
              },
            ].map((item) => (
              <div
                key={item.label}
                tabIndex={0}
                className="
                  interactive-card-dark
                  rounded-2xl
                  border
                  border-white/[0.12]
                  bg-white/[0.08]
                  p-4
                  outline-none
                "
              >
                <item.icon
                  size={22}
                  aria-hidden="true"
                />

                <p className="mt-3 text-sm font-bold">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="section-eyebrow">
            Fédération nationale
          </p>

          <h1
            id="home-federation-title"
            className="section-title"
          >
            La voix unifiée de la location automobile professionnelle au Maroc.
          </h1>

          <p className="section-body">
            FLASCAM fédère les associations affiliées, valorise les loueurs
            professionnels et accompagne la structuration du secteur de la
            location automobile sans chauffeur au Maroc.
          </p>

          <p className="section-body">
            La fédération a vocation à centraliser l’information officielle,
            soutenir les actions collectives et offrir une plateforme nationale
            de référence aux professionnels, partenaires et institutions.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/la-federation"
              className="
                inline-flex
                h-[3.25rem]
                items-center
                justify-center
                gap-2
                rounded-full
                bg-[var(--flascam-blue-dark)]
                px-7
                font-semibold
                !text-white
                shadow-[0_18px_40px_rgba(7,53,93,0.22)]
                transition
                hover:bg-[var(--flascam-blue)]
              "
            >
              Découvrir la fédération

              <ArrowRight
                size={18}
                aria-hidden="true"
              />
            </Link>
          </div>
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
        <FederationPreview />
      </main>

      <PublicFooter />
    </>
  );
}