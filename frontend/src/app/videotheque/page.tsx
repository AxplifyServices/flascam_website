import type {
  Metadata,
} from 'next';

import Link from 'next/link';

import {
  Search,
  Video,
} from 'lucide-react';

import {
  PublicFooter,
} from '@/components/site/public-footer';

import {
  PublicHeader,
} from '@/components/site/public-header';

import {
  VideoCard,
} from '@/components/site/video-card';

import {
  getPublicVideos,
} from '@/lib/videos-api';

import type {
  VideoProvider,
} from '@/types/videos';

export const metadata: Metadata = {
  title:
    'Vidéothèque',

  description:
    'Découvrez les vidéos de la FLASCAM et des associations régionales : initiatives, événements, témoignages et actualités de la profession automobile au Maroc.',

  alternates: {
    canonical:
      '/videotheque',
  },

  openGraph: {
    title:
      'Vidéothèque FLASCAM',

    description:
      'Retrouvez les vidéos de la FLASCAM et de ses associations régionales.',

    type:
      'website',

    locale:
      'fr_MA',

    url:
      '/videotheque',
  },
};

type PageProps = {
  searchParams: Promise<{
    page?: string;
    search?: string;
    provider?: string;
    association?: string;
  }>;
};

function readPage(
  value?: string,
) {
  const page =
    Number(
      value,
    );

  if (
    !Number.isInteger(
      page,
    ) ||
    page <
      1
  ) {
    return 1;
  }

  return page;
}

function readProvider(
  value?: string,
): VideoProvider | '' {
  if (
    value ===
      'YOUTUBE' ||
    value ===
      'UPLOADED'
  ) {
    return value;
  }

  return '';
}

function buildPageUrl(
  current: {
    search: string;
    provider: VideoProvider | '';
    associationSlug: string;
  },
  page: number,
) {
  const params =
    new URLSearchParams();

  if (
    current.search
  ) {
    params.set(
      'search',
      current.search,
    );
  }

  if (
    current.provider
  ) {
    params.set(
      'provider',
      current.provider,
    );
  }

  if (
    current.associationSlug
  ) {
    params.set(
      'association',
      current.associationSlug,
    );
  }

  if (
    page >
    1
  ) {
    params.set(
      'page',
      String(
        page,
      ),
    );
  }

  const query =
    params.toString();

  return query
    ? `/videotheque?${query}`
    : '/videotheque';
}

