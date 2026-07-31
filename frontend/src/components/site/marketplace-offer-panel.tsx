'use client';

import {
  type FormEvent,
  useEffect,
  useMemo,
  useState,
} from 'react';;

import Link from 'next/link';

import {
  AlertCircle,
  BadgeCheck,
  Banknote,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  CreditCard,
  LoaderCircle,
  LockKeyhole,
  Send,
  XCircle,
} from 'lucide-react';

import {
  createMarketplaceOffer,
} from '@/lib/marketplace-api';

import {
  getMyNonVotingAdherentProfile,
} from '@/lib/non-voting-adherents-api';

import {
  apiFetch,
} from '@/lib/api';

import type {
  MarketplaceListingStatus,
} from '@/types/marketplace';

import type {
  NonVotingAdherent,
} from '@/types/non-voting-adherents';

type MarketplaceOfferPanelProps = {
  listingId: string;
  listingSlug: string;
  listingTitle: string;
listingStatus:
  MarketplaceListingStatus;
  requestedPrice: number;
  remainingDays: number;
};

type SessionUser = {
  id: string;
  email: string;

  role: {
    code: string;
    name: string;
  };

  permissions: string[];
};

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

export function MarketplaceOfferPanel({
  listingId,
  listingSlug,
  listingTitle,
  listingStatus,
  requestedPrice,
  remainingDays,
}: MarketplaceOfferPanelProps) {
  const [
    checkingSession,
    setCheckingSession,
  ] = useState(
    true,
  );

  const [
    user,
    setUser,
  ] = useState<
    SessionUser | null
  >(null);

const [
  nonVotingProfile,
  setNonVotingProfile,
] = useState<
  NonVotingAdherent | null
>(null);

const [
  checkingNonVotingProfile,
  setCheckingNonVotingProfile,
] = useState(
  false,
);  

  const [
    amount,
    setAmount,
  ] = useState(
    String(
      requestedPrice,
    ),
  );

  const [
    message,
    setMessage,
  ] = useState(
    '',
  );

  const [
    submitting,
    setSubmitting,
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

const isNonVotingAdherent =
  user?.role.code ===
  'MARKETPLACE_USER';

const canDisplayOfferForm =
  !isNonVotingAdherent ||
  nonVotingProfile?.canSubmitOffer ===
    true;

const nonVotingRestriction =
  useMemo(
    () => {
      if (
        !isNonVotingAdherent ||
        !nonVotingProfile
      ) {
        return null;
      }

      if (
        nonVotingProfile.membershipStatus ===
        'PENDING_PAYMENT'
      ) {
        return {
          icon:
            CreditCard,

          title:
            'Votre caution doit être payée',

          description:
            'Finalisez le paiement de votre caution depuis votre espace acheteur avant de pouvoir envoyer une offre.',

          linkLabel:
            'Accéder au paiement',

          className:
            'border-amber-300/40 bg-amber-950/25 text-amber-100',
        };
      }

      if (
        nonVotingProfile.membershipStatus ===
        'PENDING_REVIEW'
      ) {
        return {
          icon:
            Clock3,

          title:
            'Votre paiement est en cours de vérification',

          description:
            'FLASCAM vérifie votre référence Wafacash. L’envoi d’offres sera activé automatiquement après validation.',

          linkLabel:
            'Voir le suivi de ma caution',

          className:
            'border-blue-300/40 bg-blue-950/25 text-blue-100',
        };
      }

      if (
        nonVotingProfile.membershipStatus ===
        'REJECTED'
      ) {
        return {
          icon:
            XCircle,

          title:
            'Votre paiement n’a pas été validé',

          description:
            nonVotingProfile.deposit
              .rejectionReason ||
            'La référence Wafacash fournie n’a pas pu être confirmée. Vous pouvez en transmettre une nouvelle.',

          linkLabel:
            'Corriger ma référence',

          className:
            'border-red-300/40 bg-red-950/25 text-red-100',
        };
      }

      if (
        nonVotingProfile.membershipStatus ===
        'SUSPENDED'
      ) {
        return {
          icon:
            LockKeyhole,

          title:
            'Votre compte est suspendu',

          description:
            nonVotingProfile.suspension
              .reason ||
            'Votre compte ne peut actuellement pas envoyer d’offres. Contactez FLASCAM pour davantage d’informations.',

          linkLabel:
            'Voir mon espace',

          className:
            'border-slate-300/40 bg-slate-950/30 text-slate-100',
        };
      }

      return null;
    },
    [
      isNonVotingAdherent,
      nonVotingProfile,
    ],
  );  

  useEffect(() => {
    let active =
      true;

    async function loadSession() {
      try {
        let response =
          await apiFetch(
            '/auth/me',
            {
              cache:
                'no-store',
            },
          );

        if (
          response.status ===
          401
        ) {
          await apiFetch(
            '/auth/refresh',
            {
              method:
                'POST',
            },
          );

          response =
            await apiFetch(
              '/auth/me',
              {
                cache:
                  'no-store',
              },
            );
        }

        if (
          !response.ok
        ) {
          if (active) {
            setUser(
              null,
            );
          }

          return;
        }

        const body =
          await response.json() as {
            user:
              SessionUser;
          };

if (active) {
  setUser(
    body.user,
  );
}

if (
  body.user.role.code ===
    'MARKETPLACE_USER'
) {
  if (active) {
    setCheckingNonVotingProfile(
      true,
    );
  }

  try {
    const profile =
      await getMyNonVotingAdherentProfile();

    if (active) {
      setNonVotingProfile(
        profile,
      );
    }
  } catch {
    if (active) {
      setNonVotingProfile(
        null,
      );
    }
  } finally {
    if (active) {
      setCheckingNonVotingProfile(
        false,
      );
    }
  }
}
      } catch {
        if (active) {
          setUser(
            null,
          );
        }
      } finally {
        if (active) {
          setCheckingSession(
            false,
          );
        }
      }
    }

    void loadSession();

    return () => {
      active =
        false;
    };
  }, []);

  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>,
  ) {
event.preventDefault();

if (
  isNonVotingAdherent &&
  !nonVotingProfile?.canSubmitOffer
) {
  setError(
    'Votre caution doit être validée avant de pouvoir envoyer une offre.',
  );

  return;
}

const normalizedAmount =
      Number(
        amount,
      );

    if (
      !Number.isFinite(
        normalizedAmount,
      ) ||
      normalizedAmount <=
        0
    ) {
      setError(
        'Le montant de l’offre doit être supérieur à zéro.',
      );

      return;
    }

    const normalizedMessage =
      message.trim();

    if (
      normalizedMessage.length >
      2_000
    ) {
      setError(
        'Le message ne peut pas dépasser 2 000 caractères.',
      );

      return;
    }

    const confirmed =
      window.confirm(
        `Envoyer une offre de ${formatPrice(
          normalizedAmount,
        )} sur « ${listingTitle} » ?`,
      );

    if (!confirmed) {
      return;
    }

    setSubmitting(
      true,
    );

    setError(
      null,
    );

    setSuccess(
      null,
    );

    try {
      await createMarketplaceOffer(
        listingId,
        {
          amount:
            normalizedAmount,

          message:
            normalizedMessage ||
            undefined,
        },
      );

      setSuccess(
        'Votre offre a été envoyée au vendeur de manière confidentielle.',
      );

      setMessage(
        '',
      );

      window.setTimeout(
        () => {
          window.location.href =
            '/admin/marketplace-offers/sent';
        },
        900,
      );
    } catch (
      caughtError
    ) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'L’envoi de l’offre a échoué.',
      );
    } finally {
      setSubmitting(
        false,
      );
    }
  }

  const returnPath =
    `/marketplace/${listingSlug}`;

  const loginHref =
    `/admin/login?next=${encodeURIComponent(
      returnPath,
    )}`;

