import type {
  Metadata,
} from 'next';

import Link from 'next/link';

import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  Car,
  FileText,
  Handshake,
  Leaf,
  MapPin,
  Phone,
  ShieldCheck,
  TrendingUp,
  UsersRound,
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
    'Découvrez la FLASCAM, Fédération des Loueurs d’Automobiles Sans Chauffeur au Maroc : mission, rôle, labellisation, représentativité et enjeux du secteur.',
  alternates: {
    canonical: '/la-federation',
  },
  openGraph: {
    title: 'La fédération FLASCAM',
    description:
      'Présentation de la fédération nationale représentant les loueurs automobiles sans chauffeur au Maroc.',
    type: 'article',
    locale: 'fr_MA',
  },
};

const pillars = [
  {
    icon: ShieldCheck,
    title: 'Représenter la profession',
    description:
      'Porter une voix commune pour les loueurs automobiles sans chauffeur et défendre leurs intérêts auprès des institutions, partenaires et acteurs économiques.',
  },
  {
    icon: Handshake,
    title: 'Fédérer les acteurs',
    description:
      'Créer un cadre national de collaboration entre les associations régionales, les professionnels, les constructeurs, les assureurs et les partenaires du secteur.',
  },
  {
    icon: BadgeCheck,
    title: 'Valoriser la labellisation',
    description:
      'Renforcer la confiance grâce à une démarche de labellisation orientée qualité, conformité, sérieux professionnel et transparence.',
  },
  {
    icon: Car,
    title: 'Structurer le marché',
    description:
      'Accompagner la profession face aux enjeux réglementaires, concurrentiels et opérationnels de la location automobile au Maroc.',
  },
  {
    icon: Leaf,
    title: 'Encourager la mobilité durable',
    description:
      'Préparer progressivement le secteur aux véhicules hybrides, électriques et aux nouvelles solutions de mobilité responsable.',
  },
  {
    icon: FileText,
    title: 'Informer les professionnels',
    description:
      'Centraliser les informations utiles, les actualités, les événements, les démarches et les ressources destinées aux loueurs.',
  },
];

const keyFigures = [
  {
    value: '+2 000',
    label: 'adhérents représentés',
  },
  {
    value: '80 000',
    label: 'véhicules dans le secteur',
  },
  {
    value: '37 %',
    label: 'du marché des véhicules neufs en 2023',
  },
];

const sectorItems = [
  {
    icon: TrendingUp,
    title: 'Un secteur économique important',
    description:
      'La location automobile sans chauffeur joue un rôle direct dans l’activité automobile, le tourisme, la mobilité professionnelle et les déplacements des particuliers.',
  },
  {
    icon: Building2,
    title: 'Un besoin de structuration',
    description:
      'La fédération contribue à organiser les échanges, clarifier les pratiques et accompagner les professionnels dans un environnement réglementaire en évolution.',
  },
  {
    icon: UsersRound,
    title: 'Un réseau national',
    description:
      'La FLASCAM travaille avec les associations régionales pour porter les réalités du terrain et renforcer la représentativité des loueurs à l’échelle nationale.',
  },
];

