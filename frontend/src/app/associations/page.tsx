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
  AssociationCard,
} from '@/components/site/association-card';

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



export default async function AssociationsPage() {
  const associations =
    await getPublicAssociations();

  return (
    <>
      <PublicHeader />

<main>
  <section className="relative overflow-hidden bg-gradient-to-br from-[#07355d] via-[#0a487b] to-[#0f5f9f] py-14 text-white sm:py-20 lg:py-24">
    <div
      aria-hidden="true"
      className="absolute inset-0 opacity-[0.12]"
      style={{
        backgroundImage:
          'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
        backgroundSize: '22px 22px',
      }}
    />

    <div
      aria-hidden="true"
      className="absolute -right-32 -top-48 h-[32rem] w-[32rem] rounded-full border border-white/10"
    />

    <div className="site-container relative">
      <p className="flex items-center gap-3 text-xs font-extrabold uppercase tracking-[0.18em] text-white">
        <span className="h-[3px] w-10 bg-[#c96f4a]" />
        Réseau régional
      </p>

      <h1 className="mt-6 max-w-4xl text-4xl font-extrabold leading-[1.08] tracking-[-0.045em] text-white sm:text-5xl lg:text-[4rem]">
        Les associations régionales affiliées à la FLASCAM.
      </h1>

      <p className="mt-7 max-w-3xl text-base leading-8 text-white/75 sm:text-lg">
        Découvrez les relais territoriaux de la fédération, leurs
        coordonnées, leurs actualités, leurs événements et leurs actions au
        service des loueurs automobiles.
      </p>

      {associations.length > 0 && (
        <div className="mt-10 inline-flex items-center gap-3 border-l-4 border-[#c96f4a] bg-white/10 px-5 py-4 backdrop-blur-sm">
          <strong className="text-2xl font-extrabold">
            {associations.length}
          </strong>

          <span className="text-sm text-white/75">
            association
            {associations.length > 1 ? 's' : ''} publiée
            {associations.length > 1 ? 's' : ''}
          </span>
        </div>
      )}
    </div>
  </section>

  <section className="relative overflow-hidden bg-[#f5f9fc] py-14 sm:py-20 lg:py-24">
    <div
      aria-hidden="true"
      className="absolute -left-40 top-20 h-80 w-80 rounded-full bg-[#0f5f9f]/[0.05] blur-3xl"
    />

    <div className="site-container relative">
      {associations.length === 0 ? (
        <div className="rounded-[1.25rem] border border-dashed border-[#b9c9d8] bg-white p-8 text-center sm:p-12">
          <Building2
            className="mx-auto text-[#0f5f9f]"
            size={38}
            aria-hidden="true"
          />

          <h2 className="mt-5 text-2xl font-extrabold text-[#101820]">
            Aucune association publiée pour le moment
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#536273]">
            Les associations créées depuis le back-office apparaîtront ici
            dès leur publication par l’administration FLASCAM.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {associations.map((association) => (
            <AssociationCard
              key={association.id}
              association={association}
            />
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