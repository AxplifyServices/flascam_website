'use client';

import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import Link from 'next/link';

import {
  AlertCircle,
  Check,
  CircleDollarSign,
  Clock3,
  Inbox,
  LoaderCircle,
  Mail,
  Phone,
  RefreshCw,
  X,
} from 'lucide-react';

import {
  MarketplaceOfferStatusBadge,
} from '@/components/admin/marketplace-offer-status-badge';

import {
  acceptMarketplaceOffer,
  getReceivedMarketplaceOffers,
  rejectMarketplaceOffer,
} from '@/lib/marketplace-api';

import type {
  MarketplaceOfferStatus,
  ReceivedMarketplaceOffer,
} from '@/types/marketplace';

const STATUS_OPTIONS: Array<{
  value: MarketplaceOfferStatus | '';
  label: string;
}> = [
  {
    value: '',
    label: 'Toutes les offres',
  },
  {
    value: 'PENDING',
    label: 'En attente',
  },
  {
    value: 'ACCEPTED',
    label: 'Acceptées',
  },
  {
    value: 'REJECTED',
    label: 'Refusées',
  },
  {
    value: 'CANCELLED',
    label: 'Annulées par l’acheteur',
  },
];

function formatPrice(
  value: number,
) {
  return new Intl.NumberFormat(
    'fr-MA',
    {
      style: 'currency',
      currency: 'MAD',
      maximumFractionDigits: 0,
    },
  ).format(value);
}

function formatDate(
  value?: string | null,
) {
  if (!value) {
    return '—';
  }

  return new Intl.DateTimeFormat(
    'fr-FR',
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    },
  ).format(
    new Date(value),
  );
}

function isAnonymousBuyer(
  buyer: ReceivedMarketplaceOffer['buyer'],
): buyer is {
  label: 'Acheteur anonyme';
} {
  return 'label' in buyer;
}

