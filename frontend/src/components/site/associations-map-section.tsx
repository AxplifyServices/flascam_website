'use client';

import Link from 'next/link';

import {
  ArrowRight,
  Building2,
  ChevronRight,
  MapPin,
  UsersRound,
  X,
} from 'lucide-react';

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import dynamic from 'next/dynamic';

import type {
  AssociationSummary,
} from '@/types/associations';

type AssociationsMapSectionProps = {
  associations: AssociationSummary[];
};

function MapLoadingState() {
  return (
    <div className="grid min-h-[520px] place-items-center bg-transparent px-6 text-center">
      <div>
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#dbe5ef] border-t-[#0f5f9f]" />

        <p className="mt-4 text-sm font-bold text-[#536273]">
          Chargement de la carte du Maroc…
        </p>
      </div>
    </div>
  );
}

const InteractiveAssociationsMap =
  dynamic(
    () =>
      import(
        '@/components/maps/interactive-associations-map'
      ).then(
        (module) =>
          module.InteractiveAssociationsMap,
      ),
    {
      ssr: false,
      loading:
        MapLoadingState,
    },
  );

function isMapAssociation(
  association: AssociationSummary,
) {
  return (
    association.mapIsVisible !== false &&
    association.latitude !== null &&
    association.latitude !== undefined &&
    association.longitude !== null &&
    association.longitude !== undefined &&
    Number.isFinite(
      association.latitude,
    ) &&
    Number.isFinite(
      association.longitude,
    ) &&
    association.latitude >= -90 &&
    association.latitude <= 90 &&
    association.longitude >= -180 &&
    association.longitude <= 180
  );
}

function associationLocation(
  association: AssociationSummary,
) {
  if (
    association.city &&
    association.region
  ) {
    return `${association.city} · ${association.region}`;
  }

  return (
    association.city ||
    association.region
  );
}

function AssociationLogo({
  association,
  size = 'large',
}: {
  association: AssociationSummary;
  size?: 'small' | 'large';
}) {
  const sizeClass =
    size === 'small'
      ? 'h-11 w-11 rounded-xl'
      : 'h-20 w-20 rounded-2xl';

  const textClass =
    size === 'small'
      ? 'text-xs'
      : 'text-lg';

  if (association.logoUrl) {
    return (
      <div
        className={[
          sizeClass,
          'grid shrink-0 place-items-center overflow-hidden',
          'border border-[#dbe5ef] bg-white p-2',
          'shadow-[0_10px_30px_rgba(7,53,93,0.12)]',
        ].join(' ')}
      >
        <img
          src={association.logoUrl}
          alt={`Logo de ${association.name}`}
          className="h-full w-full object-contain"
        />
      </div>
    );
  }

  return (
    <div
      className={[
        sizeClass,
        'grid shrink-0 place-items-center overflow-hidden',
        'bg-[#07355d] px-2 text-center text-white',
        'shadow-[0_10px_30px_rgba(7,53,93,0.12)]',
      ].join(' ')}
    >
      <span
        className={[
          textClass,
          'font-black leading-none',
        ].join(' ')}
      >
        {association.logoText ||
          association.acronym ||
          association.name
            .slice(0, 2)
            .toUpperCase()}
      </span>
    </div>
  );
}

