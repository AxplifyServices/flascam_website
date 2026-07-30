import Link from 'next/link';

import {
  ArrowLeft,
  CarFront,
} from 'lucide-react';

import {
  PublicFooter,
} from '@/components/site/public-footer';

import {
  PublicHeader,
} from '@/components/site/public-header';

export default function MarketplaceListingNotFound() {
  return (
    <>
      <PublicHeader />

      <main
        className="
          grid
          min-h-[70vh]
          place-items-center
          bg-slate-50
          px-5
          py-16
        "
      >
        <div
          className="
            max-w-xl
            text-center
          "
        >
          <div
            className="
              mx-auto
              grid
              size-20
              place-items-center
              rounded-3xl
              bg-blue-50
              text-[var(--flascam-blue)]
            "
          >
            <CarFront
              size={38}
            />
          </div>

          <h1
            className="
              mt-6
              text-3xl
              font-black
              text-slate-950
            "
          >
            Ce véhicule n’est plus disponible
          </h1>

          <p
            className="
              mt-3
              text-sm
              leading-7
              text-slate-600
            "
          >
            L’annonce a peut-être expiré, été retirée ou fait l’objet
            d’une offre acceptée.
          </p>

          <Link
            href="/marketplace"
            className="
              mt-7
              inline-flex
              min-h-12
              items-center
              justify-center
              gap-2
              rounded-2xl
              bg-[var(--flascam-blue)]
              px-6
              text-sm
              font-black
              text-white
            "
          >
            <ArrowLeft
              size={18}
            />

            Voir les véhicules disponibles
          </Link>
        </div>
      </main>

      <PublicFooter />
    </>
  );
}