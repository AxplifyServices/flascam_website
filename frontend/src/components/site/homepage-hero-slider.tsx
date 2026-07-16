'use client';

import {
  useEffect,
  useState,
} from 'react';

import {
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

import type {
  HomepageHeroSlide,
} from '@/types/homepage-hero';

type HomepageHeroSliderProps = {
  slides: HomepageHeroSlide[];
};

const fallbackSlide: HomepageHeroSlide = {
  id: 'fallback-membre-association',
  mediaAssetId: '',
  imageUrl: '/membre_asso.jpg',
  title: null,
  altText:
    'Membres et représentants de la FLASCAM réunis lors d’un événement professionnel',
  displayOrder: 0,
  isPublished: true,
  desktopPositionX: 50,
  desktopPositionY: 50,
  mobilePositionX: 50,
  mobilePositionY: 50,
};

export function HomepageHeroSlider({
  slides,
}: HomepageHeroSliderProps) {
  const availableSlides =
    slides.length > 0
      ? slides
      : [fallbackSlide];

  const [
    activeIndex,
    setActiveIndex,
  ] = useState(0);

  useEffect(() => {
    if (
      availableSlides.length <= 1
    ) {
      return;
    }

    const timer =
      window.setInterval(() => {
        setActiveIndex(
          (current) =>
            (
              current + 1
            ) %
            availableSlides.length,
        );
      }, 7000);

    return () => {
      window.clearInterval(timer);
    };
  }, [
    availableSlides.length,
  ]);

  useEffect(() => {
    if (
      activeIndex >=
      availableSlides.length
    ) {
      setActiveIndex(0);
    }
  }, [
    activeIndex,
    availableSlides.length,
  ]);

  function previous() {
    setActiveIndex(
      (current) =>
        (
          current -
          1 +
          availableSlides.length
        ) %
        availableSlides.length,
    );
  }

  function next() {
    setActiveIndex(
      (current) =>
        (
          current + 1
        ) %
        availableSlides.length,
    );
  }

  return (
    <div
      className="
        relative
        h-full
        min-h-[320px]
        overflow-hidden
        bg-[#e9f0f5]
        sm:min-h-[430px]
        lg:min-h-[610px]
      "
    >
      {availableSlides.map(
        (
          slide,
          index,
        ) => (
          <div
            key={slide.id}
            aria-hidden={
              index !==
              activeIndex
            }
            className={`
              absolute
              inset-0
              overflow-hidden
              transition
              duration-700
              ease-out
              ${
                index ===
                activeIndex
                  ? `
                    scale-100
                    opacity-100
                  `
                  : `
                    pointer-events-none
                    scale-[1.015]
                    opacity-0
                  `
              }
            `}
          >
            <picture>
              <source
                media="(max-width: 639px)"
                srcSet={
                  slide.imageUrl
                }
              />

              <img
                src={
                  slide.imageUrl
                }
                alt={
                  slide.altText
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
                style={{
                  '--hero-position-mobile':
                    `${slide.mobilePositionX}% ${slide.mobilePositionY}%`,
                  '--hero-position-desktop':
                    `${slide.desktopPositionX}% ${slide.desktopPositionY}%`,
                } as React.CSSProperties}
                className="
                  homepage-hero-image
                  absolute
                  inset-0
                  size-full
                  object-cover
                "
              />
            </picture>

            <div
              aria-hidden="true"
              className="
                pointer-events-none
                absolute
                inset-0
                bg-gradient-to-t
                from-[#07355d]/35
                via-transparent
                to-transparent
              "
            />
          </div>
        ),
      )}

      {availableSlides.length >
        1 && (
        <>
          <button
            type="button"
            onClick={previous}
            aria-label="Afficher l’image précédente"
            className="
              absolute
              bottom-5
              right-16
              z-10
              grid
              size-10
              place-items-center
              rounded-full
              border
              border-white/60
              bg-[#07355d]/70
              text-white
              backdrop-blur-sm
              transition
              hover:bg-[#07355d]
              focus-visible:outline-none
              focus-visible:ring-4
              focus-visible:ring-white/40
            "
          >
            <ChevronLeft
              size={20}
              aria-hidden="true"
            />
          </button>

          <button
            type="button"
            onClick={next}
            aria-label="Afficher l’image suivante"
            className="
              absolute
              bottom-5
              right-5
              z-10
              grid
              size-10
              place-items-center
              rounded-full
              border
              border-white/60
              bg-[#07355d]/70
              text-white
              backdrop-blur-sm
              transition
              hover:bg-[#07355d]
              focus-visible:outline-none
              focus-visible:ring-4
              focus-visible:ring-white/40
            "
          >
            <ChevronRight
              size={20}
              aria-hidden="true"
            />
          </button>

          <div
            className="
              absolute
              bottom-5
              left-5
              z-10
              flex
              items-center
              gap-2
            "
          >
            {availableSlides.map(
              (
                slide,
                index,
              ) => (
                <button
                  key={
                    slide.id
                  }
                  type="button"
                  onClick={() =>
                    setActiveIndex(
                      index,
                    )
                  }
                  aria-label={`Afficher l’image ${index + 1}`}
                  aria-current={
                    index ===
                    activeIndex
                      ? 'true'
                      : undefined
                  }
                  className={`
                    h-2.5
                    rounded-full
                    border
                    border-white/70
                    transition-all
                    ${
                      index ===
                      activeIndex
                        ? `
                          w-8
                          bg-white
                        `
                        : `
                          w-2.5
                          bg-white/40
                          hover:bg-white/70
                        `
                    }
                  `}
                />
              ),
            )}
          </div>
        </>
      )}
    </div>
  );
}