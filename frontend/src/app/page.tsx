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

function FederationPreview() {
  return (
    <section
      className="
        bg-[var(--ivory)]
        py-16
        sm:py-24
      "
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
              -right-16
              -top-16
              size-44
              rounded-full
              border
              border-white/[0.15]
            "
          />

          <div
            className="
              absolute
              -bottom-24
              -left-20
              size-64
              rounded-full
              bg-[var(--flascam-blue)]/30
              blur-3xl
            "
          />

          <Building2
            size={42}
            strokeWidth={1.5}
            className="text-white"
            aria-hidden="true"
          />

          <p className="mt-20 max-w-md text-3xl font-extrabold leading-tight sm:text-4xl">
            Une fédération nationale au service de la profession.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
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
                icon: Building2,
                label: 'Structurer',
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-white/[0.12] bg-white/[0.08] p-4"
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
                text-white
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