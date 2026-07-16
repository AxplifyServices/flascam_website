import type {
  HTMLAttributes,
} from 'react';

type AdaptiveImageProps = {
  src: string;
  alt: string;
  loading?: 'eager' | 'lazy';
  fetchPriority?:
    | 'high'
    | 'low'
    | 'auto';
  containerClassName?: string;
  imageClassName?: string;
  backdropClassName?: string;
} & Pick<
  HTMLAttributes<HTMLDivElement>,
  'aria-hidden'
>;

export function AdaptiveImage({
  src,
  alt,
  loading = 'lazy',
  fetchPriority = 'auto',
  containerClassName = '',
  imageClassName = '',
  backdropClassName = '',
}: AdaptiveImageProps) {
  return (
    <div
      className={`
        relative
        isolate
        h-full
        w-full
        overflow-hidden
        bg-[#eef4f8]
        ${containerClassName}
      `}
    >
      {/*
        Arrière-plan volontairement flouté.

        Il remplit l’espace disponible sans laisser de grandes bandes
        blanches, mais il ne porte aucune information accessible.
      */}
      <img
        src={src}
        alt=""
        aria-hidden="true"
        loading={loading}
        fetchPriority={
          fetchPriority
        }
        className={`
          pointer-events-none
          absolute
          inset-0
          h-full
          w-full
          scale-110
          object-cover
          opacity-30
          blur-xl
          ${backdropClassName}
        `}
      />

      {/*
        L’image principale reste entièrement visible grâce à object-contain.
        Elle n’est jamais découpée, quel que soit son format.
      */}
      <img
        src={src}
        alt={alt}
        loading={loading}
        fetchPriority={
          fetchPriority
        }
        className={`
          relative
          z-10
          h-full
          w-full
          object-contain
          ${imageClassName}
        `}
      />
    </div>
  );
}