import type {
  Metadata,
} from 'next';

import Link from 'next/link';

import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  MapPin,
} from 'lucide-react';

import {
  notFound,
} from 'next/navigation';

import {
  PublicFooter,
} from '@/components/site/public-footer';

import {
  PublicHeader,
} from '@/components/site/public-header';

import {
  getPublicNewsBySlug,
} from '@/lib/news-api';

import {
  formatNewsDate,
  formatNewsDateRange,
  newsContentTypeLabels,
  newsEventCategoryLabels,
  newsEventPeriodLabels,
} from '@/lib/news-content';

import {
  NewsMediaGallery,
} from '@/components/site/news-media-gallery';

type NewsDetailPageProps = {
  params:
    Promise<{
      slug: string;
    }>;
};

export const dynamic =
  'force-dynamic';

async function readArticle(
  slug: string,
) {
  try {
    return await getPublicNewsBySlug(
      slug,
    );
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: NewsDetailPageProps):
  Promise<Metadata> {
  const {
    slug,
  } = await params;

  const article =
    await readArticle(
      slug,
    );

  if (!article) {
    return {
      title:
        'Publication introuvable',

      robots: {
        index:
          false,

        follow:
          false,
      },
    };
  }

  const title =
    article.seoTitle?.trim() ||
    article.title;

  const description =
    article.seoDescription?.trim() ||
    article.excerpt?.trim() ||
    'Publication officielle de la FLASCAM.';

  const image =
    article.primaryMedia?.mediaType ===
      'IMAGE'
      ? article.primaryMedia.url
      : undefined;

  return {
    title,

    description,

    alternates: {
      canonical:
        `/actualites/${article.slug}`,
    },

    openGraph: {
      title,

      description,

      type:
        'article',

      locale:
        'fr_MA',

      publishedTime:
        article.publishedAt ??
        undefined,

      modifiedTime:
        article.updatedAt,

      images:
        image
          ? [
              {
                url:
                  image,

                alt:
                  article.primaryMedia
                    ?.altText ??
                  article.title,
              },
            ]
          : undefined,
    },
  };
}

export default async function NewsDetailPage({
  params,
}: NewsDetailPageProps) {
  const {
    slug,
  } = await params;

  const article =
    await readArticle(
      slug,
    );

  if (!article) {
    notFound();
  }

  const publicationDate =
    formatNewsDate(
      article.publishedAt,
      {
        withTime:
          false,
      },
    );

  const eventDate =
    formatNewsDateRange(
      article.eventStartAt,
      article.eventEndAt,
    );

  const eventCategory =
    article.eventCategory
      ? newsEventCategoryLabels[
          article.eventCategory
        ]
      : null;

const articleImages =
  article.media
    .filter(
      (media) =>
        media.mediaType ===
        'IMAGE',
    )
    .map(
      (media) =>
        media.url,
    );

  const jsonLd = {
    '@context':
      'https://schema.org',

    '@type':
      article.contentType ===
        'EVENT'
        ? 'Event'
        : 'NewsArticle',

    headline:
      article.title,

    description:
      article.excerpt ??
      article.seoDescription ??
      undefined,

    datePublished:
      article.publishedAt ??
      undefined,

    dateModified:
      article.updatedAt,

...(articleImages.length > 0
  ? {
      image:
        articleImages,
    }
  : {}),

    mainEntityOfPage:
      `https://flascam.axplitest.com/actualites/${article.slug}`,

    publisher: {
      '@type':
        'Organization',

      name:
        'FLASCAM',

      url:
        'https://flascam.axplitest.com',
    },

    ...(article.contentType ===
      'EVENT'
      ? {
          startDate:
            article.eventStartAt ??
            undefined,

          endDate:
            article.eventEndAt ??
            undefined,

          location:
            article.eventLocation
              ? {
                  '@type':
                    'Place',

                  name:
                    article.eventLocation,
                }
              : undefined,

          eventStatus:
            article.eventPeriod ===
              'UPCOMING' ||
            article.eventPeriod ===
              'ONGOING'
              ? 'https://schema.org/EventScheduled'
              : undefined,
        }
      : {}),
  };

  return (
    <>
      <PublicHeader />

      <main>
        <article>
          <header
            className="
              relative
              overflow-hidden
              bg-[#07355d]
              py-12
              text-white
              sm:py-16
              lg:py-20
            "
          >
            <div
              aria-hidden="true"
              className="
                absolute
                -right-40
                -top-52
                size-[34rem]
                rounded-full
                border
                border-white/10
              "
            />

            <div
              className="
                site-container
                relative
              "
            >
              <Link
                href="/actualites"
                className="
                  inline-flex
                  items-center
                  gap-2
                  text-sm
                  font-extrabold
                  text-white/75
                  transition
                  hover:text-white
                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-white
                "
              >
                <ArrowLeft
                  size={17}
                />

                Retour aux actualités
              </Link>

              <div
                className="
                  mt-8
                  flex
                  flex-wrap
                  gap-2
                "
              >
                <span
                  className="
                    rounded-full
                    bg-white/12
                    px-3
                    py-1.5
                    text-xs
                    font-extrabold
                    uppercase
                    tracking-[0.12em]
                    text-white
                  "
                >
                  {
                    newsContentTypeLabels[
                      article.contentType
                    ]
                  }
                </span>

                {eventCategory && (
                  <span
                    className="
                      rounded-full
                      bg-white/12
                      px-3
                      py-1.5
                      text-xs
                      font-extrabold
                      uppercase
                      tracking-[0.12em]
                      text-white
                    "
                  >
                    {
                      eventCategory
                    }
                  </span>
                )}

                {article.eventPeriod && (
                  <span
                    className="
                      rounded-full
                      bg-[#c96f4a]
                      px-3
                      py-1.5
                      text-xs
                      font-extrabold
                      uppercase
                      tracking-[0.12em]
                      text-white
                    "
                  >
                    {
                      newsEventPeriodLabels[
                        article.eventPeriod
                      ]
                    }
                  </span>
                )}
              </div>

              <h1
                className="
                  mt-6
                  max-w-5xl
                  text-3xl
                  font-extrabold
                  leading-[1.12]
                  tracking-[-0.045em]
                  text-white
                  sm:text-5xl
                  lg:text-[3.75rem]
                "
              >
                {article.title}
              </h1>

              {article.excerpt && (
                <p
                  className="
                    mt-6
                    max-w-4xl
                    text-base
                    leading-8
                    text-white/78
                    sm:text-lg
                    sm:leading-9
                  "
                >
                  {article.excerpt}
                </p>
              )}

              <div
                className="
                  mt-8
                  flex
                  flex-col
                  gap-3
                  text-sm
                  font-semibold
                  text-white/75
                  sm:flex-row
                  sm:flex-wrap
                  sm:gap-x-7
                "
              >
                {publicationDate && (
                  <p
                    className="
                      flex
                      items-center
                      gap-2
                    "
                  >
                    <Clock3
                      size={17}
                      className="
                        text-[#f0a27f]
                      "
                    />

                    Publié le{' '}
                    {
                      publicationDate
                    }
                  </p>
                )}

                {eventDate && (
                  <p
                    className="
                      flex
                      items-start
                      gap-2
                    "
                  >
                    <CalendarDays
                      size={17}
                      className="
                        mt-0.5
                        text-[#f0a27f]
                      "
                    />

                    {eventDate}
                  </p>
                )}

                {article.eventLocation && (
                  <p
                    className="
                      flex
                      items-center
                      gap-2
                    "
                  >
                    <MapPin
                      size={17}
                      className="
                        text-[#f0a27f]
                      "
                    />

                    {
                      article.eventLocation
                    }
                  </p>
                )}
              </div>
            </div>
          </header>

          <div
            className="
              bg-white
              py-10
              sm:py-14
              lg:py-20
            "
          >
            <div
              className="
                site-container
              "
            >
{article.media.length >
  0 && (
  <NewsMediaGallery
    media={article.media}
    articleTitle={
      article.title
    }
  />
)}

<section
  className={`
    mx-auto
    max-w-3xl
    ${
      article.media.length > 0
        ? `
          mt-10
          sm:mt-14
        `
        : `
          mt-0
        `
    }
  `}
>
                {article.body ? (
                  <div
                    className="
                      whitespace-pre-line
                      text-base
                      leading-8
                      text-[#334155]
                      sm:text-lg
                      sm:leading-9
                    "
                  >
                    {article.body}
                  </div>
                ) : (
                  <p
                    className="
                      text-base
                      leading-8
                      text-[#536273]
                    "
                  >
                    {
                      article.excerpt
                    }
                  </p>
                )}

                <div
                  className="
                    mt-12
                    border-t
                    border-[#dbe5ef]
                    pt-8
                  "
                >
                  <Link
                    href="/actualites"
                    className="
                      inline-flex
                      min-h-12
                      items-center
                      justify-center
                      gap-2
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
                    <ArrowLeft
                      size={17}
                    />

                    Toutes les actualités
                  </Link>
                </div>
              </section>
            </div>
          </div>
        </article>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html:
              JSON.stringify(
                jsonLd,
              ).replace(
                /</g,
                '\\u003c',
              ),
          }}
        />
      </main>

      <PublicFooter />
    </>
  );
}