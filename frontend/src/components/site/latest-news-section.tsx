import Link from 'next/link';

import {
  ArrowRight,
} from 'lucide-react';

import {
  getLatestPublicNews,
} from '@/lib/news-api';

import {
  NewsCard,
} from './news-card';

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

  const [
    mainArticle,
    ...secondaryArticles
  ] = articles;

  return (
    <section
      className="
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
              Retrouvez les actions,
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
              hover:bg-[#07355d]
              hover:text-white
            "
          >
            Toutes les actualités

            <ArrowRight
              size={17}
            />
          </Link>
        </div>

        <div
          className="
            mt-10
            grid
            gap-6
            lg:grid-cols-[1.15fr_0.85fr]
          "
        >
          <div>
            <NewsCard
              article={
                mainArticle
              }
              priority
            />
          </div>

          {secondaryArticles.length >
            0 && (
            <div
              className="
                grid
                gap-6
                sm:grid-cols-2
                lg:grid-cols-1
                xl:grid-cols-2
              "
            >
              {secondaryArticles.map(
                (article) => (
                  <NewsCard
                    key={
                      article.id
                    }
                    article={
                      article
                    }
                  />
                ),
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}