function VehicleLineIcon() {
  return (
    <svg
      viewBox="0 0 640 260"
      className="h-auto w-full max-w-[92px] sm:max-w-[116px]"
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
        <section className="bg-[var(--ivory)] py-12 sm:py-16 lg:py-20">
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

                <h1 className="mt-4 max-w-5xl text-3xl font-extrabold leading-tight tracking-[-0.035em] text-[var(--flascam-black)] sm:text-[2.45rem] lg:text-[3.25rem]">
                  La Fédération des Loueurs d’Automobiles Sans Chauffeur au Maroc.
                </h1>

                <p className="section-body">
                  La FLASCAM représente et accompagne les professionnels de la location
                  automobile sans chauffeur à travers le Royaume. Elle agit pour unir la
                  profession, défendre ses intérêts, renforcer sa crédibilité et accompagner
                  sa montée en qualité.
                </p>

                <p className="section-body">
                  Son rôle est aussi de créer un lien clair entre les loueurs, les associations
                  régionales, les partenaires économiques, les institutions et les clients finaux.
                </p>
              </div>

              <div className="relative overflow-hidden rounded-[2rem] bg-[var(--flascam-blue-dark)] p-7 text-white shadow-[0_26px_80px_rgba(7,53,93,0.18)] sm:p-10">
                <div className="absolute -right-16 -top-14 size-52 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.2)_0%,rgba(255,255,255,0.09)_42%,transparent_72%)] blur-sm" />
                <div className="absolute -bottom-20 -left-16 size-60 rounded-full bg-[radial-gradient(circle,rgba(15,95,159,0.42)_0%,rgba(15,95,159,0.16)_42%,transparent_70%)] blur-xl" />

<div className="relative -mr6 -mt-3 flex justify-end text-white">
  <VehicleLineIcon />
</div>

                <p className="relative mt-10 text-xl font-extrabold leading-tight sm:text-2xl">
                  Une voix commune, une plateforme nationale, une profession mieux organisée.
                </p>

                <div className="relative mt-8 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                  {keyFigures.map((figure) => (
<div
  key={figure.label}
  className="interactive-card-dark rounded-2xl border border-white/[0.12] bg-white/[0.08] p-4 outline-none"
>
                      <p className="text-2xl font-extrabold">
                        {figure.value}
                      </p>
                      <p className="mt-2 text-xs font-semibold leading-5 text-white/78">
                        {figure.label}
                      </p>
                    </div>
                  ))}
                </div>

                <p className="relative mt-5 text-xs leading-6 text-white/65">
                  Données issues des prises de parole publiques de la fédération. À faire
                  valider par le client avant publication finale.
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

              <h2 className="mt-4 max-w-5xl text-3xl font-extrabold leading-tight tracking-[-0.035em] text-[var(--flascam-black)] sm:text-4xl lg:text-[3rem]">
                Représenter, labelliser et accompagner les loueurs automobiles sans chauffeur.
              </h2>

              <p className="section-body">
                La FLASCAM intervient comme point de référence pour la profession. Elle
                accompagne les loueurs dans les sujets de conformité, de visibilité, de
                partenariat, de réglementation et de structuration du marché.
              </p>
            </div>

            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {pillars.map((pillar) => (
                <article
                  key={pillar.title}
                  tabIndex={0}
                  className="interactive-card rounded-[2rem] border border-slate-200 bg-white p-7 outline-none shadow-[0_18px_50px_rgba(15,23,42,0.04)]"
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

        <section className="bg-[var(--ivory)] py-16 sm:py-24">
          <div className="site-container grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div>
              <p className="section-eyebrow">
                Le secteur
              </p>

<h2 className="mt-4 text-2xl font-extrabold leading-tight tracking-[-0.03em] text-[var(--flascam-black)] sm:text-3xl lg:text-[2.55rem]">
  Un secteur stratégique pour l’automobile, le tourisme et la mobilité.
</h2>

              <p className="section-body">
                Les loueurs automobiles sans chauffeur occupent une place importante dans
                l’économie nationale. Leur activité soutient le tourisme, les déplacements
                professionnels, la mobilité des particuliers et les ventes automobiles.
              </p>
            </div>

            <div className="grid gap-5">
              {sectorItems.map((item) => (
<article
  key={item.title}
  className="interactive-card rounded-[1.75rem] border border-slate-200 bg-white p-6 outline-none shadow-[0_18px_50px_rgba(15,23,42,0.04)]"
>
                  <div className="flex flex-col gap-4 sm:flex-row">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--flascam-blue-light)] text-[var(--flascam-blue)]">
                      <item.icon size={24} aria-hidden="true" />
                    </div>

                    <div>
                      <h3 className="text-lg font-extrabold text-[var(--flascam-black)]">
                        {item.title}
                      </h3>

                      <p className="mt-2 text-sm leading-7 text-[var(--flascam-slate)]">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white py-16 sm:py-24">
          <div className="site-container grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
            <div>
              <p className="section-eyebrow">
                Adhésion et labellisation
              </p>

<h2 className="mt-4 text-2xl font-extrabold leading-tight tracking-[-0.03em] text-[var(--flascam-black)] sm:text-3xl lg:text-[2.55rem]">
  Un repère de confiance pour les professionnels, les clients et les partenaires.
</h2>

              <p className="section-body">
                La labellisation FLASCAM permet de distinguer les loueurs engagés dans une
                démarche professionnelle. Elle contribue à renforcer la transparence, la
                conformité, la qualité de service et la crédibilité du secteur.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/contact"
                  className="inline-flex h-[3.25rem] items-center justify-center gap-2 rounded-full bg-[var(--flascam-blue-dark)] px-7 font-semibold !text-white shadow-[0_18px_40px_rgba(7,53,93,0.22)] transition hover:bg-[var(--flascam-blue)]"
                >
                  Demander l’adhésion
                </Link>

                <Link
                  href="/associations"
                  className="inline-flex h-[3.25rem] items-center justify-center rounded-full border border-[var(--flascam-border)] bg-white px-7 font-semibold text-[var(--flascam-blue-dark)] transition hover:border-[var(--flascam-blue)] hover:text-[var(--flascam-blue)]"
                >
                  Voir les associations
                </Link>
              </div>
            </div>

            <div className="rounded-[2rem] bg-[var(--flascam-blue-light)] p-6 sm:p-8">
              <h3 className="text-xl font-extrabold text-[var(--flascam-black)]">
                Informations de contact
              </h3>

              <div className="mt-6 space-y-4 text-sm leading-7 text-[var(--flascam-slate)]">
                <p className="flex gap-3">
                  <Phone className="mt-1 shrink-0 text-[var(--flascam-blue)]" size={18} aria-hidden="true" />
                  <span>06 62 66 62 76</span>
                </p>

                <p className="flex gap-3">
                  <MapPin className="mt-1 shrink-0 text-[var(--flascam-blue)]" size={18} aria-hidden="true" />
                  <span>Quartier des Hôpitaux, Casablanca. Adresse complète à confirmer par le client avant publication.</span>
                </p>
              </div>

              <p className="mt-6 rounded-2xl bg-white p-4 text-xs leading-6 text-[var(--flascam-slate)]">
                Les conditions d’adhésion, les documents à fournir et les critères de
                labellisation doivent être validés par la FLASCAM avant affichage détaillé.
              </p>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </>
  );
}