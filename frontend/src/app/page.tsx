import type { Metadata } from 'next';

import Link from 'next/link';

import {
  ArrowRight,
  BadgeCheck,
  Leaf,
  ShieldCheck,
} from 'lucide-react';

import { PublicFooter } from '@/components/site/public-footer';
import { PublicHeader } from '@/components/site/public-header';

import { getFeaturedAssociations } from '@/lib/associations-api';

import {
  HomepageHeroSlider,
} from '@/components/site/homepage-hero-slider';

import {
  getPublicHomepageHeroSlides,
} from '@/lib/homepage-hero-api';

export const metadata: Metadata = {
  title: 'Accueil',
  description:
    'FLASCAM représente les loueurs automobiles sans chauffeur au Maroc, accompagne la structuration du secteur et valorise la labellisation des professionnels.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title:
      'FLASCAM - Fédération des loueurs automobiles sans chauffeur au Maroc',
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

async function HeroSection() {
  const slides =
    await getPublicHomepageHeroSlides();
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#07355d] via-[#0a487b] to-[#0f5f9f] text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 -top-40 h-[34rem] w-[34rem] rounded-full border border-white/10"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-12 right-[8%] h-64 w-64 rounded-full border border-[#c96f4a]/40"
      />

      <div className="site-container relative">
<div className="grid lg:grid-cols-2">
  <div className="flex items-center py-14 pr-0 sm:py-20 lg:min-h-[610px] lg:pr-14">
    <div className="animate-[institutionalReveal_700ms_ease-out_both]">
      <p className="flex items-center gap-3 text-xs font-extrabold uppercase tracking-[0.18em] text-white">
        <span className="h-[3px] w-10 bg-[#c96f4a]" />
        Fédération nationale
      </p>

      <h1 className="mt-6 max-w-4xl text-[2.4rem] font-extrabold leading-[1.08] tracking-[-0.045em] text-white sm:text-[3.4rem] lg:text-[4.15rem]">
        Unir, défendre et professionnaliser les loueurs automobiles sans
        chauffeur au Maroc.
      </h1>

      <p className="mt-7 max-w-3xl text-base leading-8 text-white/80 sm:text-lg sm:leading-9">
        La FLASCAM représente les professionnels de la location
        automobile sans chauffeur, accompagne la structuration du secteur
        et renforce la confiance entre loueurs, clients, partenaires et
        institutions.
      </p>

      <div className="mt-9 flex flex-col items-start gap-5 sm:flex-row sm:items-center">
        <Link
          href="/la-federation"
          className="inline-flex min-h-13 items-center justify-center gap-3 rounded-md border border-[#c96f4a] bg-[#c96f4a] px-6 text-sm font-extrabold text-white transition duration-200 hover:-translate-y-0.5 hover:border-[#a95235] hover:bg-[#a95235] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/30"
        >
          Découvrir la fédération

          <ArrowRight
            size={18}
            aria-hidden="true"
          />
        </Link>

        <Link
          href="/contact"
          className="inline-flex items-center gap-3 text-sm font-extrabold text-white transition duration-200 hover:gap-4 hover:text-[#ffd8c8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-[#07355d]"
        >
          Devenir adhérent

          <ArrowRight
            size={17}
            aria-hidden="true"
          />
        </Link>
      </div>
    </div>
  </div>

  <div className="-mx-4 sm:-mx-6 lg:mx-0 lg:translate-x-[calc((100vw-76rem)/2)] lg:w-[calc(50vw+0.5rem)]">
    <HomepageHeroSlider
      slides={slides}
    />
  </div>
</div>

        <div className="grid border-t border-white/20 bg-[#032039]/30 backdrop-blur-sm sm:grid-cols-3">
          {heroStats.map((stat) => (
            <div
              key={stat.label}
              className="border-b border-white/15 px-5 py-6 last:border-b-0 sm:border-b-0 sm:border-r sm:px-8 sm:py-7 sm:last:border-r-0"
            >
              <p className="text-3xl font-extrabold tracking-[-0.035em] text-white">
                {stat.value}
              </p>

              <p className="mt-2 text-sm font-semibold text-white/70">
                {stat.label}
              </p>
            </div>
          ))}


        </div>
      </div>
    </section>
  );
}

