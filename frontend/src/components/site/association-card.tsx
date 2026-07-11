import Image from 'next/image';
import Link from 'next/link';

import {
  ArrowUpRight,
  CalendarDays,
  MapPin,
  UsersRound,
} from 'lucide-react';

import type {
  PublicAssociation,
} from '@/types/associations';

type AssociationCardProps = {
  association: PublicAssociation;
  priority?: boolean;
};

function AssociationLogo({
  association,
}: {
  association: PublicAssociation;
}) {
  if (association.logoUrl) {
    return (
      <img
        src={association.logoUrl}
        alt={`Logo ${association.name}`}
        className="h-full w-full object-contain"
      />
    );
  }

  return (
    <span className="text-xl font-black text-white">
      {association.logoText ||
        association.name
          .slice(0, 2)
          .toUpperCase()}
    </span>
  );
}

export function AssociationCard({
  association,
}: AssociationCardProps) {
  return (
    <Link
      href={`/associations/${association.slug}`}
      className="group relative flex min-h-[21rem] flex-col overflow-hidden rounded-[1.25rem] border border-[#dbe5ef] bg-white transition duration-300 hover:-translate-y-1 hover:border-[#c96f4a]/50 hover:shadow-[0_24px_65px_rgba(7,53,93,0.12)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#0f5f9f]/20"
    >
      <div className="relative h-28 overflow-hidden bg-gradient-to-br from-[#07355d] via-[#0a487b] to-[#0f5f9f]">
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.14]"
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
            backgroundSize: '18px 18px',
          }}
        />

        <div
          aria-hidden="true"
          className="absolute -right-10 -top-12 h-32 w-32 rounded-full border border-white/20"
        />

        <div
          aria-hidden="true"
          className="absolute bottom-0 left-0 h-1 w-20 bg-[#c96f4a] transition-all duration-300 group-hover:w-full"
        />
      </div>

      <div className="relative -mt-10 flex flex-1 flex-col px-6 pb-6">
        <div className="grid h-20 w-20 place-items-center overflow-hidden rounded-xl border-4 border-white bg-[#07355d] p-2 shadow-[0_12px_28px_rgba(7,53,93,0.15)]">
          <AssociationLogo
            association={association}
          />
        </div>

        <div className="mt-5 flex-1">
          <h3 className="text-xl font-extrabold leading-tight tracking-[-0.025em] text-[#101820] transition-colors group-hover:text-[#0f5f9f]">
            {association.name}
          </h3>

          <div className="mt-5 space-y-3 border-t border-[#dbe5ef] pt-5 text-sm text-[#536273]">
            <p className="flex items-start gap-3">
              <MapPin
                size={17}
                className="mt-0.5 shrink-0 text-[#c96f4a]"
                aria-hidden="true"
              />

              <span>
                {association.city
                  ? `${association.city} · ${association.region}`
                  : association.region}
              </span>
            </p>

            {association.memberCount !== null &&
              association.memberCount !== undefined && (
                <p className="flex items-start gap-3">
                  <UsersRound
                    size={17}
                    className="mt-0.5 shrink-0 text-[#0f5f9f]"
                    aria-hidden="true"
                  />

                  <span>
                    {association.memberCount} loueurs membres
                  </span>
                </p>
              )}

            {association.affiliatedSinceYear && (
              <p className="flex items-start gap-3">
                <CalendarDays
                  size={17}
                  className="mt-0.5 shrink-0 text-[#0f5f9f]"
                  aria-hidden="true"
                />

                <span>
                  Affiliée depuis{' '}
                  {association.affiliatedSinceYear}
                </span>
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-[#dbe5ef] pt-5">
          <span className="text-sm font-extrabold text-[#07355d]">
            Découvrir l’association
          </span>

          <span className="grid h-10 w-10 place-items-center rounded-full border border-[#dbe5ef] text-[#0f5f9f] transition duration-300 group-hover:rotate-6 group-hover:border-[#c96f4a] group-hover:bg-[#c96f4a] group-hover:text-white">
            <ArrowUpRight
              size={18}
              aria-hidden="true"
            />
          </span>
        </div>
      </div>
    </Link>
  );
}