function AssociationDetailCard({
  association,
  onClose,
}: {
  association: AssociationSummary;
  onClose: () => void;
}) {
  return (
    <article
      aria-live="polite"
      className="overflow-hidden rounded-[1.5rem] border border-[#dbe5ef] bg-white shadow-[0_24px_70px_rgba(7,53,93,0.16)]"
    >
      <div className="relative h-44 overflow-hidden bg-gradient-to-br from-[#07355d] via-[#0a487b] to-[#0f5f9f] sm:h-52 lg:h-60">
        {association.coverImageUrl ? (
          <>
            <img
              src={
                association.coverImageUrl
              }
              alt={`Couverture de ${association.name}`}
              className="h-full w-full object-cover"
            />

            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-[#07355d]/75 via-[#07355d]/15 to-transparent"
            />
          </>
        ) : (
          <>
            <div
              aria-hidden="true"
              className="absolute inset-0 opacity-[0.15]"
              style={{
                backgroundImage:
                  'radial-gradient(circle, rgba(255,255,255,0.95) 1px, transparent 1px)',
                backgroundSize:
                  '19px 19px',
              }}
            />

            <div
              aria-hidden="true"
              className="absolute -right-14 -top-16 h-48 w-48 rounded-full border border-white/20"
            />

            <div
              aria-hidden="true"
              className="absolute -bottom-20 -left-16 h-48 w-48 rounded-full border border-[#c96f4a]/50"
            />
          </>
        )}

        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer la fiche de l’association"
          className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full border border-white/30 bg-[#07355d]/70 text-white backdrop-blur transition hover:bg-[#07355d] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/30"
        >
          <X
            size={19}
            aria-hidden="true"
          />
        </button>
      </div>

      <div className="relative px-5 pb-6 sm:px-7 sm:pb-7">
        <div className="-mt-10">
          <AssociationLogo
            association={association}
          />
        </div>

        <p className="mt-5 text-xs font-extrabold uppercase tracking-[0.16em] text-[#c96f4a]">
          Association régionale
        </p>

        <h3 className="mt-2 text-2xl font-extrabold leading-tight tracking-[-0.035em] text-[#101820]">
          {association.name}
        </h3>

        <div className="mt-5 space-y-3 border-t border-[#dbe5ef] pt-5 text-sm text-[#536273]">
          <p className="flex items-start gap-3">
            <MapPin
              size={18}
              aria-hidden="true"
              className="mt-0.5 shrink-0 text-[#c96f4a]"
            />

            <span>
              {associationLocation(
                association,
              )}
            </span>
          </p>

          {association.memberCount !==
            null &&
            association.memberCount !==
              undefined && (
              <p className="flex items-start gap-3">
                <UsersRound
                  size={18}
                  aria-hidden="true"
                  className="mt-0.5 shrink-0 text-[#0f5f9f]"
                />

                <span>
                  {
                    association.memberCount
                  }{' '}
                  loueurs membres
                </span>
              </p>
            )}
        </div>

<Link
  href={`/associations/${association.slug}`}
  className="
    mt-6
    inline-flex
    min-h-12
    w-full
    items-center
    justify-center
    gap-3
    rounded-xl
    border
    border-[#c96f4a]
    bg-[#c96f4a]
    px-5
    text-sm
    font-extrabold
    !text-white
    shadow-[0_12px_28px_rgba(201,111,74,0.24)]
    transition
    duration-200
    hover:-translate-y-0.5
    hover:border-[#a95235]
    hover:bg-[#a95235]
    hover:!text-white
    hover:shadow-[0_16px_34px_rgba(169,82,53,0.28)]
    focus-visible:outline-none
    focus-visible:ring-4
    focus-visible:ring-[#c96f4a]/25
    [&_*]:text-white
  "
>
  <span className="text-white">
    Découvrir l’association
  </span>

  <ArrowRight
    size={18}
    aria-hidden="true"
    className="text-white"
  />
</Link>

      </div>
    </article>
  );
}

export function AssociationsMapSection({
  associations,
}: AssociationsMapSectionProps) {
  const mapAssociations =
    useMemo(
      () =>
        associations
          .filter(
            isMapAssociation,
          )
          .sort(
            (
              first,
              second,
            ) =>
              (
                first.displayOrder ??
                0
              ) -
                (
                  second.displayOrder ??
                  0
                ) ||
              first.name.localeCompare(
                second.name,
                'fr',
              ),
          ),
      [associations],
    );

  const [
    selectedAssociationId,
    setSelectedAssociationId,
  ] = useState<string | null>(
    null,
  );

  const [
    hoveredAssociationId,
    setHoveredAssociationId,
  ] = useState<string | null>(
    null,
  );

  const detailRef =
    useRef<HTMLDivElement | null>(
      null,
    );

const mapViewportRef =
  useRef<HTMLDivElement | null>(
    null,
  );

const [
  mapShouldLoad,
  setMapShouldLoad,
] = useState(false);

  const selectedAssociation =
    mapAssociations.find(
      (association) =>
        association.id ===
        selectedAssociationId,
    ) ?? null;

  useEffect(() => {
    function closeWithEscape(
      event: KeyboardEvent,
    ) {
      if (
        event.key === 'Escape'
      ) {
        setSelectedAssociationId(
          null,
        );
      }
    }

    window.addEventListener(
      'keydown',
      closeWithEscape,
    );

    return () => {
      window.removeEventListener(
        'keydown',
        closeWithEscape,
      );
    };
  }, []);

useEffect(() => {
  const element =
    mapViewportRef.current;

  if (!element) {
    return;
  }

  if (
    !(
      'IntersectionObserver' in
      window
    )
  ) {
    setMapShouldLoad(true);
    return;
  }

  const observer =
    new IntersectionObserver(
      (entries) => {
        const entry =
          entries[0];

        if (
          entry?.isIntersecting
        ) {
          setMapShouldLoad(
            true,
          );

          observer.disconnect();
        }
      },
      {
        rootMargin:
          '400px 0px',
      },
    );

  observer.observe(element);

  return () => {
    observer.disconnect();
  };
}, []);  

  function selectAssociation(
    association: AssociationSummary,
  ) {
    setSelectedAssociationId(
      association.id,
    );

    window.setTimeout(() => {
      if (
        window.matchMedia(
          '(max-width: 1023px)',
        ).matches
      ) {
        detailRef.current?.scrollIntoView(
          {
            behavior: 'smooth',
            block: 'nearest',
          },
        );
      }
    }, 50);
  }

  if (
    mapAssociations.length === 0
  ) {
    return null;
  }

  return (
    <section
      aria-labelledby="home-associations-map-title"
      className="relative overflow-hidden bg-[#f5f9fc] py-16 sm:py-24 lg:py-20"
    >
      <div
        aria-hidden="true"
        className="absolute -left-40 top-16 h-80 w-80 rounded-full bg-[#0f5f9f]/[0.06] blur-3xl"
      />

      <div
        aria-hidden="true"
        className="absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-[#c96f4a]/[0.08] blur-3xl"
      />

      <div className="site-container relative">
        <div className="grid gap-8 border-b border-[#dbe5ef] pb-10 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-6 lg:pb-7">
          <div className="max-w-3xl">
            <p className="flex items-center gap-3 text-xs font-extrabold uppercase tracking-[0.18em] text-[#0f5f9f]">
              <span className="h-[3px] w-10 bg-[#c96f4a]" />

              Associations régionales
            </p>

            <h2
              id="home-associations-map-title"
              className="mt-5 text-3xl font-extrabold leading-[1.1] tracking-[-0.04em] text-[#101820] sm:text-4xl lg:mt-4 lg:text-[2.65rem]"
            >
              Un réseau présent au plus près des professionnels.
            </h2>

            <p className="mt-6 max-w-2xl text-base leading-8 text-[#536273] sm:text-lg">
              Explorez la carte du Maroc et sélectionnez un point pour découvrir
              l’association qui représente les loueurs de chaque région.
            </p>
          </div>

          <Link
            href="/associations"
            className="inline-flex min-h-12 items-center justify-center gap-3 rounded-md border border-[#07355d] px-5 text-sm font-extrabold text-[#07355d] transition duration-200 hover:bg-[#07355d] hover:text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#0f5f9f]/20"
          >
            Voir tout le réseau

            <ArrowRight
              size={17}
              aria-hidden="true"
            />
          </Link>
        </div>

        <div
          className={[
            'mt-10 grid gap-6 lg:mt-7',
            selectedAssociation
              ? 'lg:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.75fr)]'
              : 'lg:grid-cols-1',
          ].join(' ')}
        >
<div className="relative overflow-visible bg-transparent">
  <div className="relative px-1 pb-4 sm:px-2">
    <div className="flex items-center gap-3 text-[#07355d]">
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#eef6fb] text-[#0f5f9f]">
        <Building2
          size={19}
          aria-hidden="true"
        />
      </span>

      <div>
        <p className="text-sm font-extrabold">
          Carte du réseau FLASCAM
        </p>

        <p className="mt-0.5 text-xs text-[#536273]">
          {mapAssociations.length}{' '}
          association
          {mapAssociations.length > 1
            ? 's'
            : ''}{' '}
          présente
          {mapAssociations.length > 1
            ? 's'
            : ''}
        </p>
      </div>
    </div>
  </div>

<div
  ref={mapViewportRef}
  className="relative min-h-[520px]"
>
  {mapShouldLoad ? (
    <InteractiveAssociationsMap
      associations={
        mapAssociations
      }
      selectedAssociationId={
        selectedAssociationId
      }
      hoveredAssociationId={
        hoveredAssociationId
      }
      onSelect={
        selectAssociation
      }
      onHover={
        setHoveredAssociationId
      }
    />
  ) : (
    <MapLoadingState />
  )}
</div>
          </div>

          {selectedAssociation && (
            <div
              ref={detailRef}
              className="lg:sticky lg:top-24 lg:self-start"
            >
              <AssociationDetailCard
                association={
                  selectedAssociation
                }
                onClose={() =>
                  setSelectedAssociationId(
                    null,
                  )
                }
              />
            </div>
          )}
        </div>

        <div className="mt-8 lg:hidden">
          <details className="group overflow-hidden rounded-2xl border border-[#dbe5ef] bg-white">
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-sm font-extrabold text-[#07355d] [&::-webkit-details-marker]:hidden">
              <span>
                Afficher la liste des associations
              </span>

              <ChevronRight
                size={19}
                aria-hidden="true"
                className="transition-transform group-open:rotate-90"
              />
            </summary>

            <ul className="border-t border-[#dbe5ef]">
              {mapAssociations.map(
                (association) => (
                  <li
                    key={
                      association.id
                    }
                    className="border-b border-[#dbe5ef] last:border-b-0"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        selectAssociation(
                          association,
                        )
                      }
                      className="flex min-h-16 w-full items-center gap-3 px-5 py-3 text-left transition hover:bg-[#f5f9fc] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-[#0f5f9f]/20"
                    >
                      <AssociationLogo
                        association={
                          association
                        }
                        size="small"
                      />

                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-extrabold text-[#101820]">
                          {
                            association.name
                          }
                        </span>

                        <span className="mt-1 block truncate text-xs text-[#536273]">
                          {associationLocation(
                            association,
                          )}
                        </span>
                      </span>

                      <ChevronRight
                        size={18}
                        aria-hidden="true"
                        className="shrink-0 text-[#0f5f9f]"
                      />
                    </button>
                  </li>
                ),
              )}
            </ul>
          </details>
        </div>

        <div className="mt-12 grid overflow-hidden rounded-[1.25rem] bg-[#07355d] text-white lg:mt-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="p-7 sm:p-9 lg:p-7">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#f0a27f]">
              Rejoindre le réseau
            </p>

            <h3 className="mt-3 text-2xl font-extrabold tracking-[-0.03em] sm:text-3xl lg:text-2xl">
              Votre association souhaite rejoindre la FLASCAM ?
            </h3>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/75 sm:text-base lg:mt-3 lg:text-sm lg:leading-6">
              Découvrez les conditions d’affiliation et échangez avec la
              fédération pour intégrer le réseau national.
            </p>
          </div>

          <div className="border-t border-white/15 p-7 lg:border-l lg:border-t-0 lg:p-7">
            <Link
              href="/contact"
              className="inline-flex min-h-12 items-center justify-center gap-3 rounded-md bg-[#c96f4a] px-6 text-sm font-extrabold text-white transition hover:bg-[#a95235] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/30"
            >
              Contacter la fédération

              <ArrowRight
                size={17}
                aria-hidden="true"
              />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}