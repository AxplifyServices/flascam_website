'use client';

import {
  useMemo,
  useState,
} from 'react';

import {
  ChevronLeft,
  ChevronRight,
  Expand,
  Images,
  Play,
  X,
} from 'lucide-react';

import type {
  PublicMarketplaceMedia,
} from '@/types/marketplace';

type MarketplaceMediaGalleryProps = {
  title: string;

  media:
    PublicMarketplaceMedia[];
};

export function MarketplaceMediaGallery({
  title,
  media,
}: MarketplaceMediaGalleryProps) {
  const orderedMedia =
    useMemo(
      () =>
        [...media].sort(
          (
            first,
            second,
          ) =>
            first.displayOrder -
            second.displayOrder,
        ),
      [
        media,
      ],
    );

  const [
    activeIndex,
    setActiveIndex,
  ] = useState(
    0,
  );

  const [
    fullscreenOpen,
    setFullscreenOpen,
  ] = useState(
    false,
  );

  const activeMedia =
    orderedMedia[
      activeIndex
    ];

  function showPrevious() {
    setActiveIndex(
      (
        current,
      ) =>
        current ===
        0
          ? orderedMedia.length -
            1
          : current -
            1,
    );
  }

  function showNext() {
    setActiveIndex(
      (
        current,
      ) =>
        current ===
        orderedMedia.length -
          1
          ? 0
          : current +
            1,
    );
  }

  if (
    orderedMedia.length ===
    0
  ) {
    return (
      <div
        className="
          grid
          aspect-[16/10]
          place-items-center
          rounded-[30px]
          bg-slate-100
          text-slate-400
        "
      >
        <div className="text-center">
          <Images
            size={48}
            className="mx-auto"
          />

          <p
            className="
              mt-3
              text-sm
              font-bold
            "
          >
            Aucun média disponible
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className="
          overflow-hidden
          rounded-[30px]
          border
          border-slate-200
          bg-white
          shadow-[0_22px_65px_rgba(7,53,93,0.09)]
        "
      >
        <div
          className="
            group
            relative
            aspect-[16/10]
            overflow-hidden
            bg-slate-950
          "
        >
          {activeMedia.mediaKind ===
          'IMAGE' ? (
            <img
              src={
                activeMedia.url
              }
              alt={
                activeMedia.altText ||
                title
              }
              className="
                h-full
                w-full
                object-contain
              "
            />
          ) : (
            <video
              src={
                activeMedia.url
              }
              controls
              preload="metadata"
              className="
                h-full
                w-full
                object-contain
              "
            />
          )}

          {orderedMedia.length >
            1 && (
            <>
              <button
                type="button"
                onClick={
                  showPrevious
                }
                aria-label="Média précédent"
                className="
                  absolute
                  left-3
                  top-1/2
                  grid
                  size-11
                  -translate-y-1/2
                  place-items-center
                  rounded-full
                  bg-slate-950/65
                  text-white
                  backdrop-blur
                  transition
                  hover:bg-slate-950/85
                "
              >
                <ChevronLeft
                  size={22}
                />
              </button>

              <button
                type="button"
                onClick={
                  showNext
                }
                aria-label="Média suivant"
                className="
                  absolute
                  right-3
                  top-1/2
                  grid
                  size-11
                  -translate-y-1/2
                  place-items-center
                  rounded-full
                  bg-slate-950/65
                  text-white
                  backdrop-blur
                  transition
                  hover:bg-slate-950/85
                "
              >
                <ChevronRight
                  size={22}
                />
              </button>
            </>
          )}

          {activeMedia.mediaKind ===
            'IMAGE' && (
            <button
              type="button"
              onClick={() =>
                setFullscreenOpen(
                  true,
                )
              }
              aria-label="Agrandir l’image"
              className="
                absolute
                right-3
                top-3
                grid
                size-11
                place-items-center
                rounded-full
                bg-slate-950/65
                text-white
                backdrop-blur
                transition
                hover:bg-slate-950/85
              "
            >
              <Expand
                size={19}
              />
            </button>
          )}

          <span
            className="
              absolute
              bottom-3
              right-3
              rounded-full
              bg-slate-950/70
              px-3
              py-1.5
              text-xs
              font-black
              text-white
              backdrop-blur
            "
          >
            {activeIndex + 1}
            /
            {
              orderedMedia.length
            }
          </span>
        </div>

        {activeMedia.caption && (
          <p
            className="
              border-t
              border-slate-100
              px-5
              py-3
              text-sm
              leading-6
              text-slate-600
            "
          >
            {
              activeMedia.caption
            }
          </p>
        )}

        {orderedMedia.length >
          1 && (
          <div
            className="
              flex
              gap-3
              overflow-x-auto
              p-4
            "
          >
            {orderedMedia.map(
              (
                item,
                index,
              ) => (
                <button
                  key={
                    item.id
                  }
                  type="button"
                  onClick={() =>
                    setActiveIndex(
                      index,
                    )
                  }
                  aria-label={`Afficher le média ${index + 1}`}
                  className={`
                    relative
                    aspect-[4/3]
                    w-24
                    shrink-0
                    overflow-hidden
                    rounded-xl
                    border-2
                    bg-slate-100
                    transition
                    ${
                      activeIndex ===
                      index
                        ? 'border-[var(--flascam-terracotta)]'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }
                  `}
                >
                  {item.mediaKind ===
                  'IMAGE' ? (
                    <img
                      src={
                        item.url
                      }
                      alt={
                        item.altText ||
                        title
                      }
                      className="
                        h-full
                        w-full
                        object-cover
                      "
                    />
                  ) : (
                    <>
                      <video
                        src={
                          item.url
                        }
                        preload="metadata"
                        muted
                        className="
                          h-full
                          w-full
                          object-cover
                        "
                      />

                      <span
                        className="
                          absolute
                          inset-0
                          grid
                          place-items-center
                          bg-slate-950/35
                          text-white
                        "
                      >
                        <Play
                          size={22}
                          fill="currentColor"
                        />
                      </span>
                    </>
                  )}
                </button>
              ),
            )}
          </div>
        )}
      </div>

      {fullscreenOpen &&
        activeMedia.mediaKind ===
          'IMAGE' && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Image agrandie du véhicule"
            className="
              fixed
              inset-0
              z-[200]
              grid
              place-items-center
              bg-slate-950/95
              p-4
            "
          >
            <button
              type="button"
              onClick={() =>
                setFullscreenOpen(
                  false,
                )
              }
              aria-label="Fermer l’image"
              className="
                absolute
                right-4
                top-4
                grid
                size-12
                place-items-center
                rounded-full
                bg-white/10
                text-white
                transition
                hover:bg-white/20
              "
            >
              <X
                size={24}
              />
            </button>

            <img
              src={
                activeMedia.url
              }
              alt={
                activeMedia.altText ||
                title
              }
              className="
                max-h-[90vh]
                max-w-full
                object-contain
              "
            />
          </div>
        )}
    </>
  );
}