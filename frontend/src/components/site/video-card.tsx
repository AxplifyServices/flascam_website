import Link from 'next/link';

import {
  CalendarDays,
  Play,
} from 'lucide-react';

import type {
  VideoItem,
} from '@/types/videos';

type VideoCardProps = {
  video: VideoItem;
  priority?: boolean;
};

function formatVideoDate(
  value?: string | null,
) {
  if (!value) {
    return null;
  }

  const date =
    new Date(value);

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

function formatDuration(
  durationSeconds?: number | null,
) {
  if (
    !durationSeconds ||
    durationSeconds <= 0
  ) {
    return null;
  }

  const totalSeconds =
    Math.round(
      durationSeconds,
    );

  const hours =
    Math.floor(
      totalSeconds /
        3_600,
    );

  const minutes =
    Math.floor(
      (
        totalSeconds %
        3_600
      ) /
        60,
    );

  const seconds =
    totalSeconds %
    60;

  if (
    hours >
    0
  ) {
    return [
      hours,
      String(
        minutes,
      ).padStart(
        2,
        '0',
      ),
      String(
        seconds,
      ).padStart(
        2,
        '0',
      ),
    ].join(':');
  }

  return [
    minutes,
    String(
      seconds,
    ).padStart(
      2,
      '0',
    ),
  ].join(':');
}

export function VideoCard({
  video,
  priority = false,
}: VideoCardProps) {
  const publicationDate =
    formatVideoDate(
      video.publishedAt,
    );

  const duration =
    formatDuration(
      video.durationSeconds,
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
      <Link
        href={`/videotheque/${video.slug}`}
        className="
          relative
          block
          aspect-video
          overflow-hidden
          bg-gradient-to-br
          from-[#07355d]
          to-[#0f5f9f]
        "
        aria-label={`Regarder ${video.title}`}
      >
        {video.thumbnail?.url ? (
          <img
            src={video.thumbnail.url}
            alt={
              video.thumbnail.altText ||
              video.title
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
            className="
              h-full
              w-full
              object-cover
              transition
              duration-500
              group-hover:scale-[1.04]
            "
          />
        ) : (
          <span
            className="
              absolute
              inset-0
              bg-gradient-to-br
              from-[#07355d]
              via-[#0a487b]
              to-[#0f5f9f]
            "
          />
        )}

        <span
          className="
            absolute
            inset-0
            bg-slate-950/20
            transition
            group-hover:bg-slate-950/30
          "
        />

        <span
          className="
            absolute
            inset-0
            grid
            place-items-center
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
              transition
              duration-300
              group-hover:scale-110
            "
          >
            <Play
              size={22}
              fill="currentColor"
              aria-hidden="true"
            />
          </span>
        </span>

        <span
          className="
            absolute
            left-4
            top-4
            rounded-full
            bg-white/95
            px-3
            py-1.5
            text-[0.66rem]
            font-extrabold
            uppercase
            tracking-[0.12em]
            text-[#07355d]
            shadow-sm
          "
        >
          {video.provider ===
          'YOUTUBE'
            ? 'YouTube'
            : 'Vidéo'}
        </span>

        {duration && (
          <span
            className="
              absolute
              bottom-4
              right-4
              rounded-md
              bg-slate-950/80
              px-2.5
              py-1
              text-xs
              font-bold
              text-white
            "
          >
            {duration}
          </span>
        )}
      </Link>

      <div
        className="
          flex
          flex-1
          flex-col
          p-5
          sm:p-6
        "
      >
        <div
          className="
            flex
            flex-wrap
            items-center
            gap-x-4
            gap-y-2
            text-xs
            font-semibold
            uppercase
            tracking-[0.08em]
            text-[#6b7b8d]
          "
        >
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
            {video.association?.acronym ||
              video.association?.name ||
              'FLASCAM'}
          </span>
        </div>

        <h2
          className="
            mt-4
            text-xl
            font-extrabold
            leading-snug
            text-[#07355d]
          "
        >
          <Link
            href={`/videotheque/${video.slug}`}
            className="
              transition
              hover:text-[#0f5f9f]
            "
          >
            {video.title}
          </Link>
        </h2>

        {video.excerpt && (
          <p
            className="
              mt-3
              line-clamp-3
              text-sm
              leading-7
              text-[#536273]
            "
          >
            {video.excerpt}
          </p>
        )}

        <div className="mt-auto pt-6">
          <Link
            href={`/videotheque/${video.slug}`}
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
            Regarder la vidéo

            <Play
              size={15}
              fill="currentColor"
              aria-hidden="true"
            />
          </Link>
        </div>
      </div>
    </article>
  );
}