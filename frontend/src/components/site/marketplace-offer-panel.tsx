'use client';

import {
  type FormEvent,
  useEffect,
  useState,
} from 'react';

import Link from 'next/link';

import {
  AlertCircle,
  CheckCircle2,
  CircleDollarSign,
  LoaderCircle,
  LockKeyhole,
  Send,
} from 'lucide-react';

import {
  createMarketplaceOffer,
} from '@/lib/marketplace-api';

import {
  apiFetch,
} from '@/lib/api';

type MarketplaceOfferPanelProps = {
  listingId: string;
  listingSlug: string;
  listingTitle: string;

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
            href={
              loginHref
            }
            className="
              mt-6
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
              font-black
              text-white
              transition
              hover:brightness-95
            "
          >
            <LockKeyhole
              size={18}
            />

            Se connecter pour faire une offre
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
            disabled={
              submitting
            }
            className="
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
              font-black
              text-white
              transition
              hover:brightness-95
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            {submitting ? (
              <LoaderCircle
                size={18}
                className="animate-spin"
              />
            ) : (
              <Send
                size={18}
              />
            )}

            {submitting
              ? 'Envoi de l’offre…'
              : 'Envoyer mon offre'}
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