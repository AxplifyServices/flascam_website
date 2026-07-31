'use client';

import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import Link from 'next/link';

import {
  AlertCircle,
  BadgeCheck,
  Banknote,
  Ban,
  CarFront,
  CheckCircle2,
  Clock3,
  CreditCard,
  FileSearch,
  LoaderCircle,
  LockKeyhole,
  MapPin,
  RefreshCw,
  SendHorizontal,
  ShieldCheck,
  UserRound,
  WalletCards,
  X,
  XCircle,
} from 'lucide-react';

import {
  getMyNonVotingAdherentProfile,
  submitMyWafacashReference,
} from '@/lib/non-voting-adherents-api';

import type {
  NonVotingAdherent,
  NonVotingMembershipStatus,
} from '@/types/non-voting-adherents';

const membershipStatusLabels:
  Record<
    NonVotingMembershipStatus,
    string
  > = {
    PENDING_PAYMENT:
      'Caution à payer',

    PENDING_REVIEW:
      'Paiement en vérification',

    ACTIVE:
      'Compte actif',

    REJECTED:
      'Paiement refusé',

    SUSPENDED:
      'Compte suspendu',
  };

function formatAmount(
  amount:
    string,

  currency:
    string,
) {
  const numericAmount =
    Number(
      amount,
    );

  if (
    !Number.isFinite(
      numericAmount,
    )
  ) {
    return `${amount} ${currency}`;
  }

  return new Intl.NumberFormat(
    'fr-MA',
    {
      style:
        'currency',

      currency,

      maximumFractionDigits:
        2,
    },
  ).format(
    numericAmount,
  );
}

