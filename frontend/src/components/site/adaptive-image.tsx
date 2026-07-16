type AdaptiveImageProps = {
  src: string;
  alt: string;
  loading?: 'eager' | 'lazy';
  fetchPriority?:
    | 'high'
    | 'low'
    | 'auto';
  fit?: 'cover' | 'contain';
  position?: string;
  containerClassName?: string;
  imageClassName?: string;
};

export function AdaptiveImage({
  src,
  alt,
  loading = 'lazy',
  fetchPriority = 'auto',
  fit = 'cover',
  position = 'center',
  containerClassName = '',
  imageClassName = '',
}: AdaptiveImageProps) {
  return (
    <div
      className={`
        relative
        h-full
        w-full
        overflow-hidden
        ${
          fit === 'contain'
            ? 'bg-[#eef3f7]'
            : 'bg-[#dfe8f0]'
        }
        ${containerClassName}
      `}
    >
      <img
        src={src}
        alt={alt}
        loading={loading}
        fetchPriority={
          fetchPriority
        }
        style={{
          objectPosition:
            position,
        }}
        className={`
          h-full
          w-full
          ${
            fit === 'contain'
              ? 'object-contain'
              : 'object-cover'
          }
          ${imageClassName}
        `}
      />
    </div>
  );
}