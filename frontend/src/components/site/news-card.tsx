import Link from 'next/link';

import {
  ArrowRight,
  CalendarDays,
  Clock3,
  MapPin,
  Play,
} from 'lucide-react';

import {
  formatNewsDate,
  formatNewsDateRange,
  newsContentTypeLabels,
  newsEventPeriodLabels,
} from '@/lib/news-content';

import type {
  NewsArticle,
} from '@/types/news';

import {
  AdaptiveImage,
} from '@/components/site/adaptive-image';

type NewsCardProps = {
  article: NewsArticle;
  priority?: boolean;
  compact?: boolean;
};

export function NewsCard({
  article,
  priority = false,
  compact = false,
}: NewsCardProps) {
  const media =
    article.primaryMedia ??
    article.media[0] ??
    null;

  const hasMedia =
    media !== null;

  const publicationDate =
    formatNewsDate(
      article.publishedAt,
    );

  const eventDate =
    formatNewsDateRange(
      article.eventStartAt,
      article.eventEndAt,
    );

  return (
    <article
      className="
        group
        flex
        h-full
        flex-col
        overflow-hidden
        rounded-[1.35rem]
        border
        border-[#dbe5ef]
        bg-white
        shadow-[0_18px_55px_rgba(7,53,93,0.07)]
        transition
        duration-300
        hover:-translate-y-1
        hover:border-[#0f5f9f]/30
        hover:shadow-[0_24px_70px_rgba(7,53,93,0.13)]
      "
    >
{hasMedia && (
  <Link
    href={`/actualites/${article.slug}`}
className={`
  relative
  block
  overflow-hidden
  bg-[#eaf5ff]
  ${
    compact
      ? `
        h-[180px]
        sm:h-[210px]
        lg:h-[230px]
      `
      : `
        h-[210px]
        sm:h-[240px]
        lg:h-[270px]
      `
  }
`}
    aria-label={`Lire ${article.title}`}
  >
    {media?.mediaType ===
    'IMAGE' ? (
<AdaptiveImage
  src={media.url}
  alt={
    media.altText ??
    article.title
  }
  loading={
    priority
      ? 'eager'
      : 'lazy'
  }
  fetchPriority={
    priority
      ? 'high'
      : 'auto'
  }
  fit="contain"
  position="center"
  containerClassName="
    bg-[#dfe8ef]
  "
  imageClassName="
    transition
    duration-500
    group-hover:scale-[1.015]
  "
/>
    ) : media?.mediaType ===
      'VIDEO' ? (
      <>
        <video
          src={media.url}
          muted
          playsInline
          preload="metadata"
          className="
            h-full
            w-full
            object-cover
            transition
            duration-500
            group-hover:scale-[1.04]
          "
        />

        <span
          className="
            absolute
            inset-0
            grid
            place-items-center
            bg-slate-950/15
          "
        >
          <span
            className="
              grid
              size-14
              place-items-center
              rounded-full
              bg-white/95
              text-[#07355d]
              shadow-xl
            "
          >
            <Play
              size={22}
              fill="currentColor"
            />
          </span>
        </span>
      </>
    ) : null}

    <span
      className="
        absolute
        left-4
        top-4
        rounded-full
        bg-white/95
        px-3
        py-1.5
        text-[0.68rem]
        font-extrabold
        uppercase
        tracking-[0.12em]
        text-[#07355d]
        shadow-sm
        backdrop-blur
      "
    >
      {
        newsContentTypeLabels[
          article.contentType
        ]
      }
    </span>

    {article.eventPeriod && (
      <span
        className="
          absolute
          bottom-4
          left-4
          rounded-full
          bg-[#c96f4a]
          px-3
          py-1.5
          text-[0.68rem]
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
  </Link>
)}

<div
  className={`
    flex
    flex-1
    flex-col
    p-5
    sm:p-6
    ${
      !hasMedia
        ? `
          border-t-4
          border-[#0f5f9f]
          bg-gradient-to-br
          from-white
          to-[#f5f9fc]
        `
        : ''
    }
  `}
>
  {!hasMedia && (
    <div
      className="
        mb-5
        flex
        flex-wrap
        items-center
        gap-2
      "
    >
      <span
        className="
          inline-flex
          rounded-full
          bg-[#e8f2fa]
          px-3
          py-1.5
          text-[0.68rem]
          font-extrabold
          uppercase
          tracking-[0.12em]
          text-[#07355d]
        "
      >
        {
          newsContentTypeLabels[
            article.contentType
          ]
        }
      </span>

      {article.eventPeriod && (
        <span
          className="
            inline-flex
            rounded-full
            bg-[#c96f4a]
            px-3
            py-1.5
            text-[0.68rem]
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
  )}

  <div
    className="
      space-y-2
      text-xs
      font-semibold
      text-[#536273]
    "
  >
          {article.contentType ===
            'EVENT' &&
          eventDate ? (
            <p
              className="
                flex
                items-start
                gap-2
              "
            >
              <CalendarDays
                size={15}
                className="
                  mt-0.5
                  shrink-0
                  text-[#0f5f9f]
                "
              />

              <span>
                {eventDate}
              </span>
            </p>
          ) : publicationDate ? (
            <p
              className="
                flex
                items-center
                gap-2
              "
            >
              <Clock3
                size={15}
                className="
                  shrink-0
                  text-[#0f5f9f]
                "
              />

              {publicationDate}
            </p>
          ) : null}

          {article.eventLocation && (
            <p
              className="
                flex
                items-start
                gap-2
              "
            >
              <MapPin
                size={15}
                className="
                  mt-0.5
                  shrink-0
                  text-[#c96f4a]
                "
              />

              <span>
                {
                  article.eventLocation
                }
              </span>
            </p>
          )}
        </div>

        <h2
          className="
            mt-4
            text-xl
            font-extrabold
            leading-[1.25]
            tracking-[-0.025em]
            text-[#101820]
            sm:text-[1.35rem]
          "
        >
          <Link
            href={`/actualites/${article.slug}`}
            className="
              transition
              hover:text-[#0f5f9f]
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-[#0f5f9f]
              focus-visible:ring-offset-4
            "
          >
            {article.title}
          </Link>
        </h2>

        {article.excerpt && (
          <p
            className="
              mt-3
              line-clamp-3
              text-sm
              leading-7
              text-[#536273]
            "
          >
            {article.excerpt}
          </p>
        )}

        <div
          className="
            mt-auto
            pt-6
          "
        >
          <Link
            href={`/actualites/${article.slug}`}
            className="
              inline-flex
              items-center
              gap-2
              text-sm
              font-extrabold
              text-[#07355d]
              transition
              hover:gap-3
              hover:text-[#c96f4a]
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-[#0f5f9f]
              focus-visible:ring-offset-4
            "
          >
            Lire la publication

            <ArrowRight
              size={16}
            />
          </Link>
        </div>
      </div>
    </article>
  );
}