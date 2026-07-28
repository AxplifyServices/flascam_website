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

import type {
  AssociationSummary,
} from '@/types/associations';

type AssociationsMapSectionProps = {
  associations: AssociationSummary[];
};

function isMapAssociation(
  association: AssociationSummary,
) {
  return (
    association.mapIsVisible !== false &&
    association.mapPositionX !== null &&
    association.mapPositionX !== undefined &&
    association.mapPositionY !== null &&
    association.mapPositionY !== undefined &&
    Number.isFinite(
      association.mapPositionX,
    ) &&
    Number.isFinite(
      association.mapPositionY,
    ) &&
    association.mapPositionX >= 0 &&
    association.mapPositionX <= 100 &&
    association.mapPositionY >= 0 &&
    association.mapPositionY <= 100
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
          className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-xl bg-[#07355d] px-5 text-sm font-extrabold text-white transition hover:bg-[#0f5f9f] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#0f5f9f]/25"
        >
          Découvrir l’association

          <ArrowRight
            size={18}
            aria-hidden="true"
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
      className="relative overflow-hidden bg-[#f5f9fc] py-16 sm:py-24 lg:py-28"
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
        <div className="grid gap-8 border-b border-[#dbe5ef] pb-10 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="max-w-3xl">
            <p className="flex items-center gap-3 text-xs font-extrabold uppercase tracking-[0.18em] text-[#0f5f9f]">
              <span className="h-[3px] w-10 bg-[#c96f4a]" />

              Associations régionales
            </p>

            <h2
              id="home-associations-map-title"
              className="mt-5 text-3xl font-extrabold leading-[1.1] tracking-[-0.04em] text-[#101820] sm:text-4xl lg:text-[3.25rem]"
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
            'mt-10 grid gap-6',
            selectedAssociation
              ? 'lg:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.75fr)]'
              : 'lg:grid-cols-1',
          ].join(' ')}
        >
          <div className="relative overflow-hidden rounded-[1.5rem] border border-[#183d64] bg-[#071d38] shadow-[0_22px_70px_rgba(7,53,93,0.16)]">
            <div
              aria-hidden="true"
              className="absolute inset-0 opacity-[0.2]"
              style={{
                backgroundImage:
                  'radial-gradient(circle, rgba(255,255,255,0.7) 1px, transparent 1px)',
                backgroundSize:
                  '24px 24px',
              }}
            />

            <div className="relative border-b border-white/10 px-5 py-4 sm:px-7">
              <div className="flex items-center gap-3 text-white">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/10">
                  <Building2
                    size={19}
                    aria-hidden="true"
                  />
                </span>

                <div>
                  <p className="text-sm font-extrabold">
                    Carte du réseau FLASCAM
                  </p>

                  <p className="mt-0.5 text-xs text-white/60">
                    {
                      mapAssociations.length
                    }{' '}
                    association
                    {mapAssociations.length >
                    1
                      ? 's'
                      : ''}{' '}
                    présente
                    {mapAssociations.length >
                    1
                      ? 's'
                      : ''}
                  </p>
                </div>
              </div>
            </div>

            <div className="relative mx-auto aspect-[4/5] w-full max-w-[42rem] p-4 sm:p-8 lg:aspect-[5/4] lg:max-w-[58rem] lg:p-10">
              <svg
                viewBox="0 0 500 650"
                role="img"
                aria-label="Carte interactive du Maroc présentant les associations régionales de la FLASCAM"
                className="absolute inset-0 h-full w-full p-5 sm:p-8 lg:p-10"
                preserveAspectRatio="xMidYMid meet"
              >
                <defs>
                  <linearGradient
                    id="publicMoroccoMapGradient"
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="#1269aa"
                    />

                    <stop
                      offset="45%"
                      stopColor="#6f279f"
                    />

                    <stop
                      offset="100%"
                      stopColor="#c92b81"
                    />
                  </linearGradient>

                  <filter
                    id="publicMoroccoMapShadow"
                    x="-30%"
                    y="-30%"
                    width="160%"
                    height="160%"
                  >
                    <feDropShadow
                      dx="0"
                      dy="12"
                      stdDeviation="12"
                      floodColor="#000000"
                      floodOpacity="0.3"
                    />
                  </filter>
                </defs>

                <path
                  d="
                    M 270 24
                    L 310 38
                    L 324 58
                    L 350 69
                    L 355 92
                    L 376 107
                    L 367 130
                    L 388 151
                    L 374 178
                    L 392 207
                    L 378 231
                    L 392 256
                    L 377 284
                    L 386 314
                    L 366 338
                    L 372 366
                    L 350 390
                    L 354 420
                    L 330 442
                    L 334 470
                    L 310 493
                    L 314 519
                    L 289 541
                    L 291 566
                    L 263 590
                    L 258 621
                    L 226 630
                    L 201 610
                    L 195 578
                    L 177 552
                    L 183 518
                    L 167 488
                    L 177 456
                    L 161 425
                    L 174 394
                    L 159 362
                    L 177 331
                    L 167 301
                    L 189 273
                    L 182 242
                    L 205 218
                    L 203 190
                    L 229 168
                    L 222 137
                    L 246 116
                    L 239 86
                    L 261 64
                    Z
                  "
                  fill="url(#publicMoroccoMapGradient)"
                  stroke="rgba(255,255,255,0.85)"
                  strokeWidth="4"
                  strokeLinejoin="round"
                  filter="url(#publicMoroccoMapShadow)"
                />

                <path
                  d="
                    M 189 273
                    L 377 284
                    M 177 331
                    L 366 338
                    M 174 394
                    L 350 390
                    M 177 456
                    L 330 442
                    M 183 518
                    L 310 493
                  "
                  fill="none"
                  stroke="rgba(255,255,255,0.11)"
                  strokeWidth="2"
                />
              </svg>

              <div className="absolute inset-5 sm:inset-8 lg:inset-10">
                {mapAssociations.map(
                  (
                    association,
                  ) => {
                    const isSelected =
                      association.id ===
                      selectedAssociationId;

                    const isHovered =
                      association.id ===
                      hoveredAssociationId;

                    return (
                      <div
                        key={
                          association.id
                        }
                        style={{
                          left: `${association.mapPositionX}%`,
                          top: `${association.mapPositionY}%`,
                        }}
                        className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
                      >
                        <button
                          type="button"
                          aria-label={`Afficher ${association.name}`}
                          aria-pressed={
                            isSelected
                          }
                          onClick={() =>
                            selectAssociation(
                              association,
                            )
                          }
                          onMouseEnter={() =>
                            setHoveredAssociationId(
                              association.id,
                            )
                          }
                          onMouseLeave={() =>
                            setHoveredAssociationId(
                              null,
                            )
                          }
                          onFocus={() =>
                            setHoveredAssociationId(
                              association.id,
                            )
                          }
                          onBlur={() =>
                            setHoveredAssociationId(
                              null,
                            )
                          }
                          className={[
                            'group relative grid h-11 w-11 place-items-center rounded-full',
                            'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/40',
                            isSelected
                              ? 'z-30'
                              : '',
                          ].join(' ')}
                        >
                          <span
                            aria-hidden="true"
                            className={[
                              'absolute rounded-full bg-[#ef4b87]/30 transition-all duration-300',
                              isSelected
                                ? 'h-11 w-11 animate-ping'
                                : 'h-7 w-7 group-hover:h-10 group-hover:w-10',
                            ].join(' ')}
                          />

                          <span
                            aria-hidden="true"
                            className={[
                              'relative block rounded-full border-[3px] border-white',
                              'shadow-[0_5px_18px_rgba(0,0,0,0.35)] transition duration-200',
                              isSelected
                                ? 'h-6 w-6 bg-[#c96f4a] scale-110'
                                : 'h-4 w-4 bg-[#ef2779] group-hover:scale-125',
                            ].join(' ')}
                          />
                        </button>

                        <div
                          role="tooltip"
                          className={[
                            'pointer-events-none absolute bottom-[calc(100%+0.45rem)] left-1/2',
                            'w-max max-w-[13rem] -translate-x-1/2 rounded-xl',
                            'border border-white/20 bg-[#03172d]/95 px-3 py-2',
                            'text-center text-xs font-bold leading-5 text-white',
                            'shadow-[0_12px_35px_rgba(0,0,0,0.35)] backdrop-blur',
                            'transition duration-150',
                            isHovered
                              ? 'visible translate-y-0 opacity-100'
                              : 'invisible translate-y-1 opacity-0',
                          ].join(' ')}
                        >
                          <span className="block">
                            {
                              association.name
                            }
                          </span>

                          <span className="mt-0.5 block font-medium text-white/65">
                            {associationLocation(
                              association,
                            )}
                          </span>

                          <span
                            aria-hidden="true"
                            className="absolute left-1/2 top-full h-2 w-2 -translate-x-1/2 -translate-y-1/2 rotate-45 border-b border-r border-white/20 bg-[#03172d]"
                          />
                        </div>
                      </div>
                    );
                  },
                )}
              </div>

              <div className="pointer-events-none absolute bottom-4 left-4 right-4 rounded-xl border border-white/10 bg-[#03172d]/75 px-4 py-3 text-center text-xs font-semibold leading-5 text-white/75 backdrop-blur sm:bottom-6 sm:left-6 sm:right-auto sm:max-w-xs sm:text-left">
                Sélectionnez un point pour afficher les informations de
                l’association.
              </div>
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

        <div className="mt-12 grid overflow-hidden rounded-[1.25rem] bg-[#07355d] text-white lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="p-7 sm:p-9">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#f0a27f]">
              Rejoindre le réseau
            </p>

            <h3 className="mt-3 text-2xl font-extrabold tracking-[-0.03em] sm:text-3xl">
              Votre association souhaite rejoindre la FLASCAM ?
            </h3>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/75 sm:text-base">
              Découvrez les conditions d’affiliation et échangez avec la
              fédération pour intégrer le réseau national.
            </p>
          </div>

          <div className="border-t border-white/15 p-7 lg:border-l lg:border-t-0 lg:p-9">
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