export default function ReceivedMarketplaceOffersPage() {
  const [
    offers,
    setOffers,
  ] = useState<
    ReceivedMarketplaceOffer[]
  >([]);

  const [
    status,
    setStatus,
  ] = useState<
    MarketplaceOfferStatus | ''
  >('');

  const [
    page,
    setPage,
  ] = useState(1);

  const [
    total,
    setTotal,
  ] = useState(0);

  const [
    totalPages,
    setTotalPages,
  ] = useState(0);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    actionLoading,
    setActionLoading,
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

  const loadOffers =
    useCallback(
      async () => {
        setLoading(true);
        setError(null);

        try {
          const response =
            await getReceivedMarketplaceOffers({
              page,
              limit: 20,
              status,
            });

          setOffers(
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
              : 'Impossible de charger les offres reçues.',
          );
        } finally {
          setLoading(false);
        }
      },
      [
        page,
        status,
      ],
    );

  useEffect(() => {
    void loadOffers();
  }, [
    loadOffers,
  ]);

  async function handleDecision(
    offer: ReceivedMarketplaceOffer,
    decision: 'accept' | 'reject',
  ) {
    const isAccept =
      decision === 'accept';

    const confirmed =
      window.confirm(
        isAccept
          ? `Accepter l’offre de ${formatPrice(
              offer.amount,
            )} sur « ${offer.listing.title} » ? Les coordonnées seront alors partagées entre les deux parties.`
          : `Refuser définitivement l’offre de ${formatPrice(
              offer.amount,
            )} sur « ${offer.listing.title} » ?`,
      );

    if (!confirmed) {
      return;
    }

    setActionLoading(
      offer.id,
    );

    setError(null);
    setSuccess(null);

    try {
      if (isAccept) {
        await acceptMarketplaceOffer(
          offer.id,
        );

        setSuccess(
          'L’offre a été acceptée. Les coordonnées sont désormais partagées.',
        );
      } else {
        await rejectMarketplaceOffer(
          offer.id,
        );

        setSuccess(
          'L’offre a été refusée.',
        );
      }

      await loadOffers();
    } catch (
      caughtError
    ) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Le traitement de l’offre a échoué.',
      );
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div
      className="
        mx-auto
        w-full
        max-w-[1500px]
      "
    >
      <header>
        <p
          className="
            text-sm
            font-bold
            uppercase
            tracking-[0.16em]
            text-[var(--flascam-terracotta)]
          "
        >
          Marketplace
        </p>

        <h1
          className="
            mt-2
            text-3xl
            font-black
            text-slate-950
            sm:text-4xl
          "
        >
          Offres reçues
        </h1>

        <p
          className="
            mt-3
            max-w-3xl
            text-sm
            leading-6
            text-slate-600
          "
        >
          Consultez les propositions reçues sur vos véhicules.
          L’identité de l’acheteur reste protégée jusqu’à votre
          acceptation de son offre.
        </p>
      </header>

      <section
        className="
          mt-7
          flex
          flex-col
          gap-3
          rounded-3xl
          border
          border-slate-200
          bg-white
          p-4
          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >
        <div
          className="
            flex
            flex-col
            gap-3
            sm:flex-row
            sm:items-center
          "
        >
          <select
            value={status}
            onChange={(
              event,
            ) => {
              setPage(1);

              setStatus(
                event.target.value as
                  MarketplaceOfferStatus | '',
              );
            }}
            aria-label="Filtrer les offres reçues par statut"
            className="
              h-12
              rounded-2xl
              border
              border-slate-200
              bg-slate-50
              px-4
              text-sm
              font-bold
              text-slate-700
              outline-none
              focus:border-[var(--flascam-blue)]
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
                  {option.label}
                </option>
              ),
            )}
          </select>

          <p
            className="
              text-sm
              font-semibold
              text-slate-500
            "
          >
            {total}
            {' '}
            offre
            {total > 1
              ? 's'
              : ''}
          </p>
        </div>

        <button
          type="button"
          disabled={loading}
          onClick={() =>
            void loadOffers()
          }
          className="
            inline-flex
            min-h-11
            items-center
            justify-center
            gap-2
            rounded-2xl
            px-4
            text-sm
            font-bold
            text-[var(--flascam-blue)]
            transition
            hover:bg-blue-50
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

      {loading ? (
        <div
          className="
            mt-6
            grid
            min-h-72
            place-items-center
            rounded-3xl
            border
            border-slate-200
            bg-white
          "
        >
          <LoaderCircle
            size={36}
            className="
              animate-spin
              text-[var(--flascam-blue)]
            "
          />
        </div>
      ) : offers.length === 0 ? (
        <div
          className="
            mt-6
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
          <Inbox
            size={46}
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
            Aucune offre reçue
          </h2>

          <p
            className="
              mx-auto
              mt-2
              max-w-xl
              text-sm
              leading-6
              text-slate-500
            "
          >
            Les propositions envoyées sur vos annonces apparaîtront ici.
          </p>

          <Link
            href="/admin/my-marketplace-listings"
            className="
              mt-6
              inline-flex
              min-h-11
              items-center
              justify-center
              rounded-2xl
              bg-[var(--flascam-blue)]
              px-5
              text-sm
              font-black
              !text-white
              transition
              hover:brightness-110
            "
          >
            Voir mes annonces
          </Link>
        </div>
      ) : (
        <div
          className="
            mt-6
            grid
            gap-5
            xl:grid-cols-2
          "
        >
          {offers.map(
            (
              offer,
            ) => {
const buyer =
  offer.buyer;

              return (
                <article
                  key={offer.id}
                  className="
                    overflow-hidden
                    rounded-3xl
                    border
                    border-slate-200
                    bg-white
                    shadow-[0_16px_45px_rgba(7,53,93,0.05)]
                  "
                >
                  <div
                    className="
                      relative
                      aspect-[16/8]
                      bg-slate-100
                    "
                  >
                    {offer.listing.coverUrl ? (
                      <img
                        src={
                          offer.listing.coverUrl
                        }
                        alt={
                          offer.listing.title
                        }
                        className="
                          h-full
                          w-full
                          object-cover
                        "
                      />
                    ) : (
                      <div
                        className="
                          grid
                          h-full
                          place-items-center
                        "
                      >
                        <Inbox
                          size={44}
                          className="text-slate-300"
                        />
                      </div>
                    )}

                    <div
                      className="
                        absolute
                        left-4
                        top-4
                      "
                    >
                      <MarketplaceOfferStatusBadge
                        status={offer.status}
                      />
                    </div>
                  </div>

                  <div
                    className="
                      p-5
                      sm:p-6
                    "
                  >
                    <p
                      className="
                        text-xs
                        font-black
                        uppercase
                        tracking-wide
                        text-slate-400
                      "
                    >
                      {offer.listing.reference}
                    </p>

                    <h2
                      className="
                        mt-1
                        text-xl
                        font-black
                        text-slate-950
                      "
                    >
                      {offer.listing.title}
                    </h2>

                    <div
                      className="
                        mt-4
                        flex
                        items-center
                        gap-2
                      "
                    >
                      <CircleDollarSign
                        size={20}
                        className="
                          text-[var(--flascam-terracotta)]
                        "
                      />

                      <p
                        className="
                          text-2xl
                          font-black
                          text-[var(--flascam-terracotta)]
                        "
                      >
                        {formatPrice(
                          offer.amount,
                        )}
                      </p>
                    </div>

                    <p
                      className="
                        mt-1
                        text-xs
                        text-slate-500
                      "
                    >
                      Prix affiché :
                      {' '}
                      {formatPrice(
                        offer.listing.requestedPrice,
                      )}
                    </p>

                    {offer.message && (
                      <div
                        className="
                          mt-5
                          rounded-2xl
                          bg-slate-50
                          p-4
                        "
                      >
                        <p
                          className="
                            whitespace-pre-line
                            text-sm
                            leading-6
                            text-slate-700
                          "
                        >
                          {offer.message}
                        </p>
                      </div>
                    )}

                    <p
                      className="
                        mt-4
                        inline-flex
                        items-center
                        gap-2
                        text-xs
                        font-semibold
                        text-slate-500
                      "
                    >
                      <Clock3 size={15} />

                      Reçue le
                      {' '}
                      {formatDate(
                        offer.submittedAt,
                      )}
                    </p>

                    <div
                      className="
                        mt-5
                        rounded-2xl
                        border
                        border-slate-200
                        bg-slate-50
                        p-4
                      "
                    >
                      <p
                        className="
                          text-xs
                          font-black
                          uppercase
                          tracking-wide
                          text-slate-500
                        "
                      >
                        Acheteur
                      </p>

                      {isAnonymousBuyer(buyer) ? (
                        <p
                          className="
                            mt-2
                            text-sm
                            font-bold
                            text-slate-700
                          "
                        >
                          Acheteur anonyme — ses coordonnées seront
                          visibles uniquement après acceptation.
                        </p>
                      ) : (
                        <>
                          <p
                            className="
                              mt-2
                              font-black
                              text-slate-900
                            "
                          >
                            {[
                              buyer.firstName,
                              buyer.lastName,
                            ]
                              .filter(Boolean)
                              .join(' ') ||
                              'Acheteur'}
                          </p>

                          <a
                            href={`mailto:${buyer.email}`}
                            className="
                              mt-3
                              flex
                              items-center
                              gap-2
                              break-all
                              text-sm
                              font-semibold
                              text-[var(--flascam-blue)]
                            "
                          >
                            <Mail
                              size={16}
                              aria-hidden="true"
                            />

                            {buyer.email}
                          </a>

                          {buyer.phone && (
                            <a
                              href={`tel:${buyer.phone}`}
                              className="
                                mt-2
                                flex
                                items-center
                                gap-2
                                text-sm
                                font-semibold
                                text-[var(--flascam-blue)]
                              "
                            >
                              <Phone
                                size={16}
                                aria-hidden="true"
                              />

                              {buyer.phone}
                            </a>
                          )}
                        </>
                      )}
                    </div>

                    <div
                      className="
                        mt-5
                        grid
                        gap-3
                        sm:grid-cols-2
                      "
                    >
                      <Link
                        href={`/marketplace/${offer.listing.slug}`}
                        className="
                          inline-flex
                          min-h-11
                          items-center
                          justify-center
                          rounded-2xl
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
                        Voir le véhicule
                      </Link>

                      {offer.status === 'PENDING' && (
                        <div
                          className="
                            grid
                            grid-cols-2
                            gap-2
                          "
                        >
                          <button
                            type="button"
                            disabled={
                              actionLoading ===
                              offer.id
                            }
                            onClick={() =>
                              void handleDecision(
                                offer,
                                'reject',
                              )
                            }
                            className="
                              inline-flex
                              min-h-11
                              items-center
                              justify-center
                              gap-2
                              rounded-2xl
                              border
                              border-red-200
                              bg-red-50
                              px-3
                              text-sm
                              font-bold
                              text-red-700
                              transition
                              hover:bg-red-100
                              disabled:opacity-50
                            "
                          >
                            <X size={17} />

                            Refuser
                          </button>

                          <button
                            type="button"
                            disabled={
                              actionLoading ===
                              offer.id
                            }
                            onClick={() =>
                              void handleDecision(
                                offer,
                                'accept',
                              )
                            }
                            className="
                              inline-flex
                              min-h-11
                              items-center
                              justify-center
                              gap-2
                              rounded-2xl
                              bg-[var(--flascam-terracotta)]
                              px-3
                              text-sm
                              font-black
                              text-white
                              transition
                              hover:-translate-y-0.5
                              hover:brightness-105
                              disabled:opacity-50
                            "
                          >
                            {actionLoading ===
                            offer.id ? (
                              <LoaderCircle
                                size={17}
                                className="animate-spin"
                              />
                            ) : (
                              <Check size={17} />
                            )}

                            Accepter
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              );
            },
          )}
        </div>
      )}

      {!loading &&
        totalPages > 1 && (
          <nav
            aria-label="Pagination des offres reçues"
            className="
              mt-7
              flex
              flex-wrap
              items-center
              justify-center
              gap-3
            "
          >
            <button
              type="button"
              disabled={
                page <= 1
              }
              onClick={() =>
                setPage(
                  (
                    current,
                  ) =>
                    Math.max(
                      1,
                      current - 1,
                    ),
                )
              }
              className="
                min-h-10
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
                font-semibold
                text-slate-500
              "
            >
              Page
              {' '}
              {page}
              {' '}
              sur
              {' '}
              {totalPages}
            </span>

            <button
              type="button"
              disabled={
                page >= totalPages
              }
              onClick={() =>
                setPage(
                  (
                    current,
                  ) =>
                    Math.min(
                      totalPages,
                      current + 1,
                    ),
                )
              }
              className="
                min-h-10
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