function formatDate(
  value?:
    string | null,
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

function getFullName(
  adherent:
    NonVotingAdherent,
) {
  const fullName =
    adherent.account
      ?.fullName
      ?.trim();

  if (fullName) {
    return fullName;
  }

  return [
    adherent.account
      ?.firstName,

    adherent.account
      ?.lastName,
  ]
    .filter(
      Boolean,
    )
    .join(
      ' ',
    ) ||
    'Adhérent non votant';
}

function getStatusPresentation(
  adherent:
    NonVotingAdherent,
) {
  if (
    adherent.membershipStatus ===
    'ACTIVE'
  ) {
    return {
      icon:
        BadgeCheck,

      label:
        'Votre accès est actif',

      description:
        'Votre caution a été validée. Vous pouvez consulter la marketplace, envoyer des offres et suivre leurs résultats.',

      containerClassName:
        'border-emerald-200 bg-emerald-50',

      iconClassName:
        'bg-white text-emerald-700',

      titleClassName:
        'text-emerald-950',

      textClassName:
        'text-emerald-900/80',
    };
  }

  if (
    adherent.membershipStatus ===
    'PENDING_REVIEW'
  ) {
    return {
      icon:
        FileSearch,

      label:
        'Votre paiement est en cours de vérification',

      description:
        'FLASCAM vérifie actuellement votre référence Wafacash. Vous serez autorisé à envoyer des offres dès sa validation.',

      containerClassName:
        'border-blue-200 bg-blue-50',

      iconClassName:
        'bg-white text-blue-700',

      titleClassName:
        'text-blue-950',

      textClassName:
        'text-blue-900/80',
    };
  }

  if (
    adherent.membershipStatus ===
    'PENDING_PAYMENT'
  ) {
    return {
      icon:
        CreditCard,

      label:
        'Votre caution doit être payée',

      description:
        'Finalisez le paiement de votre caution pour débloquer l’envoi d’offres sur les véhicules de la marketplace.',

      containerClassName:
        'border-amber-200 bg-amber-50',

      iconClassName:
        'bg-white text-amber-700',

      titleClassName:
        'text-amber-950',

      textClassName:
        'text-amber-900/80',
    };
  }

  if (
    adherent.membershipStatus ===
    'REJECTED'
  ) {
    return {
      icon:
        XCircle,

      label:
        'Votre paiement n’a pas été validé',

      description:
        adherent.deposit.rejectionReason ||
        'La référence fournie n’a pas pu être confirmée. Vous pouvez transmettre une nouvelle référence Wafacash.',

      containerClassName:
        'border-red-200 bg-red-50',

      iconClassName:
        'bg-white text-red-700',

      titleClassName:
        'text-red-950',

      textClassName:
        'text-red-900/80',
    };
  }

  return {
    icon:
      Ban,

    label:
      'Votre compte est suspendu',

    description:
      adherent.suspension.reason ||
      'Votre accès a été suspendu par FLASCAM. Contactez l’administration pour obtenir davantage d’informations.',

    containerClassName:
      'border-slate-300 bg-slate-100',

    iconClassName:
      'bg-white text-slate-700',

    titleClassName:
      'text-slate-950',

    textClassName:
      'text-slate-700',
  };
}

export default function NonVotingMemberAreaPage() {
  const [
    adherent,
    setAdherent,
  ] = useState<
    NonVotingAdherent | null
  >(
    null,
  );

  const [
    loading,
    setLoading,
  ] = useState(
    true,
  );

  const [
    refreshing,
    setRefreshing,
  ] = useState(
    false,
  );

  const [
    submittingReference,
    setSubmittingReference,
  ] = useState(
    false,
  );

  const [
    wafacashReference,
    setWafacashReference,
  ] = useState(
    '',
  );

  const [
    error,
    setError,
  ] = useState<
    string | null
  >(
    null,
  );

  const [
    success,
    setSuccess,
  ] = useState<
    string | null
  >(
    null,
  );

  const loadProfile =
    useCallback(
      async (
        showRefreshLoader =
          false,
      ) => {
        if (
          showRefreshLoader
        ) {
          setRefreshing(
            true,
          );
        } else {
          setLoading(
            true,
          );
        }

        setError(
          null,
        );

        try {
          const response =
            await getMyNonVotingAdherentProfile();

          setAdherent(
            response,
          );

          setWafacashReference(
            response.deposit
              .wafacashReference ||
            '',
          );
        } catch (
          currentError
        ) {
          setError(
            currentError instanceof
              Error
              ? currentError.message
              : 'Impossible de charger votre espace.',
          );
        } finally {
          setLoading(
            false,
          );

          setRefreshing(
            false,
          );
        }
      },
      [],
    );

  useEffect(() => {
    void loadProfile();
  }, [
    loadProfile,
  ]);

  const statusPresentation =
    useMemo(
      () =>
        adherent
          ? getStatusPresentation(
              adherent,
            )
          : null,
      [
        adherent,
      ],
    );

  async function submitReference(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const normalizedReference =
      wafacashReference.trim();

    if (
      !normalizedReference
    ) {
      setError(
        'La référence Wafacash est obligatoire.',
      );

      return;
    }

    setSubmittingReference(
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
        await submitMyWafacashReference(
          normalizedReference,
        );

      setAdherent(
        updated,
      );

      setWafacashReference(
        updated.deposit
          .wafacashReference ||
        normalizedReference,
      );

      setSuccess(
        'Votre référence Wafacash a été transmise. FLASCAM va maintenant vérifier le paiement.',
      );
    } catch (
      currentError
    ) {
      setError(
        currentError instanceof
          Error
          ? currentError.message
          : 'La référence Wafacash n’a pas pu être envoyée.',
      );
    } finally {
      setSubmittingReference(
        false,
      );
    }
  }

  if (
    loading
  ) {
    return (
      <section
        className="
          grid
          min-h-[420px]
          w-full
          place-items-center
        "
      >
        <div
          className="
            text-center
          "
        >
          <LoaderCircle
            size={38}
            className="
              mx-auto
              animate-spin
              text-[var(--flascam-terracotta)]
            "
          />

          <p
            className="
              mt-4
              text-sm
              font-extrabold
              text-[var(--flascam-slate)]
            "
          >
            Chargement de votre espace…
          </p>
        </div>
      </section>
    );
  }

  if (
    !adherent
  ) {
    return (
      <section
        className="
          mx-auto
          w-full
          max-w-4xl
        "
      >
        <div
          className="
            rounded-[2rem]
            border
            border-red-200
            bg-red-50
            p-6
            text-red-900
            sm:p-8
          "
        >
          <AlertCircle
            size={34}
          />

          <h1
            className="
              mt-4
              text-2xl
              font-black
            "
          >
            Votre dossier est introuvable
          </h1>

          <p
            className="
              mt-3
              max-w-2xl
              text-sm
              leading-7
            "
          >
            Votre compte est connecté, mais aucun dossier
            d’adhérent non votant n’est associé à vos
            identifiants. Contactez l’administration
            FLASCAM pour régulariser la situation.
          </p>

          {error && (
            <p
              className="
                mt-4
                text-sm
                font-bold
              "
            >
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={() =>
              void loadProfile()
            }
            className="
              mt-6
              inline-flex
              min-h-11
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-red-700
              px-5
              text-sm
              font-extrabold
              text-white
              transition
              hover:bg-red-800
            "
          >
            <RefreshCw
              size={17}
            />

            Réessayer
          </button>
        </div>
      </section>
    );
  }

  const StatusIcon =
    statusPresentation?.icon ||
    ShieldCheck;

  return (
    <section
      className="
        mx-auto
        w-full
        max-w-[1500px]
      "
    >
      <div
        className="
          blue-gradient-bg
          overflow-hidden
          rounded-[2rem]
          border
          border-[var(--flascam-border)]
          p-5
          shadow-[0_24px_70px_rgba(7,53,93,0.08)]
          sm:p-7
          lg:p-9
        "
      >
        <div
          className="
            flex
            flex-col
            gap-7
            lg:flex-row
            lg:items-center
            lg:justify-between
          "
        >
          <div
            className="
              max-w-3xl
            "
          >
            <p
              className="
                flex
                items-center
                gap-2
                text-xs
                font-extrabold
                uppercase
                tracking-[0.18em]
                text-[var(--flascam-blue)]
              "
            >
              <WalletCards
                size={16}
              />

              Espace acheteur
            </p>

            <h1
              className="
                mt-3
                text-3xl
                font-extrabold
                tracking-[-0.04em]
                text-[var(--flascam-black)]
                sm:text-4xl
                lg:text-5xl
              "
            >
              Bonjour{' '}
              {
                adherent.account
                  ?.firstName ||
                getFullName(
                  adherent,
                )
              }
            </h1>

            <p
              className="
                mt-4
                max-w-2xl
                text-sm
                leading-7
                text-[var(--flascam-slate)]
                sm:text-base
              "
            >
              Cet espace vous permet de vérifier le statut
              de votre caution, de consulter les véhicules
              disponibles et de suivre toutes les offres que
              vous avez envoyées.
            </p>
          </div>

          <div
            className="
              flex
              flex-col
              gap-3
              sm:flex-row
              lg:flex-col
            "
          >
            <Link
              href="/marketplace"
              className="
                inline-flex
                min-h-12
                items-center
                justify-center
                gap-2
                rounded-2xl
                bg-[var(--flascam-terracotta)]
                px-5
                text-sm
                font-extrabold
                text-white
                shadow-[0_14px_30px_rgba(169,71,43,0.24)]
                transition
                hover:-translate-y-0.5
                hover:brightness-95
              "
            >
              <CarFront
                size={19}
              />

              Découvrir la marketplace
            </Link>

            <button
              type="button"
              onClick={() =>
                void loadProfile(
                  true,
                )
              }
              disabled={
                refreshing
              }
              className="
                inline-flex
                min-h-12
                items-center
                justify-center
                gap-2
                rounded-2xl
                border
                border-[var(--flascam-border)]
                bg-white
                px-5
                text-sm
                font-extrabold
                text-[var(--flascam-blue)]
                transition
                hover:border-[var(--flascam-blue)]
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              <RefreshCw
                size={18}
                className={
                  refreshing
                    ? 'animate-spin'
                    : ''
                }
              />

              Actualiser
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div
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
            text-red-800
          "
        >
          <AlertCircle
            size={20}
            className="
              mt-0.5
              shrink-0
            "
          />

          <span
            className="
              flex-1
            "
          >
            {error}
          </span>

          <button
            type="button"
            onClick={() =>
              setError(
                null,
              )
            }
            aria-label="Fermer"
          >
            <X
              size={18}
            />
          </button>
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
            text-emerald-800
          "
        >
          <CheckCircle2
            size={20}
            className="
              mt-0.5
              shrink-0
            "
          />

          <span
            className="
              flex-1
            "
          >
            {success}
          </span>

          <button
            type="button"
            onClick={() =>
              setSuccess(
                null,
              )
            }
            aria-label="Fermer"
          >
            <X
              size={18}
            />
          </button>
        </div>
      )}

      <article
        className={`
          mt-6
          rounded-[2rem]
          border
          p-5
          sm:p-7
          ${statusPresentation?.containerClassName}
        `}
      >
        <div
          className="
            flex
            flex-col
            gap-5
            sm:flex-row
            sm:items-start
          "
        >
          <div
            className={`
              grid
              size-14
              shrink-0
              place-items-center
              rounded-2xl
              shadow-sm
              ${statusPresentation?.iconClassName}
            `}
          >
            <StatusIcon
              size={28}
            />
          </div>

          <div
            className="
              min-w-0
              flex-1
            "
          >
            <div
              className="
                flex
                flex-col
                gap-3
                xl:flex-row
                xl:items-start
                xl:justify-between
              "
            >
              <div>
                <p
                  className="
                    text-xs
                    font-black
                    uppercase
                    tracking-[0.14em]
                    opacity-70
                  "
                >
                  Statut de votre adhésion
                </p>

                <h2
                  className={`
                    mt-2
                    text-xl
                    font-black
                    sm:text-2xl
                    ${statusPresentation?.titleClassName}
                  `}
                >
                  {
                    statusPresentation
                      ?.label
                  }
                </h2>
              </div>

              <span
                className="
                  inline-flex
                  w-fit
                  items-center
                  rounded-full
                  border
                  border-current/20
                  bg-white/70
                  px-4
                  py-2
                  text-xs
                  font-black
                "
              >
                {
                  membershipStatusLabels[
                    adherent
                      .membershipStatus
                  ]
                }
              </span>
            </div>

            <p
              className={`
                mt-3
                max-w-4xl
                text-sm
                leading-7
                sm:text-base
                ${statusPresentation?.textClassName}
              `}
            >
              {
                statusPresentation
                  ?.description
              }
            </p>
          </div>
        </div>
      </article>

      <div
        className="
          mt-6
          grid
          gap-5
          xl:grid-cols-[1.15fr_0.85fr]
        "
      >
        <div
          className="
            grid
            gap-5
          "
        >
          <article
            className="
              rounded-[2rem]
              border
              border-[var(--flascam-border)]
              bg-white
              p-5
              shadow-[0_18px_45px_rgba(15,23,42,0.05)]
              sm:p-7
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
                <p
                  className="
                    text-xs
                    font-black
                    uppercase
                    tracking-[0.14em]
                    text-[var(--flascam-terracotta)]
                  "
                >
                  Votre caution
                </p>

                <h2
                  className="
                    mt-2
                    text-2xl
                    font-black
                    text-slate-950
                  "
                >
                  {
                    formatAmount(
                      adherent.deposit
                        .amount,

                      adherent.deposit
                        .currency,
                    )
                  }
                </h2>
              </div>

              <div
                className="
                  grid
                  size-12
                  place-items-center
                  rounded-2xl
                  bg-[#fff3ee]
                  text-[var(--flascam-terracotta)]
                "
              >
                {adherent.deposit
                  .paymentMethod ===
                'CARD' ? (
                  <CreditCard
                    size={23}
                  />
                ) : (
                  <Banknote
                    size={23}
                  />
                )}
              </div>
            </div>

            <div
              className="
                mt-6
                grid
                gap-3
                sm:grid-cols-2
              "
            >
              <InformationItem
                label="Mode de paiement"
                value={
                  adherent.deposit
                    .paymentMethod ===
                  'CARD'
                    ? 'Carte bancaire'
                    : 'Wafacash'
                }
              />

              <InformationItem
                label="État du paiement"
                value={
                  getDepositStatusLabel(
                    adherent.deposit
                      .status,
                  )
                }
              />

              <InformationItem
                label="Paiement demandé le"
                value={
                  formatDate(
                    adherent.deposit
                      .requestedAt,
                  )
                }
              />

              <InformationItem
                label="Paiement confirmé le"
                value={
                  formatDate(
                    adherent.deposit
                      .confirmedAt,
                  )
                }
              />
            </div>

            {adherent.deposit
              .wafacashReference && (
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
                    tracking-[0.12em]
                    text-slate-500
                  "
                >
                  Référence Wafacash
                </p>

                <code
                  className="
                    mt-2
                    block
                    break-all
                    text-sm
                    font-black
                    text-slate-950
                  "
                >
                  {
                    adherent.deposit
                      .wafacashReference
                  }
                </code>

                {adherent.deposit
                  .submittedAt && (
                  <p
                    className="
                      mt-2
                      text-xs
                      font-semibold
                      text-slate-500
                    "
                  >
                    Transmise le{' '}
                    {
                      formatDate(
                        adherent.deposit
                          .submittedAt,
                      )
                    }
                  </p>
                )}
              </div>
            )}
          </article>

          {adherent.requiresCardPayment && (
            <article
              className="
                rounded-[2rem]
                border
                border-amber-200
                bg-amber-50
                p-5
                sm:p-7
              "
            >
              <div
                className="
                  flex
                  items-start
                  gap-4
                "
              >
                <div
                  className="
                    grid
                    size-12
                    shrink-0
                    place-items-center
                    rounded-2xl
                    bg-white
                    text-amber-700
                    shadow-sm
                  "
                >
                  <CreditCard
                    size={24}
                  />
                </div>

                <div>
                  <h2
                    className="
                      text-xl
                      font-black
                      text-amber-950
                    "
                  >
                    Paiement par carte bancaire
                  </h2>

                  <p
                    className="
                      mt-2
                      text-sm
                      leading-7
                      text-amber-900/80
                    "
                  >
                    Le module de paiement sécurisé sera
                    connecté au prestataire retenu par
                    FLASCAM. Tant que ce paiement n’est pas
                    confirmé, l’envoi d’offres reste
                    verrouillé.
                  </p>
                </div>
              </div>

              <button
                type="button"
                disabled
                className="
                  mt-5
                  inline-flex
                  min-h-12
                  w-full
                  cursor-not-allowed
                  items-center
                  justify-center
                  gap-2
                  rounded-2xl
                  bg-amber-200
                  px-5
                  text-sm
                  font-extrabold
                  text-amber-800
                  opacity-80
                  sm:w-auto
                "
              >
                <LockKeyhole
                  size={18}
                />

                Paiement en ligne bientôt disponible
              </button>
            </article>
          )}

          {adherent.canSubmitWafacashReference && (
            <article
              className="
                rounded-[2rem]
                border
                border-red-200
                bg-white
                p-5
                shadow-[0_18px_45px_rgba(15,23,42,0.05)]
                sm:p-7
              "
            >
              <div
                className="
                  flex
                  items-start
                  gap-4
                "
              >
                <div
                  className="
                    grid
                    size-12
                    shrink-0
                    place-items-center
                    rounded-2xl
                    bg-red-50
                    text-red-700
                  "
                >
                  <Banknote
                    size={24}
                  />
                </div>

                <div>
                  <h2
                    className="
                      text-xl
                      font-black
                      text-slate-950
                    "
                  >
                    Envoyer une nouvelle référence
                  </h2>

                  <p
                    className="
                      mt-2
                      text-sm
                      leading-7
                      text-slate-600
                    "
                  >
                    Vérifiez attentivement le code inscrit
                    sur votre reçu Wafacash avant de
                    l’envoyer. Une référence déjà utilisée
                    ne pourra pas être acceptée.
                  </p>
                </div>
              </div>

              <form
                onSubmit={
                  submitReference
                }
                className="
                  mt-6
                "
              >
                <label
                  className="
                    block
                    text-sm
                    font-black
                    text-slate-800
                  "
                >
                  Référence Wafacash

                  <span
                    className="
                      text-red-600
                    "
                  >
                    {' '}*
                  </span>

                  <input
                    type="text"
                    value={
                      wafacashReference
                    }
                    onChange={(
                      event,
                    ) =>
                      setWafacashReference(
                        event.target.value,
                      )
                    }
                    maxLength={
                      180
                    }
                    placeholder="Ex. WFC-2026-000123"
                    className="
                      mt-2
                      min-h-12
                      w-full
                      rounded-2xl
                      border
                      border-slate-200
                      bg-white
                      px-4
                      text-sm
                      font-semibold
                      text-slate-950
                      outline-none
                      transition
                      placeholder:text-slate-400
                      focus:border-[var(--flascam-terracotta)]
                      focus:ring-4
                      focus:ring-[var(--flascam-terracotta)]/10
                    "
                  />
                </label>

                <button
                  type="submit"
                  disabled={
                    submittingReference
                  }
                  className="
                    mt-4
                    inline-flex
                    min-h-12
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-2xl
                    bg-[var(--flascam-terracotta)]
                    px-5
                    text-sm
                    font-extrabold
                    text-white
                    transition
                    hover:brightness-95
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                    sm:w-auto
                  "
                >
                  {submittingReference ? (
                    <>
                      <LoaderCircle
                        size={18}
                        className="animate-spin"
                      />

                      Envoi…
                    </>
                  ) : (
                    <>
                      <SendHorizontal
                        size={18}
                      />

                      Envoyer pour vérification
                    </>
                  )}
                </button>
              </form>
            </article>
          )}
        </div>

        <div
          className="
            grid
            content-start
            gap-5
          "
        >
          <article
            className="
              rounded-[2rem]
              border
              border-[var(--flascam-border)]
              bg-white
              p-5
              shadow-[0_18px_45px_rgba(15,23,42,0.05)]
              sm:p-7
            "
          >
            <div
              className="
                flex
                items-start
                gap-4
              "
            >
              <div
                className="
                  grid
                  size-12
                  shrink-0
                  place-items-center
                  rounded-2xl
                  bg-blue-50
                  text-[var(--flascam-blue)]
                "
              >
                <UserRound
                  size={23}
                />
              </div>

              <div>
                <p
                  className="
                    text-xs
                    font-black
                    uppercase
                    tracking-[0.13em]
                    text-[var(--flascam-blue)]
                  "
                >
                  Mon profil
                </p>

                <h2
                  className="
                    mt-2
                    text-xl
                    font-black
                    text-slate-950
                  "
                >
                  {getFullName(
                    adherent,
                  )}
                </h2>
              </div>
            </div>

            <div
              className="
                mt-6
                grid
                gap-3
              "
            >
              <InformationItem
                label="Adresse e-mail"
                value={
                  adherent.account
                    ?.email ||
                  '—'
                }
              />

              <InformationItem
                label="Téléphone"
                value={
                  adherent.account
                    ?.phone ||
                  '—'
                }
              />

              <InformationItem
                label="Ville"
                value={
                  adherent.city
                }
                icon={
                  MapPin
                }
              />

              <InformationItem
                label="Compte créé le"
                value={
                  formatDate(
                    adherent.createdAt,
                  )
                }
              />
            </div>
          </article>

          <article
            className="
              rounded-[2rem]
              border
              border-[var(--flascam-border)]
              bg-white
              p-5
              shadow-[0_18px_45px_rgba(15,23,42,0.05)]
              sm:p-7
            "
          >
            <p
              className="
                text-xs
                font-black
                uppercase
                tracking-[0.13em]
                text-[var(--flascam-terracotta)]
              "
            >
              Mes accès
            </p>

            <div
              className="
                mt-5
                grid
                gap-3
              "
            >
              <AccessItem
                icon={
                  CarFront
                }
                label="Consulter la marketplace"
                enabled
              />

              <AccessItem
                icon={
                  SendHorizontal
                }
                label="Envoyer des offres"
                enabled={
                  adherent.canSubmitOffer
                }
              />

              <AccessItem
                icon={
                  Clock3
                }
                label="Suivre mes offres"
                enabled
              />

              <AccessItem
                icon={
                  LockKeyhole
                }
                label="Publier un véhicule"
                enabled={
                  false
                }
              />
            </div>
          </article>

          <article
            className="
              rounded-[2rem]
              border
              border-[var(--flascam-border)]
              bg-[var(--flascam-blue)]
              p-5
              text-white
              shadow-[0_20px_50px_rgba(7,53,93,0.18)]
              sm:p-7
            "
          >
            <ShieldCheck
              size={32}
              className="
                text-white
              "
            />

            <h2
              className="
                mt-4
                text-xl
                font-black
              "
            >
              Suivez vos offres simplement
            </h2>

            <p
              className="
                mt-2
                text-sm
                leading-7
                text-white/80
              "
            >
              Consultez le résultat de chaque offre,
              annulez celles qui sont encore en attente et
              accédez aux coordonnées du vendeur lorsqu’une
              offre est acceptée.
            </p>

            <Link
              href="/admin/marketplace-offers/sent"
              className="
                mt-5
                inline-flex
                min-h-12
                w-full
                items-center
                justify-center
                gap-2
                rounded-2xl
                bg-[var(--flascam-terracotta)]
                px-5
                text-sm
                font-extrabold
                text-white
                transition
                hover:brightness-95
              "
            >
              <Clock3
                size={18}
              />

              Voir mes offres
            </Link>
          </article>
        </div>
      </div>
    </section>
  );
}

function getDepositStatusLabel(
  status:
    NonVotingAdherent['deposit']['status'],
) {
  if (
    status ===
    'PENDING'
  ) {
    return 'En attente de paiement';
  }

  if (
    status ===
    'SUBMITTED'
  ) {
    return 'Transmis pour vérification';
  }

  if (
    status ===
    'PAID'
  ) {
    return 'Payé et confirmé';
  }

  if (
    status ===
    'REJECTED'
  ) {
    return 'Paiement refusé';
  }

  return 'Caution remboursée';
}

function InformationItem({
  label,
  value,
  icon:
    Icon,
}: {
  label: string;

  value: string;

  icon?:
    typeof MapPin;
}) {
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
      <div
        className="
          flex
          items-start
          gap-3
        "
      >
        {Icon && (
          <Icon
            size={17}
            className="
              mt-0.5
              shrink-0
              text-[var(--flascam-terracotta)]
            "
          />
        )}

        <div
          className="
            min-w-0
          "
        >
          <p
            className="
              text-xs
              font-bold
              text-slate-500
            "
          >
            {label}
          </p>

          <strong
            className="
              mt-1
              block
              break-words
              text-sm
              text-slate-950
            "
          >
            {value}
          </strong>
        </div>
      </div>
    </div>
  );
}

function AccessItem({
  icon:
    Icon,
  label,
  enabled,
}: {
  icon:
    typeof CarFront;

  label: string;

  enabled: boolean;
}) {
  return (
    <div
      className="
        flex
        items-center
        gap-3
        rounded-2xl
        border
        border-slate-100
        bg-slate-50
        p-4
      "
    >
      <div
        className={`
          grid
          size-10
          shrink-0
          place-items-center
          rounded-xl
          ${
            enabled
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-slate-200 text-slate-500'
          }
        `}
      >
        <Icon
          size={19}
        />
      </div>

      <strong
        className="
          min-w-0
          flex-1
          text-sm
          text-slate-950
        "
      >
        {label}
      </strong>

      {enabled ? (
        <CheckCircle2
          size={19}
          className="
            shrink-0
            text-emerald-700
          "
        />
      ) : (
        <LockKeyhole
          size={18}
          className="
            shrink-0
            text-slate-400
          "
        />
      )}
    </div>
  );
}