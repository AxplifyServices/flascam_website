'use client';

import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import Link from 'next/link';

import {
  useParams,
  useRouter,
} from 'next/navigation';

import {
  AlertCircle,
  ArrowLeft,
  Building2,
  CalendarClock,
  CarFront,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  FileCheck2,
  Images,
  LoaderCircle,
  Mail,
  MapPin,
  Phone,
  Send,
  Settings2,
  ShieldCheck,
  UserRound,
  Users,
  XCircle,
} from 'lucide-react';

import {
  approveMarketplaceListing,
  getAdminMarketplaceListingById,
  rejectMarketplaceListing,
} from '@/lib/marketplace-api';

import type {
  AdminMarketplaceListing,
  MarketplaceListingStatus,
} from '@/types/marketplace';

import {
  MARKETPLACE_FUEL_LABELS,
  MARKETPLACE_STATUS_LABELS,
  MARKETPLACE_TRANSMISSION_LABELS,
  MARKETPLACE_VEHICLE_TYPE_LABELS,
} from '@/types/marketplace';

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
  value?: number | null,
) {
  if (
    value === null ||
    value === undefined
  ) {
    return '—';
  }

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
        'long',

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

function getPersonName(
  firstName?: string | null,
  lastName?: string | null,
) {
  return [
    firstName?.trim(),
    lastName?.trim(),
  ]
    .filter(
      Boolean,
    )
    .join(
      ' ',
    ) || '—';
}

function getSellerName(
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

type InformationItemProps = {
  label: string;

  value:
    | string
    | number;
};

function InformationItem({
  label,
  value,
}: InformationItemProps) {
  return (
    <div
      className="
        rounded-2xl
        border
        border-slate-100
        bg-slate-50
        p-4
      "
    >
      <p
        className="
          text-xs
          font-bold
          uppercase
          tracking-[0.08em]
          text-slate-400
        "
      >
        {label}
      </p>

      <p
        className="
          mt-1
          break-words
          text-sm
          font-bold
          text-slate-800
        "
      >
        {value}
      </p>
    </div>
  );
}

export default function AdminMarketplaceListingDetailPage() {
  const params =
    useParams<{
      id: string;
    }>();

  const router =
    useRouter();

  const listingId =
    typeof params.id ===
    'string'
      ? params.id
      : '';

  const [
    listing,
    setListing,
  ] = useState<
    AdminMarketplaceListing | null
  >(null);

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
    'approve'
    | 'reject'
    | null
  >(null);

  const [
    rejectOpen,
    setRejectOpen,
  ] = useState(
    false,
  );

  const [
    rejectionReason,
    setRejectionReason,
  ] = useState(
    '',
  );

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

  const loadListing =
    useCallback(
      async () => {
        if (!listingId) {
          setError(
            'Identifiant de l’annonce invalide.',
          );

          setLoading(
            false,
          );

          return;
        }

        setLoading(
          true,
        );

        setError(
          null,
        );

        try {
          const response =
            await getAdminMarketplaceListingById(
              listingId,
            );

          setListing(
            response,
          );
        } catch (
          caughtError
        ) {
          setError(
            caughtError instanceof Error
              ? caughtError.message
              : 'Impossible de charger cette annonce.',
          );
        } finally {
          setLoading(
            false,
          );
        }
      },
      [
        listingId,
      ],
    );

  useEffect(() => {
    void loadListing();
  }, [
    loadListing,
  ]);

  async function handleApprove() {
    if (
      !listing ||
      listing.status !==
        'PENDING_REVIEW'
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        `Valider et publier l’annonce « ${listing.title} » pendant ${listing.durationDays} jour${listing.durationDays > 1 ? 's' : ''} ?`,
      );

    if (!confirmed) {
      return;
    }

    setActionLoading(
      'approve',
    );

    setError(
      null,
    );

    setSuccess(
      null,
    );

    try {
      const updated =
        await approveMarketplaceListing(
          listing.id,
        );

      setListing(
        updated,
      );

      setRejectOpen(
        false,
      );

      setRejectionReason(
        '',
      );

      setSuccess(
        'L’annonce a été validée et publiée dans la marketplace.',
      );
    } catch (
      caughtError
    ) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'La validation de l’annonce a échoué.',
      );
    } finally {
      setActionLoading(
        null,
      );
    }
  }

  async function handleReject(
    event:
      React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (
      !listing ||
      listing.status !==
        'PENDING_REVIEW'
    ) {
      return;
    }

    const normalizedReason =
      rejectionReason
        .trim()
        .replace(
          /\s+/g,
          ' ',
        );

    if (
      normalizedReason.length <
      10
    ) {
      setError(
        'Le motif du refus doit contenir au moins 10 caractères.',
      );

      return;
    }

    const confirmed =
      window.confirm(
        'Confirmer le refus de cette annonce ? Le vendeur pourra la corriger puis la soumettre à nouveau.',
      );

    if (!confirmed) {
      return;
    }

    setActionLoading(
      'reject',
    );

    setError(
      null,
    );

    setSuccess(
      null,
    );

    try {
      const updated =
        await rejectMarketplaceListing(
          listing.id,
          normalizedReason,
        );

      setListing(
        updated,
      );

      setRejectOpen(
        false,
      );

      setRejectionReason(
        '',
      );

      setSuccess(
        'L’annonce a été refusée. Le motif sera visible par le vendeur.',
      );
    } catch (
      caughtError
    ) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Le refus de l’annonce a échoué.',
      );
    } finally {
      setActionLoading(
        null,
      );
    }
  }

  if (loading) {
    return (
      <div
        className="
          grid
          min-h-[500px]
          place-items-center
        "
      >
        <div
          className="
            text-center
            text-slate-600
          "
        >
          <LoaderCircle
            size={38}
            className="
              mx-auto
              animate-spin
              text-[var(--flascam-blue)]
            "
          />

          <p
            className="
              mt-4
              text-sm
              font-bold
            "
          >
            Chargement de l’annonce…
          </p>
        </div>
      </div>
    );
  }

  if (
    error &&
    !listing
  ) {
    return (
      <div
        className="
          mx-auto
          max-w-3xl
          rounded-3xl
          border
          border-red-200
          bg-red-50
          p-8
          text-center
        "
      >
        <AlertCircle
          size={38}
          className="
            mx-auto
            text-red-600
          "
        />

        <h1
          className="
            mt-4
            text-xl
            font-black
            text-red-800
          "
        >
          Impossible d’afficher l’annonce
        </h1>

        <p
          className="
            mt-2
            text-sm
            text-red-700
          "
        >
          {error}
        </p>

        <Link
          href="/admin/marketplace-listings"
          className="
            mt-6
            inline-flex
            min-h-11
            items-center
            justify-center
            gap-2
            rounded-2xl
            bg-[var(--flascam-blue)]
            px-5
            text-sm
            font-bold
            text-white
          "
        >
          <ArrowLeft
            size={18}
          />

          Retour aux annonces
        </Link>
      </div>
    );
  }

  if (!listing) {
    return null;
  }

  const images =
    listing.media.filter(
      (
        item,
      ) =>
        item.mediaKind ===
        'IMAGE',
    );

  const videos =
    listing.media.filter(
      (
        item,
      ) =>
        item.mediaKind ===
        'VIDEO',
    );

  const canReview =
    listing.status ===
    'PENDING_REVIEW';

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
          gap-5
          lg:flex-row
          lg:items-end
          lg:justify-between
        "
      >
        <div>
          <button
            type="button"
            onClick={() =>
              router.push(
                '/admin/marketplace-listings',
              )
            }
            className="
              inline-flex
              items-center
              gap-2
              text-sm
              font-bold
              text-[var(--flascam-blue)]
              transition
              hover:opacity-70
            "
          >
            <ArrowLeft
              size={18}
            />

            Retour à la validation
          </button>

          <div
            className="
              mt-5
              flex
              flex-wrap
              items-center
              gap-3
            "
          >
            <span
              className={`
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

            <span
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
            </span>
          </div>

          <h1
            className="
              mt-3
              text-3xl
              font-black
              tracking-tight
              text-slate-950
              sm:text-4xl
            "
          >
            {listing.title}
          </h1>

          <p
            className="
              mt-3
              text-xl
              font-black
              text-[var(--flascam-terracotta)]
            "
          >
            {formatPrice(
              listing.requestedPrice,
            )}
          </p>
        </div>

        {canReview && (
          <div
            className="
              flex
              flex-wrap
              gap-3
            "
          >
            <button
              type="button"
              disabled={
                actionLoading !==
                null
              }
              onClick={() =>
                setRejectOpen(
                  true,
                )
              }
              className="
                inline-flex
                min-h-12
                items-center
                justify-center
                gap-2
                rounded-2xl
                border
                border-red-200
                bg-red-50
                px-5
                text-sm
                font-bold
                text-red-700
                transition
                hover:bg-red-100
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              <XCircle
                size={18}
              />

              Refuser
            </button>

            <button
              type="button"
              disabled={
                actionLoading !==
                null
              }
              onClick={() =>
                void handleApprove()
              }
              className="
                inline-flex
                min-h-12
                items-center
                justify-center
                gap-2
                rounded-2xl
                bg-emerald-600
                px-5
                text-sm
                font-bold
                text-white
                transition
                hover:bg-emerald-700
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {actionLoading ===
              'approve' ? (
                <LoaderCircle
                  size={18}
                  className="animate-spin"
                />
              ) : (
                <FileCheck2
                  size={18}
                />
              )}

              Valider et publier
            </button>
          </div>
        )}
      </header>

      {error && (
        <div
          role="alert"
          className="
            mt-6
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
            mt-6
            flex
            items-start
            gap-3
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
          <CheckCircle2
            size={20}
            className="
              mt-0.5
              shrink-0
            "
          />

          {success}
        </div>
      )}

      {!canReview && (
        <div
          className="
            mt-6
            flex
            items-start
            gap-3
            rounded-2xl
            border
            border-slate-200
            bg-slate-50
            p-4
            text-sm
            text-slate-700
          "
        >
          <ShieldCheck
            size={20}
            className="
              mt-0.5
              shrink-0
              text-slate-500
            "
          />

          <span>
            Cette annonce a déjà été traitée. Aucune nouvelle décision
            n’est possible dans son état actuel.
          </span>
        </div>
      )}

      {rejectOpen &&
        canReview && (
          <section
            className="
              mt-6
              rounded-3xl
              border
              border-red-200
              bg-red-50
              p-5
              sm:p-6
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
              <div>
                <h2
                  className="
                    text-lg
                    font-black
                    text-red-900
                  "
                >
                  Refuser l’annonce
                </h2>

                <p
                  className="
                    mt-1
                    text-sm
                    leading-6
                    text-red-700
                  "
                >
                  Indiquez précisément ce que le vendeur doit corriger.
                  Ce motif sera visible dans son espace.
                </p>
              </div>

              <button
                type="button"
                disabled={
                  actionLoading !==
                  null
                }
                onClick={() => {
                  setRejectOpen(
                    false,
                  );

                  setError(
                    null,
                  );
                }}
                className="
                  grid
                  size-10
                  shrink-0
                  place-items-center
                  rounded-xl
                  border
                  border-red-200
                  bg-white
                  text-red-700
                  transition
                  hover:bg-red-100
                "
                aria-label="Fermer le formulaire de refus"
              >
                <XCircle
                  size={19}
                />
              </button>
            </div>

            <form
              onSubmit={
                handleReject
              }
              className="
                mt-5
              "
            >
              <label>
                <span
                  className="
                    mb-2
                    block
                    text-sm
                    font-bold
                    text-red-900
                  "
                >
                  Motif du refus
                  {' '}
                  <span className="text-red-600">
                    *
                  </span>
                </span>

                <textarea
                  value={
                    rejectionReason
                  }
                  onChange={(
                    event,
                  ) =>
                    setRejectionReason(
                      event.target.value,
                    )
                  }
                  minLength={
                    10
                  }
                  maxLength={
                    2000
                  }
                  required
                  placeholder="Ex. Les photos ne permettent pas de vérifier correctement l’état général du véhicule. Merci d’ajouter une vue avant, arrière et intérieure."
                  className="
                    min-h-32
                    w-full
                    resize-y
                    rounded-2xl
                    border
                    border-red-200
                    bg-white
                    px-4
                    py-3
                    text-sm
                    leading-6
                    text-slate-900
                    outline-none
                    transition
                    placeholder:text-slate-400
                    focus:border-red-400
                    focus:ring-4
                    focus:ring-red-100
                  "
                />
              </label>

              <div
                className="
                  mt-4
                  flex
                  flex-wrap
                  justify-end
                  gap-3
                "
              >
                <button
                  type="button"
                  disabled={
                    actionLoading !==
                    null
                  }
                  onClick={() => {
                    setRejectOpen(
                      false,
                    );

                    setRejectionReason(
                      '',
                    );

                    setError(
                      null,
                    );
                  }}
                  className="
                    inline-flex
                    min-h-11
                    items-center
                    justify-center
                    rounded-2xl
                    border
                    border-slate-200
                    bg-white
                    px-5
                    text-sm
                    font-bold
                    text-slate-700
                    transition
                    hover:bg-slate-50
                  "
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  disabled={
                    actionLoading !==
                    null
                  }
                  className="
                    inline-flex
                    min-h-11
                    items-center
                    justify-center
                    gap-2
                    rounded-2xl
                    bg-red-600
                    px-5
                    text-sm
                    font-bold
                    text-white
                    transition
                    hover:bg-red-700
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  {actionLoading ===
                  'reject' ? (
                    <LoaderCircle
                      size={18}
                      className="animate-spin"
                    />
                  ) : (
                    <Send
                      size={18}
                    />
                  )}

                  Confirmer le refus
                </button>
              </div>
            </form>
          </section>
        )}

      <div
        className="
          mt-7
          grid
          gap-6
          xl:grid-cols-[minmax(0,1fr)_390px]
        "
      >
        <div
          className="
            space-y-6
          "
        >
          <section
            className="
              overflow-hidden
              rounded-3xl
              border
              border-[var(--flascam-border)]
              bg-white
              shadow-[0_18px_50px_rgba(7,53,93,0.05)]
            "
          >
            <div
              className="
                flex
                items-center
                gap-3
                border-b
                border-slate-100
                p-5
                sm:p-6
              "
            >
              <Images
                size={22}
                className="
                  text-[var(--flascam-blue)]
                "
              />

              <div>
                <h2
                  className="
                    text-lg
                    font-black
                    text-slate-950
                  "
                >
                  Médias à examiner
                </h2>

                <p
                  className="
                    text-sm
                    text-slate-500
                  "
                >
                  {images.length}
                  {' '}
                  image
                  {images.length >
                  1
                    ? 's'
                    : ''}
                  {videos.length >
                  0
                    ? ' et 1 vidéo'
                    : ''}
                </p>
              </div>
            </div>

            {listing.media.length ===
            0 ? (
              <div
                className="
                  grid
                  min-h-64
                  place-items-center
                  bg-slate-50
                  p-8
                  text-center
                "
              >
                <div>
                  <AlertCircle
                    size={48}
                    className="
                      mx-auto
                      text-amber-500
                    "
                  />

                  <p
                    className="
                      mt-4
                      text-sm
                      font-bold
                      text-slate-600
                    "
                  >
                    Aucun média rattaché à l’annonce
                  </p>
                </div>
              </div>
            ) : (
              <div
                className="
                  grid
                  gap-3
                  p-4
                  sm:grid-cols-2
                  lg:grid-cols-3
                  sm:p-5
                "
              >
                {listing.media.map(
                  (
                    media,
                    index,
                  ) => (
                    <div
                      key={
                        media.id
                      }
                      className="
                        relative
                        overflow-hidden
                        rounded-2xl
                        border
                        border-slate-200
                        bg-slate-100
                      "
                    >
                      <div
                        className="
                          aspect-[4/3]
                        "
                      >
                        {media.mediaKind ===
                        'IMAGE' ? (
                          <img
                            src={
                              media.url
                            }
                            alt={
                              media.altText ||
                              listing.title
                            }
                            className="
                              h-full
                              w-full
                              object-cover
                            "
                          />
                        ) : (
                          <video
                            src={
                              media.url
                            }
                            controls
                            preload="metadata"
                            className="
                              h-full
                              w-full
                              object-cover
                            "
                          />
                        )}
                      </div>

                      <span
                        className="
                          absolute
                          left-3
                          top-3
                          rounded-full
                          bg-slate-950/75
                          px-3
                          py-1.5
                          text-xs
                          font-black
                          text-white
                        "
                      >
                        {index ===
                        0
                          ? 'Couverture'
                          : media.mediaKind ===
                              'VIDEO'
                            ? 'Vidéo'
                            : `Photo ${index + 1}`}
                      </span>

                      {(media.caption ||
                        media.altText) && (
                        <div
                          className="
                            border-t
                            border-slate-200
                            bg-white
                            p-3
                          "
                        >
                          {media.caption && (
                            <p
                              className="
                                text-xs
                                leading-5
                                text-slate-700
                              "
                            >
                              {
                                media.caption
                              }
                            </p>
                          )}

                          {media.altText && (
                            <p
                              className="
                                mt-1
                                text-xs
                                text-slate-400
                              "
                            >
                              Texte alternatif :
                              {' '}
                              {
                                media.altText
                              }
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ),
                )}
              </div>
            )}
          </section>

          <section
            className="
              rounded-3xl
              border
              border-[var(--flascam-border)]
              bg-white
              p-5
              shadow-[0_18px_50px_rgba(7,53,93,0.05)]
              sm:p-7
            "
          >
            <div
              className="
                flex
                items-center
                gap-3
              "
            >
              <CarFront
                size={22}
                className="
                  text-[var(--flascam-blue)]
                "
              />

              <h2
                className="
                  text-xl
                  font-black
                  text-slate-950
                "
              >
                Présentation du véhicule
              </h2>
            </div>

            <div
              className="
                mt-6
                grid
                gap-4
                sm:grid-cols-2
                lg:grid-cols-3
              "
            >
              <InformationItem
                label="Type"
                value={
                  MARKETPLACE_VEHICLE_TYPE_LABELS[
                    listing.vehicleType
                  ]
                }
              />

              <InformationItem
                label="Marque"
                value={
                  listing.brand
                }
              />

              <InformationItem
                label="Modèle"
                value={
                  listing.model
                }
              />

              <InformationItem
                label="Version"
                value={
                  listing.version ||
                  '—'
                }
              />

              <InformationItem
                label="Année"
                value={
                  listing.registrationYear
                }
              />

              <InformationItem
                label="Première circulation"
                value={
                  listing.firstRegistrationDate
                    ? new Intl.DateTimeFormat(
                        'fr-FR',
                        {
                          day:
                            '2-digit',

                          month:
                            'long',

                          year:
                            'numeric',
                        },
                      ).format(
                        new Date(
                          listing.firstRegistrationDate,
                        ),
                      )
                    : '—'
                }
              />
            </div>

            <div
              className="
                mt-6
                border-t
                border-slate-100
                pt-6
              "
            >
              <h3
                className="
                  text-sm
                  font-black
                  uppercase
                  tracking-[0.1em]
                  text-slate-500
                "
              >
                Description
              </h3>

              <p
                className="
                  mt-3
                  whitespace-pre-line
                  text-sm
                  leading-7
                  text-slate-700
                "
              >
                {listing.description ||
                  'Aucune description renseignée.'}
              </p>
            </div>
          </section>

          <section
            className="
              rounded-3xl
              border
              border-[var(--flascam-border)]
              bg-white
              p-5
              shadow-[0_18px_50px_rgba(7,53,93,0.05)]
              sm:p-7
            "
          >
            <div
              className="
                flex
                items-center
                gap-3
              "
            >
              <Settings2
                size={22}
                className="
                  text-violet-700
                "
              />

              <h2
                className="
                  text-xl
                  font-black
                  text-slate-950
                "
              >
                Caractéristiques techniques
              </h2>
            </div>

            <div
              className="
                mt-6
                grid
                gap-4
                sm:grid-cols-2
                lg:grid-cols-3
              "
            >
              <InformationItem
                label="Kilométrage"
                value={`${formatNumber(
                  listing.mileageKm,
                )} km`}
              />

              <InformationItem
                label="Énergie"
                value={
                  MARKETPLACE_FUEL_LABELS[
                    listing.fuelType
                  ]
                }
              />

              <InformationItem
                label="Transmission"
                value={
                  MARKETPLACE_TRANSMISSION_LABELS[
                    listing.transmission
                  ]
                }
              />

              <InformationItem
                label="Puissance fiscale"
                value={
                  listing.fiscalPower
                    ? `${listing.fiscalPower} CV`
                    : '—'
                }
              />

              <InformationItem
                label="Puissance moteur"
                value={
                  listing.enginePowerHp
                    ? `${listing.enginePowerHp} ch`
                    : '—'
                }
              />

              <InformationItem
                label="Cylindrée"
                value={
                  listing.engineCapacityCc
                    ? `${formatNumber(
                        listing.engineCapacityCc,
                      )} cm³`
                    : '—'
                }
              />

              <InformationItem
                label="Carrosserie"
                value={
                  listing.bodyType ||
                  '—'
                }
              />

              <InformationItem
                label="Couleur extérieure"
                value={
                  listing.exteriorColor ||
                  '—'
                }
              />

              <InformationItem
                label="Couleur intérieure"
                value={
                  listing.interiorColor ||
                  '—'
                }
              />

              <InformationItem
                label="Nombre de portes"
                value={
                  formatNumber(
                    listing.doorsCount,
                  )
                }
              />

              <InformationItem
                label="Nombre de places"
                value={
                  formatNumber(
                    listing.seatsCount,
                  )
                }
              />

              <InformationItem
                label="Ville d’immatriculation"
                value={
                  listing.registrationCity ||
                  '—'
                }
              />
            </div>
          </section>
        </div>

        <aside
          className="
            space-y-5
            xl:sticky
            xl:top-6
            xl:self-start
          "
        >
          <section
            className="
              rounded-3xl
              border
              border-[var(--flascam-border)]
              bg-white
              p-5
              shadow-[0_18px_50px_rgba(7,53,93,0.07)]
            "
          >
            <div
              className="
                flex
                items-center
                gap-3
              "
            >
              <UserRound
                size={21}
                className="
                  text-[var(--flascam-blue)]
                "
              />

              <h2
                className="
                  text-lg
                  font-black
                  text-slate-950
                "
              >
                Identité du vendeur
              </h2>
            </div>

            <div
              className="
                mt-5
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
                  Origine de l’annonce
                </p>

                <p
                  className="
                    mt-1
                    font-black
                    text-slate-900
                  "
                >
                  {getSellerName(
                    listing,
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
                  Compte propriétaire
                </p>

                <p
                  className="
                    mt-1
                    font-bold
                    text-slate-800
                  "
                >
                  {getPersonName(
                    listing.owner?.firstName,
                    listing.owner?.lastName,
                  )}
                </p>
              </div>

              {listing.owner?.email && (
                <div
                  className="
                    flex
                    items-start
                    gap-3
                  "
                >
                  <Mail
                    size={18}
                    className="
                      mt-0.5
                      shrink-0
                      text-slate-400
                    "
                  />

                  <a
                    href={`mailto:${listing.owner.email}`}
                    className="
                      break-all
                      font-semibold
                      text-[var(--flascam-blue)]
                      hover:underline
                    "
                  >
                    {
                      listing.owner.email
                    }
                  </a>
                </div>
              )}

              {listing.owner?.phone && (
                <div
                  className="
                    flex
                    items-start
                    gap-3
                  "
                >
                  <Phone
                    size={18}
                    className="
                      mt-0.5
                      shrink-0
                      text-slate-400
                    "
                  />

                  <a
                    href={`tel:${listing.owner.phone}`}
                    className="
                      font-semibold
                      text-[var(--flascam-blue)]
                      hover:underline
                    "
                  >
                    {
                      listing.owner.phone
                    }
                  </a>
                </div>
              )}

              {listing.association && (
                <div
                  className="
                    flex
                    items-start
                    gap-3
                    border-t
                    border-slate-100
                    pt-4
                  "
                >
                  <Building2
                    size={18}
                    className="
                      mt-0.5
                      shrink-0
                      text-slate-400
                    "
                  />

                  <div>
                    <p
                      className="
                        font-bold
                        text-slate-800
                      "
                    >
                      {
                        listing.association.name
                      }
                    </p>

                    <p
                      className="
                        mt-1
                        text-xs
                        text-slate-500
                      "
                    >
                      Association de rattachement
                    </p>
                  </div>
                </div>
              )}

              {listing.adherent && (
                <div
                  className="
                    border-t
                    border-slate-100
                    pt-4
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
                    Numéro d’adhérent
                  </p>

                  <p
                    className="
                      mt-1
                      font-bold
                      text-slate-800
                    "
                  >
                    {listing.adherent.membershipNumber ||
                      '—'}
                  </p>
                </div>
              )}
            </div>
          </section>

          <section
            className="
              rounded-3xl
              border
              border-[var(--flascam-border)]
              bg-white
              p-5
            "
          >
            <div
              className="
                flex
                items-center
                gap-3
              "
            >
              <CircleDollarSign
                size={21}
                className="
                  text-[var(--flascam-terracotta)]
                "
              />

              <h2
                className="
                  text-lg
                  font-black
                  text-slate-950
                "
              >
                Conditions de publication
              </h2>
            </div>

            <div
              className="
                mt-5
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
                  Prix demandé
                </p>

                <p
                  className="
                    mt-1
                    text-xl
                    font-black
                    text-[var(--flascam-terracotta)]
                  "
                >
                  {formatPrice(
                    listing.requestedPrice,
                  )}
                </p>
              </div>

              <div
                className="
                  flex
                  items-start
                  gap-3
                "
              >
                <Clock3
                  size={18}
                  className="
                    mt-0.5
                    shrink-0
                    text-[var(--flascam-blue)]
                  "
                />

                <div>
                  <p
                    className="
                      font-bold
                      text-slate-800
                    "
                  >
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

                  <p
                    className="
                      mt-1
                      text-xs
                      leading-5
                      text-slate-500
                    "
                  >
                    La durée commence au moment de la validation.
                  </p>
                </div>
              </div>

              <div
                className="
                  flex
                  items-start
                  gap-3
                "
              >
                <CalendarClock
                  size={18}
                  className="
                    mt-0.5
                    shrink-0
                    text-slate-400
                  "
                />

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
              </div>

              <div
                className="
                  flex
                  items-start
                  gap-3
                "
              >
                <Users
                  size={18}
                  className="
                    mt-0.5
                    shrink-0
                    text-violet-600
                  "
                />

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
                    Offres reçues
                  </p>

                  <p
                    className="
                      mt-1
                      font-semibold
                      text-slate-700
                    "
                  >
                    {
                      listing.offersCount
                    }
                  </p>
                </div>
              </div>

              {listing.registrationCity && (
                <div
                  className="
                    flex
                    items-start
                    gap-3
                  "
                >
                  <MapPin
                    size={18}
                    className="
                      mt-0.5
                      shrink-0
                      text-slate-400
                    "
                  />

                  <span
                    className="
                      text-slate-700
                    "
                  >
                    {
                      listing.registrationCity
                    }
                  </span>
                </div>
              )}
            </div>
          </section>

          {listing.reviewedBy && (
            <section
              className="
                rounded-3xl
                border
                border-slate-200
                bg-slate-50
                p-5
              "
            >
              <h2
                className="
                  font-black
                  text-slate-900
                "
              >
                Décision enregistrée
              </h2>

              <p
                className="
                  mt-2
                  text-sm
                  leading-6
                  text-slate-600
                "
              >
                Par
                {' '}
                {getPersonName(
                  listing.reviewedBy.firstName,
                  listing.reviewedBy.lastName,
                )}
                {' '}
                le
                {' '}
                {formatDate(
                  listing.reviewedAt,
                )}
                .
              </p>

              {listing.rejectionReason && (
                <div
                  className="
                    mt-4
                    rounded-2xl
                    border
                    border-red-200
                    bg-red-50
                    p-4
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
                      mt-2
                      whitespace-pre-line
                      text-sm
                      leading-6
                      text-red-700
                    "
                  >
                    {
                      listing.rejectionReason
                    }
                  </p>
                </div>
              )}
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}