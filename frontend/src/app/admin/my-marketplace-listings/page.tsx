'use client';

import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import Link from 'next/link';

import {
  AlertCircle,
  CalendarClock,
  CarFront,
  CircleDollarSign,
  Clock3,
  Eye,
  FilePenLine,
  Gauge,
  LoaderCircle,
  Plus,
  RefreshCw,
  Search,
  Send,
  XCircle,
} from 'lucide-react';

import {
  getMyMarketplaceListings,
  submitMarketplaceListing,
  withdrawMarketplaceListing,
} from '@/lib/marketplace-api';

import type {
  MarketplaceListing,
  MarketplaceListingStatus,
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
      'DRAFT',

    label:
      'Brouillons',
  },
  {
    value:
      'PENDING_REVIEW',

    label:
      'En attente',
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

function formatMileage(
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

export default function MyMarketplaceListingsPage() {
  const [
    listings,
    setListings,
  ] = useState<
    MarketplaceListing[]
  >([]);

  const [
    loading,
    setLoading,
  ] = useState(
    true,
  );

  const [
    actionId,
    setActionId,
  ] = useState<
    string | null
  >(null);

  const [
    error,
    setError,
  ] = useState<
    string | null
  >(null);

  const [
    success,
    setSuccess,
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
  >('');

  const [
    page,
    setPage,
  ] = useState(
    1,
  );

  const [
    totalPages,
    setTotalPages,
  ] = useState(
    0,
  );

  const [
    total,
    setTotal,
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
            await getMyMarketplaceListings({
              page,
              limit:
                12,
              search,
              status,
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
              : 'Impossible de charger vos annonces.',
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

  function handleStatusChange(
    value:
      MarketplaceListingStatus | '',
  ) {
    setPage(
      1,
    );

    setStatus(
      value,
    );
  }

  async function handleSubmitListing(
    listing:
      MarketplaceListing,
  ) {
    const confirmed =
      window.confirm(
        `Soumettre l’annonce « ${listing.title} » à la validation de la FLASCAM ?`,
      );

    if (!confirmed) {
      return;
    }

    setActionId(
      listing.id,
    );

    setError(
      null,
    );

    setSuccess(
      null,
    );

    try {
      await submitMarketplaceListing(
        listing.id,
      );

      setSuccess(
        'L’annonce a été envoyée à la FLASCAM pour validation.',
      );

      await loadListings();
    } catch (
      caughtError
    ) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'La soumission de l’annonce a échoué.',
      );
    } finally {
      setActionId(
        null,
      );
    }
  }

  async function handleWithdrawListing(
    listing:
      MarketplaceListing,
  ) {
    const confirmed =
      window.confirm(
        listing.status ===
          'PUBLISHED'
          ? 'Retirer cette annonce de la marketplace ? Les offres en attente seront automatiquement fermées.'
          : 'Annuler la soumission de cette annonce ?',
      );

    if (!confirmed) {
      return;
    }

    setActionId(
      listing.id,
    );

    setError(
      null,
    );

    setSuccess(
      null,
    );

    try {
      await withdrawMarketplaceListing(
        listing.id,
      );

      setSuccess(
        'L’annonce a été retirée.',
      );

      await loadListings();
    } catch (
      caughtError
    ) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Le retrait de l’annonce a échoué.',
      );
    } finally {
      setActionId(
        null,
      );
    }
  }

  return (
    <div
      className="
        mx-auto
        w-full
        max-w-[1600px]
      "
    >
      <header
        className="
          flex
          flex-col
          gap-5
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
            Marketplace FLASCAM
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
            Mes annonces
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
            Présentez vos véhicules, choisissez leur durée de
            publication et suivez leur validation par la FLASCAM.
            Votre identité reste invisible dans la marketplace.
          </p>
        </div>

        <Link
          href="/admin/my-marketplace-listings/new"
          className="
            inline-flex
            min-h-12
            items-center
            justify-center
            gap-2
            rounded-2xl
            bg-[var(--flascam-terracotta)]
            px-5
            py-3
            text-sm
            font-bold
            text-white
            shadow-[0_14px_35px_rgba(184,91,63,0.22)]
            transition
            hover:-translate-y-0.5
            hover:brightness-95
          "
        >
          <Plus
            size={19}
          />

          Déposer un véhicule
        </Link>
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
            lg:grid-cols-[minmax(0,1fr)_240px_auto]
          "
        >
          <label
            className="
              relative
              block
            "
          >
            <span className="sr-only">
              Rechercher une annonce
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
              placeholder="Référence, marque, modèle…"
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
            ) =>
              handleStatusChange(
                event.target.value as
                  MarketplaceListingStatus | '',
              )
            }
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
              transition
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

          <span>
            {error}
          </span>
        </div>
      )}

      {success && (
        <div
          className="
            mt-5
            rounded-2xl
            border
            border-emerald-200
            bg-emerald-50
            p-4
            text-sm
            font-semibold
            text-emerald-700
          "
        >
          {success}
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
          {total === 0
            ? 'Aucune annonce'
            : `${total} annonce${total > 1 ? 's' : ''}`}
        </p>

        <button
          type="button"
          onClick={() =>
            void loadListings()
          }
          disabled={
            loading
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
          <div
            className="
              mx-auto
              grid
              size-16
              place-items-center
              rounded-2xl
              bg-blue-50
              text-[var(--flascam-blue)]
            "
          >
            <CarFront
              size={30}
            />
          </div>

          <h2
            className="
              mt-5
              text-xl
              font-black
              text-slate-950
            "
          >
            Aucun véhicule déposé
          </h2>

          <p
            className="
              mx-auto
              mt-2
              max-w-xl
              text-sm
              leading-6
              text-slate-600
            "
          >
            Créez votre première annonce. Elle restera en brouillon
            jusqu’à ce que vous décidiez de l’envoyer à la FLASCAM.
          </p>

          <Link
            href="/admin/my-marketplace-listings/new"
            className="
              mt-6
              inline-flex
              min-h-11
              items-center
              justify-center
              gap-2
              rounded-2xl
              bg-[var(--flascam-terracotta)]
              px-5
              text-sm
              font-bold
              text-white
            "
          >
            <Plus
              size={18}
            />

            Déposer un véhicule
          </Link>
        </div>
      ) : (
        <div
          className="
            mt-5
            grid
            gap-5
            xl:grid-cols-2
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

              const busy =
                actionId ===
                listing.id;

              const canEdit =
                listing.status ===
                  'DRAFT' ||
                listing.status ===
                  'REJECTED';

              const canSubmit =
                listing.status ===
                'DRAFT';

              const canWithdraw =
                listing.status ===
                  'PENDING_REVIEW' ||
                listing.status ===
                  'PUBLISHED';

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
                    shadow-[0_18px_50px_rgba(7,53,93,0.06)]
                  "
                >
                  <div
                    className="
                      grid
                      gap-0
                      sm:grid-cols-[210px_minmax(0,1fr)]
                    "
                  >
                    <div
                      className="
                        relative
                        min-h-52
                        bg-slate-100
                        sm:min-h-full
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
                            text-slate-400
                          "
                        >
                          <CarFront
                            size={44}
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
                      "
                    >
                      <div
                        className="
                          flex
                          items-start
                          justify-between
                          gap-4
                        "
                      >
                        <div
                          className="
                            min-w-0
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
                              line-clamp-2
                              text-xl
                              font-black
                              text-slate-950
                            "
                          >
                            {
                              listing.title
                            }
                          </h2>
                        </div>

                        <div
                          className="
                            shrink-0
                            text-right
                          "
                        >
                          <p
                            className="
                              text-lg
                              font-black
                              text-[var(--flascam-blue)]
                            "
                          >
                            {formatPrice(
                              listing.requestedPrice,
                            )}
                          </p>
                        </div>
                      </div>

                      <div
                        className="
                          mt-4
                          grid
                          grid-cols-2
                          gap-2
                          text-sm
                          text-slate-600
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

                          {formatMileage(
                            listing.mileageKm,
                          )}{' '}
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
                          mt-4
                          flex
                          flex-wrap
                          gap-2
                          text-xs
                          font-semibold
                          text-slate-500
                        "
                      >
                        <span
                          className="
                            inline-flex
                            items-center
                            gap-1.5
                            rounded-full
                            bg-slate-100
                            px-3
                            py-1.5
                          "
                        >
                          <Clock3
                            size={14}
                          />

                          Durée :
                          {' '}
                          {
                            listing.durationDays
                          }
                          {' '}
                          jour
                          {
                            listing.durationDays >
                            1
                              ? 's'
                              : ''
                          }
                        </span>

                        {listing.status ===
                          'PUBLISHED' &&
                          listing.remainingDays !==
                            null &&
                          listing.remainingDays !==
                            undefined && (
                            <span
                              className="
                                rounded-full
                                bg-emerald-50
                                px-3
                                py-1.5
                                text-emerald-700
                              "
                            >
                              {
                                listing.remainingDays
                              }
                              {' '}
                              jour
                              {
                                listing.remainingDays >
                                1
                                  ? 's'
                                  : ''
                              }
                              {' '}
                              restant
                              {
                                listing.remainingDays >
                                1
                                  ? 's'
                                  : ''
                              }
                            </span>
                          )}

                        {listing.offersCount >
                          0 && (
                          <span
                            className="
                              inline-flex
                              items-center
                              gap-1.5
                              rounded-full
                              bg-violet-50
                              px-3
                              py-1.5
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
                            {
                              listing.offersCount >
                              1
                                ? 's'
                                : ''
                            }
                          </span>
                        )}
                      </div>

                      {listing.status ===
                        'REJECTED' &&
                        listing.rejectionReason && (
                          <div
                            className="
                              mt-4
                              rounded-2xl
                              border
                              border-red-200
                              bg-red-50
                              p-3
                            "
                          >
                            <p
                              className="
                                text-xs
                                font-black
                                uppercase
                                tracking-wide
                                text-red-700
                              "
                            >
                              Motif du refus
                            </p>

                            <p
                              className="
                                mt-1
                                text-sm
                                leading-5
                                text-red-700
                              "
                            >
                              {
                                listing.rejectionReason
                              }
                            </p>
                          </div>
                        )}

                      <p
                        className="
                          mt-4
                          text-xs
                          text-slate-400
                        "
                      >
                        Mise à jour le
                        {' '}
                        {formatDate(
                          listing.updatedAt,
                        )}
                      </p>
                    </div>
                  </div>

                  <div
                    className="
                      flex
                      flex-wrap
                      gap-2
                      border-t
                      border-slate-100
                      p-4
                    "
                  >
                    <Link
                      href={`/admin/my-marketplace-listings/${listing.id}`}
                      className="
                        inline-flex
                        min-h-10
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        border
                        border-slate-200
                        px-4
                        text-sm
                        font-bold
                        text-slate-700
                        transition
                        hover:bg-slate-50
                      "
                    >
                      <Eye
                        size={17}
                      />

                      Consulter
                    </Link>

                    {canEdit && (
                      <Link
                        href={`/admin/my-marketplace-listings/${listing.id}/edit`}
                        className="
                          inline-flex
                          min-h-10
                          items-center
                          justify-center
                          gap-2
                          rounded-xl
                          border
                          border-blue-200
                          bg-blue-50
                          px-4
                          text-sm
                          font-bold
                          text-[var(--flascam-blue)]
                          transition
                          hover:bg-blue-100
                        "
                      >
                        <FilePenLine
                          size={17}
                        />

                        Modifier
                      </Link>
                    )}

                    {canSubmit && (
                      <button
                        type="button"
                        disabled={
                          busy
                        }
                        onClick={() =>
                          void handleSubmitListing(
                            listing,
                          )
                        }
                        className="
                          inline-flex
                          min-h-10
                          items-center
                          justify-center
                          gap-2
                          rounded-xl
                          bg-[var(--flascam-blue)]
                          px-4
                          text-sm
                          font-bold
                          text-white
                          transition
                          hover:brightness-95
                          disabled:cursor-not-allowed
                          disabled:opacity-50
                        "
                      >
                        {busy ? (
                          <LoaderCircle
                            size={17}
                            className="animate-spin"
                          />
                        ) : (
                          <Send
                            size={17}
                          />
                        )}

                        Soumettre
                      </button>
                    )}

                    {canWithdraw && (
                      <button
                        type="button"
                        disabled={
                          busy
                        }
                        onClick={() =>
                          void handleWithdrawListing(
                            listing,
                          )
                        }
                        className="
                          inline-flex
                          min-h-10
                          items-center
                          justify-center
                          gap-2
                          rounded-xl
                          border
                          border-red-200
                          bg-red-50
                          px-4
                          text-sm
                          font-bold
                          text-red-700
                          transition
                          hover:bg-red-100
                          disabled:cursor-not-allowed
                          disabled:opacity-50
                        "
                      >
                        {busy ? (
                          <LoaderCircle
                            size={17}
                            className="animate-spin"
                          />
                        ) : (
                          <XCircle
                            size={17}
                          />
                        )}

                        Retirer
                      </button>
                    )}
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
            aria-label="Pagination des annonces"
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