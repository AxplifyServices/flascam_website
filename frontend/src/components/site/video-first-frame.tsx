'use client';

import {
  useCallback,
  useMemo,
  useRef,
} from 'react';

type VideoFirstFrameProps = {
  src: string;
  title: string;
  className?: string;
};

function addInitialFrameFragment(
  src: string,
) {
  if (
    src.includes('#t=')
  ) {
    return src;
  }

  return `${src}#t=0.05`;
}

export function VideoFirstFrame({
  src,
  title,
  className = '',
}: VideoFirstFrameProps) {
  const videoRef =
    useRef<HTMLVideoElement | null>(
      null,
    );

  const frameSource =
    useMemo(
      () =>
        addInitialFrameFragment(
          src,
        ),
      [
        src,
      ],
    );

  const displayFirstFrame =
    useCallback(() => {
      const video =
        videoRef.current;

      if (
        !video ||
        !Number.isFinite(
          video.duration,
        ) ||
        video.duration <= 0
      ) {
        return;
      }

      const targetTime =
        Math.min(
          0.05,
          Math.max(
            video.duration / 100,
            0.01,
          ),
        );

      if (
        Math.abs(
          video.currentTime -
            targetTime,
        ) >
        0.01
      ) {
        try {
          video.currentTime =
            targetTime;
        } catch {
          // Certains navigateurs empêchent le seek
          // tant que les métadonnées ne sont pas prêtes.
        }
      }
    }, []);

  return (
    <video
      ref={
        videoRef
      }
      src={
        frameSource
      }
      title={
        title
      }
      aria-label={
        title
      }
      muted
      playsInline
      preload="auto"
      tabIndex={
        -1
      }
      onLoadedMetadata={
        displayFirstFrame
      }
      onLoadedData={
        displayFirstFrame
      }
      className={`
        pointer-events-none
        h-full
        w-full
        object-cover
        ${className}
      `}
    />
  );
}