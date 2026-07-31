'use client';

import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import Link from 'next/link';

import {
  AlertCircle,
  CarFront,
  CircleDollarSign,
  Clock3,
  LoaderCircle,
  Mail,
  Phone,
  RefreshCw,
  SendHorizontal,
  X,
} from 'lucide-react';

import {
  MarketplaceOfferStatusBadge,
} from '@/components/admin/marketplace-offer-status-badge';

import {
  cancelMarketplaceOffer,
  getSentMarketplaceOffers,
} from '@/lib/marketplace-api';

import type {
  MarketplaceOfferStatus,
  SentMarketplaceOffer,
} from '@/types/marketplace';

const STATUS_OPTIONS: Array<{
  value:
    | MarketplaceOfferStatus
    | '';

  label: string;
}> = [
  {
    value:
      '',

    label:
      'Toutes mes offres',
  },
  {
    value:
      'PENDING',

    label:
      'En attente',
  },
  {
    value:
      'ACCEPTED',

    label:
      'Acceptées',
  },
  {
    value:
      'REJECTED',

    label:
      'Refusées',
  },
  {
    value:
      'CANCELLED',

    label:
      'Annulées',
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

function formatDate(
  value?: string | null,
) {
  if (!value) {
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
    new Date(
      value,
    ),
  );
}

export default function SentMarketplaceOffersPage() {
  const [
    offers,
    setOffers,
  ] = useState<
    SentMarketplaceOffer[]
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

  const [
    loading,
    setLoading,
  ] = useState(
    true,
  );

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
        setLoading(
          true,
        );

        setError(
          null,
        );

        try {
          const response =
            await getSentMarketplaceOffers({
              page,
              limit:
                20,
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
              : 'Impossible de charger vos offres.',
          );
        } finally {
          setLoading(
            false,
          );
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

  async function handleCancel(
    offer:
      SentMarketplaceOffer,
  ) {
    const confirmed =
      window.confirm(
        `Annuler votre offre de ${formatPrice(
          offer.amount,
        )} sur « ${offer.listing.title} » ?`,
      );

    if (!confirmed) {
      return;
    }

    setActionLoading(
      offer.id,
    );

    setError(
      null,
    );

    setSuccess(
      null,
    );

    try {
      await cancelMarketplaceOffer(
        offer.id,
      );

      setSuccess(
        'Votre offre a été annulée.',
      );

      await loadOffers();
    } catch (
      caughtError
    ) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'L’annulation de l’offre a échoué.',
      );
    } finally {
      setActionLoading(
        null,
      );
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
          Mes offres envoyées
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
          Suivez vos propositions et accédez aux coordonnées du
          vendeur uniquement lorsqu’une offre est acceptée.
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
                MarketplaceOfferStatus | '',
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
            font-bold
            text-slate-700
            outline-none
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
          type="button"
          disabled={
            loading
          }
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
            hover:bg-blue-50
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
      ) : offers.length ===
        0 ? (
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
          <SendHorizontal
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
            Aucune offre envoyée
          </h2>

          <Link
            href="/marketplace"
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
              text-white
            "
          >
            Découvrir la marketplace
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
            ) => (
              <article
                key={
                  offer.id
                }
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
                        text-slate-300
                      "
                    >
                      <CarFront
                        size={48}
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
                      status={
                        offer.status
                      }
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
                      font-bold
                      uppercase
                      tracking-wide
                      text-slate-400
                    "
                  >
                    {
                      offer.listing.reference
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
                      offer.listing.title
                    }
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
                        {
                          offer.message
                        }
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
                    <Clock3
                      size={15}
                    />

                    Envoyée le
                    {' '}
                    {formatDate(
                      offer.submittedAt,
                    )}
                  </p>

                  {offer.sellerContact && (
                    <div
                      className="
                        mt-5
                        rounded-2xl
                        border
                        border-emerald-200
                        bg-emerald-50
                        p-4
                      "
                    >
                      <p
                        className="
                          text-xs
                          font-black
                          uppercase
                          tracking-wide
                          text-emerald-700
                        "
                      >
                        Coordonnées du vendeur
                      </p>

                      <p
                        className="
                          mt-2
                          font-black
                          text-emerald-900
                        "
                      >
                        {[
                          offer.sellerContact.firstName,
                          offer.sellerContact.lastName,
                        ]
                          .filter(
                            Boolean,
                          )
                          .join(
                            ' ',
                          ) ||
                          'Vendeur'}
                      </p>

                      <a
                        href={`mailto:${offer.sellerContact.email}`}
                        className="
                          mt-3
                          flex
                          items-center
                          gap-2
                          break-all
                          text-sm
                          font-semibold
                          text-emerald-800
                        "
                      >
                        <Mail
                          size={16}
                        />

                        {
                          offer.sellerContact.email
                        }
                      </a>

                      {offer.sellerContact.phone && (
                        <a
                          href={`tel:${offer.sellerContact.phone}`}
                          className="
                            mt-2
                            flex
                            items-center
                            gap-2
                            text-sm
                            font-semibold
                            text-emerald-800
                          "
                        >
                          <Phone
                            size={16}
                          />

                          {
                            offer.sellerContact.phone
                          }
                        </a>
                      )}
                    </div>
                  )}

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
                        hover:bg-slate-50
                      "
                    >
                      Voir le véhicule
                    </Link>

                    {offer.status ===
                      'PENDING' && (
                      <button
                        type="button"
                        disabled={
                          actionLoading ===
                          offer.id
                        }
                        onClick={() =>
                          void handleCancel(
                            offer,
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
                          px-4
                          text-sm
                          font-bold
                          text-red-700
                          hover:bg-red-100
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
                          <X
                            size={17}
                          />
                        )}

                        Annuler mon offre
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ),
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
            >
              Précédent
            </button>

            <span>
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
            >
              Suivant
            </button>
          </nav>
        )}
    </div>
  );
}