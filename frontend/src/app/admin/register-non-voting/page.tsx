'use client';

import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from 'react';

import Link from 'next/link';

import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  CheckCircle2,
  CreditCard,
  Loader2,
  LockKeyhole,
  ShieldCheck,
  UserRound,
  WalletCards,
} from 'lucide-react';

import {
  getNonVotingRegistrationConfig,
  registerNonVotingAdherent,
} from '@/lib/non-voting-adherents-api';

import type {
  NonVotingRegistrationConfig,
  NonVotingRegistrationForm,
  RegisterNonVotingAdherentResponse,
} from '@/types/non-voting-adherents';

const initialForm:
  NonVotingRegistrationForm = {
    firstName:
      '',

    lastName:
      '',

    phone:
      '',

    email:
      '',

    city:
      '',

    password:
      '',

    passwordConfirmation:
      '',

depositPaymentMethod:
  '',

    wafacashReference:
      '',
  };

type RegistrationStep =
  | 1
  | 2
  | 3;

export default function RegisterNonVotingPage() {
  const [
    step,
    setStep,
  ] = useState<
    RegistrationStep
  >(
    1,
  );

  const [
    form,
    setForm,
  ] = useState<
    NonVotingRegistrationForm
  >(
    initialForm,
  );

  const [
    config,
    setConfig,
  ] = useState<
    NonVotingRegistrationConfig | null
  >(
    null,
  );

  const [
    result,
    setResult,
  ] = useState<
    RegisterNonVotingAdherentResponse | null
  >(
    null,
  );

  const [
    loadingConfig,
    setLoadingConfig,
  ] = useState(
    true,
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
  >(
    null,
  );

  useEffect(() => {
    let active =
      true;

    async function loadConfig() {
      try {
        const response =
          await getNonVotingRegistrationConfig();

        if (active) {
          setConfig(
            response,
          );
        }
      } catch (
        currentError
      ) {
        if (active) {
          setError(
            currentError instanceof
              Error
              ? currentError.message
              : 'Impossible de charger les informations de caution.',
          );
        }
      } finally {
        if (active) {
          setLoadingConfig(
            false,
          );
        }
      }
    }

    void loadConfig();

    return () => {
      active =
        false;
    };
  }, []);

  const formattedDeposit =
    useMemo(
      () => {
        if (!config) {
          return '—';
        }

        const amount =
          Number(
            config.depositAmount,
          );

        if (
          !Number.isFinite(
            amount,
          )
        ) {
          return `${config.depositAmount} ${config.currency}`;
        }

        return new Intl.NumberFormat(
          'fr-MA',
          {
            style:
              'currency',

            currency:
              config.currency,

            maximumFractionDigits:
              2,
          },
        ).format(
          amount,
        );
      },
      [
        config,
      ],
    );

  function updateField<
    Key extends
      keyof NonVotingRegistrationForm,
  >(
    key:
      Key,

    value:
      NonVotingRegistrationForm[Key],
  ) {
    setForm(
      (
        current,
      ) => ({
        ...current,

        [key]:
          value,
      }),
    );

    setError(
      null,
    );
  }

  function validateStepOne() {
    if (
      !form.firstName.trim()
    ) {
      return 'Le prénom est obligatoire.';
    }

    if (
      !form.lastName.trim()
    ) {
      return 'Le nom est obligatoire.';
    }

    if (
      !form.phone.trim()
    ) {
      return 'Le numéro de téléphone est obligatoire.';
    }

    if (
      !form.city.trim()
    ) {
      return 'La ville est obligatoire.';
    }

    return null;
  }

  function validateStepTwo() {
    if (
      !form.email.trim()
    ) {
      return 'L’adresse e-mail est obligatoire.';
    }

    if (
      form.password.length <
      12
    ) {
      return 'Le mot de passe doit contenir au moins 12 caractères.';
    }

    if (
      form.password !==
      form.passwordConfirmation
    ) {
      return 'Les deux mots de passe ne correspondent pas.';
    }

    return null;
  }

function validateStepThree() {
  if (
    !form.depositPaymentMethod
  ) {
    return 'Choisissez un mode de paiement.';
  }

  if (
    form.depositPaymentMethod ===
      'WAFACASH' &&
    !form.wafacashReference.trim()
  ) {
    return 'Le code Wafacash est obligatoire.';
  }

  return null;
}

  function goNext() {
    const validationError =
      step === 1
        ? validateStepOne()
        : validateStepTwo();

    if (
      validationError
    ) {
      setError(
        validationError,
      );

      return;
    }

    setError(
      null,
    );

    setStep(
      (
        current,
      ) =>
        Math.min(
          3,
          current +
            1,
        ) as RegistrationStep,
    );
  }

async function submit(
  event:
    FormEvent<HTMLFormElement>,
) {
  event.preventDefault();

  /*
   * Empêche la touche Entrée de créer le compte
   * depuis les étapes 1 ou 2.
   */
  if (
    step < 3
  ) {
    goNext();

    return;
  }

  const validationError =
    validateStepThree();

    if (
      validationError
    ) {
      setError(
        validationError,
      );

      return;
    }

const paymentMethod =
  form.depositPaymentMethod;

if (
  !paymentMethod
) {
  setError(
    'Choisissez un mode de paiement.',
  );

  return;
}    

    setSubmitting(
      true,
    );

    setError(
      null,
    );

    try {
      const response =
        await registerNonVotingAdherent({
          firstName:
            form.firstName.trim(),

          lastName:
            form.lastName.trim(),

          phone:
            form.phone.trim(),

          city:
            form.city.trim(),

          email:
            form.email
              .trim()
              .toLowerCase(),

          password:
            form.password,

depositPaymentMethod:
  paymentMethod,

...(paymentMethod ===
'WAFACASH'
            ? {
                wafacashReference:
                  form.wafacashReference.trim(),
              }
            : {}),
        });

      setResult(
        response,
      );
    } catch (
      currentError
    ) {
      setError(
        currentError instanceof
          Error
          ? currentError.message
          : 'Votre inscription n’a pas pu être finalisée.',
      );
    } finally {
      setSubmitting(
        false,
      );
    }
  }

  if (
    loadingConfig
  ) {
    return (
      <main
        className="
          grid
          min-h-screen
          place-items-center
          bg-slate-950
          px-4
        "
      >
        <div
          className="
            text-center
            text-white
          "
        >
          <Loader2
            size={38}
            className="
              mx-auto
              animate-spin
            "
          />

          <p
            className="
              mt-4
              text-sm
              font-bold
              text-white/75
            "
          >
            Préparation de votre inscription…
          </p>
        </div>
      </main>
    );
  }

  if (
    result
  ) {
    return (
      <main
        className="
          grid
          min-h-screen
          place-items-center
          bg-slate-950
          px-4
          py-10
        "
      >
        <section
          className="
            w-full
            max-w-xl
            rounded-[2rem]
            bg-white
            p-6
            shadow-2xl
            sm:p-9
          "
        >
          <div
            className={`
              grid
              size-16
              place-items-center
              rounded-2xl
              ${
                result.loginAllowed
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-blue-100 text-blue-700'
              }
            `}
          >
            {result.loginAllowed ? (
              <CheckCircle2
                size={32}
              />
            ) : (
              <ShieldCheck
                size={32}
              />
            )}
          </div>

          <h1
            className="
              mt-6
              text-3xl
              font-black
              text-slate-950
            "
          >
            {result.loginAllowed
              ? 'Votre compte est actif'
              : 'Votre inscription est enregistrée'}
          </h1>

          <p
            className="
              mt-3
              text-sm
              leading-7
              text-slate-600
            "
          >
            {result.message}
          </p>

          {result.loginAllowed ? (
            <Link
              href="/admin/login"
              className="
                mt-7
                inline-flex
                min-h-12
                w-full
                items-center
                justify-center
                rounded-xl
                bg-[var(--flascam-blue)]
                px-5
                text-sm
                font-extrabold
                text-white
                transition
                hover:bg-[var(--flascam-blue-dark)]
              "
            >
              Me connecter
            </Link>
          ) : (
            <div
              className="
                mt-7
                rounded-2xl
                border
                border-blue-200
                bg-blue-50
                p-5
              "
            >
              <strong
                className="
                  block
                  text-blue-950
                "
              >
                Validation FLASCAM requise
              </strong>

              <p
                className="
                  mt-2
                  text-sm
                  leading-6
                  text-blue-900/75
                "
              >
                Votre référence Wafacash va être vérifiée.
                La connexion sera disponible après sa
                validation.
              </p>

              <Link
                href="/admin/login"
                className="
                  mt-5
                  inline-flex
                  min-h-11
                  w-full
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-blue-300
                  bg-white
                  px-4
                  text-sm
                  font-extrabold
                  text-blue-800
                "
              >
                Retour à la connexion
              </Link>
            </div>
          )}
        </section>
      </main>
    );
  }

  return (
    <main
      className="
        min-h-screen
        bg-slate-950
        px-4
        py-8
        sm:px-6
      "
    >
      <div
        className="
          mx-auto
          w-full
          max-w-3xl
        "
      >
        <Link
          href="/admin/login"
          className="
            inline-flex
            items-center
            gap-2
            text-sm
            font-bold
            text-white/75
            transition
            hover:text-white
          "
        >
          <ArrowLeft
            size={17}
          />

          Retour à la connexion
        </Link>

        <section
          className="
            mt-5
            overflow-hidden
            rounded-[2rem]
            bg-white
            shadow-2xl
          "
        >
          <header
            className="
              bg-[var(--flascam-blue)]
              px-5
              py-6
              text-white
              sm:px-8
            "
          >
            <p
              className="
                flex
                items-center
                gap-2
                text-xs
                font-black
                uppercase
                tracking-[0.16em]
                text-white/70
              "
            >
              <WalletCards
                size={17}
              />

              Marketplace FLASCAM
            </p>

            <h1
              className="
                mt-3
                text-2xl
                font-black
                sm:text-3xl
              "
            >
              Créer un compte acheteur
            </h1>

            <p
              className="
                mt-2
                max-w-2xl
                text-sm
                leading-6
                text-white/75
              "
            >
              Rejoignez la marketplace pour consulter les
              véhicules disponibles, envoyer vos offres et
              suivre leur résultat depuis un espace simple.
            </p>
          </header>

          <div
            className="
              border-b
              border-slate-100
              px-5
              py-5
              sm:px-8
            "
          >
            <div
              className="
                grid
                grid-cols-3
                gap-2
              "
            >
              <StepIndicator
                number={1}
                label="Informations"
                active={
                  step >=
                  1
                }
                current={
                  step ===
                  1
                }
              />

              <StepIndicator
                number={2}
                label="Identifiants"
                active={
                  step >=
                  2
                }
                current={
                  step ===
                  2
                }
              />

              <StepIndicator
                number={3}
                label="Caution"
                active={
                  step >=
                  3
                }
                current={
                  step ===
                  3
                }
              />
            </div>
          </div>

          <form
            onSubmit={
              submit
            }
          >
            <div
              className="
                px-5
                py-7
                sm:px-8
              "
            >
              {error && (
                <div
                  role="alert"
                  className="
                    mb-6
                    rounded-2xl
                    border
                    border-red-200
                    bg-red-50
                    px-4
                    py-3
                    text-sm
                    font-semibold
                    text-red-800
                  "
                >
                  {error}
                </div>
              )}

              {step ===
                1 && (
                <div
                  className="
                    grid
                    gap-5
                    sm:grid-cols-2
                  "
                >
                  <RegistrationInput
                    label="Prénom"
                    value={
                      form.firstName
                    }
                    onChange={(
                      value,
                    ) =>
                      updateField(
                        'firstName',
                        value,
                      )
                    }
                    autoComplete="given-name"
                  />

                  <RegistrationInput
                    label="Nom"
                    value={
                      form.lastName
                    }
                    onChange={(
                      value,
                    ) =>
                      updateField(
                        'lastName',
                        value,
                      )
                    }
                    autoComplete="family-name"
                  />

                  <RegistrationInput
                    label="Téléphone"
                    value={
                      form.phone
                    }
                    onChange={(
                      value,
                    ) =>
                      updateField(
                        'phone',
                        value,
                      )
                    }
                    type="tel"
                    autoComplete="tel"
                  />

                  <RegistrationInput
                    label="Ville"
                    value={
                      form.city
                    }
                    onChange={(
                      value,
                    ) =>
                      updateField(
                        'city',
                        value,
                      )
                    }
                    autoComplete="address-level2"
                  />
                </div>
              )}

              {step ===
                2 && (
                <div
                  className="
                    grid
                    gap-5
                  "
                >
                  <RegistrationInput
                    label="Adresse e-mail"
                    value={
                      form.email
                    }
                    onChange={(
                      value,
                    ) =>
                      updateField(
                        'email',
                        value,
                      )
                    }
                    type="email"
                    autoComplete="email"
                  />

                  <div
                    className="
                      grid
                      gap-5
                      sm:grid-cols-2
                    "
                  >
                    <RegistrationInput
                      label="Mot de passe"
                      value={
                        form.password
                      }
                      onChange={(
                        value,
                      ) =>
                        updateField(
                          'password',
                          value,
                        )
                      }
                      type="password"
                      autoComplete="new-password"
                    />

                    <RegistrationInput
                      label="Confirmation"
                      value={
                        form.passwordConfirmation
                      }
                      onChange={(
                        value,
                      ) =>
                        updateField(
                          'passwordConfirmation',
                          value,
                        )
                      }
                      type="password"
                      autoComplete="new-password"
                    />
                  </div>

                  <div
                    className="
                      flex
                      items-start
                      gap-3
                      rounded-2xl
                      bg-slate-50
                      p-4
                    "
                  >
                    <LockKeyhole
                      size={20}
                      className="
                        mt-0.5
                        shrink-0
                        text-[var(--flascam-blue)]
                      "
                    />

                    <p
                      className="
                        text-sm
                        leading-6
                        text-slate-600
                      "
                    >
                      Utilisez au minimum 12 caractères.
                      Votre mot de passe est chiffré et
                      n’est jamais visible par FLASCAM.
                    </p>
                  </div>
                </div>
              )}

              {step ===
                3 && (
                <div>
                  <div
                    className="
                      rounded-3xl
                      border
                      border-[#ead0c7]
                      bg-[#fff8f5]
                      p-5
                      text-center
                    "
                  >
                    <p
                      className="
                        text-xs
                        font-black
                        uppercase
                        tracking-[0.14em]
                        text-[#9b4028]
                      "
                    >
                      Montant de la caution
                    </p>

                    <strong
                      className="
                        mt-2
                        block
                        text-3xl
                        font-black
                        text-slate-950
                        sm:text-4xl
                      "
                    >
                      {formattedDeposit}
                    </strong>

                    <p
                      className="
                        mt-2
                        text-sm
                        text-slate-600
                      "
                    >
                      Cette caution est nécessaire pour
                      envoyer des offres sur les véhicules.
                    </p>
                  </div>

                  <div
                    className="
                      mt-6
                      grid
                      gap-4
                      sm:grid-cols-2
                    "
                  >
                    <PaymentChoice
                      selected={
                        form.depositPaymentMethod ===
                        'CARD'
                      }
                      icon={
                        CreditCard
                      }
                      title="Carte bancaire"
                      description="Pour le moment, ce choix valide immédiatement votre compte."
                      onClick={() =>
                        updateField(
                          'depositPaymentMethod',
                          'CARD',
                        )
                      }
                    />

                    <PaymentChoice
                      selected={
                        form.depositPaymentMethod ===
                        'WAFACASH'
                      }
                      icon={
                        Banknote
                      }
                      title="Wafacash"
                      description="Votre référence sera vérifiée manuellement par FLASCAM."
                      onClick={() =>
                        updateField(
                          'depositPaymentMethod',
                          'WAFACASH',
                        )
                      }
                    />
                  </div>

                  {form.depositPaymentMethod ===
                    'WAFACASH' && (
                    <div
                      className="
                        mt-6
                      "
                    >
                      <RegistrationInput
                        label="Code ou référence Wafacash"
                        value={
                          form.wafacashReference
                        }
                        onChange={(
                          value,
                        ) =>
                          updateField(
                            'wafacashReference',
                            value,
                          )
                        }
                        placeholder="Ex. WFC-2026-000123"
                      />

                      <p
                        className="
                          mt-2
                          text-xs
                          leading-5
                          text-slate-500
                        "
                      >
                        Votre compte restera inaccessible
                        jusqu’à la vérification de ce code
                        par FLASCAM.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <footer
              className="
                flex
                flex-col-reverse
                gap-3
                border-t
                border-slate-100
                bg-slate-50
                px-5
                py-5
                sm:flex-row
                sm:items-center
                sm:justify-between
                sm:px-8
              "
            >
              {step >
              1 ? (
                <button
                  type="button"
                  onClick={() => {
                    setError(
                      null,
                    );

                    setStep(
                      (
                        current,
                      ) =>
                        Math.max(
                          1,
                          current -
                            1,
                        ) as RegistrationStep,
                    );
                  }}
                  disabled={
                    submitting
                  }
                  className="
                    inline-flex
                    min-h-12
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    border
                    border-slate-300
                    bg-white
                    px-5
                    text-sm
                    font-extrabold
                    text-slate-700
                  "
                >
                  <ArrowLeft
                    size={18}
                  />

                  Retour
                </button>
              ) : (
                <span />
              )}

              {step <
              3 ? (
                <button
                  type="button"
                  onClick={
                    goNext
                  }
                  className="
                    inline-flex
                    min-h-12
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-[var(--flascam-blue)]
                    px-6
                    text-sm
                    font-extrabold
                    text-white
                    transition
                    hover:bg-[var(--flascam-blue-dark)]
                  "
                >
                  Continuer

                  <ArrowRight
                    size={18}
                  />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={
                    submitting
                  }
                  className="
                    inline-flex
                    min-h-12
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-[#A9472B]
                    px-6
                    text-sm
                    font-extrabold
                    text-white
                    transition
                    hover:bg-[#913B24]
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >
                  {submitting ? (
                    <>
                      <Loader2
                        size={18}
                        className="animate-spin"
                      />

                      Création…
                    </>
                  ) : (
                    <>
                      <ShieldCheck
                        size={18}
                      />

                      Créer mon compte
                    </>
                  )}
                </button>
              )}
            </footer>
          </form>
        </section>
      </div>
    </main>
  );
}

function StepIndicator({
  number,
  label,
  active,
  current,
}: {
  number: number;

  label: string;

  active: boolean;

  current: boolean;
}) {
  return (
    <div
      className="
        text-center
      "
    >
      <span
        className={`
          mx-auto
          grid
          size-9
          place-items-center
          rounded-full
          text-sm
          font-black
          transition
          ${
            current
              ? 'bg-[#A9472B] text-white'
              : active
                ? 'bg-[var(--flascam-blue)] text-white'
                : 'bg-slate-200 text-slate-500'
          }
        `}
      >
        {number}
      </span>

      <span
        className={`
          mt-2
          block
          text-[11px]
          font-black
          sm:text-xs
          ${
            current
              ? 'text-[#A9472B]'
              : active
                ? 'text-[var(--flascam-blue)]'
                : 'text-slate-400'
          }
        `}
      >
        {label}
      </span>
    </div>
  );
}

function RegistrationInput({
  label,
  value,
  onChange,
  type =
    'text',
  placeholder,
  autoComplete,
}: {
  label: string;

  value: string;

  onChange: (
    value:
      string,
  ) => void;

  type?: string;

  placeholder?: string;

  autoComplete?: string;
}) {
  return (
    <label
      className="
        block
        text-sm
        font-black
        text-slate-800
      "
    >
      {label}

      <span
        className="
          text-red-600
        "
      >
        {' '}*
      </span>

      <input
        type={
          type
        }
        value={
          value
        }
        onChange={(
          event,
        ) =>
          onChange(
            event.target.value,
          )
        }
        placeholder={
          placeholder
        }
        autoComplete={
          autoComplete
        }
        required
        className="
          mt-2
          min-h-12
          w-full
          rounded-xl
          border
          border-slate-300
          bg-white
          px-4
          text-sm
          font-semibold
          text-slate-950
          outline-none
          transition
          focus:border-[var(--flascam-blue)]
          focus:ring-4
          focus:ring-[#eaf5ff]
        "
      />
    </label>
  );
}

function PaymentChoice({
  selected,
  icon:
    Icon,
  title,
  description,
  onClick,
}: {
  selected: boolean;

  icon:
    typeof CreditCard;

  title: string;

  description: string;

  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className={`
        rounded-2xl
        border
        p-5
        text-left
        transition
        ${
          selected
            ? 'border-[#A9472B] bg-[#fff8f5] ring-4 ring-[#A9472B]/10'
            : 'border-slate-200 bg-white hover:border-slate-300'
        }
      `}
    >
      <Icon
        size={24}
        className={
          selected
            ? 'text-[#A9472B]'
            : 'text-slate-500'
        }
      />

      <strong
        className="
          mt-4
          block
          text-base
          text-slate-950
        "
      >
        {title}
      </strong>

      <span
        className="
          mt-2
          block
          text-sm
          leading-6
          text-slate-600
        "
      >
        {description}
      </span>
    </button>
  );
}