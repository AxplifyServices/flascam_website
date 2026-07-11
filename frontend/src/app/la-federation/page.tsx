import type {
  Metadata,
} from 'next';

import Link from 'next/link';

import {
  ArrowLeft,
  ArrowRight,
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

export default function FederationPage() {
  return (
    <>
      <PublicHeader />

      <main>
        <section className="relative overflow-hidden bg-gradient-to-br from-[#07355d] via-[#0a487b] to-[#0f5f9f] text-white">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.12]"
            style={{
              backgroundImage:
                'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
              backgroundSize: '22px 22px',
            }}
          />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-40 -top-52 h-[38rem] w-[38rem] rounded-full border border-white/10"
          />

          <div className="site-container relative py-14 sm:py-20 lg:py-24">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-semibold text-white/75 transition hover:text-white"
            >
              <ArrowLeft
                size={17}
                aria-hidden="true"
              />
              Retour à l’accueil
            </Link>

            <div className="mt-10 grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-start lg:gap-20">
              <div>
                <p className="flex items-center gap-3 text-xs font-extrabold uppercase tracking-[0.18em] text-white">
                  <span className="h-[3px] w-10 bg-[#c96f4a]" />
                  La fédération
                </p>

                <h1 className="mt-6 max-w-5xl text-4xl font-extrabold leading-[1.08] tracking-[-0.045em] text-white sm:text-5xl lg:text-[4.15rem]">
                  La Fédération des Loueurs d’Automobiles Sans Chauffeur au Maroc.
                </h1>

                <p className="mt-7 max-w-3xl text-base leading-8 text-white/78 sm:text-lg sm:leading-9">
                  La FLASCAM représente et accompagne les professionnels de la location
                  automobile sans chauffeur à travers le Royaume. Elle agit pour unir la
                  profession, défendre ses intérêts, renforcer sa crédibilité et accompagner
                  sa montée en qualité.
                </p>
              </div>

              <div className="border-l-4 border-[#c96f4a] bg-white/10 p-6 backdrop-blur-sm sm:p-8 lg:mt-[2.1rem]">
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#f0a27f]">
                  Positionnement
                </p>

                <p className="mt-4 text-xl font-extrabold leading-8 text-white sm:text-2xl">
                  Une voix commune, une plateforme nationale, une profession mieux organisée.
                </p>

                <p className="mt-5 text-sm leading-7 text-white/70">
                  La fédération crée un lien structuré entre les loueurs, les associations
                  régionales, les partenaires économiques, les institutions et les clients.
                </p>
              </div>
            </div>

            <div className="mt-12 grid border-t border-white/20 bg-[#032039]/25 backdrop-blur-sm sm:grid-cols-3">
              {keyFigures.map((figure) => (
                <div
                  key={figure.label}
                  className="border-b border-white/15 px-6 py-6 last:border-b-0 sm:border-b-0 sm:border-r sm:px-8 sm:last:border-r-0"
                >
                  <p className="text-3xl font-extrabold tracking-[-0.035em] text-white">
                    {figure.value}
                  </p>

                  <p className="mt-2 text-sm leading-6 text-white/68">
                    {figure.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white py-16 sm:py-24 lg:py-28">
          <div className="site-container">
            <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
              <div>
                <p className="flex items-center gap-3 text-xs font-extrabold uppercase tracking-[0.18em] text-[#0f5f9f]">
                  <span className="h-[3px] w-10 bg-[#c96f4a]" />
                  Rôle et mission
                </p>

                <h2 className="mt-5 text-3xl font-extrabold leading-[1.12] tracking-[-0.04em] text-[#101820] sm:text-4xl lg:text-[3.25rem]">
                  Représenter, labelliser et accompagner les loueurs automobiles sans chauffeur.
                </h2>

                <p className="mt-7 text-base leading-8 text-[#536273] sm:text-lg">
                  La FLASCAM intervient comme point de référence pour la profession. Elle
                  accompagne les loueurs dans les sujets de conformité, de visibilité, de
                  partenariat, de réglementation et de structuration du marché.
                </p>

                <Link
                  href="/contact"
                  className="mt-8 inline-flex min-h-12 items-center justify-center gap-3 rounded-md bg-[#c96f4a] px-6 text-sm font-extrabold text-white transition duration-200 hover:bg-[#a95235] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#c96f4a]/20"
                >
                  Contacter la fédération

                  <ArrowRight
                    size={17}
                    aria-hidden="true"
                  />
                </Link>
              </div>

              <div className="border-t border-[#dbe5ef] lg:border-l lg:border-t-0 lg:pl-12">
                {pillars.map((pillar) => (
                  <article
                    key={pillar.title}
                    className="group border-b border-[#dbe5ef] py-7 sm:py-8"
                  >
                    <div className="flex items-start gap-4 transition-transform duration-200 group-hover:translate-x-1">
                      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-md border border-[#0f5f9f]/20 bg-[#eaf5ff] text-[#0f5f9f] transition duration-200 group-hover:border-[#c96f4a] group-hover:bg-[#f8ede8] group-hover:text-[#a95235]">
                        <pillar.icon
                          size={22}
                          aria-hidden="true"
                        />
                      </div>

                      <div>
                        <h3 className="text-xl font-extrabold text-[#07355d]">
                          {pillar.title}
                        </h3>

                        <p className="mt-3 text-sm leading-7 text-[#536273] sm:text-base">
                          {pillar.description}
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-[#f5f9fc] py-16 sm:py-24 lg:py-28">
          <div
            aria-hidden="true"
            className="absolute -left-40 top-20 h-80 w-80 rounded-full bg-[#0f5f9f]/[0.05] blur-3xl"
          />

          <div
            aria-hidden="true"
            className="absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-[#c96f4a]/[0.07] blur-3xl"
          />

          <div className="site-container relative grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
            <div>
              <p className="flex items-center gap-3 text-xs font-extrabold uppercase tracking-[0.18em] text-[#0f5f9f]">
                <span className="h-[3px] w-10 bg-[#c96f4a]" />
                Le secteur
              </p>

              <h2 className="mt-5 text-3xl font-extrabold leading-[1.12] tracking-[-0.04em] text-[#101820] sm:text-4xl lg:text-[3.1rem]">
                Un secteur stratégique pour l’automobile, le tourisme et la mobilité.
              </h2>

              <p className="mt-7 text-base leading-8 text-[#536273] sm:text-lg">
                Les loueurs automobiles sans chauffeur occupent une place importante dans
                l’économie nationale. Leur activité soutient le tourisme, les déplacements
                professionnels, la mobilité des particuliers et les ventes automobiles.
              </p>
            </div>

            <div className="space-y-4">
              {sectorItems.map((item) => (
                <article
                  key={item.title}
                  className="group border-l-4 border-[#0f5f9f] bg-white p-6 transition duration-200 hover:border-[#c96f4a] hover:shadow-[0_20px_50px_rgba(7,53,93,0.08)]"
                >
                  <div className="flex items-start gap-4">
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-md bg-[#eaf5ff] text-[#0f5f9f] transition group-hover:bg-[#f8ede8] group-hover:text-[#a95235]">
                      <item.icon
                        size={23}
                        aria-hidden="true"
                      />
                    </div>

                    <div>
                      <h3 className="text-lg font-extrabold text-[#07355d]">
                        {item.title}
                      </h3>

                      <p className="mt-2 text-sm leading-7 text-[#536273]">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white py-16 sm:py-24 lg:py-28">
          <div className="site-container grid gap-12 lg:grid-cols-[1fr_0.8fr] lg:items-center lg:gap-20">
            <div>
              <p className="flex items-center gap-3 text-xs font-extrabold uppercase tracking-[0.18em] text-[#0f5f9f]">
                <span className="h-[3px] w-10 bg-[#c96f4a]" />
                Adhésion et labellisation
              </p>

              <h2 className="mt-5 text-3xl font-extrabold leading-[1.12] tracking-[-0.04em] text-[#101820] sm:text-4xl lg:text-[3.1rem]">
                Un repère de confiance pour les professionnels, les clients et les partenaires.
              </h2>

              <p className="mt-7 text-base leading-8 text-[#536273] sm:text-lg">
                La labellisation FLASCAM permet de distinguer les loueurs engagés dans une
                démarche professionnelle. Elle contribue à renforcer la transparence, la
                conformité, la qualité de service et la crédibilité du secteur.
              </p>

              <div className="mt-9 flex flex-col gap-4 sm:flex-row">
<Link
  href="/contact"
  className="inline-flex min-h-12 items-center justify-center gap-3 rounded-md bg-[#c96f4a] px-6 text-sm font-extrabold text-white transition hover:bg-[#a95235] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#c96f4a]/25"
>
  Demander l’adhésion

                  <ArrowRight
                    size={17}
                    aria-hidden="true"
                  />
                </Link>

                <Link
                  href="/associations"
                  className="inline-flex min-h-12 items-center justify-center gap-3 rounded-md border border-[#07355d] px-6 text-sm font-extrabold text-[#07355d] transition hover:bg-[#07355d] hover:text-white"
                >
                  Voir les associations
                </Link>
              </div>
            </div>

            <aside className="border-t-4 border-[#c96f4a] bg-[#07355d] p-7 text-white sm:p-9">
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#f0a27f]">
                Informations de contact
              </p>

              <div className="mt-6 space-y-5 text-sm leading-7 text-white/75">
                <p className="flex gap-3">
                  <Phone
                    className="mt-1 shrink-0 text-[#f0a27f]"
                    size={18}
                    aria-hidden="true"
                  />

                  <span>
                    06 62 66 62 76
                  </span>
                </p>

                <p className="flex gap-3">
                  <MapPin
                    className="mt-1 shrink-0 text-[#f0a27f]"
                    size={18}
                    aria-hidden="true"
                  />

                  <span>
                    Quartier des Hôpitaux, Casablanca.
                  </span>
                </p>
              </div>

              <p className="mt-7 border-t border-white/15 pt-6 text-xs leading-6 text-white/55">
                Les conditions d’adhésion, les documents à fournir et les critères de
                labellisation doivent être validés par la FLASCAM avant affichage détaillé.
              </p>
            </aside>
          </div>
        </section>
      </main>

      <PublicFooter />
    </>
  );
}