import Link from 'next/link';

import {
  ArrowLeft,
  Newspaper,
} from 'lucide-react';

import {
  PublicFooter,
} from '@/components/site/public-footer';

import {
  PublicHeader,
} from '@/components/site/public-header';

export default function NewsNotFound() {
  return (
    <>
      <PublicHeader />

      <main
        className="
          grid
          min-h-[65vh]
          place-items-center
          bg-[#f5f9fc]
          px-4
          py-16
        "
      >
        <div
          className="
            w-full
            max-w-xl
            rounded-[2rem]
            border
            border-[#dbe5ef]
            bg-white
            p-7
            text-center
            shadow-[0_24px_70px_rgba(7,53,93,0.08)]
            sm:p-10
          "
        >
          <Newspaper
            size={44}
            className="
              mx-auto
              text-[#0f5f9f]/30
            "
          />

          <h1
            className="
              mt-5
              text-3xl
              font-extrabold
              tracking-[-0.04em]
              text-[#101820]
            "
          >
            Publication introuvable
          </h1>

          <p
            className="
              mt-4
              text-sm
              leading-7
              text-[#536273]
            "
          >
            Cette actualité n’existe pas,
            n’est plus publiée ou son
            adresse a changé.
          </p>

          <Link
            href="/actualites"
            className="
              mt-7
              inline-flex
              min-h-12
              items-center
              justify-center
              gap-2
              rounded-md
              bg-[#07355d]
              px-5
              text-sm
              font-extrabold
              text-white
              transition
              hover:bg-[#0f5f9f]
            "
          >
            <ArrowLeft
              size={17}
            />

            Retour aux actualités
          </Link>
        </div>
      </main>

      <PublicFooter />
    </>
  );
}