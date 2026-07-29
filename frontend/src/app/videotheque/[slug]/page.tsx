import type {
  Metadata,
} from 'next';

import Link from 'next/link';

import {
  notFound,
} from 'next/navigation';

import {
  ArrowLeft,
  CalendarDays,
  ExternalLink,
} from 'lucide-react';

import {
  PublicFooter,
} from '@/components/site/public-footer';

import {
  PublicHeader,
} from '@/components/site/public-header';

import {
  VideoPlayer,
} from '@/components/site/video-player';

import {
  getPublicVideoBySlug,
} from '@/lib/videos-api';

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function formatDate(
  value?: string | null,
) {
  if (!value) {
    return null;
  }

  const date =
    new Date(
      value,
    );

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return null;
  }

  return new Intl.DateTimeFormat(
    'fr-MA',
    {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    },
  ).format(date);
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const {
    slug,
  } =
    await params;

  const video =
    await getPublicVideoBySlug(
      slug,
    );

  if (!video) {
    return {
      title:
        'Vidéo introuvable',
    };
  }

  const title =
    video.seo.title ||
    video.title;

  const description =
    video.seo.description ||
    video.excerpt ||
    video.description ||
    `Regardez la vidéo ${video.title} dans la vidéothèque de la FLASCAM.`;

  return {
    title,
    description,

    alternates: {
      canonical:
        `/videotheque/${video.slug}`,
    },

    openGraph: {
      title,
      description,
      type:
        'video.other',
      locale:
        'fr_MA',

      images:
        video.thumbnail?.url
          ? [
              {
                url:
                  video.thumbnail.url,

                alt:
                  video.thumbnail.altText ||
                  video.title,
              },
            ]
          : undefined,

      videos:
        video.provider ===
          'UPLOADED' &&
        video.media?.url
          ? [
              {
                url:
                  video.media.url,
              },
            ]
          : undefined,
    },
  };
}

export default async function VideoDetailPage({
  params,
}: PageProps) {
  const {
    slug,
  } =
    await params;

  const video =
    await getPublicVideoBySlug(
      slug,
    );

  if (!video) {
    notFound();
  }

  const publicationDate =
    formatDate(
      video.publishedAt,
    );

  const description =
    video.description ||
    video.excerpt;

  const structuredData = {
    '@context':
      'https://schema.org',

    '@type':
      'VideoObject',

    name:
      video.title,

    description:
      video.seo.description ||
      video.excerpt ||
      video.description ||
      video.title,

    thumbnailUrl:
      video.thumbnail?.url
        ? [
            video.thumbnail.url,
          ]
        : undefined,

    uploadDate:
      video.publishedAt ||
      video.createdAt,

    duration:
      video.durationSeconds
        ? `PT${Math.round(
            video.durationSeconds,
          )}S`
        : undefined,

    contentUrl:
      video.provider ===
        'UPLOADED'
        ? video.media?.url
        : undefined,

    embedUrl:
      video.provider ===
        'YOUTUBE'
        ? video.youtubeEmbedUrl
        : undefined,

    publisher: {
      '@type':
        'Organization',

      name:
        video.association?.name ||
        'FLASCAM',
    },
  };

  return (
    <>
      <PublicHeader />

      <main
        className="
          bg-[#f5f9fc]
          py-10
          sm:py-14
          lg:py-16
        "
      >
        <div className="site-container">
          <Link
            href="/videotheque"
            className="
              inline-flex
              items-center
              gap-2
              text-sm
              font-extrabold
              text-[#0f5f9f]
              transition
              hover:text-[#07355d]
            "
          >
            <ArrowLeft
              size={17}
              aria-hidden="true"
            />

            Retour à la vidéothèque
          </Link>

          <article
            className="
              mt-6
              overflow-hidden
              rounded-[1.5rem]
              border
              border-[#dbe5ef]
              bg-white
              shadow-[0_24px_80px_rgba(7,53,93,0.08)]
            "
          >
            <VideoPlayer
              video={video}
              autoplay={
                false
              }
            />

            <div
              className="
                p-6
                sm:p-8
                lg:p-10
              "
            >
              <div
                className="
                  flex
                  flex-wrap
                  items-center
                  gap-x-5
                  gap-y-3
                  text-xs
                  font-extrabold
                  uppercase
                  tracking-[0.1em]
                  text-[#6b7b8d]
                "
              >
                <span>
                  {video.provider ===
                  'YOUTUBE'
                    ? 'YouTube'
                    : 'Vidéo hébergée'}
                </span>

                {publicationDate && (
                  <span
                    className="
                      inline-flex
                      items-center
                      gap-2
                    "
                  >
                    <CalendarDays
                      size={15}
                      aria-hidden="true"
                    />

                    {publicationDate}
                  </span>
                )}

                <span>
                  {video.association?.name ||
                    'FLASCAM'}
                </span>
              </div>

              <h1
                className="
                  mt-5
                  max-w-4xl
                  text-3xl
                  font-black
                  leading-tight
                  tracking-[-0.04em]
                  text-[#07355d]
                  sm:text-4xl
                  lg:text-5xl
                "
              >
                {video.title}
              </h1>

              {video.excerpt && (
                <p
                  className="
                    mt-5
                    max-w-3xl
                    text-lg
                    leading-8
                    text-[#536273]
                  "
                >
                  {video.excerpt}
                </p>
              )}

              {description && (
                <div
                  className="
                    mt-8
                    max-w-4xl
                    whitespace-pre-line
                    border-t
                    border-[#dbe5ef]
                    pt-8
                    text-base
                    leading-8
                    text-[#344456]
                  "
                >
                  {description}
                </div>
              )}

              <div
                className="
                  mt-8
                  flex
                  flex-wrap
                  gap-3
                "
              >
                {video.association && (
<Link
  href={`/associations/${video.association.slug}`}
  className="
    inline-flex
    min-h-11
    items-center
    justify-center
    rounded-xl
    bg-[#c96f4a]
    px-5
    text-sm
    font-extrabold
    !text-white
    transition
    hover:bg-[#ad5938]
    hover:!text-white
    visited:!text-white
    focus:!text-white
    focus:outline-none
    focus:ring-4
    focus:ring-[#c96f4a]/20
  "
>
  Voir l’association
</Link>
                )}

                {video.sourceType ===
                  'NEWS' &&
                  video.newsArticleId && (
                    <Link
                      href="/actualites"
                      className="
                        inline-flex
                        min-h-11
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        border
                        border-[#c9d6e2]
                        bg-white
                        px-5
                        text-sm
                        font-extrabold
                        text-[#07355d]
                        transition
                        hover:border-[#0f5f9f]
                        hover:text-[#0f5f9f]
                      "
                    >
                      Voir les actualités

                      <ExternalLink
                        size={16}
                        aria-hidden="true"
                      />
                    </Link>
                  )}
              </div>
            </div>
          </article>
        </div>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html:
              JSON.stringify(
                structuredData,
              ),
          }}
        />
      </main>

      <PublicFooter />
    </>
  );
}