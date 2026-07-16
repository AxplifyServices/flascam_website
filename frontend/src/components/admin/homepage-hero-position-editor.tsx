'use client';

import {
  PointerEvent,
  useRef,
  useState,
} from 'react';

import {
  Monitor,
  Move,
  RotateCcw,
  Smartphone,
} from 'lucide-react';

export type HeroImagePositions = {
  desktopPositionX: number;
  desktopPositionY: number;
  mobilePositionX: number;
  mobilePositionY: number;
};

type PreviewMode =
  | 'desktop'
  | 'mobile';

type HomepageHeroPositionEditorProps = {
  imageUrl: string;
  altText: string;
  value: HeroImagePositions;
  onChange: (
    positions: HeroImagePositions,
  ) => void;
};

type DragState = {
  pointerId: number;
  startClientX: number;
  startClientY: number;
  startPositionX: number;
  startPositionY: number;
  width: number;
  height: number;
};

function clampPosition(
  value: number,
) {
  return Math.max(
    0,
    Math.min(
      100,
      Math.round(value),
    ),
  );
}

export function HomepageHeroPositionEditor({
  imageUrl,
  altText,
  value,
  onChange,
}: HomepageHeroPositionEditorProps) {
  const [
    previewMode,
    setPreviewMode,
  ] = useState<PreviewMode>(
    'desktop',
  );

  const dragStateRef =
    useRef<DragState | null>(
      null,
    );

  const isMobile =
    previewMode === 'mobile';

  const positionX =
    isMobile
      ? value.mobilePositionX
      : value.desktopPositionX;

  const positionY =
    isMobile
      ? value.mobilePositionY
      : value.desktopPositionY;

  function updateCurrentPosition(
    nextX: number,
    nextY: number,
  ) {
    if (isMobile) {
      onChange({
        ...value,
        mobilePositionX:
          clampPosition(nextX),
        mobilePositionY:
          clampPosition(nextY),
      });

      return;
    }

    onChange({
      ...value,
      desktopPositionX:
        clampPosition(nextX),
      desktopPositionY:
        clampPosition(nextY),
    });
  }

  function handlePointerDown(
    event: PointerEvent<HTMLDivElement>,
  ) {
    const rect =
      event.currentTarget.getBoundingClientRect();

    event.currentTarget.setPointerCapture(
      event.pointerId,
    );

    dragStateRef.current = {
      pointerId:
        event.pointerId,
      startClientX:
        event.clientX,
      startClientY:
        event.clientY,
      startPositionX:
        positionX,
      startPositionY:
        positionY,
      width:
        rect.width,
      height:
        rect.height,
    };
  }

  function handlePointerMove(
    event: PointerEvent<HTMLDivElement>,
  ) {
    const dragState =
      dragStateRef.current;

    if (
      !dragState ||
      dragState.pointerId !==
        event.pointerId
    ) {
      return;
    }

    /*
     * Le déplacement est inversé pour reproduire
     * le comportement naturel d'une image que
     * l'utilisateur saisit et fait glisser.
     */
    const deltaX =
      event.clientX -
      dragState.startClientX;

    const deltaY =
      event.clientY -
      dragState.startClientY;

    const percentageX =
      dragState.width > 0
        ? (
            deltaX /
            dragState.width
          ) * 100
        : 0;

    const percentageY =
      dragState.height > 0
        ? (
            deltaY /
            dragState.height
          ) * 100
        : 0;

    updateCurrentPosition(
      dragState.startPositionX -
        percentageX,
      dragState.startPositionY -
        percentageY,
    );
  }

  function stopDragging(
    event: PointerEvent<HTMLDivElement>,
  ) {
    if (
      dragStateRef.current
        ?.pointerId ===
      event.pointerId
    ) {
      dragStateRef.current =
        null;
    }

    if (
      event.currentTarget.hasPointerCapture(
        event.pointerId,
      )
    ) {
      event.currentTarget.releasePointerCapture(
        event.pointerId,
      );
    }
  }

  function resetCurrentPosition() {
    updateCurrentPosition(
      50,
      50,
    );
  }

  return (
    <div
      className="
        mt-5
        rounded-2xl
        border
        border-[var(--flascam-border)]
        bg-[#f8fbff]
        p-3
        sm:p-4
      "
    >
      <div
        className="
          flex
          flex-col
          gap-3
          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >
        <div>
          <h3
            className="
              text-sm
              font-extrabold
              text-slate-900
            "
          >
            Cadrage de l’image
          </h3>

          <p
            className="
              mt-1
              text-xs
              leading-5
              text-[var(--flascam-slate)]
            "
          >
            Faites glisser l’image pour choisir la
            zone qui restera visible.
          </p>
        </div>

        <div
          className="
            grid
            grid-cols-2
            rounded-xl
            border
            border-[var(--flascam-border)]
            bg-white
            p-1
          "
        >
          <button
            type="button"
            onClick={() =>
              setPreviewMode(
                'desktop',
              )
            }
            aria-pressed={
              previewMode ===
              'desktop'
            }
            className={`
              flex
              min-h-10
              items-center
              justify-center
              gap-2
              rounded-lg
              px-3
              text-xs
              font-bold
              transition
              ${
                previewMode ===
                'desktop'
                  ? `
                    bg-[var(--flascam-blue)]
                    text-white
                  `
                  : `
                    text-slate-600
                    hover:bg-slate-50
                  `
              }
            `}
          >
            <Monitor size={16} />
            Desktop
          </button>

          <button
            type="button"
            onClick={() =>
              setPreviewMode(
                'mobile',
              )
            }
            aria-pressed={
              previewMode ===
              'mobile'
            }
            className={`
              flex
              min-h-10
              items-center
              justify-center
              gap-2
              rounded-lg
              px-3
              text-xs
              font-bold
              transition
              ${
                previewMode ===
                'mobile'
                  ? `
                    bg-[var(--flascam-blue)]
                    text-white
                  `
                  : `
                    text-slate-600
                    hover:bg-slate-50
                  `
              }
            `}
          >
            <Smartphone size={16} />
            Mobile
          </button>
        </div>
      </div>

      <div
        className="
          mt-4
          flex
          justify-center
          overflow-hidden
          rounded-2xl
          bg-slate-200
          p-2
          sm:p-3
        "
      >
        <div
          role="application"
          aria-label={`Réglage du cadrage ${isMobile ? 'mobile' : 'desktop'}`}
          onPointerDown={
            handlePointerDown
          }
          onPointerMove={
            handlePointerMove
          }
          onPointerUp={
            stopDragging
          }
          onPointerCancel={
            stopDragging
          }
          className={`
            relative
            cursor-grab
            touch-none
            select-none
            overflow-hidden
            rounded-xl
            bg-slate-300
            shadow-lg
            active:cursor-grabbing
            ${
              isMobile
                ? `
                  aspect-[9/13]
                  w-full
                  max-w-[260px]
                `
                : `
                  aspect-[16/9]
                  w-full
                `
            }
          `}
        >
          <img
            src={imageUrl}
            alt={altText}
            draggable={false}
            style={{
              objectPosition:
                `${positionX}% ${positionY}%`,
            }}
            className="
              pointer-events-none
              absolute
              inset-0
              size-full
              object-cover
              select-none
            "
          />

          <div
            aria-hidden="true"
            className="
              pointer-events-none
              absolute
              inset-0
              bg-gradient-to-t
              from-[#07355d]/30
              via-transparent
              to-transparent
            "
          />

          <div
            aria-hidden="true"
            className="
              pointer-events-none
              absolute
              left-1/2
              top-1/2
              grid
              size-10
              -translate-x-1/2
              -translate-y-1/2
              place-items-center
              rounded-full
              border
              border-white/70
              bg-[#07355d]/65
              text-white
              shadow-lg
              backdrop-blur-sm
            "
          >
            <Move size={18} />
          </div>
        </div>
      </div>

      <div
        className="
          mt-3
          flex
          flex-col
          gap-3
          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >
        <p
          className="
            text-xs
            font-semibold
            text-slate-600
          "
        >
          Position : {positionX}% horizontal,
          {' '}
          {positionY}% vertical
        </p>

        <button
          type="button"
          onClick={
            resetCurrentPosition
          }
          className="
            flex
            min-h-10
            items-center
            justify-center
            gap-2
            rounded-xl
            border
            border-[var(--flascam-border)]
            bg-white
            px-3
            text-xs
            font-bold
            text-slate-700
            transition
            hover:border-[var(--flascam-blue)]
            hover:text-[var(--flascam-blue)]
          "
        >
          <RotateCcw size={15} />
          Recentrer ce cadrage
        </button>
      </div>
    </div>
  );
}