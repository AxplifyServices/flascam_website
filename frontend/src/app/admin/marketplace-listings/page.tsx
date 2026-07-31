'use client';

import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import Link from 'next/link';

import {
  AlertCircle,
  Building2,
  CalendarClock,
  CarFront,
  CircleDollarSign,
  Clock3,
  Eye,
  Gauge,
  LoaderCircle,
  RefreshCw,
  Search,
  UserRound,
} from 'lucide-react';

import {
  getAdminMarketplaceListings,
} from '@/lib/marketplace-api';

import type {
  AdminMarketplaceListing,
  MarketplaceListingStatus,
  MarketplaceSellerType,
} from '@/types/marketplace';

import {
  MARKETPLACE_FUEL_LABELS,
  MARKETPLACE_STATUS_LABELS,
  MARKETPLACE_TRANSMISSION_LABELS,
} from '@/types/marketplace';

const STATUS_OPTIONS: Array<{
  value:
    | MarketplaceListingStatus
    | '';

  label: string;
}> = [
  {
    value:
      '',

    label:
      'Tous les statuts',
  },
  {
    value:
      'PENDING_REVIEW',

    label:
      'En attente de validation',
  },
  {
    value:
      'PUBLISHED',

    label:
      'Publiées',
  },
  {
    value:
      'REJECTED',

    label:
      'Refusées',
  },
  {
    value:
      'DRAFT',

    label:
      'Brouillons',
  },
  {
    value:
      'WITHDRAWN',

    label:
      'Retirées',
  },
  {
    value:
      'EXPIRED',

    label:
      'Expirées',
  },
  {
    value:
      'SOLD',

    label:
      'Offre acceptée',
  },
];

const SELLER_OPTIONS: Array<{
  value:
    | MarketplaceSellerType
    | '';

  label: string;
}> = [
  {
    value:
      '',

    label:
      'Tous les vendeurs',
  },
  {
    value:
      'FLASCAM',

    label:
      'FLASCAM',
  },
  {
    value:
      'ASSOCIATION',

    label:
      'Associations',
  },
  {
    value:
      'ADHERENT',

    label:
      'Adhérents',
  },
];

function formatPrice(
  value: number,
) {
  return new Intl.NumberFormat(
    'fr-MA',
    {
      style:
        'currency',

      currency:
        'MAD',

      maximumFractionDigits:
        0,
    },
  ).format(
    value,
  );
}

function formatNumber(
  value: number,
) {
  return new Intl.NumberFormat(
    'fr-FR',
  ).format(
    value,
  );
}

function formatDate(
  value?: string | null,
) {
  if (!value) {
    return '—';
  }

  const date =
    new Date(
      value,
    );

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return '—';
  }

  return new Intl.DateTimeFormat(
    'fr-FR',
    {
      day:
        '2-digit',

      month:
        'short',

      year:
        'numeric',

      hour:
        '2-digit',

      minute:
        '2-digit',
    },
  ).format(
    date,
  );
}

function getStatusClasses(
  status:
    MarketplaceListingStatus,
) {
  switch (status) {
    case 'PUBLISHED':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700';

    case 'PENDING_REVIEW':
      return 'border-amber-200 bg-amber-50 text-amber-700';

    case 'REJECTED':
      return 'border-red-200 bg-red-50 text-red-700';

    case 'SOLD':
      return 'border-violet-200 bg-violet-50 text-violet-700';

    case 'EXPIRED':
    case 'WITHDRAWN':
      return 'border-slate-200 bg-slate-100 text-slate-600';

    case 'DRAFT':
    default:
      return 'border-blue-200 bg-blue-50 text-blue-700';
  }
}

function getSellerLabel(
  listing:
    AdminMarketplaceListing,
) {
  if (
    listing.sellerType ===
    'FLASCAM'
  ) {
    return 'FLASCAM';
  }

  if (
    listing.sellerType ===
    'ASSOCIATION'
  ) {
    return (
      listing.association?.name ||
      'Association'
    );
  }

  return (
    listing.adherent?.displayName ||
    listing.adherent?.legalName ||
    listing.adherent?.membershipNumber ||
    'Adhérent'
  );
}