function FederationPreview() {
  return (
    <section
      className="overflow-hidden bg-white py-16 sm:py-24 lg:py-28"
      aria-labelledby="home-federation-title"
    >
      <div className="site-container">
        <div className="grid gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:gap-20">
          <div>
            <p className="section-eyebrow">
              Rôle de la FLASCAM
            </p>

            <h2
              id="home-federation-title"
              className="mt-5 max-w-2xl text-3xl font-extrabold leading-[1.13] tracking-[-0.04em] text-[var(--flascam-black)] sm:text-4xl lg:text-[3.25rem]"
            >
              La voix unifiée de la location automobile professionnelle au
              Maroc.
            </h2>

            <div className="mt-8 h-[3px] w-20 bg-[var(--flascam-accent)]" />

            <p className="section-body">
              La FLASCAM fédère les loueurs automobiles sans chauffeur,
              soutient les actions collectives et accompagne les professionnels
              dans les enjeux de conformité, de qualité de service, de
              visibilité et de transition durable.
            </p>

            <p className="section-body">
              Elle agit comme point de référence pour les professionnels, les
              associations régionales, les partenaires économiques et les
              institutions concernées par la mobilité, le tourisme et
              l’automobile.
            </p>

            <Link
              href="/la-federation"
              className="mt-8 inline-flex items-center gap-3 text-sm font-extrabold text-[var(--flascam-blue-dark)] transition-colors hover:text-[var(--flascam-accent-dark)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--flascam-accent)] focus-visible:ring-offset-4"
            >
              En savoir plus sur la fédération

              <ArrowRight
                size={17}
                aria-hidden="true"
              />
            </Link>
          </div>

          <div className="border-t border-slate-200 lg:border-l lg:border-t-0 lg:pl-12">
            {focusItems.map((item) => {
              const Icon = item.icon;

              return (
<article
  key={item.title}
  className="group border-b border-slate-200 py-8 sm:py-9"
>
  <div className="flex items-start gap-4 transition-transform duration-200 group-hover:translate-x-1">
    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-md border border-[#0f5f9f]/20 bg-[#eaf5ff] text-[#0f5f9f] transition duration-200 group-hover:border-[#c96f4a] group-hover:bg-[#f8ede8] group-hover:text-[#a95235]">
      <Icon
        size={22}
        aria-hidden="true"
      />
    </div>

    <div>
      <h3 className="text-xl font-extrabold text-[#07355d] sm:text-2xl">
        {item.title}
      </h3>

      <p className="mt-3 max-w-xl text-sm leading-7 text-[#536273] sm:text-base sm:leading-8">
        {item.description}
      </p>
    </div>
  </div>
</article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

async function AssociationsPreview() {
  const associations = await getFeaturedAssociations();

  if (associations.length === 0) {
    return null;
  }

  return (
    <section className="bg-[var(--ivory)] py-16 sm:py-24">
      <div className="site-container">
        <div className="flex flex-col gap-6 border-b border-[var(--flascam-border)] pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-3xl">
            <p className="section-eyebrow">
              Associations régionales
            </p>

            <h2 className="mt-4 text-3xl font-extrabold leading-tight tracking-[-0.035em] text-[var(--flascam-black)] sm:text-4xl lg:text-[3rem]">
              Les relais régionaux de la fédération.
            </h2>

            <p className="section-body">
              Consultez les associations affiliées, leurs coordonnées, leurs
              actualités et leurs événements.
            </p>
          </div>

          <Link
            href="/associations"
            className="inline-flex items-center gap-3 text-sm font-extrabold text-[var(--flascam-blue-dark)] transition-colors hover:text-[var(--flascam-accent-dark)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--flascam-accent)] focus-visible:ring-offset-4"
          >
            Voir toutes les associations

            <ArrowRight
              size={17}
              aria-hidden="true"
            />
          </Link>
        </div>

        <div className="divide-y divide-[var(--flascam-border)]">
          {associations.map((association) => (
            <Link
              key={association.id}
              href={`/associations/${association.slug}`}
              className="group grid min-h-28 grid-cols-[auto_1fr_auto] items-center gap-4 py-5 transition duration-200 hover:bg-white/70 hover:px-3 sm:gap-6"
            >


              <div className="grid h-14 w-14 place-items-center overflow-hidden rounded-md border border-[#dbe5ef] bg-white p-2 text-sm font-extrabold text-[#07355d]">
                {association.logoUrl ? (
                  <img
                    src={association.logoUrl}
                    alt={`Logo ${association.name}`}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <span>
                    {association.logoText ||
                      association.name.slice(0, 2).toUpperCase()}
                  </span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-extrabold text-[var(--flascam-blue-dark)] transition-colors group-hover:text-[var(--flascam-blue)] sm:text-xl">
                  {association.name}
                </h3>

                <p className="mt-1 text-sm text-[var(--flascam-slate)]">
                  {association.city
                    ? `${association.city} · ${association.region}`
                    : association.region}
                </p>
              </div>

              <span className="grid h-10 w-10 place-items-center rounded-full border border-[#dbe5ef] text-[#0f5f9f] transition duration-200 group-hover:translate-x-1 group-hover:border-[#c96f4a] group-hover:bg-[#c96f4a] group-hover:text-white">
                <ArrowRight
                  size={19}
                  aria-hidden="true"
                />
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
        <AssociationsPreview />
      </main>

      <PublicFooter />
    </>
  );
}