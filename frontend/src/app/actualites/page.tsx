import type {
  Metadata,
} from 'next';

import Link from 'next/link';

import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Newspaper,
} from 'lucide-react';

import {
  NewsCard,
} from '@/components/site/news-card';

import {
  PublicFooter,
} from '@/components/site/public-footer';

import {
  PublicHeader,
} from '@/components/site/public-header';

import {
  getPublicNews,
} from '@/lib/news-api';

import {
  newsContentTypeLabels,
} from '@/lib/news-content';

import type {
  NewsContentType,
} from '@/types/news';

export const dynamic =
  'force-dynamic';

export const metadata: Metadata = {
  title:
    'Actualités et événements',

  description:
    'Retrouvez les actualités, événements, communiqués officiels, publications réglementaires et revues de presse de la FLASCAM.',

  alternates: {
    canonical:
      '/actualites',
  },

  openGraph: {
    title:
      'Actualités et événements de la FLASCAM',

    description:
      'Suivez les actualités officielles, événements et communiqués de la Fédération des loueurs automobiles sans chauffeur au Maroc.',

    type:
      'website',

    locale:
      'fr_MA',
  },
};

type ActualitesPageProps = {
  searchParams:
    Promise<{
      page?: string;
      type?: string;
      periode?: string;
    }>;
};

const allowedTypes:
  NewsContentType[] = [
    'ACTUALITY',
    'EVENT',
    'OFFICIAL_RELEASE',
    'REGULATORY_PUBLICATION',
    'PRESS_REVIEW',
  ];

const allowedPeriods = [
  'UPCOMING',
  'ONGOING',
  'PAST',
] as const;

function readPage(
  value?: string,
) {
  const parsed =
    Number(value);

  if (
    !Number.isInteger(
      parsed,
    ) ||
    parsed < 1
  ) {
    return 1;
  }

  return parsed;
}

function readType(
  value?: string,
):
  | NewsContentType
  | '' {
  if (
    value &&
    allowedTypes.includes(
      value as NewsContentType,
    )
  ) {
    return value as
      NewsContentType;
  }

  return '';
}

function readPeriod(
  value?: string,
):
  | 'UPCOMING'
  | 'ONGOING'
  | 'PAST'
  | '' {
  if (
    value &&
    allowedPeriods.includes(
      value as
        | 'UPCOMING'
        | 'ONGOING'
        | 'PAST',
    )
  ) {
    return value as
      | 'UPCOMING'
      | 'ONGOING'
      | 'PAST';
  }

  return '';
}

function buildPageUrl({
  page,
  contentType,
  eventPeriod,
}: {
  page?: number;
  contentType?:
    | NewsContentType
    | '';
  eventPeriod?:
    | 'UPCOMING'
    | 'ONGOING'
    | 'PAST'
    | '';
}) {
  const params =
    new URLSearchParams();

  if (
    page &&
    page > 1
  ) {
    params.set(
      'page',
      String(page),
    );
  }

  if (contentType) {
    params.set(
      'type',
      contentType,
    );
  }

  if (eventPeriod) {
    params.set(
      'periode',
      eventPeriod,
    );
  }

  const query =
    params.toString();

  return query
    ? `/actualites?${query}`
    : '/actualites';
}

