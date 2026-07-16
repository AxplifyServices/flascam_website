'use client';

import {
  useEffect,
  useState,
} from 'react';

import {
  ChevronLeft,
  ChevronRight,
  Expand,
  PlayCircle,
  X,
} from 'lucide-react';

import type {
  NewsMedia,
} from '@/types/news';

import {
  AdaptiveImage,
} from '@/components/site/adaptive-image';

type NewsMediaGalleryProps = {
  media: NewsMedia[];
  articleTitle: string;
};

export function NewsMediaGallery({
  media,
  articleTitle,
}: NewsMediaGalleryProps) {
  const imageMedia =
    media.filter(
      (item) =>
        item.mediaType ===
        'IMAGE',
    );

  const [
    activeImageId,
    setActiveImageId,
  ] = useState<
    string | null
  >(null);

  const activeImageIndex =
    activeImageId
      ? imageMedia.findIndex(
          (item) =>
            item.id ===
            activeImageId,
        )
      : -1;

  const activeImage =
    activeImageIndex >= 0
      ? imageMedia[
          activeImageIndex
        ]
      : null;

  const closeLightbox = () => {
    setActiveImageId(null);
  };

  const showPreviousImage =
    () => {
      if (
        imageMedia.length <= 1 ||
        activeImageIndex < 0
      ) {
        return;
      }

      const previousIndex =
        activeImageIndex === 0
          ? imageMedia.length -
            1
          : activeImageIndex -
            1;

      setActiveImageId(
        imageMedia[
          previousIndex
        ].id,
      );
    };

  const showNextImage =
    () => {
      if (
        imageMedia.length <= 1 ||
        activeImageIndex < 0
      ) {
        return;
      }

      const nextIndex =
        activeImageIndex ===
        imageMedia.length - 1
          ? 0
          : activeImageIndex +
            1;

      setActiveImageId(
        imageMedia[
          nextIndex
        ].id,
      );
    };

  useEffect(() => {
    if (!activeImage) {
      return;
    }

    const previousOverflow =
      document.body.style
        .overflow;

    document.body.style.overflow =
      'hidden';

    const handleKeyDown = (
      event: KeyboardEvent,
    ) => {
      if (
        event.key ===
        'Escape'
      ) {
        closeLightbox();
      }

      if (
        event.key ===
        'ArrowLeft'
      ) {
        showPreviousImage();
      }

      if (
        event.key ===
        'ArrowRight'
      ) {
        showNextImage();
      }
    };

    window.addEventListener(
      'keydown',
      handleKeyDown,
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      window.removeEventListener(
        'keydown',
        handleKeyDown,
      );
    };
  }, [
    activeImage,
    activeImageIndex,
  ]);

  return (
    <>
      <section
        className="
          grid
          gap-5
          lg:grid-cols-2
        "
        aria-label="Médias de la publication"
      >
        {media.map(
          (
            item,
            index,
          ) => (
            <figure
              key={item.id}
              className={`
                overflow-hidden
                rounded-[1.25rem]
                border
                border-[#dbe5ef]
                bg-[#f5f9fc]
                ${
                  index === 0
                    ? 'lg:col-span-2'
                    : ''
                }
              `}
            >
              {item.mediaType ===
              'IMAGE' ? (
                <button
                  type="button"
                  onClick={() =>
                    setActiveImageId(
                      item.id,
                    )
                  }
                  className="
                    group/image
                    relative
                    block
                    w-full
                    cursor-zoom-in
                    overflow-hidden
                    text-left
                    focus-visible:outline-none
                    focus-visible:ring-4
                    focus-visible:ring-[#0f5f9f]
                    focus-visible:ring-inset
                  "
                  aria-label={`Agrandir l’image ${
                    item.altText ??
                    articleTitle
                  }`}
                >
<div
  className={`
    w-full
    ${
      index === 0
        ? `
          h-[clamp(17rem,65vw,42rem)]
        `
        : `
          aspect-video
        `
    }
  `}
>
  <AdaptiveImage
    src={item.url}
    alt={
      item.altText ??
      articleTitle
    }
    loading={
      index === 0
        ? 'eager'
        : 'lazy'
    }
    fetchPriority={
      index === 0
        ? 'high'
        : 'auto'
    }
    imageClassName="
      p-2
      transition
      duration-500
      group-hover/image:scale-[1.015]
      sm:p-4
    "
  />
</div>

                  <span
                    className="
                      absolute
                      bottom-4
                      right-4
                      inline-flex
                      items-center
                      gap-2
                      rounded-full
                      bg-[#07355d]/90
                      px-4
                      py-2
                      text-xs
                      font-extrabold
                      text-white
                      opacity-100
                      shadow-lg
                      backdrop-blur
                      transition
                      sm:opacity-0
                      sm:group-hover/image:opacity-100
                      sm:group-focus-visible/image:opacity-100
                    "
                  >
                    <Expand
                      size={16}
                    />

                    Agrandir
                  </span>
                </button>
              ) : (
                <div
                  className="
                    relative
                    bg-slate-950
                  "
                >
                  <video
                    src={item.url}
                    controls
                    playsInline
                    preload="metadata"
                    className="
                      aspect-video
                      w-full
                      bg-slate-950
                      object-contain
                    "
                  />

                  <span
                    className="sr-only"
                  >
                    <PlayCircle />

                    Vidéo
                  </span>
                </div>
              )}

              {item.caption && (
                <figcaption
                  className="
                    px-4
                    py-3
                    text-sm
                    leading-6
                    text-[#536273]
                  "
                >
                  {item.caption}
                </figcaption>
              )}
            </figure>
          ),
        )}
      </section>

      {activeImage && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Aperçu agrandi de l’image"
          className="
            fixed
            inset-0
            z-[100]
            flex
            items-center
            justify-center
            bg-slate-950/95
            p-3
            sm:p-6
          "
          onMouseDown={(
            event,
          ) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeLightbox();
            }
          }}
        >
          <button
            type="button"
            onClick={
              closeLightbox
            }
            className="
              absolute
              right-3
              top-3
              z-20
              grid
              size-11
              place-items-center
              rounded-full
              bg-white
              text-[#07355d]
              shadow-xl
              transition
              hover:bg-[#c96f4a]
              hover:text-white
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-white
              focus-visible:ring-offset-2
              focus-visible:ring-offset-slate-950
              sm:right-6
              sm:top-6
            "
            aria-label="Fermer l’image agrandie"
          >
            <X size={22} />
          </button>

          {imageMedia.length >
            1 && (
            <>
              <button
                type="button"
                onClick={
                  showPreviousImage
                }
                className="
                  absolute
                  left-2
                  top-1/2
                  z-20
                  grid
                  size-11
                  -translate-y-1/2
                  place-items-center
                  rounded-full
                  bg-white
                  text-[#07355d]
                  shadow-xl
                  transition
                  hover:bg-[#c96f4a]
                  hover:text-white
                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-white
                  sm:left-6
                  sm:size-12
                "
                aria-label="Afficher l’image précédente"
              >
                <ChevronLeft
                  size={26}
                />
              </button>

              <button
                type="button"
                onClick={
                  showNextImage
                }
                className="
                  absolute
                  right-2
                  top-1/2
                  z-20
                  grid
                  size-11
                  -translate-y-1/2
                  place-items-center
                  rounded-full
                  bg-white
                  text-[#07355d]
                  shadow-xl
                  transition
                  hover:bg-[#c96f4a]
                  hover:text-white
                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-white
                  sm:right-6
                  sm:size-12
                "
                aria-label="Afficher l’image suivante"
              >
                <ChevronRight
                  size={26}
                />
              </button>
            </>
          )}

          <figure
            className="
              flex
              max-h-[92vh]
              max-w-[94vw]
              flex-col
              items-center
            "
          >
            <img
              src={
                activeImage.url
              }
              alt={
                activeImage.altText ??
                articleTitle
              }
              className="
                max-h-[82vh]
                max-w-full
                rounded-lg
                object-contain
                shadow-2xl
              "
            />

            {activeImage.caption && (
              <figcaption
                className="
                  mt-3
                  max-w-3xl
                  rounded-lg
                  bg-black/45
                  px-4
                  py-2
                  text-center
                  text-sm
                  leading-6
                  text-white
                "
              >
                {
                  activeImage.caption
                }
              </figcaption>
            )}

            {imageMedia.length >
              1 && (
              <p
                className="
                  mt-3
                  text-xs
                  font-bold
                  text-white/75
                "
              >
                {activeImageIndex +
                  1}{' '}
                /{' '}
                {
                  imageMedia.length
                }
              </p>
            )}
          </figure>
        </div>
      )}
    </>
  );
}