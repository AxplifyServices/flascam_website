import type {
  Metadata,
} from 'next';

import Link from 'next/link';

import {
  ArrowRight,
  Building2,
  CalendarDays,
  MapPin,
  Search,
  UsersRound,
} from 'lucide-react';

import {
  PublicFooter,
} from '@/components/site/public-footer';

import {
  PublicHeader,
} from '@/components/site/public-header';

import {
  getPublicAssociations,
} from '@/lib/associations-api';

export const metadata: Metadata = {
  title: 'Associations régionales',
  description:
    'Consultez les associations régionales affiliées à FLASCAM, leurs coordonnées, actualités, événements, photos et vidéos.',
  alternates: {
    canonical: '/associations',
  },
  openGraph: {
    title:
      'Associations régionales FLASCAM',
    description:
      'Découvrez les relais régionaux de FLASCAM au Maroc.',
    type: 'website',
    locale: 'fr_MA',
  },
};

function AssociationLogo({
  name,
  logoText,
  logoUrl,
}: {
  name: string;
  logoText?: string | null;
  logoUrl?: string | null;
}) {
  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt={`Logo ${name}`}
        className="h-full w-full object-cover"
      />
    );
  }

  return (
    <span className="text-xl font-black text-white">
      {logoText || name.slice(0, 2).toUpperCase()}
    </span>
  );
}

export default async function AssociationsPage() {
  const associations =
    await getPublicAssociations();

  return (
    <>
      <PublicHeader />

      <main>
        <section className="bg-[var(--ivory)] py-12 sm:py-16 lg:py-20">
          <div className="site-container">
            <div className="max-w-4xl">
              <p className="section-eyebrow">
                Réseau régional
              </p>

              <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-[-0.04em] text-[var(--flascam-black)] sm:text-4xl lg:text-[3.25rem]">
                Associations régionales affiliées à FLASCAM
              </h1>

              <p className="section-body">
                Retrouvez les relais régionaux de la fédération,
                leurs coordonnées, leurs actualités, leurs événements
                et leurs contenus médias.
              </p>
            </div>

            <div className="mt-8 grid gap-4 rounded-[2rem] border border-[var(--flascam-border)] bg-white p-4 shadow-[0_20px_70px_rgba(7,53,93,0.06)] sm:grid-cols-3 sm:p-5">
              <div className="flex items-center gap-3 rounded-2xl bg-[#eaf5ff] p-4">
                <UsersRound className="text-[var(--flascam-blue)]" />
                <div>
                  <p className="text-2xl font-black text-[var(--flascam-black)]">
                    {associations.length}
                  </p>
                  <p className="text-xs font-bold uppercase tracking-wide text-[var(--flascam-slate)]">
                    associations publiées
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl bg-[#eaf5ff] p-4">
                <MapPin className="text-[var(--flascam-blue)]" />
                <div>
                  <p className="text-2xl font-black text-[var(--flascam-black)]">
                    Maroc
                  </p>
                  <p className="text-xs font-bold uppercase tracking-wide text-[var(--flascam-slate)]">
                    couverture régionale
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-12 sm:py-16 lg:py-20">
          <div className="site-container">
            {associations.length === 0 ? (
              <div className="rounded-[2rem] border border-dashed border-[var(--flascam-border)] bg-[var(--ivory)] p-8 text-center">
                <Building2
                  className="mx-auto text-[var(--flascam-blue)]"
                  size={36}
                />

                <h2 className="mt-4 text-2xl font-extrabold text-[var(--flascam-black)]">
                  Aucune association publiée pour le moment
                </h2>

                <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[var(--flascam-slate)]">
                  Les associations créées depuis le back-office apparaîtront ici
                  dès leur publication par l’administration FLASCAM.
                </p>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {associations.map((association) => (
                  <Link
                    key={association.id}
                    href={`/associations/${association.slug}`}
                    className="interactive-card group overflow-hidden rounded-[1.75rem] border border-[var(--flascam-border)] bg-white p-5 shadow-[0_20px_55px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 hover:border-[var(--flascam-blue)]"
                  >
                    <div className="flex items-start gap-4">
                      <div className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-2xl bg-[var(--flascam-blue-dark)]">
                        <AssociationLogo
                          name={association.name}
                          logoText={association.logoText}
                          logoUrl={association.logoUrl}
                        />
                      </div>

                      <div className="min-w-0">
                        <p className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-[0.68rem] font-extrabold uppercase tracking-wide text-emerald-700">
                          Page publiée
                        </p>

                        <h2 className="mt-3 text-xl font-extrabold leading-tight text-[var(--flascam-black)] group-hover:text-[var(--flascam-blue)]">
                          {association.name}
                        </h2>
                      </div>
                    </div>

                    <div className="mt-5 space-y-3 text-sm text-[var(--flascam-slate)]">
                      <p className="flex items-center gap-2">
                        <MapPin
                          size={16}
                          className="text-[var(--flascam-blue)]"
                        />
                        {association.city
                          ? `${association.city} · ${association.region}`
                          : association.region}
                      </p>

                      {association.memberCount !== null &&
                        association.memberCount !== undefined && (
                          <p className="flex items-center gap-2">
                            <UsersRound
                              size={16}
                              className="text-[var(--flascam-blue)]"
                            />
                            {association.memberCount} loueurs membres
                          </p>
                        )}

                      {association.affiliatedSinceYear && (
                        <p className="flex items-center gap-2">
                          <CalendarDays
                            size={16}
                            className="text-[var(--flascam-blue)]"
                          />
                          Affiliée depuis {association.affiliatedSinceYear}
                        </p>
                      )}
                    </div>

                    <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[var(--flascam-blue)]">
                      Voir la page
                      <ArrowRight size={16} />
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <PublicFooter />
    </>
  );
}