export default async function ActualitesPage({
  searchParams,
}: ActualitesPageProps) {
  const params =
    await searchParams;

  const page =
    readPage(
      params.page,
    );

  const contentType =
    readType(
      params.type,
    );

  const eventPeriod =
    readPeriod(
      params.periode,
    );

  let result;
  let loadingError =
    '';

  try {
    result =
      await getPublicNews({
        page,
        limit: 12,
        contentType,
        eventPeriod,
      });
  } catch (
    caughtError
  ) {
    loadingError =
      caughtError instanceof
        Error
        ? caughtError.message
        : 'Impossible de charger les actualités.';

    console.error(
      '[ActualitesPage] Erreur de chargement',
      caughtError,
    );

    result = {
      items: [],
      pagination: {
        page,
        limit: 12,
        total: 0,
        totalPages: 0,
      },
    };
  }

  const {
    items,
    pagination,
  } = result;

  const previousUrl =
    buildPageUrl({
      page:
        Math.max(
          1,
          page - 1,
        ),
      contentType,
      eventPeriod,
    });

  const nextUrl =
    buildPageUrl({
      page:
        page + 1,
      contentType,
      eventPeriod,
    });

  return (
    <>
      <PublicHeader />

      <main>
        <section
          className="
            relative
            overflow-hidden
            bg-gradient-to-br
            from-[#07355d]
            via-[#0a487b]
            to-[#0f5f9f]
            py-16
            text-white
            sm:py-20
            lg:py-24
          "
        >
          <div
            aria-hidden="true"
            className="
              pointer-events-none
              absolute
              -right-40
              -top-48
              size-[34rem]
              rounded-full
              border
              border-white/10
            "
          />

          <div
            aria-hidden="true"
            className="
              pointer-events-none
              absolute
              bottom-0
              left-[8%]
              size-52
              rounded-full
              bg-[#c96f4a]/15
              blur-3xl
            "
          />

          <div
            className="
              site-container
              relative
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
                text-white
              "
            >
              <span
                className="
                  h-[3px]
                  w-10
                  bg-[#c96f4a]
                "
              />

              Information officielle
            </p>

            <h1
              className="
                mt-5
                max-w-4xl
                text-4xl
                font-extrabold
                leading-[1.08]
                tracking-[-0.045em]
                text-white
                sm:text-5xl
                lg:text-[4rem]
              "
            >
              Actualités et événements
            </h1>

            <p
              className="
                mt-6
                max-w-3xl
                text-base
                leading-8
                text-white/78
                sm:text-lg
                sm:leading-9
              "
            >
              Suivez les actions de la
              FLASCAM, les événements du
              secteur, les communiqués
              officiels et les publications
              destinées aux professionnels
              de la location automobile.
            </p>
          </div>
        </section>

        <section
          className="
            border-b
            border-[#dbe5ef]
            bg-white
          "
          aria-label="Filtres des actualités"
        >
          <div
            className="
              site-container
              py-5
              sm:py-6
            "
          >
            <div
              className="
                flex
                gap-2
                overflow-x-auto
                pb-2
                [scrollbar-width:thin]
              "
            >
              <Link
                href="/actualites"
                className={`
                  inline-flex
                  min-h-11
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  border
                  px-4
                  text-sm
                  font-extrabold
                  transition
                  ${
!contentType &&
!eventPeriod
  ? `
    border-[#07355d]
    bg-[#07355d]
    !text-white
  `
                      : `
                        border-[#dbe5ef]
                        bg-white
                        text-[#536273]
                        hover:border-[#0f5f9f]
                        hover:text-[#0f5f9f]
                      `
                  }
                `}
              >
                Toutes
              </Link>

              {Object.entries(
                newsContentTypeLabels,
              ).map(
                ([
                  value,
                  label,
                ]) => {
                  const type =
                    value as
                      NewsContentType;

                  const active =
                    contentType ===
                      type &&
                    !eventPeriod;

                  return (
                    <Link
                      key={value}
                      href={
                        buildPageUrl({
                          contentType:
                            type,
                        })
                      }
                      className={`
                        inline-flex
                        min-h-11
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        border
                        px-4
                        text-sm
                        font-extrabold
                        transition
                        ${
active
  ? `
    border-[#07355d]
    bg-[#07355d]
    !text-white
  `
                            : `
                              border-[#dbe5ef]
                              bg-white
                              text-[#536273]
                              hover:border-[#0f5f9f]
                              hover:text-[#0f5f9f]
                            `
                        }
                      `}
                    >
                      {label}
                    </Link>
                  );
                },
              )}

              <Link
                href={
                  buildPageUrl({
                    contentType:
                      'EVENT',
                    eventPeriod:
                      'UPCOMING',
                  })
                }
                className={`
                  inline-flex
                  min-h-11
                  shrink-0
                  items-center
                  justify-center
                  gap-2
                  rounded-full
                  border
                  px-4
                  text-sm
                  font-extrabold
                  transition
                  ${
eventPeriod ===
'UPCOMING'
  ? `
    border-[#c96f4a]
    bg-[#c96f4a]
    !text-white
  `
                      : `
                        border-[#c96f4a]/30
                        bg-[#f8ede8]
                        text-[#a95235]
                        hover:border-[#c96f4a]
                      `
                  }
                `}
              >
                <CalendarDays
                  size={16}
                />

                À venir
              </Link>
            </div>
          </div>
        </section>

        <section
          className="
            bg-[#f5f9fc]
            py-14
            sm:py-20
            lg:py-24
          "
        >
          <div
            className="
              site-container
            "
          >
            <div
              className="
                flex
                flex-col
                gap-3
                border-b
                border-[#dbe5ef]
                pb-8
                sm:flex-row
                sm:items-end
                sm:justify-between
              "
            >
              <div>
                <p
                  className="
                    section-eyebrow
                  "
                >
                  Publications FLASCAM
                </p>

                <h2
                  className="
                    mt-3
                    text-3xl
                    font-extrabold
                    tracking-[-0.04em]
                    text-[#101820]
                    sm:text-4xl
                  "
                >
                  {contentType
                    ? newsContentTypeLabels[
                        contentType
                      ]
                    : eventPeriod ===
                        'UPCOMING'
                      ? 'Événements à venir'
                      : 'Toutes les publications'}
                </h2>
              </div>

              <p
                className="
                  text-sm
                  font-semibold
                  text-[#536273]
                "
              >
                {
                  pagination.total
                }{' '}
                publication
                {pagination.total >
                1
                  ? 's'
                  : ''}
              </p>
            </div>

            {loadingError ? (
              <div
                className="
                  mt-10
                  rounded-[1.5rem]
                  border
                  border-red-200
                  bg-red-50
                  px-6
                  py-10
                "
              >
                <h2
                  className="
                    text-xl
                    font-extrabold
                    text-red-900
                  "
                >
                  Impossible de charger
                  les actualités
                </h2>

                <p
                  className="
                    mt-3
                    text-sm
                    leading-7
                    text-red-800
                  "
                >
                  {loadingError}
                </p>
              </div>
            ) : items.length ===
            0 ? (
              <div
                className="
                  mt-10
                  rounded-[1.5rem]
                  border
                  border-dashed
                  border-[#b9c9d8]
                  bg-white
                  px-6
                  py-16
                  text-center
                "
              >
                <Newspaper
                  size={42}
                  className="
                    mx-auto
                    text-[#0f5f9f]/25
                  "
                />

                <h2
                  className="
                    mt-5
                    text-2xl
                    font-extrabold
                    text-[#101820]
                  "
                >
                  Aucune publication
                  disponible
                </h2>

                <p
                  className="
                    mx-auto
                    mt-3
                    max-w-xl
                    text-sm
                    leading-7
                    text-[#536273]
                  "
                >
                  Aucun contenu publié ne
                  correspond actuellement à
                  ce filtre.
                </p>

                <Link
                  href="/actualites"
className="
  inline-flex
  min-h-12
  items-center
  justify-center
  rounded-md
  bg-[#c96f4a]
  px-5
  text-sm
  font-extrabold
  !text-white
  shadow-[0_14px_32px_rgba(201,111,74,0.22)]
  transition
  hover:bg-[#ad5838]
  focus-visible:outline-none
  focus-visible:ring-2
  focus-visible:ring-[#c96f4a]
  focus-visible:ring-offset-4
"
                >
                  Voir toutes les actualités
                </Link>
              </div>
            ) : (
              <div
                className="
                  mt-10
                  grid
                  gap-6
                  md:grid-cols-2
                  xl:grid-cols-3
                "
              >
                {items.map(
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

            {pagination.totalPages >
              1 && (
              <nav
                className="
                  mt-12
                  flex
                  items-center
                  justify-between
                  gap-4
                  border-t
                  border-[#dbe5ef]
                  pt-8
                "
                aria-label="Pagination"
              >
                {page > 1 ? (
                  <Link
                    href={
                      previousUrl
                    }
                    className="
                      inline-flex
                      min-h-11
                      items-center
                      gap-2
                      rounded-md
                      border
                      border-[#dbe5ef]
                      bg-white
                      px-4
                      text-sm
                      font-extrabold
                      text-[#07355d]
                      transition
                      hover:border-[#0f5f9f]
                    "
                  >
                    <ArrowLeft
                      size={17}
                    />

                    Précédente
                  </Link>
                ) : (
                  <span />
                )}

                <span
                  className="
                    text-sm
                    font-semibold
                    text-[#536273]
                  "
                >
                  Page {page} sur{' '}
                  {
                    pagination.totalPages
                  }
                </span>

                {page <
                pagination.totalPages ? (
                  <Link
                    href={
                      nextUrl
                    }
                    className="
                      inline-flex
                      min-h-11
                      items-center
                      gap-2
                      rounded-md
                      bg-[#07355d]
                      px-4
                      text-sm
                      font-extrabold
                      text-white
                      transition
                      hover:bg-[#0f5f9f]
                    "
                  >
                    Suivante

                    <ArrowRight
                      size={17}
                    />
                  </Link>
                ) : (
                  <span />
                )}
              </nav>
            )}
          </div>
        </section>
      </main>

      <PublicFooter />
    </>
  );
}