function getOwnerName(
  listing:
    AdminMarketplaceListing,
) {
  const firstName =
    listing.owner?.firstName?.trim();

  const lastName =
    listing.owner?.lastName?.trim();

  const fullName =
    [
      firstName,
      lastName,
    ]
      .filter(
        Boolean,
      )
      .join(
        ' ',
      );

  return (
    fullName ||
    listing.owner?.email ||
    'Compte inconnu'
  );
}

export default function AdminMarketplaceListingsPage() {
  const [
    listings,
    setListings,
  ] = useState<
    AdminMarketplaceListing[]
  >([]);

  const [
    loading,
    setLoading,
  ] = useState(
    true,
  );

  const [
    error,
    setError,
  ] = useState<
    string | null
  >(null);

  const [
    searchInput,
    setSearchInput,
  ] = useState(
    '',
  );

  const [
    search,
    setSearch,
  ] = useState(
    '',
  );

  const [
    status,
    setStatus,
  ] = useState<
    MarketplaceListingStatus | ''
  >(
    'PENDING_REVIEW',
  );

  const [
    sellerType,
    setSellerType,
  ] = useState<
    MarketplaceSellerType | ''
  >('');

  const [
    page,
    setPage,
  ] = useState(
    1,
  );

  const [
    total,
    setTotal,
  ] = useState(
    0,
  );

  const [
    totalPages,
    setTotalPages,
  ] = useState(
    0,
  );

  const loadListings =
    useCallback(
      async () => {
        setLoading(
          true,
        );

        setError(
          null,
        );

        try {
          const response =
            await getAdminMarketplaceListings({
              page,
              limit:
                20,
              search,
              status,
              sellerType,
            });

          setListings(
            response.items,
          );

          setTotal(
            response.pagination.total,
          );

          setTotalPages(
            response.pagination.totalPages,
          );
        } catch (
          caughtError
        ) {
          setError(
            caughtError instanceof Error
              ? caughtError.message
              : 'Impossible de charger les annonces marketplace.',
          );
        } finally {
          setLoading(
            false,
          );
        }
      },
      [
        page,
        search,
        sellerType,
        status,
      ],
    );

  useEffect(() => {
    void loadListings();
  }, [
    loadListings,
  ]);

  function handleSearchSubmit(
    event:
      React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setPage(
      1,
    );

    setSearch(
      searchInput.trim(),
    );
  }

  return (
    <div
      className="
        mx-auto
        w-full
        max-w-[1700px]
      "
    >
      <header
        className="
          flex
          flex-col
          gap-4
          lg:flex-row
          lg:items-end
          lg:justify-between
        "
      >
        <div>
          <p
            className="
              text-sm
              font-bold
              uppercase
              tracking-[0.16em]
              text-[var(--flascam-terracotta)]
            "
          >
            Administration marketplace
          </p>

          <h1
            className="
              mt-2
              text-3xl
              font-black
              tracking-tight
              text-slate-950
              sm:text-4xl
            "
          >
            Validation des annonces
          </h1>

          <p
            className="
              mt-3
              max-w-3xl
              text-sm
              leading-6
              text-slate-600
              sm:text-base
            "
          >
            Examinez les véhicules soumis par la FLASCAM, les
            associations et les adhérents avant leur mise en ligne.
            Aucune annonce n’est visible publiquement sans votre
            validation.
          </p>
        </div>

        <div
          className="
            rounded-2xl
            border
            border-amber-200
            bg-amber-50
            px-4
            py-3
          "
        >
          <p
            className="
              text-xs
              font-bold
              uppercase
              tracking-wide
              text-amber-700
            "
          >
            En attente
          </p>

          <p
            className="
              mt-1
              text-2xl
              font-black
              text-amber-900
            "
          >
            {status ===
            'PENDING_REVIEW'
              ? total
              : '—'}
          </p>
        </div>
      </header>

      <section
        className="
          mt-7
          rounded-3xl
          border
          border-[var(--flascam-border)]
          bg-white
          p-4
          shadow-[0_20px_60px_rgba(7,53,93,0.06)]
          sm:p-5
        "
      >
        <form
          onSubmit={
            handleSearchSubmit
          }
          className="
            grid
            gap-3
            xl:grid-cols-[minmax(260px,1fr)_230px_220px_auto]
          "
        >
          <label
            className="
              relative
              block
            "
          >
            <span className="sr-only">
              Rechercher
            </span>

            <Search
              size={19}
              className="
                pointer-events-none
                absolute
                left-4
                top-1/2
                -translate-y-1/2
                text-slate-400
              "
            />

            <input
              type="search"
              value={
                searchInput
              }
              onChange={(
                event,
              ) =>
                setSearchInput(
                  event.target.value,
                )
              }
              placeholder="Référence, véhicule ou vendeur…"
              className="
                h-12
                w-full
                rounded-2xl
                border
                border-slate-200
                bg-slate-50
                pl-12
                pr-4
                text-sm
                outline-none
                transition
                placeholder:text-slate-400
                focus:border-[var(--flascam-blue)]
                focus:bg-white
                focus:ring-4
                focus:ring-blue-100
              "
            />
          </label>

          <select
            value={
              status
            }
            onChange={(
              event,
            ) => {
              setPage(
                1,
              );

              setStatus(
                event.target.value as
                  MarketplaceListingStatus | '',
              );
            }}
            className="
              h-12
              rounded-2xl
              border
              border-slate-200
              bg-slate-50
              px-4
              text-sm
              font-semibold
              text-slate-700
              outline-none
              focus:border-[var(--flascam-blue)]
              focus:bg-white
              focus:ring-4
              focus:ring-blue-100
            "
          >
            {STATUS_OPTIONS.map(
              (
                option,
              ) => (
                <option
                  key={
                    option.value ||
                    'ALL'
                  }
                  value={
                    option.value
                  }
                >
                  {
                    option.label
                  }
                </option>
              ),
            )}
          </select>

          <select
            value={
              sellerType
            }
            onChange={(
              event,
            ) => {
              setPage(
                1,
              );

              setSellerType(
                event.target.value as
                  MarketplaceSellerType | '',
              );
            }}
            className="
              h-12
              rounded-2xl
              border
              border-slate-200
              bg-slate-50
              px-4
              text-sm
              font-semibold
              text-slate-700
              outline-none
              focus:border-[var(--flascam-blue)]
              focus:bg-white
              focus:ring-4
              focus:ring-blue-100
            "
          >
            {SELLER_OPTIONS.map(
              (
                option,
              ) => (
                <option
                  key={
                    option.value ||
                    'ALL'
                  }
                  value={
                    option.value
                  }
                >
                  {
                    option.label
                  }
                </option>
              ),
            )}
          </select>

          <button
            type="submit"
            className="
              inline-flex
              h-12
              items-center
              justify-center
              gap-2
              rounded-2xl
              bg-[var(--flascam-blue)]
              px-5
              text-sm
              font-bold
              text-white
              transition
              hover:brightness-95
            "
          >
            <Search
              size={18}
            />

            Rechercher
          </button>
        </form>
      </section>

      {error && (
        <div
          role="alert"
          className="
            mt-5
            flex
            items-start
            gap-3
            rounded-2xl
            border
            border-red-200
            bg-red-50
            p-4
            text-sm
            font-semibold
            text-red-700
          "
        >
          <AlertCircle
            size={20}
            className="
              mt-0.5
              shrink-0
            "
          />

          {error}
        </div>
      )}

      <div
        className="
          mt-6
          flex
          items-center
          justify-between
          gap-4
        "
      >
        <p
          className="
            text-sm
            font-semibold
            text-slate-600
          "
        >
          {total ===
          0
            ? 'Aucune annonce'
            : `${total} annonce${total > 1 ? 's' : ''}`}
        </p>

        <button
          type="button"
          disabled={
            loading
          }
          onClick={() =>
            void loadListings()
          }
          className="
            inline-flex
            items-center
            gap-2
            rounded-xl
            px-3
            py-2
            text-sm
            font-bold
            text-[var(--flascam-blue)]
            transition
            hover:bg-blue-50
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          <RefreshCw
            size={17}
            className={
              loading
                ? 'animate-spin'
                : ''
            }
          />

          Actualiser
        </button>
      </div>

      {loading ? (
        <div
          className="
            mt-5
            grid
            min-h-72
            place-items-center
            rounded-3xl
            border
            border-[var(--flascam-border)]
            bg-white
          "
        >
          <div
            className="
              text-center
              text-slate-600
            "
          >
            <LoaderCircle
              size={34}
              className="
                mx-auto
                animate-spin
                text-[var(--flascam-blue)]
              "
            />

            <p
              className="
                mt-3
                text-sm
                font-semibold
              "
            >
              Chargement des annonces…
            </p>
          </div>
        </div>
      ) : listings.length ===
        0 ? (
        <div
          className="
            mt-5
            rounded-3xl
            border
            border-dashed
            border-slate-300
            bg-white
            px-6
            py-14
            text-center
          "
        >
          <CarFront
            size={44}
            className="
              mx-auto
              text-slate-300
            "
          />

          <h2
            className="
              mt-4
              text-xl
              font-black
              text-slate-900
            "
          >
            Aucune annonce à afficher
          </h2>

          <p
            className="
              mt-2
              text-sm
              text-slate-500
            "
          >
            Modifiez les filtres ou attendez une nouvelle soumission.
          </p>
        </div>
      ) : (
        <div
          className="
            mt-5
            space-y-4
          "
        >
          {listings.map(
            (
              listing,
            ) => {
              const cover =
                listing.media.find(
                  (
                    item,
                  ) =>
                    item.mediaKind ===
                    'IMAGE',
                );

              return (
                <article
                  key={
                    listing.id
                  }
                  className="
                    overflow-hidden
                    rounded-3xl
                    border
                    border-[var(--flascam-border)]
                    bg-white
                    shadow-[0_16px_45px_rgba(7,53,93,0.05)]
                  "
                >
                  <div
                    className="
                      grid
                      gap-0
                      md:grid-cols-[220px_minmax(0,1fr)]
                      xl:grid-cols-[240px_minmax(0,1fr)_280px]
                    "
                  >
                    <div
                      className="
                        relative
                        min-h-52
                        bg-slate-100
                        md:min-h-full
                      "
                    >
                      {cover ? (
                        <img
                          src={
                            cover.url
                          }
                          alt={
                            cover.altText ||
                            listing.title
                          }
                          className="
                            absolute
                            inset-0
                            h-full
                            w-full
                            object-cover
                          "
                        />
                      ) : (
                        <div
                          className="
                            absolute
                            inset-0
                            grid
                            place-items-center
                            text-slate-300
                          "
                        >
                          <CarFront
                            size={48}
                          />
                        </div>
                      )}

                      <span
                        className={`
                          absolute
                          left-3
                          top-3
                          rounded-full
                          border
                          px-3
                          py-1.5
                          text-xs
                          font-black
                          ${getStatusClasses(
                            listing.status,
                          )}
                        `}
                      >
                        {
                          MARKETPLACE_STATUS_LABELS[
                            listing.status
                          ]
                        }
                      </span>
                    </div>

                    <div
                      className="
                        min-w-0
                        p-5
                        sm:p-6
                      "
                    >
                      <p
                        className="
                          text-xs
                          font-bold
                          uppercase
                          tracking-[0.12em]
                          text-slate-400
                        "
                      >
                        {
                          listing.reference
                        }
                      </p>

                      <h2
                        className="
                          mt-1
                          text-xl
                          font-black
                          text-slate-950
                        "
                      >
                        {
                          listing.title
                        }
                      </h2>

                      <p
                        className="
                          mt-2
                          text-lg
                          font-black
                          text-[var(--flascam-terracotta)]
                        "
                      >
                        {formatPrice(
                          listing.requestedPrice,
                        )}
                      </p>

                      <div
                        className="
                          mt-4
                          grid
                          gap-2
                          text-sm
                          text-slate-600
                          sm:grid-cols-2
                          lg:grid-cols-4
                        "
                      >
                        <span
                          className="
                            inline-flex
                            items-center
                            gap-2
                          "
                        >
                          <CalendarClock
                            size={16}
                          />

                          {
                            listing.registrationYear
                          }
                        </span>

                        <span
                          className="
                            inline-flex
                            items-center
                            gap-2
                          "
                        >
                          <Gauge
                            size={16}
                          />

                          {formatNumber(
                            listing.mileageKm,
                          )}
                          {' '}
                          km
                        </span>

                        <span>
                          {
                            MARKETPLACE_FUEL_LABELS[
                              listing.fuelType
                            ]
                          }
                        </span>

                        <span>
                          {
                            MARKETPLACE_TRANSMISSION_LABELS[
                              listing.transmission
                            ]
                          }
                        </span>
                      </div>

                      <div
                        className="
                          mt-5
                          flex
                          flex-wrap
                          gap-2
                        "
                      >
                        <span
                          className="
                            inline-flex
                            items-center
                            gap-2
                            rounded-full
                            bg-blue-50
                            px-3
                            py-1.5
                            text-xs
                            font-bold
                            text-[var(--flascam-blue)]
                          "
                        >
                          <Building2
                            size={14}
                          />

                          {getSellerLabel(
                            listing,
                          )}
                        </span>

                        <span
                          className="
                            inline-flex
                            items-center
                            gap-2
                            rounded-full
                            bg-slate-100
                            px-3
                            py-1.5
                            text-xs
                            font-bold
                            text-slate-600
                          "
                        >
                          <UserRound
                            size={14}
                          />

                          {getOwnerName(
                            listing,
                          )}
                        </span>

                        <span
                          className="
                            inline-flex
                            items-center
                            gap-2
                            rounded-full
                            bg-violet-50
                            px-3
                            py-1.5
                            text-xs
                            font-bold
                            text-violet-700
                          "
                        >
                          <CircleDollarSign
                            size={14}
                          />

                          {
                            listing.offersCount
                          }
                          {' '}
                          offre
                          {listing.offersCount >
                          1
                            ? 's'
                            : ''}
                        </span>
                      </div>
                    </div>

                    <div
                      className="
                        border-t
                        border-slate-100
                        p-5
                        xl:border-l
                        xl:border-t-0
                      "
                    >
                      <div
                        className="
                          space-y-4
                          text-sm
                        "
                      >
                        <div>
                          <p
                            className="
                              text-xs
                              font-bold
                              uppercase
                              tracking-wide
                              text-slate-400
                            "
                          >
                            Soumise le
                          </p>

                          <p
                            className="
                              mt-1
                              font-semibold
                              text-slate-700
                            "
                          >
                            {formatDate(
                              listing.submittedAt,
                            )}
                          </p>
                        </div>

                        <div>
                          <p
                            className="
                              text-xs
                              font-bold
                              uppercase
                              tracking-wide
                              text-slate-400
                            "
                          >
                            Durée demandée
                          </p>

                          <p
                            className="
                              mt-1
                              inline-flex
                              items-center
                              gap-2
                              font-semibold
                              text-slate-700
                            "
                          >
                            <Clock3
                              size={16}
                            />

                            {
                              listing.durationDays
                            }
                            {' '}
                            jour
                            {listing.durationDays >
                            1
                              ? 's'
                              : ''}
                          </p>
                        </div>
                      </div>

                      <Link
                        href={`/admin/marketplace-listings/${listing.id}`}
                        className="
                          mt-5
                          inline-flex
                          min-h-11
                          w-full
                          items-center
                          justify-center
                          gap-2
                          rounded-2xl
                          bg-[var(--flascam-blue)]
                          px-4
                          text-sm
                          font-bold
                          !text-white
                          transition
                          hover:brightness-95
                        "
                      >
                        <Eye
                          size={18}
                        />

                        Examiner l’annonce
                      </Link>
                    </div>
                  </div>
                </article>
              );
            },
          )}
        </div>
      )}

      {!loading &&
        totalPages >
          1 && (
          <nav
            className="
              mt-7
              flex
              items-center
              justify-center
              gap-3
            "
          >
            <button
              type="button"
              disabled={
                page <=
                1
              }
              onClick={() =>
                setPage(
                  (
                    current,
                  ) =>
                    Math.max(
                      1,
                      current -
                        1,
                    ),
                )
              }
              className="
                min-h-11
                rounded-xl
                border
                border-slate-200
                bg-white
                px-4
                text-sm
                font-bold
                text-slate-700
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >
              Précédent
            </button>

            <span
              className="
                text-sm
                font-bold
                text-slate-600
              "
            >
              Page
              {' '}
              {page}
              {' '}
              sur
              {' '}
              {
                totalPages
              }
            </span>

            <button
              type="button"
              disabled={
                page >=
                totalPages
              }
              onClick={() =>
                setPage(
                  (
                    current,
                  ) =>
                    Math.min(
                      totalPages,
                      current +
                        1,
                    ),
                )
              }
              className="
                min-h-11
                rounded-xl
                border
                border-slate-200
                bg-white
                px-4
                text-sm
                font-bold
                text-slate-700
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >
              Suivant
            </button>
          </nav>
        )}
    </div>
  );
}