export default async function VideothequePage({
  searchParams,
}: PageProps) {
  const params =
    await searchParams;

  const page =
    readPage(
      params.page,
    );

  const search =
    params.search?.trim() ??
    '';

  const provider =
    readProvider(
      params.provider,
    );

  const associationSlug =
    params.association?.trim() ??
    '';

  const response =
    await getPublicVideos({
      page,
      limit:
        12,
      search,
      provider,
      associationSlug,
    });

  const {
    items,
    pagination,
  } =
    response;

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
            className="
              absolute
              -right-24
              -top-28
              size-80
              rounded-full
              border
              border-white/10
            "
          />

          <div
            className="
              absolute
              -bottom-40
              -left-24
              size-96
              rounded-full
              bg-white/5
            "
          />

          <div
            className="
              site-container
              relative
              z-10
            "
          >
            <p
              className="
                text-xs
                font-extrabold
                uppercase
                tracking-[0.2em]
                text-[#f0a27f]
              "
            >
              Images et témoignages
            </p>

            <h1
              className="
                mt-4
                max-w-4xl
                text-4xl
                font-black
                leading-tight
                tracking-[-0.04em]
                sm:text-5xl
                lg:text-6xl
              "
            >
              La profession automobile racontée en vidéo
            </h1>

            <p
              className="
                mt-6
                max-w-2xl
                text-base
                leading-8
                text-white/75
                sm:text-lg
              "
            >
              Découvrez les initiatives, les événements et les actions portées par la FLASCAM et ses associations régionales à travers le Maroc.
            </p>
          </div>
        </section>

        <section
          className="
            bg-[#f5f9fc]
            py-10
            sm:py-12
            lg:py-16
          "
        >
          <div className="site-container">
            <form
              method="GET"
              action="/videotheque"
              className="
                grid
                gap-4
                rounded-[1.35rem]
                border
                border-[#dbe5ef]
                bg-white
                p-4
                shadow-[0_16px_50px_rgba(7,53,93,0.06)]
                sm:p-5
                lg:grid-cols-[minmax(0,1fr)_220px_auto]
                lg:items-end
              "
            >
              <label>
                <span
                  className="
                    block
                    text-xs
                    font-extrabold
                    uppercase
                    tracking-[0.14em]
                    text-[#07355d]
                  "
                >
                  Rechercher
                </span>

                <span
                  className="
                    relative
                    mt-2
                    block
                  "
                >
                  <Search
                    size={18}
                    className="
                      pointer-events-none
                      absolute
                      left-4
                      top-1/2
                      -translate-y-1/2
                      text-[#6b7b8d]
                    "
                    aria-hidden="true"
                  />

                  <input
                    type="search"
                    name="search"
                    defaultValue={
                      search
                    }
                    placeholder="Titre, sujet ou mot-clé"
                    className="
                      h-12
                      w-full
                      rounded-xl
                      border
                      border-[#c9d6e2]
                      bg-white
                      pl-11
                      pr-4
                      text-sm
                      text-[#07355d]
                      outline-none
                      transition
                      placeholder:text-[#8b99a8]
                      focus:border-[#0f5f9f]
                      focus:ring-4
                      focus:ring-[#0f5f9f]/10
                    "
                  />
                </span>
              </label>

              <label>
                <span
                  className="
                    block
                    text-xs
                    font-extrabold
                    uppercase
                    tracking-[0.14em]
                    text-[#07355d]
                  "
                >
                  Source
                </span>

                <select
                  name="provider"
                  defaultValue={
                    provider
                  }
                  className="
                    mt-2
                    h-12
                    w-full
                    rounded-xl
                    border
                    border-[#c9d6e2]
                    bg-white
                    px-4
                    text-sm
                    font-semibold
                    text-[#07355d]
                    outline-none
                    transition
                    focus:border-[#0f5f9f]
                    focus:ring-4
                    focus:ring-[#0f5f9f]/10
                  "
                >
                  <option value="">
                    Toutes les vidéos
                  </option>

                  <option value="YOUTUBE">
                    YouTube
                  </option>

                  <option value="UPLOADED">
                    Vidéos hébergées
                  </option>
                </select>
              </label>

              {associationSlug && (
                <input
                  type="hidden"
                  name="association"
                  value={
                    associationSlug
                  }
                />
              )}

              <button
                type="submit"
                className="
                  inline-flex
                  h-12
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-[#0f5f9f]
                  px-6
                  text-sm
                  font-extrabold
                  text-white
                  transition
                  hover:bg-[#07355d]
                "
              >
                <Search
                  size={17}
                  aria-hidden="true"
                />

                Rechercher
              </button>
            </form>

            {associationSlug && (
              <div
                className="
                  mt-5
                  flex
                  flex-wrap
                  items-center
                  gap-3
                  rounded-xl
                  border
                  border-[#0f5f9f]/15
                  bg-[#eaf5ff]
                  px-4
                  py-3
                  text-sm
                  text-[#07355d]
                "
              >
                <span className="font-bold">
                  Vidéos de l’association sélectionnée
                </span>

                <Link
                  href="/videotheque"
                  className="
                    font-extrabold
                    text-[#0f5f9f]
                    underline
                    underline-offset-4
                  "
                >
                  Afficher toute la vidéothèque
                </Link>
              </div>
            )}

            <div
              className="
                mt-10
                flex
                flex-wrap
                items-end
                justify-between
                gap-4
              "
            >
              <div>
                <p className="section-eyebrow">
                  Vidéothèque
                </p>

                <h2
                  className="
                    mt-3
                    text-3xl
                    font-black
                    tracking-[-0.035em]
                    text-[#07355d]
                    sm:text-4xl
                  "
                >
                  Toutes les vidéos publiées
                </h2>
              </div>

              <p
                className="
                  text-sm
                  font-semibold
                  text-[#6b7b8d]
                "
              >
                {pagination.total}{' '}
                {pagination.total >
                1
                  ? 'vidéos'
                  : 'vidéo'}
              </p>
            </div>

            {items.length ===
            0 ? (
              <div
                className="
                  mt-8
                  grid
                  min-h-72
                  place-items-center
                  rounded-[1.35rem]
                  border
                  border-dashed
                  border-[#b9c9d8]
                  bg-white
                  px-6
                  text-center
                "
              >
                <div>
                  <span
                    className="
                      mx-auto
                      grid
                      size-14
                      place-items-center
                      rounded-full
                      bg-[#eaf5ff]
                      text-[#0f5f9f]
                    "
                  >
                    <Video
                      size={25}
                      aria-hidden="true"
                    />
                  </span>

                  <h2
                    className="
                      mt-5
                      text-xl
                      font-extrabold
                      text-[#07355d]
                    "
                  >
                    Aucune vidéo trouvée
                  </h2>

                  <p
                    className="
                      mt-2
                      max-w-md
                      text-sm
                      leading-7
                      text-[#536273]
                    "
                  >
                    Modifiez les critères de recherche ou revenez prochainement pour découvrir de nouveaux contenus.
                  </p>
                </div>
              </div>
            ) : (
              <div
                className="
                  mt-8
                  grid
                  gap-6
                  sm:grid-cols-2
                  xl:grid-cols-3
                "
              >
                {items.map(
                  (
                    video,
                    index,
                  ) => (
                    <VideoCard
                      key={
                        video.id
                      }
                      video={
                        video
                      }
                      priority={
                        index <
                        3
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
                  flex-wrap
                  items-center
                  justify-center
                  gap-2
                "
                aria-label="Pagination de la vidéothèque"
              >
                {Array.from(
                  {
                    length:
                      pagination.totalPages,
                  },
                  (
                    _,
                    index,
                  ) =>
                    index +
                    1,
                ).map(
                  (
                    pageNumber,
                  ) => {
                    const isCurrent =
                      pageNumber ===
                      pagination.page;

                    return (
                      <Link
                        key={
                          pageNumber
                        }
                        href={buildPageUrl(
                          {
                            search,
                            provider,
                            associationSlug,
                          },
                          pageNumber,
                        )}
                        aria-current={
                          isCurrent
                            ? 'page'
                            : undefined
                        }
                        className={`
                          grid
                          size-11
                          place-items-center
                          rounded-xl
                          border
                          text-sm
                          font-extrabold
                          transition
                          ${
                            isCurrent
                              ? `
                                border-[#0f5f9f]
                                bg-[#0f5f9f]
                                text-white
                              `
                              : `
                                border-[#c9d6e2]
                                bg-white
                                text-[#07355d]
                                hover:border-[#0f5f9f]
                                hover:text-[#0f5f9f]
                              `
                          }
                        `}
                      >
                        {pageNumber}
                      </Link>
                    );
                  },
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