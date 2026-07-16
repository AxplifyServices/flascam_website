'use client';

import {
  useEffect,
  useRef,
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

type ImageDimensions = {
  width: number;
  height: number;
};

type ContainerDimensions = {
  width: number;
  height: number;
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
};

const DIMENSION_TOLERANCE = 0.03;

export function HomepageHeroSlider({
  slides,
}: HomepageHeroSliderProps) {
  const availableSlides =
    slides.length > 0
      ? slides
      : [fallbackSlide];

  const containerRef =
    useRef<HTMLDivElement | null>(
      null,
    );

  const [
    activeIndex,
    setActiveIndex,
  ] = useState(0);

  const [
    containerDimensions,
    setContainerDimensions,
  ] =
    useState<ContainerDimensions>({
      width: 0,
      height: 0,
    });

  const [
    imageDimensions,
    setImageDimensions,
  ] = useState<
    Record<
      string,
      ImageDimensions
    >
  >({});

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
    const container =
      containerRef.current;

    if (!container) {
      return;
    }

    function updateContainerDimensions() {
      const rect =
        container.getBoundingClientRect();

      setContainerDimensions({
        width:
          Math.round(rect.width),
        height:
          Math.round(rect.height),
      });
    }

    updateContainerDimensions();

    const resizeObserver =
      new ResizeObserver(
        updateContainerDimensions,
      );

    resizeObserver.observe(
      container,
    );

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

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

  function saveImageDimensions(
    slideId: string,
    image: HTMLImageElement,
  ) {
    const width =
      image.naturalWidth;

    const height =
      image.naturalHeight;

    if (
      width <= 0 ||
      height <= 0
    ) {
      return;
    }

    setImageDimensions(
      (current) => {
        const existing =
          current[slideId];

        if (
          existing?.width ===
            width &&
          existing?.height ===
            height
        ) {
          return current;
        }

        return {
          ...current,
          [slideId]: {
            width,
            height,
          },
        };
      },
    );
  }

  function calculateRenderedSize(
    slideId: string,
  ) {
    const sourceDimensions =
      imageDimensions[slideId];

    if (
      !sourceDimensions ||
      containerDimensions.width <=
        0 ||
      containerDimensions.height <=
        0
    ) {
      return {
        width: '100%',
        height: '100%',
      };
    }

    const widthRatio =
      containerDimensions.width /
      sourceDimensions.width;

    const heightRatio =
      containerDimensions.height /
      sourceDimensions.height;

    const calculatedScale =
      Math.min(
        widthRatio,
        heightRatio,
      );

    const isAlreadyWithinTolerance =
      Math.abs(
        calculatedScale - 1,
      ) <= DIMENSION_TOLERANCE;

    const finalScale =
      isAlreadyWithinTolerance
        ? 1
        : calculatedScale;

    return {
      width: `${Math.round(
        sourceDimensions.width *
          finalScale,
      )}px`,
      height: `${Math.round(
        sourceDimensions.height *
          finalScale,
      )}px`,
    };
  }

  return (
    <div
      ref={containerRef}
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
        ) => {
          const renderedSize =
            calculateRenderedSize(
              slide.id,
            );

          return (
            <div
              key={slide.id}
              aria-hidden={
                index !==
                activeIndex
              }
              className={`
                absolute
                inset-0
                flex
                items-center
                justify-center
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
                onLoad={(
                  event,
                ) => {
                  saveImageDimensions(
                    slide.id,
                    event.currentTarget,
                  );
                }}
                style={{
                  width:
                    renderedSize.width,
                  height:
                    renderedSize.height,
                  maxWidth: 'none',
                  maxHeight:
                    'none',
                }}
                className="
                  block
                  flex-none
                  object-contain
                  transition-[width,height]
                  duration-300
                  ease-out
                "
              />

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
          );
        },
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
              bottom-6
              left-6
              z-10
              flex
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
                    h-1.5
                    rounded-full
                    transition-all
                    ${
                      index ===
                      activeIndex
                        ? `
                          w-8
                          bg-white
                        `
                        : `
                          w-3
                          bg-white/50
                          hover:bg-white/80
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