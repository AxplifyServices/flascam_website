'use client';

import {
  useEffect,
  useMemo,
  useRef,
} from 'react';

import {
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

import type {
  NewsArticle,
} from '@/types/news';

import {
  NewsCard,
} from './news-card';

type LatestNewsCarouselProps = {
  articles: NewsArticle[];
};

const MAX_NEWS_COUNT = 10;

/**
 * Vitesse normale du carrousel, en pixels par seconde.
 */
const AUTO_SCROLL_SPEED = 50;

/**
 * Multiplicateur appliqué pendant l’utilisation d’une flèche.
 */
const BOOST_SPEED_MULTIPLIER = 4;

/**
 * Durée de l’accélération déclenchée par un simple clic.
 */
const CLICK_BOOST_DURATION = 900;

export function LatestNewsCarousel({
  articles,
}: LatestNewsCarouselProps) {
  const viewportRef =
    useRef<HTMLDivElement | null>(
      null,
    );

  const trackRef =
    useRef<HTMLDivElement | null>(
      null,
    );

  const animationFrameRef =
    useRef<number | null>(
      null,
    );

  const previousTimestampRef =
    useRef<number | null>(
      null,
    );

  /**
   * Position courante de la piste.
   */
  const positionRef =
    useRef(0);

  /**
   * Largeur d’une seule série d’actualités.
   *
   * La piste contient deux séries identiques.
   */
  const singleSeriesWidthRef =
    useRef(0);

  /**
   * 1 :
   * les cartes avancent dans leur sens normal,
   * visuellement vers la gauche.
   *
   * -1 :
   * les cartes repartent temporairement vers la droite.
   */
  const directionRef =
    useRef<1 | -1>(1);

  /**
   * 1 en vitesse normale.
   * 4 pendant une accélération.
   */
  const speedMultiplierRef =
    useRef(1);

const boostTimeoutRef =
  useRef<number | null>(null);

  const visibleArticles =
    useMemo(
      () =>
        articles.slice(
          0,
          MAX_NEWS_COUNT,
        ),
      [articles],
    );

  /**
   * La duplication permet une boucle continue :
   *
   * A B C D | A B C D
   */
  const carouselArticles =
    useMemo(
      () => [
        ...visibleArticles,
        ...visibleArticles,
      ],
      [visibleArticles],
    );

  function clearBoostTimeout() {
    if (
      boostTimeoutRef.current !==
      null
    ) {
      window.clearTimeout(
        boostTimeoutRef.current,
      );

      boostTimeoutRef.current =
        null;
    }
  }

  function startBoost(
    direction: 1 | -1,
  ) {
    clearBoostTimeout();

    directionRef.current =
      direction;

    speedMultiplierRef.current =
      BOOST_SPEED_MULTIPLIER;
  }

  function stopBoost() {
    clearBoostTimeout();

    directionRef.current = 1;
    speedMultiplierRef.current = 1;
  }

  function triggerClickBoost(
    direction: 1 | -1,
  ) {
    startBoost(direction);

    boostTimeoutRef.current =
      window.setTimeout(
        () => {
          stopBoost();
        },
        CLICK_BOOST_DURATION,
      );
  }

  /**
   * Mesure la largeur d’une seule série.
   *
   * Cette valeur reste dans une ref afin de ne pas provoquer
   * de nouveau rendu React et de ne pas redémarrer l’animation.
   */
  useEffect(() => {
    const viewport =
      viewportRef.current;

    const track =
      trackRef.current;

    if (
      !viewport ||
      !track ||
      visibleArticles.length <= 1
    ) {
      return;
    }

    function updateTrackWidth() {
      const currentTrack =
        trackRef.current;

      if (!currentTrack) {
        return;
      }

      const measuredWidth =
        currentTrack.scrollWidth /
        2;

      if (
        Number.isFinite(
          measuredWidth,
        ) &&
        measuredWidth > 0
      ) {
        singleSeriesWidthRef.current =
          measuredWidth;

        /**
         * Après un redimensionnement, on s’assure que
         * la position reste comprise dans la boucle.
         */
        positionRef.current =
          positionRef.current %
          measuredWidth;
      }
    }

    updateTrackWidth();

    const resizeObserver =
      new ResizeObserver(() => {
        updateTrackWidth();
      });

    /**
     * On observe le viewport uniquement.
     *
     * On ne surveille pas la piste animée afin que son
     * déplacement ne déclenche jamais de nouvelle mesure.
     */
    resizeObserver.observe(
      viewport,
    );

    window.addEventListener(
      'load',
      updateTrackWidth,
    );

    return () => {
      resizeObserver.disconnect();

      window.removeEventListener(
        'load',
        updateTrackWidth,
      );
    };
  }, [
    visibleArticles.length,
  ]);

  /**
   * Boucle d’animation principale.
   *
   * Cet effet ne dépend pas de la largeur mesurée.
   * Il est donc lancé une seule fois pour la liste courante.
   */
  useEffect(() => {
    if (
      visibleArticles.length <= 1
    ) {
      return;
    }

    function animate(
      timestamp: number,
    ) {
      const currentTrack =
        trackRef.current;

      const singleSeriesWidth =
        singleSeriesWidthRef.current;

      if (!currentTrack) {
        animationFrameRef.current =
          window.requestAnimationFrame(
            animate,
          );

        return;
      }

      if (
        previousTimestampRef.current ===
        null
      ) {
        previousTimestampRef.current =
          timestamp;
      }

      const elapsedMilliseconds =
        Math.min(
          timestamp -
            previousTimestampRef.current,
          50,
        );

      previousTimestampRef.current =
        timestamp;

      const elapsedSeconds =
        elapsedMilliseconds /
        1000;

      /**
       * Tant que la largeur n’est pas encore mesurée,
       * la boucle reste active et attend la mesure suivante.
       */
      if (
        singleSeriesWidth > 0
      ) {
        positionRef.current +=
          AUTO_SCROLL_SPEED *
          speedMultiplierRef.current *
          directionRef.current *
          elapsedSeconds;

        /**
         * Boucle vers l’avant.
         */
        while (
          positionRef.current >=
          singleSeriesWidth
        ) {
          positionRef.current -=
            singleSeriesWidth;
        }

        /**
         * Boucle vers l’arrière.
         */
        while (
          positionRef.current < 0
        ) {
          positionRef.current +=
            singleSeriesWidth;
        }

        currentTrack.style.transform =
          `translate3d(-${positionRef.current}px, 0, 0)`;
      }

      animationFrameRef.current =
        window.requestAnimationFrame(
          animate,
        );
    }

    animationFrameRef.current =
      window.requestAnimationFrame(
        animate,
      );

    return () => {
      if (
        animationFrameRef.current !==
        null
      ) {
        window.cancelAnimationFrame(
          animationFrameRef.current,
        );
      }

      clearBoostTimeout();

      animationFrameRef.current =
        null;

      previousTimestampRef.current =
        null;

      positionRef.current = 0;

      directionRef.current = 1;

      speedMultiplierRef.current = 1;

      const currentTrack =
        trackRef.current;

      if (currentTrack) {
        currentTrack.style.transform =
          'translate3d(0, 0, 0)';
      }
    };
  }, [
    visibleArticles.length,
  ]);

  if (
    visibleArticles.length === 0
  ) {
    return null;
  }

  if (
    visibleArticles.length === 1
  ) {
    return (
      <div
        className="
          mt-10
          max-w-md
        "
      >
        <div
          className="
            h-[580px]
            sm:h-[600px]
          "
        >
          <NewsCard
            article={
              visibleArticles[0]
            }
            priority
            compact
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className="
        relative
        mt-10
        overflow-hidden
      "
      aria-label="Défilement des dernières actualités de la FLASCAM"
    >
      {/* Flèche gauche */}
      <button
        type="button"
        className="
          absolute
          left-2
          top-1/2
          z-30
          inline-flex
          size-12
          -translate-y-1/2
          touch-none
          select-none
          items-center
          justify-center
          rounded-full
          border
          border-white/80
          bg-[#07355d]/90
          text-white
          shadow-[0_10px_28px_rgba(7,53,93,0.28)]
          backdrop-blur-sm
          transition
          duration-200
          hover:scale-105
          hover:bg-[#c96f4a]
          active:scale-95
          focus-visible:outline-none
          focus-visible:ring-4
          focus-visible:ring-[#c96f4a]/30
          sm:left-3
          lg:left-4
        "
        aria-label="Accélérer le défilement vers la gauche"
        title="Accélérer vers la gauche"
        onPointerDown={(
          event,
        ) => {
          event.currentTarget.setPointerCapture(
            event.pointerId,
          );

          startBoost(-1);
        }}
        onPointerUp={(
          event,
        ) => {
          if (
            event.currentTarget.hasPointerCapture(
              event.pointerId,
            )
          ) {
            event.currentTarget.releasePointerCapture(
              event.pointerId,
            );
          }

          stopBoost();
        }}
        onPointerCancel={() => {
          stopBoost();
        }}
        onClick={() => {
          triggerClickBoost(-1);
        }}
        onKeyDown={(
          event,
        ) => {
          if (
            event.repeat
          ) {
            return;
          }

          if (
            event.key ===
              'Enter' ||
            event.key === ' '
          ) {
            startBoost(-1);
          }
        }}
        onKeyUp={(
          event,
        ) => {
          if (
            event.key ===
              'Enter' ||
            event.key === ' '
          ) {
            stopBoost();
          }
        }}
      >
        <ChevronLeft
          size={26}
          strokeWidth={2.5}
          aria-hidden="true"
        />
      </button>

      {/* Flèche droite */}
      <button
        type="button"
        className="
          absolute
          right-2
          top-1/2
          z-30
          inline-flex
          size-12
          -translate-y-1/2
          touch-none
          select-none
          items-center
          justify-center
          rounded-full
          border
          border-white/80
          bg-[#07355d]/90
          text-white
          shadow-[0_10px_28px_rgba(7,53,93,0.28)]
          backdrop-blur-sm
          transition
          duration-200
          hover:scale-105
          hover:bg-[#c96f4a]
          active:scale-95
          focus-visible:outline-none
          focus-visible:ring-4
          focus-visible:ring-[#c96f4a]/30
          sm:right-3
          lg:right-4
        "
        aria-label="Accélérer le défilement vers la droite"
        title="Accélérer vers la droite"
        onPointerDown={(
          event,
        ) => {
          event.currentTarget.setPointerCapture(
            event.pointerId,
          );

          startBoost(1);
        }}
        onPointerUp={(
          event,
        ) => {
          if (
            event.currentTarget.hasPointerCapture(
              event.pointerId,
            )
          ) {
            event.currentTarget.releasePointerCapture(
              event.pointerId,
            );
          }

          stopBoost();
        }}
        onPointerCancel={() => {
          stopBoost();
        }}
        onClick={() => {
          triggerClickBoost(1);
        }}
        onKeyDown={(
          event,
        ) => {
          if (
            event.repeat
          ) {
            return;
          }

          if (
            event.key ===
              'Enter' ||
            event.key === ' '
          ) {
            startBoost(1);
          }
        }}
        onKeyUp={(
          event,
        ) => {
          if (
            event.key ===
              'Enter' ||
            event.key === ' '
          ) {
            stopBoost();
          }
        }}
      >
        <ChevronRight
          size={26}
          strokeWidth={2.5}
          aria-hidden="true"
        />
      </button>

      {/* Fondu gauche */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-y-0
          left-0
          z-10
          hidden
          w-24
          bg-gradient-to-r
          from-white
          to-transparent
          lg:block
        "
      />

      {/* Fondu droit */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-y-0
          right-0
          z-10
          hidden
          w-24
          bg-gradient-to-l
          from-white
          to-transparent
          lg:block
        "
      />

      <div
        ref={viewportRef}
        className="
          w-full
          overflow-hidden
          pb-4
        "
      >
        <div
          ref={trackRef}
          className="
            flex
            w-max
            gap-5
            will-change-transform
            sm:gap-6
          "
        >
          {carouselArticles.map(
            (
              article,
              index,
            ) => {
              const isDuplicate =
                index >=
                visibleArticles.length;

              return (
                <div
                  key={`${article.id}-${isDuplicate ? 'duplicate' : 'original'}`}
                  aria-hidden={
                    isDuplicate
                      ? 'true'
                      : undefined
                  }
                  className="
                    h-[580px]
                    w-[82vw]
                    max-w-[360px]
                    shrink-0
                    sm:h-[600px]
                    sm:w-[340px]
                    lg:w-[360px]
                  "
                >
                  <NewsCard
                    article={
                      article
                    }
                    priority={
                      index === 0
                    }
                    compact
                  />
                </div>
              );
            },
          )}
        </div>
      </div>
    </div>
  );
}