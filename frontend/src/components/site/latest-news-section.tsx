import Link from 'next/link';

import {
  ArrowRight,
} from 'lucide-react';

import {
  getLatestPublicNews,
} from '@/lib/news-api';

import {
  LatestNewsCarousel,
} from './latest-news-carousel';

export async function LatestNewsSection() {
  let articles;

  try {
    articles =
      await getLatestPublicNews();
  } catch (
    caughtError
  ) {
    console.error(
      '[LatestNewsSection] Impossible de charger les dernières actualités',
      caughtError,
    );

    return (
      <section
        className="
          bg-white
          py-16
          sm:py-24
        "
      >
        <div
          className="
            site-container
          "
        >
          <div
            className="
              rounded-3xl
              border
              border-red-200
              bg-red-50
              p-6
            "
          >
            <h2
              className="
                text-xl
                font-extrabold
                text-red-900
              "
            >
              Actualités temporairement
              indisponibles
            </h2>

            <p
              className="
                mt-2
                text-sm
                leading-7
                text-red-800
              "
            >
              La connexion avec le service
              d’actualités a échoué.
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (
    articles.length ===
    0
  ) {
    return null;
  }

  return (
    <section
      className="
        overflow-hidden
        bg-white
        py-16
        sm:py-24
        lg:py-28
      "
      aria-labelledby="home-news-title"
    >
      <div
        className="
          site-container
        "
      >
        <div
          className="
            grid
            gap-8
            border-b
            border-[#dbe5ef]
            pb-10
            lg:grid-cols-[1fr_auto]
            lg:items-end
          "
        >
          <div
            className="
              max-w-3xl
            "
          >
            <p
              className="
                flex
                items-center
                gap-3
                text-xs
                font-extrabold
                uppercase
                tracking-[0.18em]
                text-[#0f5f9f]
              "
            >
              <span
                className="
                  h-[3px]
                  w-10
                  bg-[#c96f4a]
                "
              />

              Actualités FLASCAM
            </p>

            <h2
              id="home-news-title"
              className="
                mt-5
                text-3xl
                font-extrabold
                leading-[1.1]
                tracking-[-0.04em]
                text-[#101820]
                sm:text-4xl
                lg:text-[3.25rem]
              "
            >
              Les dernières informations
              de la fédération.
            </h2>

            <p
              className="
                mt-6
                max-w-2xl
                text-base
                leading-8
                text-[#536273]
                sm:text-lg
              "
            >
              Parcourez les actions,
              événements, communiqués et
              publications officielles de
              la FLASCAM.
            </p>
          </div>

          <Link
            href="/actualites"
            className="
              inline-flex
              min-h-12
              items-center
              justify-center
              gap-3
              rounded-md
              border
              border-[#07355d]
              px-5
              text-sm
              font-extrabold
              text-[#07355d]
              transition
              hover:border-[#c96f4a]
              hover:bg-[#c96f4a]
              hover:text-white
              focus-visible:outline-none
              focus-visible:ring-4
              focus-visible:ring-[#c96f4a]/20
            "
          >
            Toutes les actualités

            <ArrowRight
              size={17}
              aria-hidden="true"
            />
          </Link>
        </div>

        <LatestNewsCarousel
          articles={
            articles.slice(
              0,
              10,
            )
          }
        />
      </div>
    </section>
  );
}