'use client';

import {
  PointerEvent,
  useRef,
  useState,
} from 'react';

import {
  Minus,
  Monitor,
  Move,
  Plus,
  RotateCcw,
  Smartphone,
} from 'lucide-react';

export type HeroImagePositions = {
  desktopPositionX: number;
  desktopPositionY: number;
  mobilePositionX: number;
  mobilePositionY: number;
  desktopZoom: number;
  mobileZoom: number;
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

const MIN_ZOOM = 25;
const MAX_ZOOM = 200;
const ZOOM_STEP = 5;

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

function clampZoom(
  value: number,
) {
  return Math.max(
    MIN_ZOOM,
    Math.min(
      MAX_ZOOM,
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

  const zoom =
    isMobile
      ? value.mobileZoom
      : value.desktopZoom;

  function updateCurrentValues(
    nextX: number,
    nextY: number,
    nextZoom = zoom,
  ) {
    if (isMobile) {
      onChange({
        ...value,
        mobilePositionX:
          clampPosition(nextX),
        mobilePositionY:
          clampPosition(nextY),
        mobileZoom:
          clampZoom(nextZoom),
      });

      return;
    }

    onChange({
      ...value,
      desktopPositionX:
        clampPosition(nextX),
      desktopPositionY:
        clampPosition(nextY),
      desktopZoom:
        clampZoom(nextZoom),
    });
  }

  function updateCurrentPosition(
    nextX: number,
    nextY: number,
  ) {
    updateCurrentValues(
      nextX,
      nextY,
      zoom,
    );
  }

  function updateCurrentZoom(
    nextZoom: number,
  ) {
    updateCurrentValues(
      positionX,
      positionY,
      nextZoom,
    );
  }

  function handlePointerDown(
    event: PointerEvent<HTMLDivElement>,
  ) {
    if (
      event.pointerType === 'mouse' &&
      event.button !== 0
    ) {
      return;
    }

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

  function resetCurrentFraming() {
    updateCurrentValues(
      50,
      50,
      100,
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
            Faites glisser l’image et ajustez son
            zoom séparément pour ordinateur et
            mobile.
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
  overflow-visible
  rounded-2xl
  bg-slate-200
  px-2
  pb-12
  pt-3
  sm:px-3
  sm:pb-12
  sm:pt-4
"
      >
<div
  className="
    relative
    flex
    w-full
    justify-center
  "
>
  <div
    role="application"
    aria-label={`Réglage du cadrage ${isMobile ? 'mobile' : 'desktop'}`}
    onPointerDown={handlePointerDown}
    onPointerMove={handlePointerMove}
    onPointerUp={stopDragging}
    onPointerCancel={stopDragging}
    className={`
      relative
      cursor-grab
      touch-none
      select-none
      overflow-hidden
      bg-slate-100
      shadow-[0_18px_45px_rgba(15,23,42,0.18)]
      active:cursor-grabbing
      ${
        isMobile
          ? `
            aspect-[9/13]
            w-full
            max-w-[280px]
            rounded-[1.75rem]
            border-[6px]
            border-slate-900
          `
          : `
            aspect-[16/9]
            w-full
            rounded-2xl
            border-[4px]
            border-slate-900
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
    objectFit:
      zoom < 100
        ? 'contain'
        : 'cover',
    transform:
      zoom < 100
        ? 'scale(1)'
        : `scale(${zoom / 100})`,
    transformOrigin:
      `${positionX}% ${positionY}%`,
  }}
  className="
    pointer-events-none
    absolute
    inset-0
    size-full
    select-none
    transition-transform
    duration-150
  "
/>
<div
  aria-hidden="true"
  className="
    pointer-events-none
    absolute
    inset-0
    z-20
    border-2
    border-white/90
    shadow-[inset_0_0_0_1px_rgba(15,23,42,0.45)]
  "
/>
<div
  aria-hidden="true"
  className="
    pointer-events-none
    absolute
    inset-0
    z-10
  "
>
  <div
    className="
      absolute
      left-1/3
      top-0
      h-full
      w-px
      bg-white/35
    "
  />

  <div
    className="
      absolute
      left-2/3
      top-0
      h-full
      w-px
      bg-white/35
    "
  />

  <div
    className="
      absolute
      left-0
      top-1/3
      h-px
      w-full
      bg-white/35
    "
  />

  <div
    className="
      absolute
      left-0
      top-2/3
      h-px
      w-full
      bg-white/35
    "
  />
</div>
<div
  className="
    pointer-events-none
    absolute
    left-3
    top-3
    z-30
    inline-flex
    items-center
    gap-2
    rounded-full
    bg-slate-950/75
    px-3
    py-1.5
    text-[11px]
    font-extrabold
    uppercase
    tracking-[0.12em]
    text-white
    backdrop-blur-sm
  "
>
  {isMobile ? (
    <Smartphone size={13} />
  ) : (
    <Monitor size={13} />
  )}

  {isMobile
    ? 'Cadre mobile'
    : 'Cadre desktop'}
</div>
<div
  className="
    pointer-events-none
    absolute
    -bottom-8
    left-1/2
    z-30
    -translate-x-1/2
    whitespace-nowrap
    rounded-full
    border
    border-[var(--flascam-border)]
    bg-white
    px-3
    py-1
    text-[11px]
    font-bold
    text-slate-600
    shadow-sm
  "
>
  Zone visible sur le site
</div>
</div>
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
          mt-4
          rounded-2xl
          border
          border-[var(--flascam-border)]
          bg-white
          p-3
          sm:p-4
        "
      >
        <div
          className="
            flex
            items-center
            justify-between
            gap-3
          "
        >
          <div>
            <p
              className="
                text-sm
                font-extrabold
                text-slate-900
              "
            >
              Zoom
            </p>

            <p
              className="
                mt-1
                text-xs
                text-[var(--flascam-slate)]
              "
            >
Réglage {isMobile
  ? 'mobile'
  : 'desktop'} : {zoom} %
{zoom < 100
  ? ' — image entière visible'
  : zoom > 100
    ? ' — image agrandie'
    : ' — image ajustée au cadre'}
            </p>
          </div>

          <div
            className="
              flex
              items-center
              gap-2
            "
          >
            <button
              type="button"
              onClick={() =>
                updateCurrentZoom(
                  zoom -
                    ZOOM_STEP,
                )
              }
              disabled={
                zoom <= MIN_ZOOM
              }
              aria-label="Dézoomer l’image"
              className="
                grid
                size-10
                place-items-center
                rounded-xl
                border
                border-[var(--flascam-border)]
                text-slate-700
                transition
                hover:border-[var(--flascam-blue)]
                hover:text-[var(--flascam-blue)]
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >
              <Minus size={17} />
            </button>

            <button
              type="button"
              onClick={() =>
                updateCurrentZoom(
                  zoom +
                    ZOOM_STEP,
                )
              }
              disabled={
                zoom >= MAX_ZOOM
              }
              aria-label="Zoomer l’image"
              className="
                grid
                size-10
                place-items-center
                rounded-xl
                border
                border-[var(--flascam-border)]
                text-slate-700
                transition
                hover:border-[var(--flascam-blue)]
                hover:text-[var(--flascam-blue)]
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >
              <Plus size={17} />
            </button>
          </div>
        </div>

        <input
          type="range"
          min={MIN_ZOOM}
          max={MAX_ZOOM}
          step={ZOOM_STEP}
          value={zoom}
          onChange={(event) =>
            updateCurrentZoom(
              Number(
                event.target.value,
              ),
            )
          }
          aria-label={`Zoom ${isMobile ? 'mobile' : 'desktop'}`}
          className="
            mt-4
            w-full
            accent-[var(--flascam-blue)]
          "
        />

        <div
          className="
            mt-2
            flex
            justify-between
            text-[11px]
            font-semibold
            text-slate-500
          "
        >
          <span>25 %</span>
          <span>100 %</span>
          <span>200 %</span>
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

  <div
    className="
      flex
      flex-col
      gap-2
      sm:flex-row
    "
  >
    <button
      type="button"
      onClick={() => {
        updateCurrentValues(
          50,
          50,
          95,
        );
      }}
      className="
        flex
        min-h-10
        items-center
        justify-center
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
      Ajuster au cadre
    </button>

    <button
      type="button"
      onClick={
        resetCurrentFraming
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
      Réinitialiser
    </button>
  </div>
</div>
    </div>
  );
}