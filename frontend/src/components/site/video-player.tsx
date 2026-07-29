'use client';

import {
  useState,
} from 'react';

import {
  Play,
} from 'lucide-react';

import type {
  VideoItem,
} from '@/types/videos';

type VideoPlayerProps = {
  video: VideoItem;
  className?: string;
  autoplay?: boolean;
};

export function VideoPlayer({
  video,
  className = '',
  autoplay = false,
}: VideoPlayerProps) {
  const [
    youtubePlayerLoaded,
    setYoutubePlayerLoaded,
  ] =
    useState(
      autoplay,
    );

  if (
    video.provider ===
    'YOUTUBE'
  ) {
    if (
      !video.youtubeEmbedUrl
    ) {
      return (
        <div
          className={`
            grid
            aspect-video
            place-items-center
            bg-[#07355d]
            px-6
            text-center
            text-sm
            text-white/75
            ${className}
          `}
        >
          Cette vidéo YouTube ne peut pas être chargée.
        </div>
      );
    }

    if (
      !youtubePlayerLoaded
    ) {
      return (
        <button
          type="button"
          onClick={() =>
            setYoutubePlayerLoaded(
              true,
            )
          }
          className={`
            group
            relative
            block
            aspect-video
            w-full
            overflow-hidden
            bg-[#07355d]
            text-left
            ${className}
          `}
          aria-label={`Lire la vidéo : ${video.title}`}
        >
          {video.thumbnail?.url ? (
            <img
              src={
                video.thumbnail.url
              }
              alt={
                video.thumbnail.altText ||
                video.title
              }
              className="
                h-full
                w-full
                object-cover
                transition
                duration-500
                group-hover:scale-[1.03]
              "
              loading="lazy"
            />
          ) : (
            <span
              className="
                absolute
                inset-0
                bg-gradient-to-br
                from-[#07355d]
                to-[#0f5f9f]
              "
            />
          )}

          <span
            className="
              absolute
              inset-0
              bg-slate-950/25
              transition
              group-hover:bg-slate-950/35
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
                size-16
                place-items-center
                rounded-full
                bg-white
                text-[#07355d]
                shadow-2xl
                transition
                duration-300
                group-hover:scale-110
              "
            >
              <Play
                size={25}
                fill="currentColor"
                aria-hidden="true"
              />
            </span>
          </span>
        </button>
      );
    }

    const separator =
      video.youtubeEmbedUrl.includes(
        '?',
      )
        ? '&'
        : '?';

    return (
      <iframe
        src={`${video.youtubeEmbedUrl}${separator}autoplay=1&rel=0&modestbranding=1`}
        title={video.title}
        loading="lazy"
        allow="
          accelerometer;
          autoplay;
          clipboard-write;
          encrypted-media;
          gyroscope;
          picture-in-picture;
          web-share
        "
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
        className={`
          aspect-video
          w-full
          border-0
          bg-[#07355d]
          ${className}
        `}
      />
    );
  }

  if (
    video.provider ===
      'UPLOADED' &&
    video.media?.url
  ) {
    return (
      <video
        controls
        playsInline
        preload="metadata"
        poster={
          video.thumbnail?.url ||
          undefined
        }
        className={`
          aspect-video
          w-full
          bg-[#07355d]
          object-contain
          ${className}
        `}
      >
        <source
          src={video.media.url}
          type={video.media.mimeType}
        />

        Votre navigateur ne prend pas en charge la lecture vidéo.
      </video>
    );
  }

  return (
    <div
      className={`
        grid
        aspect-video
        place-items-center
        bg-[#07355d]
        px-6
        text-center
        text-sm
        text-white/75
        ${className}
      `}
    >
      La source de cette vidéo est indisponible.
    </div>
  );
}