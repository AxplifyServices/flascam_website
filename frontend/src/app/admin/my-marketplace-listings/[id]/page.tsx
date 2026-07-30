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
  CalendarClock,
  CarFront,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  FilePenLine,
  Images,
  LoaderCircle,
  MapPin,
  Send,
  Settings2,
  Users,
  XCircle,
} from 'lucide-react';

import {
  getMyMarketplaceListingById,
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

export default function MarketplaceListingDetailPage() {
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
    MarketplaceListing | null
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
  ] = useState(
    false,
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
            await getMyMarketplaceListingById(
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

  async function handleSubmit() {
    if (!listing) {
      return;
    }

    const confirmed =
      window.confirm(
        `Soumettre l’annonce « ${listing.title} » à la validation de la FLASCAM ?`,
      );

    if (!confirmed) {
      return;
    }

    setActionLoading(
      true,
    );

    setError(
      null,
    );

    setSuccess(
      null,
    );

    try {
      const updated =
        await submitMarketplaceListing(
          listing.id,
        );

      setListing(
        updated,
      );

      setSuccess(
        'L’annonce a été transmise à la FLASCAM pour validation.',
      );
    } catch (
      caughtError
    ) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'La soumission de l’annonce a échoué.',
      );
    } finally {
      setActionLoading(
        false,
      );
    }
  }

  async function handleWithdraw() {
    if (!listing) {
      return;
    }

    const message =
      listing.status ===
      'PUBLISHED'
        ? 'Retirer cette annonce de la marketplace ? Les offres en attente seront automatiquement refusées.'
        : 'Retirer cette annonce de la file de validation ?';

    if (
      !window.confirm(
        message,
      )
    ) {
      return;
    }

    setActionLoading(
      true,
    );

    setError(
      null,
    );

    setSuccess(
      null,
    );

    try {
      const updated =
        await withdrawMarketplaceListing(
          listing.id,
        );

      setListing(
        updated,
      );

      setSuccess(
        'L’annonce a été retirée.',
      );
    } catch (
      caughtError
    ) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Le retrait de l’annonce a échoué.',
      );
    } finally {
      setActionLoading(
        false,
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
          href="/admin/my-marketplace-listings"
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

          Retour à mes annonces
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
          <button
            type="button"
            onClick={() =>
              router.push(
                '/admin/my-marketplace-listings',
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

            Retour à mes annonces
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

        <div
          className="
            flex
            flex-wrap
            gap-3
          "
        >
          {canEdit && (
            <Link
              href={`/admin/my-marketplace-listings/${listing.id}/edit`}
              className="
                inline-flex
                min-h-12
                items-center
                justify-center
                gap-2
                rounded-2xl
                border
                border-blue-200
                bg-blue-50
                px-5
                text-sm
                font-bold
                text-[var(--flascam-blue)]
                transition
                hover:bg-blue-100
              "
            >
              <FilePenLine
                size={18}
              />

              Modifier
            </Link>
          )}

          {canSubmit && (
            <button
              type="button"
              disabled={
                actionLoading
              }
              onClick={() =>
                void handleSubmit()
              }
              className="
                inline-flex
                min-h-12
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
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {actionLoading ? (
                <LoaderCircle
                  size={18}
                  className="animate-spin"
                />
              ) : (
                <Send
                  size={18}
                />
              )}

              Soumettre à la FLASCAM
            </button>
          )}

          {canWithdraw && (
            <button
              type="button"
              disabled={
                actionLoading
              }
              onClick={() =>
                void handleWithdraw()
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
              {actionLoading ? (
                <LoaderCircle
                  size={18}
                  className="animate-spin"
                />
              ) : (
                <XCircle
                  size={18}
                />
              )}

              Retirer
            </button>
          )}
        </div>
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

      {listing.status ===
        'REJECTED' &&
        listing.rejectionReason && (
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
                gap-3
              "
            >
              <AlertCircle
                size={24}
                className="
                  mt-0.5
                  shrink-0
                  text-red-700
                "
              />

              <div>
                <h2
                  className="
                    font-black
                    text-red-800
                  "
                >
                  Modifications demandées par la FLASCAM
                </h2>

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
            </div>
          </section>
        )}

      <div
        className="
          mt-7
          grid
          gap-6
          xl:grid-cols-[minmax(0,1fr)_370px]
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
                  Médias du véhicule
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
                  {images.length > 1
                    ? 's'
                    : ''}
                  {videos.length > 0
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
                  <CarFront
                    size={48}
                    className="
                      mx-auto
                      text-slate-300
                    "
                  />

                  <p
                    className="
                      mt-4
                      text-sm
                      font-bold
                      text-slate-500
                    "
                  >
                    Aucun média ajouté
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

                      {media.caption && (
                        <p
                          className="
                            border-t
                            border-slate-200
                            bg-white
                            p-3
                            text-xs
                            leading-5
                            text-slate-600
                          "
                        >
                          {
                            media.caption
                          }
                        </p>
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
                Présentation
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
            <h2
              className="
                text-lg
                font-black
                text-slate-950
              "
            >
              Publication
            </h2>

            <div
              className="
                mt-5
                space-y-4
              "
            >
              <div
                className="
                  flex
                  items-start
                  gap-3
                "
              >
                <CircleDollarSign
                  size={19}
                  className="
                    mt-0.5
                    shrink-0
                    text-[var(--flascam-terracotta)]
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
                    Prix demandé
                  </p>

                  <p
                    className="
                      mt-1
                      font-black
                      text-slate-900
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
                  flex
                  items-start
                  gap-3
                "
              >
                <CalendarClock
                  size={19}
                  className="
                    mt-0.5
                    shrink-0
                    text-[var(--flascam-blue)]
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
                    Durée choisie
                  </p>

                  <p
                    className="
                      mt-1
                      font-bold
                      text-slate-800
                    "
                  >
                    {listing.durationDays}
                    {' '}
                    jour
                    {listing.durationDays >
                    1
                      ? 's'
                      : ''}
                  </p>
                </div>
              </div>

              {listing.status ===
                'PUBLISHED' && (
                <div
                  className="
                    flex
                    items-start
                    gap-3
                  "
                >
                  <Clock3
                    size={19}
                    className="
                      mt-0.5
                      shrink-0
                      text-emerald-700
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
                      Temps restant
                    </p>

                    <p
                      className="
                        mt-1
                        font-bold
                        text-emerald-700
                      "
                    >
                      {listing.remainingDays ??
                        0}
                      {' '}
                      jour
                      {(listing.remainingDays ??
                        0) >
                      1
                        ? 's'
                        : ''}
                    </p>
                  </div>
                </div>
              )}

              <div
                className="
                  flex
                  items-start
                  gap-3
                "
              >
                <Users
                  size={19}
                  className="
                    mt-0.5
                    shrink-0
                    text-violet-700
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
                      font-bold
                      text-slate-800
                    "
                  >
                    {
                      listing.offersCount
                    }
                  </p>
                </div>
              </div>
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
            <h2
              className="
                text-lg
                font-black
                text-slate-950
              "
            >
              Suivi de l’annonce
            </h2>

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
                    font-bold
                    text-slate-500
                  "
                >
                  Créée le
                </p>

                <p
                  className="
                    mt-1
                    text-slate-800
                  "
                >
                  {formatDate(
                    listing.createdAt,
                  )}
                </p>
              </div>

              <div>
                <p
                  className="
                    font-bold
                    text-slate-500
                  "
                >
                  Dernière modification
                </p>

                <p
                  className="
                    mt-1
                    text-slate-800
                  "
                >
                  {formatDate(
                    listing.updatedAt,
                  )}
                </p>
              </div>

              {listing.submittedAt && (
                <div>
                  <p
                    className="
                      font-bold
                      text-slate-500
                    "
                  >
                    Soumise le
                  </p>

                  <p
                    className="
                      mt-1
                      text-slate-800
                    "
                  >
                    {formatDate(
                      listing.submittedAt,
                    )}
                  </p>
                </div>
              )}

              {listing.reviewedAt && (
                <div>
                  <p
                    className="
                      font-bold
                      text-slate-500
                    "
                  >
                    Examinée le
                  </p>

                  <p
                    className="
                      mt-1
                      text-slate-800
                    "
                  >
                    {formatDate(
                      listing.reviewedAt,
                    )}
                  </p>
                </div>
              )}

              {listing.publishedAt && (
                <div>
                  <p
                    className="
                      font-bold
                      text-slate-500
                    "
                  >
                    Publiée le
                  </p>

                  <p
                    className="
                      mt-1
                      text-slate-800
                    "
                  >
                    {formatDate(
                      listing.publishedAt,
                    )}
                  </p>
                </div>
              )}

              {listing.expiresAt && (
                <div>
                  <p
                    className="
                      font-bold
                      text-slate-500
                    "
                  >
                    Expiration prévue
                  </p>

                  <p
                    className="
                      mt-1
                      text-slate-800
                    "
                  >
                    {formatDate(
                      listing.expiresAt,
                    )}
                  </p>
                </div>
              )}

              {listing.registrationCity && (
                <div
                  className="
                    flex
                    items-start
                    gap-2
                    border-t
                    border-slate-100
                    pt-4
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
                    Immatriculation :
                    {' '}
                    {
                      listing.registrationCity
                    }
                  </span>
                </div>
              )}
            </div>
          </section>

          {listing.status ===
            'DRAFT' && (
            <section
              className="
                rounded-3xl
                border
                border-amber-200
                bg-amber-50
                p-5
              "
            >
              <h2
                className="
                  font-black
                  text-amber-900
                "
              >
                Brouillon non visible
              </h2>

              <p
                className="
                  mt-2
                  text-sm
                  leading-6
                  text-amber-800
                "
              >
                Vérifiez les informations et ajoutez au moins une
                image avant de soumettre l’annonce à la FLASCAM.
              </p>
            </section>
          )}

          {listing.status ===
            'PENDING_REVIEW' && (
            <section
              className="
                rounded-3xl
                border
                border-blue-200
                bg-blue-50
                p-5
              "
            >
              <h2
                className="
                  font-black
                  text-[var(--flascam-blue)]
                "
              >
                Validation en cours
              </h2>

              <p
                className="
                  mt-2
                  text-sm
                  leading-6
                  text-blue-800
                "
              >
                La FLASCAM examine actuellement cette annonce. Elle
                sera publiée uniquement après validation.
              </p>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}