if (
  listingStatus ===
    'SOLD' ||
  listingStatus ===
    'EXPIRED'
) {
  const sold =
    listingStatus ===
    'SOLD';

  return (
    <aside
      className="
        rounded-[30px]
        bg-[var(--flascam-blue)]
        p-6
        text-white
        shadow-[0_20px_60px_rgba(7,53,93,0.18)]
      "
    >
      <p
        className="
          text-xs
          font-black
          uppercase
          tracking-[0.16em]
          text-white/65
        "
      >
        Prix demandé
      </p>

      <p
        className="
          mt-2
          text-3xl
          font-black
          text-white
        "
      >
        {formatPrice(
          requestedPrice,
        )}
      </p>

      <div
        className="
          mt-6
          rounded-2xl
          border
          border-white/15
          bg-white/10
          p-5
        "
      >
        <div
          className="
            flex
            items-start
            gap-3
          "
        >
          <CheckCircle2
            size={22}
            aria-hidden="true"
            className="
              mt-0.5
              shrink-0
              text-white
            "
          />

          <div>
            <p
              className="
                font-black
                text-white
              "
            >
              {sold
                ? 'Ce véhicule a été vendu'
                : 'Cette annonce a expiré'}
            </p>

            <p
              className="
                mt-2
                text-sm
                leading-6
                text-white/70
              "
            >
              {sold
                ? 'Une offre a été acceptée. Il n’est plus possible d’envoyer une nouvelle proposition.'
                : 'La période de publication est terminée. Il n’est plus possible d’envoyer une offre.'}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

  return (
    <section
      className="
        rounded-[30px]
        bg-[var(--flascam-blue)]
        p-6
        text-white
        shadow-[0_24px_65px_rgba(7,53,93,0.2)]
      "
    >
      <p
        className="
          text-xs
          font-black
          uppercase
          tracking-[0.14em]
          text-white/65
        "
      >
        Prix demandé
      </p>

      <p
        className="
          mt-2
          text-3xl
          font-black
        "
      >
        {formatPrice(
          requestedPrice,
        )}
      </p>

      <div
        className="
          mt-5
          rounded-2xl
          bg-white/10
          p-4
        "
      >
        <p className="font-black">
          {remainingDays}
          {' '}
          jour
          {remainingDays >
          1
            ? 's'
            : ''}
          {' '}
          restant
          {remainingDays >
          1
            ? 's'
            : ''}
        </p>

        <p
          className="
            mt-1
            text-xs
            leading-5
            text-white/70
          "
        >
          L’annonce sera automatiquement retirée à son expiration.
        </p>
      </div>

      {checkingSession ? (
        <div
          className="
            mt-6
            flex
            min-h-28
            items-center
            justify-center
            rounded-2xl
            bg-white/10
          "
        >
          <LoaderCircle
            size={25}
            className="animate-spin"
          />
        </div>
      ) : !user ? (
        <>
          <Link
            href={loginHref}
            className="
              group
              relative
              isolate
              mt-6
              inline-flex
              min-h-12
              w-full
              items-center
              justify-center
              gap-2
              overflow-hidden
              rounded-2xl
              bg-[var(--flascam-terracotta)]
              px-5
              text-center
              text-sm
              font-black
              !text-white
              shadow-[0_14px_32px_rgba(201,111,74,0.32)]
              transition-all
              duration-300
              after:pointer-events-none
              after:absolute
              after:inset-y-0
              after:-left-1/3
              after:w-1/4
              after:-skew-x-12
              after:bg-white/30
              after:blur-sm
              after:transition-transform
              after:duration-700
              hover:-translate-y-0.5
              hover:bg-[var(--flascam-terracotta-dark)]
              hover:shadow-[0_18px_38px_rgba(201,111,74,0.4)]
              hover:after:translate-x-[650%]
              active:translate-y-0
              active:scale-[0.98]
              focus-visible:outline-none
              focus-visible:ring-4
              focus-visible:ring-white/30
            "
          >
            <LockKeyhole
              size={18}
              aria-hidden="true"
              className="
                relative
                z-10
                shrink-0
                transition-transform
                duration-300
                group-hover:scale-110
              "
            />

            <span className="relative z-10">
              Se connecter pour faire une offre
            </span>
          </Link>

          <p
            className="
              mt-3
              text-center
              text-xs
              leading-5
              text-white/65
            "
          >
            Après connexion, vous reviendrez automatiquement sur ce
            véhicule.
          </p>
        </>
      ) : checkingNonVotingProfile ? (
        <div
          className="
            mt-6
            flex
            min-h-36
            items-center
            justify-center
            rounded-2xl
            border
            border-white/15
            bg-white/10
          "
        >
          <div
            className="
              text-center
            "
          >
            <LoaderCircle
              size={25}
              className="
                mx-auto
                animate-spin
                text-white
              "
            />

            <p
              className="
                mt-3
                text-sm
                font-bold
                text-white/75
              "
            >
              Vérification de votre caution…
            </p>
          </div>
        </div>
      ) : isNonVotingAdherent &&
        !nonVotingProfile ? (
        <div
          className="
            mt-6
            rounded-2xl
            border
            border-red-300/40
            bg-red-950/25
            p-5
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
              size={22}
              className="
                mt-0.5
                shrink-0
                text-red-100
              "
            />

            <div>
              <p
                className="
                  font-black
                  text-red-100
                "
              >
                Votre dossier est introuvable
              </p>

              <p
                className="
                  mt-2
                  text-sm
                  leading-6
                  text-red-100/75
                "
              >
                Aucun dossier d’adhérent non votant
                n’est associé à votre compte. Contactez
                FLASCAM avant de tenter d’envoyer une
                offre.
              </p>
            </div>
          </div>

          <Link
            href="/admin/non-voting-member-area"
            className="
              mt-5
              inline-flex
              min-h-11
              w-full
              items-center
              justify-center
              rounded-xl
              bg-white
              px-4
              text-sm
              font-black
              !text-[var(--flascam-blue)]
              transition
              hover:bg-white/90
            "
          >
            Consulter mon espace
          </Link>
        </div>
      ) : nonVotingRestriction &&
        !canDisplayOfferForm ? (
        <NonVotingOfferRestriction
          restriction={
            nonVotingRestriction
          }
        />
      ) : (
        <form
          onSubmit={
            handleSubmit
          }
          className="
            mt-6
            space-y-4
          "
        >
          <div
            className="
              rounded-2xl
              bg-white/10
              p-4
            "
          >
            <p
              className="
                text-xs
                font-bold
                uppercase
                tracking-wide
                text-white/65
              "
            >
              Compte connecté
            </p>

            <p
              className="
                mt-1
                break-all
                text-sm
                font-black
              "
            >
              {user.email}
            </p>
          </div>

          <label className="block">
            <span
              className="
                mb-2
                block
                text-sm
                font-black
              "
            >
              Montant de votre offre
              {' '}
              <span className="text-red-200">
                *
              </span>
            </span>

            <div className="relative">
              <CircleDollarSign
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
                type="number"
                min="1"
                step="1"
                value={
                  amount
                }
                onChange={(
                  event,
                ) =>
                  setAmount(
                    event.target.value,
                  )
                }
                required
                className="
                  h-12
                  w-full
                  rounded-2xl
                  border
                  border-white/20
                  bg-white
                  pl-11
                  pr-16
                  text-sm
                  font-bold
                  text-slate-950
                  outline-none
                  focus:ring-4
                  focus:ring-white/20
                "
              />

              <span
                className="
                  pointer-events-none
                  absolute
                  right-4
                  top-1/2
                  -translate-y-1/2
                  text-sm
                  font-black
                  text-slate-500
                "
              >
                MAD
              </span>
            </div>
          </label>

          <label className="block">
            <span
              className="
                mb-2
                block
                text-sm
                font-black
              "
            >
              Message au vendeur
            </span>

            <textarea
              value={
                message
              }
              onChange={(
                event,
              ) =>
                setMessage(
                  event.target.value,
                )
              }
              maxLength={
                2_000
              }
              placeholder="Présentez brièvement votre proposition, sans indiquer vos coordonnées."
              className="
                min-h-28
                w-full
                resize-y
                rounded-2xl
                border
                border-white/20
                bg-white
                px-4
                py-3
                text-sm
                leading-6
                text-slate-950
                outline-none
                placeholder:text-slate-400
                focus:ring-4
                focus:ring-white/20
              "
            />

            <span
              className="
                mt-1
                block
                text-right
                text-xs
                text-white/55
              "
            >
              {message.length}
              /2000
            </span>
          </label>

          {error && (
            <div
              role="alert"
              className="
                flex
                items-start
                gap-3
                rounded-2xl
                border
                border-red-300/40
                bg-red-950/25
                p-4
                text-sm
                font-semibold
                text-red-100
              "
            >
              <AlertCircle
                size={19}
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
                flex
                items-start
                gap-3
                rounded-2xl
                border
                border-emerald-300/40
                bg-emerald-950/25
                p-4
                text-sm
                font-semibold
                text-emerald-100
              "
            >
              <CheckCircle2
                size={19}
                className="
                  mt-0.5
                  shrink-0
                "
              />

              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="
              group
              relative
              isolate
              inline-flex
              min-h-12
              w-full
              items-center
              justify-center
              gap-2
              overflow-hidden
              rounded-2xl
              bg-[var(--flascam-terracotta)]
              px-5
              text-sm
              font-black
              !text-white
              shadow-[0_14px_32px_rgba(201,111,74,0.32)]
              transition-all
              duration-300
              after:pointer-events-none
              after:absolute
              after:inset-y-0
              after:-left-1/3
              after:w-1/4
              after:-skew-x-12
              after:bg-white/30
              after:blur-sm
              after:transition-transform
              after:duration-700
              hover:-translate-y-0.5
              hover:bg-[var(--flascam-terracotta-dark)]
              hover:shadow-[0_18px_38px_rgba(201,111,74,0.4)]
              hover:after:translate-x-[650%]
              active:translate-y-0
              active:scale-[0.98]
              disabled:cursor-not-allowed
              disabled:translate-y-0
              disabled:opacity-60
              disabled:shadow-none
            "
          >
            {submitting ? (
              <LoaderCircle
                size={18}
                aria-hidden="true"
                className="
                  relative
                  z-10
                  shrink-0
                  animate-spin
                "
              />
            ) : (
              <Send
                size={18}
                aria-hidden="true"
                className="
                  relative
                  z-10
                  shrink-0
                  transition-transform
                  duration-300
                  group-hover:translate-x-0.5
                  group-hover:-translate-y-0.5
                "
              />
            )}

            <span className="relative z-10">
              {submitting
                ? 'Envoi de l’offre…'
                : 'Envoyer mon offre'}
            </span>
          </button>

          <p
            className="
              text-center
              text-xs
              leading-5
              text-white/65
            "
          >
            Votre identité restera masquée tant que le vendeur
            n’accepte pas votre offre.
          </p>
        </form>
      )}
    </section>
  );
}

type NonVotingOfferRestrictionProps = {
  restriction: {
    icon:
      typeof CreditCard;

    title:
      string;

    description:
      string;

    linkLabel:
      string;

    className:
      string;
  };
};

function NonVotingOfferRestriction({
  restriction,
}: NonVotingOfferRestrictionProps) {
  const RestrictionIcon =
    restriction.icon;

  return (
    <div
      className={`
        mt-6
        rounded-2xl
        border
        p-5
        ${restriction.className}
      `}
    >
      <div
        className="
          flex
          items-start
          gap-3
        "
      >
        <div
          className="
            grid
            size-11
            shrink-0
            place-items-center
            rounded-xl
            bg-white/10
          "
        >
          <RestrictionIcon
            size={22}
          />
        </div>

        <div
          className="
            min-w-0
            flex-1
          "
        >
          <p
            className="
              font-black
            "
          >
            {restriction.title}
          </p>

          <p
            className="
              mt-2
              text-sm
              leading-6
              opacity-80
            "
          >
            {restriction.description}
          </p>
        </div>
      </div>

      <Link
        href="/admin/non-voting-member-area"
        className="
          mt-5
          inline-flex
          min-h-11
          w-full
          items-center
          justify-center
          gap-2
          rounded-xl
          bg-[var(--flascam-terracotta)]
          px-4
          text-sm
          font-black
          !text-white
          transition
          hover:bg-[var(--flascam-terracotta-dark)]
        "
      >
        <WalletStatusIcon />

        {restriction.linkLabel}
      </Link>
    </div>
  );
}

function WalletStatusIcon() {
  return (
    <BadgeCheck
      size={18}
      aria-hidden="true"
    />
  );
}