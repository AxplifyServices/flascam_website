'use client';

import {
  FormEvent,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Clock3,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  UserRound,
  UsersRound,
  X,
  XCircle,
} from 'lucide-react';

import {
  createAdherentPayload,
  createAssociationAdherent,
  getAssociationAdherents,
} from '@/lib/adherents-api';

import type {
  Adherent,
  AdherentFormState,
  AdherentIdentifierType,
  AdherentStatus,
} from '@/types/adherents';

const emptyForm: AdherentFormState = {
  regionalAssociationId:
    '',

  displayName:
    '',

  legalName:
    '',

  identifierType:
    '',

  identifierValue:
    '',

  address:
    '',

  city:
    '',

  postalCode:
    '',

  notes:
    '',

  firstName:
    '',

  lastName:
    '',

  email:
    '',

  phone:
    '',

  password:
    '',

  passwordConfirmation:
    '',

  approveImmediately:
    false,
};

const statusLabels:
  Record<
    AdherentStatus,
    string
  > = {
    PENDING:
      'En attente de validation',

    APPROVED:
      'Validé',

    REJECTED:
      'Refusé',

    SUSPENDED:
      'Suspendu',
  };

const identifierTypeLabels:
  Record<
    AdherentIdentifierType,
    string
  > = {
    ICE:
      'ICE',

    IF:
      'Identifiant fiscal',

    RC:
      'Registre de commerce',

    CIN:
      'CIN',

    OTHER:
      'Autre identifiant',
  };

type StatusFilter =
  | 'ALL'
  | AdherentStatus;

function normalizeSearchValue(
  value: string,
) {
  return value
    .toLocaleLowerCase(
      'fr',
    )
    .normalize(
      'NFD',
    )
    .replace(
      /[\u0300-\u036f]/g,
      '',
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
  status: AdherentStatus,
) {
  switch (
    status
  ) {
    case 'APPROVED':
      return {
        badge:
          'border-emerald-200 bg-emerald-50 text-emerald-800',

        icon:
          'bg-emerald-100 text-emerald-700',
      };

    case 'REJECTED':
      return {
        badge:
          'border-red-200 bg-red-50 text-red-800',

        icon:
          'bg-red-100 text-red-700',
      };

    case 'SUSPENDED':
      return {
        badge:
          'border-slate-300 bg-slate-100 text-slate-700',

        icon:
          'bg-slate-200 text-slate-700',
      };

    case 'PENDING':
    default:
      return {
        badge:
          'border-amber-200 bg-amber-50 text-amber-800',

        icon:
          'bg-amber-100 text-amber-700',
      };
  }
}

function StatusIcon({
  status,
  size = 18,
}: {
  status:
    AdherentStatus;

  size?: number;
}) {
  if (
    status ===
    'APPROVED'
  ) {
    return (
      <CheckCircle2
        size={size}
      />
    );
  }

  if (
    status ===
      'REJECTED' ||
    status ===
      'SUSPENDED'
  ) {
    return (
      <XCircle
        size={size}
      />
    );
  }

  return (
    <Clock3
      size={size}
    />
  );
}

function StatusBadge({
  status,
}: {
  status:
    AdherentStatus;
}) {
  const classes =
    getStatusClasses(
      status,
    );

  return (
    <span
      className={`
        inline-flex
        items-center
        gap-1.5
        rounded-full
        border
        px-3
        py-1.5
        text-xs
        font-extrabold
        ${classes.badge}
      `}
    >
      <StatusIcon
        status={status}
        size={15}
      />

      {
        statusLabels[
          status
        ]
      }
    </span>
  );
}

function InputLabel({
  htmlFor,
  children,
  required = false,
}: {
  htmlFor: string;
children:
  ReactNode;
  required?: boolean;
}) {
  return (
    <label
      htmlFor={
        htmlFor
      }
      className="
        mb-2
        block
        text-sm
        font-extrabold
        text-slate-800
      "
    >
      {children}

      {required && (
        <span
          className="
            ml-1
            text-red-600
          "
        >
          *
        </span>
      )}
    </label>
  );
}

function AdherentCard({
  adherent,
}: {
  adherent:
    Adherent;
}) {
  const classes =
    getStatusClasses(
      adherent.status,
    );

  return (
    <article
      className="
        overflow-hidden
        rounded-[1.75rem]
        border
        border-[var(--flascam-border)]
        bg-white
        shadow-[0_16px_45px_rgba(7,53,93,0.06)]
      "
    >
      <div
        className="
          flex
          flex-col
          gap-4
          p-5
          sm:p-6
          lg:flex-row
          lg:items-start
          lg:justify-between
        "
      >
        <div
          className="
            flex
            min-w-0
            items-start
            gap-4
          "
        >
          <div
            className={`
              grid
              size-12
              shrink-0
              place-items-center
              rounded-2xl
              ${classes.icon}
            `}
          >
            <Building2
              size={23}
            />
          </div>

          <div
            className="
              min-w-0
            "
          >
            <div
              className="
                flex
                flex-col
                gap-2
                sm:flex-row
                sm:items-center
              "
            >
              <h2
                className="
                  break-words
                  text-lg
                  font-extrabold
                  tracking-[-0.02em]
                  text-slate-950
                "
              >
                {
                  adherent.displayName
                }
              </h2>

              <StatusBadge
                status={
                  adherent.status
                }
              />
            </div>

            {adherent.legalName && (
              <p
                className="
                  mt-1
                  text-sm
                  font-semibold
                  text-[var(--flascam-slate)]
                "
              >
                {
                  adherent.legalName
                }
              </p>
            )}

            <div
              className="
                mt-4
                flex
                flex-wrap
                gap-x-5
                gap-y-2
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
                <UserRound
                  size={16}
                />

                {
                  adherent
                    .account
                    .firstName
                }{' '}
                {
                  adherent
                    .account
                    .lastName
                }
              </span>

              <span
                className="
                  inline-flex
                  min-w-0
                  items-center
                  gap-2
                "
              >
                <Mail
                  size={16}
                  className="
                    shrink-0
                  "
                />

                <span
                  className="
                    break-all
                  "
                >
                  {
                    adherent
                      .account
                      .email
                  }
                </span>
              </span>

              {adherent.account.phone && (
                <span
                  className="
                    inline-flex
                    items-center
                    gap-2
                  "
                >
                  <Phone
                    size={16}
                  />

                  {
                    adherent
                      .account
                      .phone
                  }
                </span>
              )}

              {adherent.city && (
                <span
                  className="
                    inline-flex
                    items-center
                    gap-2
                  "
                >
                  <MapPin
                    size={16}
                  />

                  {
                    adherent.city
                  }
                </span>
              )}
            </div>
          </div>
        </div>

        <div
          className="
            shrink-0
            rounded-2xl
            bg-[#f8fbff]
            px-4
            py-3
            text-left
            lg:text-right
          "
        >
          <p
            className="
              text-[0.7rem]
              font-extrabold
              uppercase
              tracking-[0.14em]
              text-slate-500
            "
          >
            Demande envoyée
          </p>

          <p
            className="
              mt-1
              text-sm
              font-bold
              text-slate-800
            "
          >
            {
              formatDate(
                adherent.submittedAt,
              )
            }
          </p>
        </div>
      </div>

      <div
        className="
          grid
          gap-px
          border-t
          border-[var(--flascam-border)]
          bg-[var(--flascam-border)]
          sm:grid-cols-2
          lg:grid-cols-4
        "
      >
        <div
          className="
            bg-[#fbfdff]
            px-5
            py-4
          "
        >
          <p
            className="
              text-xs
              font-bold
              uppercase
              tracking-wide
              text-slate-500
            "
          >
            Identifiant
          </p>

          <p
            className="
              mt-1
              text-sm
              font-extrabold
              text-slate-900
            "
          >
            {adherent.identifierType &&
            adherent.identifierValue
              ? `${
                  identifierTypeLabels[
                    adherent
                      .identifierType
                  ]
                } : ${
                  adherent
                    .identifierValue
                }`
              : 'Non renseigné'}
          </p>
        </div>

        <div
          className="
            bg-[#fbfdff]
            px-5
            py-4
          "
        >
          <p
            className="
              text-xs
              font-bold
              uppercase
              tracking-wide
              text-slate-500
            "
          >
            Compte
          </p>

          <p
            className="
              mt-1
              text-sm
              font-extrabold
              text-slate-900
            "
          >
            {adherent.account.isActive
              ? 'Actif'
              : 'Inactif'}
          </p>
        </div>

        <div
          className="
            bg-[#fbfdff]
            px-5
            py-4
          "
        >
          <p
            className="
              text-xs
              font-bold
              uppercase
              tracking-wide
              text-slate-500
            "
          >
            Validation
          </p>

          <p
            className="
              mt-1
              text-sm
              font-extrabold
              text-slate-900
            "
          >
            {
              formatDate(
                adherent.reviewedAt,
              )
            }
          </p>
        </div>

        <div
          className="
            bg-[#fbfdff]
            px-5
            py-4
          "
        >
          <p
            className="
              text-xs
              font-bold
              uppercase
              tracking-wide
              text-slate-500
            "
          >
            Dernière connexion
          </p>

          <p
            className="
              mt-1
              text-sm
              font-extrabold
              text-slate-900
            "
          >
            {
              formatDate(
                adherent
                  .account
                  .lastLoginAt,
              )
            }
          </p>
        </div>
      </div>

      {adherent.status ===
        'PENDING' && (
        <div
          className="
            border-t
            border-amber-200
            bg-amber-50
            px-5
            py-4
            sm:px-6
          "
        >
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
                text-amber-700
              "
            />

            <p
              className="
                text-sm
                leading-6
                text-amber-900
              "
            >
              Cette demande a été
              transmise à FLASCAM.
              Le compte ne pourra être
              utilisé qu’après sa
              validation.
            </p>
          </div>
        </div>
      )}

      {adherent.status ===
        'REJECTED' && (
        <div
          className="
            border-t
            border-red-200
            bg-red-50
            px-5
            py-4
            sm:px-6
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
              size={19}
              className="
                mt-0.5
                shrink-0
                text-red-700
              "
            />

            <div>
              <p
                className="
                  text-sm
                  font-extrabold
                  text-red-900
                "
              >
                Motif du refus
              </p>

              <p
                className="
                  mt-1
                  whitespace-pre-wrap
                  text-sm
                  leading-6
                  text-red-900/85
                "
              >
                {adherent.rejectionReason ||
                  'Aucun motif détaillé n’a été communiqué.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {adherent.status ===
        'SUSPENDED' && (
        <div
          className="
            border-t
            border-slate-200
            bg-slate-100
            px-5
            py-4
            sm:px-6
          "
        >
          <div
            className="
              flex
              items-start
              gap-3
            "
          >
            <ShieldCheck
              size={19}
              className="
                mt-0.5
                shrink-0
                text-slate-700
              "
            />

            <p
              className="
                text-sm
                leading-6
                text-slate-800
              "
            >
              Ce compte a été suspendu
              par FLASCAM et ne peut
              actuellement plus se
              connecter.
            </p>
          </div>
        </div>
      )}
    </article>
  );
}

export default function MyAdherentsPage() {
  const [
    adherents,
    setAdherents,
  ] = useState<
    Adherent[]
  >([]);

  const [
    form,
    setForm,
  ] = useState<
    AdherentFormState
  >(
    emptyForm,
  );

  const [
    loading,
    setLoading,
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
    formOpen,
    setFormOpen,
  ] = useState(
    false,
  );

  const [
    showPassword,
    setShowPassword,
  ] = useState(
    false,
  );

  const [
    showPasswordConfirmation,
    setShowPasswordConfirmation,
  ] = useState(
    false,
  );

  const [
    statusFilter,
    setStatusFilter,
  ] = useState<
    StatusFilter
  >(
    'ALL',
  );

  const [
    search,
    setSearch,
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

  const loadAdherents =
    useCallback(
      async () => {
        setLoading(
          true,
        );

        setError(
          null,
        );

        try {
          const data =
            await getAssociationAdherents();

          setAdherents(
            data,
          );
        } catch (
          caughtError
        ) {
          setError(
            caughtError instanceof
            Error
              ? caughtError.message
              : 'Impossible de charger les adhérents.',
          );
        } finally {
          setLoading(
            false,
          );
        }
      },
      [],
    );

  useEffect(() => {
    void loadAdherents();
  }, [
    loadAdherents,
  ]);

  useEffect(() => {
    if (
      !formOpen
    ) {
      return;
    }

    const previousOverflow =
      document.body.style
        .overflow;

    document.body.style.overflow =
      'hidden';

    function handleKeyDown(
      event:
        KeyboardEvent,
    ) {
      if (
        event.key ===
        'Escape' &&
        !submitting
      ) {
        setFormOpen(
          false,
        );
      }
    }

    window.addEventListener(
      'keydown',
      handleKeyDown,
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      window.removeEventListener(
        'keydown',
        handleKeyDown,
      );
    };
  }, [
    formOpen,
    submitting,
  ]);

  const statistics =
    useMemo(
      () => ({
        total:
          adherents.length,

        pending:
          adherents.filter(
            (
              adherent,
            ) =>
              adherent.status ===
              'PENDING',
          ).length,

        approved:
          adherents.filter(
            (
              adherent,
            ) =>
              adherent.status ===
              'APPROVED',
          ).length,

        rejected:
          adherents.filter(
            (
              adherent,
            ) =>
              adherent.status ===
              'REJECTED',
          ).length,
      }),
      [
        adherents,
      ],
    );

  const filteredAdherents =
    useMemo(
      () => {
        const normalizedSearch =
          normalizeSearchValue(
            search.trim(),
          );

        return adherents.filter(
          (
            adherent,
          ) => {
            if (
              statusFilter !==
                'ALL' &&
              adherent.status !==
                statusFilter
            ) {
              return false;
            }

            if (
              !normalizedSearch
            ) {
              return true;
            }

            const searchableValue =
              normalizeSearchValue(
                [
                  adherent.displayName,
                  adherent.legalName,
                  adherent.identifierValue,
                  adherent.city,
                  adherent
                    .account
                    .firstName,
                  adherent
                    .account
                    .lastName,
                  adherent
                    .account
                    .email,
                  adherent
                    .account
                    .phone,
                ]
                  .filter(
                    Boolean,
                  )
                  .join(
                    ' ',
                  ),
              );

            return searchableValue.includes(
              normalizedSearch,
            );
          },
        );
      },
      [
        adherents,
        search,
        statusFilter,
      ],
    );

  function updateField<
    Key extends
      keyof AdherentFormState,
  >(
    key: Key,
    value:
      AdherentFormState[Key],
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
  }

  function openForm() {
    setError(
      null,
    );

    setSuccess(
      null,
    );

    setForm(
      emptyForm,
    );

    setShowPassword(
      false,
    );

    setShowPasswordConfirmation(
      false,
    );

    setFormOpen(
      true,
    );
  }

  function closeForm() {
    if (
      submitting
    ) {
      return;
    }

    setFormOpen(
      false,
    );

    setForm(
      emptyForm,
    );

    setShowPassword(
      false,
    );

    setShowPasswordConfirmation(
      false,
    );
  }

  function validateForm() {
    if (
      !form.displayName.trim()
    ) {
      return 'Le nom de l’adhérent est obligatoire.';
    }

    if (
      !form.firstName.trim()
    ) {
      return 'Le prénom du responsable du compte est obligatoire.';
    }

    if (
      !form.lastName.trim()
    ) {
      return 'Le nom du responsable du compte est obligatoire.';
    }

    if (
      !form.email.trim()
    ) {
      return 'L’adresse e-mail de connexion est obligatoire.';
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        form.email.trim(),
      )
    ) {
      return 'L’adresse e-mail renseignée n’est pas valide.';
    }

    if (
      form.identifierType &&
      !form.identifierValue.trim()
    ) {
      return 'Renseignez la valeur de l’identifiant sélectionné.';
    }

    if (
      !form.identifierType &&
      form.identifierValue.trim()
    ) {
      return 'Sélectionnez le type d’identifiant.';
    }

    if (
      form.password.length <
      12
    ) {
      return 'Le mot de passe initial doit contenir au moins 12 caractères.';
    }

    if (
      form.password !==
      form.passwordConfirmation
    ) {
      return 'La confirmation ne correspond pas au mot de passe initial.';
    }

    return null;
  }

  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError(
      null,
    );

    setSuccess(
      null,
    );

    const validationError =
      validateForm();

    if (
      validationError
    ) {
      setError(
        validationError,
      );

      return;
    }

    setSubmitting(
      true,
    );

    try {
      const payload =
        createAdherentPayload(
          form,
          false,
        );

      const created =
        await createAssociationAdherent(
          payload,
        );

      setAdherents(
        (
          current,
        ) => [
          created,
          ...current.filter(
            (
              item,
            ) =>
              item.id !==
              created.id,
          ),
        ],
      );

      setFormOpen(
        false,
      );

      setForm(
        emptyForm,
      );

      setShowPassword(
        false,
      );

      setShowPasswordConfirmation(
        false,
      );

      setStatusFilter(
        'ALL',
      );

      setSearch(
        '',
      );

      setSuccess(
        'L’adhérent a été créé et sa demande a été transmise à FLASCAM. Son compte sera activé après validation.',
      );

      window.scrollTo({
        top:
          0,

        behavior:
          'smooth',
      });
    } catch (
      caughtError
    ) {
      setError(
        caughtError instanceof
        Error
          ? caughtError.message
          : 'Impossible de créer cet adhérent.',
      );
    } finally {
      setSubmitting(
        false,
      );
    }
  }

  return (
    <>
      <section
        className="
          mx-auto
          w-full
          max-w-[1500px]
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
              <UsersRound
                size={16}
              />

              Espace association
            </p>

            <h1
              className="
                mt-2
                text-3xl
                font-extrabold
                tracking-[-0.04em]
                text-slate-950
                sm:text-4xl
              "
            >
              Mes adhérents
            </h1>

            <p
              className="
                mt-3
                max-w-3xl
                text-sm
                leading-7
                text-[var(--flascam-slate)]
                sm:text-base
              "
            >
              Créez les comptes de vos
              adhérents et suivez leur
              validation par FLASCAM.
              Chaque adhérent créé est
              automatiquement rattaché
              à votre association.
            </p>
          </div>

          <button
            type="button"
            onClick={
              openForm
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
              py-3
              text-sm
              font-extrabold
              text-white
              shadow-[0_14px_30px_rgba(190,94,67,0.22)]
              transition
              hover:-translate-y-0.5
              hover:brightness-95
              focus-visible:outline-none
              focus-visible:ring-4
              focus-visible:ring-[#f3c7b8]
              sm:w-auto
            "
          >
            <Plus
              size={19}
            />

            Créer un adhérent
          </button>
        </header>

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
              leading-6
              text-emerald-900
            "
          >
            <CheckCircle2
              size={20}
              className="
                mt-0.5
                shrink-0
              "
            />

            <p
              className="
                flex-1
              "
            >
              {success}
            </p>

            <button
              type="button"
              onClick={() =>
                setSuccess(
                  null,
                )
              }
              className="
                grid
                size-8
                shrink-0
                place-items-center
                rounded-full
                text-emerald-800
                transition
                hover:bg-emerald-100
              "
              aria-label="Fermer le message"
            >
              <X
                size={17}
              />
            </button>
          </div>
        )}

        {error &&
          !formOpen && (
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
              leading-6
              text-red-900
            "
          >
            <AlertCircle
              size={20}
              className="
                mt-0.5
                shrink-0
              "
            />

            <p
              className="
                flex-1
              "
            >
              {error}
            </p>

            <button
              type="button"
              onClick={() =>
                setError(
                  null,
                )
              }
              className="
                grid
                size-8
                shrink-0
                place-items-center
                rounded-full
                text-red-800
                transition
                hover:bg-red-100
              "
              aria-label="Fermer le message"
            >
              <X
                size={17}
              />
            </button>
          </div>
        )}

        <div
          className="
            mt-7
            grid
            gap-4
            sm:grid-cols-2
            xl:grid-cols-4
          "
        >
          <button
            type="button"
            onClick={() =>
              setStatusFilter(
                'ALL',
              )
            }
            className={`
              rounded-3xl
              border
              p-5
              text-left
              transition
              ${
                statusFilter ===
                'ALL'
                  ? 'border-[var(--flascam-blue)] bg-[#eaf5ff] shadow-[0_16px_36px_rgba(7,53,93,0.09)]'
                  : 'border-[var(--flascam-border)] bg-white hover:border-[#9ac9e9]'
              }
            `}
          >
            <div
              className="
                flex
                items-center
                justify-between
                gap-3
              "
            >
              <div>
                <p
                  className="
                    text-sm
                    font-bold
                    text-slate-600
                  "
                >
                  Tous les adhérents
                </p>

                <p
                  className="
                    mt-2
                    text-3xl
                    font-extrabold
                    text-slate-950
                  "
                >
                  {
                    statistics.total
                  }
                </p>
              </div>

              <div
                className="
                  grid
                  size-12
                  place-items-center
                  rounded-2xl
                  bg-[#d9eeff]
                  text-[var(--flascam-blue)]
                "
              >
                <UsersRound
                  size={23}
                />
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() =>
              setStatusFilter(
                'PENDING',
              )
            }
            className={`
              rounded-3xl
              border
              p-5
              text-left
              transition
              ${
                statusFilter ===
                'PENDING'
                  ? 'border-amber-400 bg-amber-50 shadow-[0_16px_36px_rgba(180,120,20,0.09)]'
                  : 'border-[var(--flascam-border)] bg-white hover:border-amber-300'
              }
            `}
          >
            <div
              className="
                flex
                items-center
                justify-between
                gap-3
              "
            >
              <div>
                <p
                  className="
                    text-sm
                    font-bold
                    text-slate-600
                  "
                >
                  En attente
                </p>

                <p
                  className="
                    mt-2
                    text-3xl
                    font-extrabold
                    text-slate-950
                  "
                >
                  {
                    statistics.pending
                  }
                </p>
              </div>

              <div
                className="
                  grid
                  size-12
                  place-items-center
                  rounded-2xl
                  bg-amber-100
                  text-amber-700
                "
              >
                <Clock3
                  size={23}
                />
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() =>
              setStatusFilter(
                'APPROVED',
              )
            }
            className={`
              rounded-3xl
              border
              p-5
              text-left
              transition
              ${
                statusFilter ===
                'APPROVED'
                  ? 'border-emerald-400 bg-emerald-50 shadow-[0_16px_36px_rgba(10,130,80,0.09)]'
                  : 'border-[var(--flascam-border)] bg-white hover:border-emerald-300'
              }
            `}
          >
            <div
              className="
                flex
                items-center
                justify-between
                gap-3
              "
            >
              <div>
                <p
                  className="
                    text-sm
                    font-bold
                    text-slate-600
                  "
                >
                  Validés
                </p>

                <p
                  className="
                    mt-2
                    text-3xl
                    font-extrabold
                    text-slate-950
                  "
                >
                  {
                    statistics.approved
                  }
                </p>
              </div>

              <div
                className="
                  grid
                  size-12
                  place-items-center
                  rounded-2xl
                  bg-emerald-100
                  text-emerald-700
                "
              >
                <CheckCircle2
                  size={23}
                />
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() =>
              setStatusFilter(
                'REJECTED',
              )
            }
            className={`
              rounded-3xl
              border
              p-5
              text-left
              transition
              ${
                statusFilter ===
                'REJECTED'
                  ? 'border-red-400 bg-red-50 shadow-[0_16px_36px_rgba(190,40,40,0.08)]'
                  : 'border-[var(--flascam-border)] bg-white hover:border-red-300'
              }
            `}
          >
            <div
              className="
                flex
                items-center
                justify-between
                gap-3
              "
            >
              <div>
                <p
                  className="
                    text-sm
                    font-bold
                    text-slate-600
                  "
                >
                  Refusés
                </p>

                <p
                  className="
                    mt-2
                    text-3xl
                    font-extrabold
                    text-slate-950
                  "
                >
                  {
                    statistics.rejected
                  }
                </p>
              </div>

              <div
                className="
                  grid
                  size-12
                  place-items-center
                  rounded-2xl
                  bg-red-100
                  text-red-700
                "
              >
                <XCircle
                  size={23}
                />
              </div>
            </div>
          </button>
        </div>

        <div
          className="
            mt-6
            flex
            flex-col
            gap-3
            rounded-3xl
            border
            border-[var(--flascam-border)]
            bg-white
            p-4
            shadow-sm
            sm:flex-row
            sm:items-center
          "
        >
          <div
            className="
              relative
              min-w-0
              flex-1
            "
          >
            <Search
              size={18}
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
                search
              }
              onChange={(
                event,
              ) =>
                setSearch(
                  event.target.value,
                )
              }
              placeholder="Rechercher un adhérent, un responsable, une ville ou un e-mail…"
              className="
                h-12
                w-full
                rounded-2xl
                border
                border-[var(--flascam-border)]
                bg-[#fbfdff]
                pl-11
                pr-4
                text-sm
                font-semibold
                text-slate-900
                outline-none
                transition
                placeholder:text-slate-400
                focus:border-[var(--flascam-blue)]
                focus:ring-4
                focus:ring-[#dcefff]
              "
            />
          </div>

          <button
            type="button"
            onClick={() =>
              void loadAdherents()
            }
            disabled={
              loading
            }
            className="
              inline-flex
              h-12
              items-center
              justify-center
              gap-2
              rounded-2xl
              border
              border-[var(--flascam-border)]
              bg-white
              px-4
              text-sm
              font-extrabold
              text-slate-700
              transition
              hover:border-[var(--flascam-blue)]
              hover:text-[var(--flascam-blue)]
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            <RefreshCw
              size={18}
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
              mt-6
              grid
              min-h-64
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
              "
            >
              <Loader2
                size={32}
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
                  font-bold
                  text-[var(--flascam-slate)]
                "
              >
                Chargement des
                adhérents…
              </p>
            </div>
          </div>
        ) : filteredAdherents.length ===
          0 ? (
          <div
            className="
              mt-6
              rounded-[2rem]
              border
              border-dashed
              border-[#b8d7eb]
              bg-white
              px-5
              py-14
              text-center
              sm:px-8
            "
          >
            <div
              className="
                mx-auto
                grid
                size-16
                place-items-center
                rounded-3xl
                bg-[#eaf5ff]
                text-[var(--flascam-blue)]
              "
            >
              <UsersRound
                size={30}
              />
            </div>

            <h2
              className="
                mt-5
                text-xl
                font-extrabold
                text-slate-950
              "
            >
              {adherents.length ===
              0
                ? 'Aucun adhérent créé'
                : 'Aucun résultat'}
            </h2>

            <p
              className="
                mx-auto
                mt-2
                max-w-xl
                text-sm
                leading-6
                text-[var(--flascam-slate)]
              "
            >
              {adherents.length ===
              0
                ? 'Créez votre premier adhérent. Sa demande sera automatiquement envoyée à FLASCAM pour validation.'
                : 'Aucun adhérent ne correspond aux critères de recherche ou au statut sélectionné.'}
            </p>

            {adherents.length ===
              0 && (
              <button
                type="button"
                onClick={
                  openForm
                }
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
                  py-3
                  text-sm
                  font-extrabold
                  text-white
                "
              >
                <Plus
                  size={18}
                />

                Créer un adhérent
              </button>
            )}
          </div>
        ) : (
          <div
            className="
              mt-6
              space-y-4
            "
          >
            <div
              className="
                flex
                flex-col
                gap-1
                sm:flex-row
                sm:items-center
                sm:justify-between
              "
            >
              <p
                className="
                  text-sm
                  font-extrabold
                  text-slate-800
                "
              >
                {
                  filteredAdherents.length
                }{' '}
                résultat
                {filteredAdherents.length >
                1
                  ? 's'
                  : ''}
              </p>

              {statusFilter !==
                'ALL' && (
                <p
                  className="
                    text-sm
                    text-[var(--flascam-slate)]
                  "
                >
                  Filtre :{' '}
                  {
                    statusLabels[
                      statusFilter
                    ]
                  }
                </p>
              )}
            </div>

            {filteredAdherents.map(
              (
                adherent,
              ) => (
                <AdherentCard
                  key={
                    adherent.id
                  }
                  adherent={
                    adherent
                  }
                />
              ),
            )}
          </div>
        )}
      </section>

      {formOpen && (
        <div
          className="
            fixed
            inset-0
            z-[100]
            flex
            items-end
            justify-center
            bg-slate-950/55
            p-0
            backdrop-blur-sm
            sm:items-center
            sm:p-4
          "
          role="presentation"
          onMouseDown={(
            event,
          ) => {
            if (
              event.target ===
                event.currentTarget &&
              !submitting
            ) {
              closeForm();
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-adherent-title"
            className="
              flex
              max-h-[96dvh]
              w-full
              max-w-5xl
              flex-col
              overflow-hidden
              rounded-t-[2rem]
              bg-white
              shadow-2xl
              sm:max-h-[92dvh]
              sm:rounded-[2rem]
            "
          >
            <div
              className="
                flex
                shrink-0
                items-start
                justify-between
                gap-4
                border-b
                border-[var(--flascam-border)]
                px-5
                py-5
                sm:px-7
              "
            >
              <div>
                <p
                  className="
                    text-xs
                    font-extrabold
                    uppercase
                    tracking-[0.16em]
                    text-[var(--flascam-blue)]
                  "
                >
                  Nouveau compte
                </p>

                <h2
                  id="create-adherent-title"
                  className="
                    mt-1
                    text-2xl
                    font-extrabold
                    tracking-[-0.03em]
                    text-slate-950
                  "
                >
                  Créer un adhérent
                </h2>

                <p
                  className="
                    mt-2
                    max-w-2xl
                    text-sm
                    leading-6
                    text-[var(--flascam-slate)]
                  "
                >
                  L’adhérent sera
                  automatiquement
                  rattaché à votre
                  association et envoyé
                  à FLASCAM pour
                  validation.
                </p>
              </div>

              <button
                type="button"
                onClick={
                  closeForm
                }
                disabled={
                  submitting
                }
                className="
                  grid
                  size-10
                  shrink-0
                  place-items-center
                  rounded-full
                  border
                  border-[var(--flascam-border)]
                  text-slate-600
                  transition
                  hover:border-slate-400
                  hover:text-slate-950
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
                aria-label="Fermer le formulaire"
              >
                <X
                  size={20}
                />
              </button>
            </div>

            <form
              onSubmit={
                handleSubmit
              }
              className="
                flex
                min-h-0
                flex-1
                flex-col
              "
            >
              <div
                className="
                  min-h-0
                  flex-1
                  overflow-y-auto
                  px-5
                  py-6
                  sm:px-7
                "
              >
                {error && (
                  <div
                    className="
                      mb-6
                      flex
                      items-start
                      gap-3
                      rounded-2xl
                      border
                      border-red-200
                      bg-red-50
                      p-4
                      text-sm
                      leading-6
                      text-red-900
                    "
                  >
                    <AlertCircle
                      size={20}
                      className="
                        mt-0.5
                        shrink-0
                      "
                    />

                    <p>
                      {error}
                    </p>
                  </div>
                )}

                <div
                  className="
                    rounded-3xl
                    border
                    border-[var(--flascam-border)]
                    bg-[#fbfdff]
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
                    <div
                      className="
                        grid
                        size-11
                        shrink-0
                        place-items-center
                        rounded-2xl
                        bg-[#eaf5ff]
                        text-[var(--flascam-blue)]
                      "
                    >
                      <Building2
                        size={21}
                      />
                    </div>

                    <div>
                      <h3
                        className="
                          text-lg
                          font-extrabold
                          text-slate-950
                        "
                      >
                        Informations de
                        l’adhérent
                      </h3>

                      <p
                        className="
                          mt-1
                          text-sm
                          leading-6
                          text-[var(--flascam-slate)]
                        "
                      >
                        Renseignez
                        l’identité de la
                        structure ou du
                        professionnel
                        adhérent.
                      </p>
                    </div>
                  </div>

                  <div
                    className="
                      mt-6
                      grid
                      gap-5
                      md:grid-cols-2
                    "
                  >
                    <div>
                      <InputLabel
                        htmlFor="display-name"
                        required
                      >
                        Nom affiché
                      </InputLabel>

                      <input
                        id="display-name"
                        type="text"
                        value={
                          form.displayName
                        }
                        onChange={(
                          event,
                        ) =>
                          updateField(
                            'displayName',
                            event.target.value,
                          )
                        }
                        maxLength={
                          255
                        }
                        autoComplete="organization"
                        placeholder="Ex. Coopérative Laitière Atlas"
                        className="
                          h-12
                          w-full
                          rounded-2xl
                          border
                          border-[var(--flascam-border)]
                          bg-white
                          px-4
                          text-sm
                          font-semibold
                          text-slate-900
                          outline-none
                          transition
                          placeholder:text-slate-400
                          focus:border-[var(--flascam-blue)]
                          focus:ring-4
                          focus:ring-[#dcefff]
                        "
                      />
                    </div>

                    <div>
                      <InputLabel
                        htmlFor="legal-name"
                      >
                        Raison sociale
                      </InputLabel>

                      <input
                        id="legal-name"
                        type="text"
                        value={
                          form.legalName
                        }
                        onChange={(
                          event,
                        ) =>
                          updateField(
                            'legalName',
                            event.target.value,
                          )
                        }
                        maxLength={
                          255
                        }
                        placeholder="Nom légal complet"
                        className="
                          h-12
                          w-full
                          rounded-2xl
                          border
                          border-[var(--flascam-border)]
                          bg-white
                          px-4
                          text-sm
                          font-semibold
                          text-slate-900
                          outline-none
                          transition
                          placeholder:text-slate-400
                          focus:border-[var(--flascam-blue)]
                          focus:ring-4
                          focus:ring-[#dcefff]
                        "
                      />
                    </div>

                    <div>
                      <InputLabel
                        htmlFor="identifier-type"
                      >
                        Type
                        d’identifiant
                      </InputLabel>

                      <select
                        id="identifier-type"
                        value={
                          form.identifierType
                        }
                        onChange={(
                          event,
                        ) =>
                          updateField(
                            'identifierType',
                            event.target.value as
                              | AdherentIdentifierType
                              | '',
                          )
                        }
                        className="
                          h-12
                          w-full
                          rounded-2xl
                          border
                          border-[var(--flascam-border)]
                          bg-white
                          px-4
                          text-sm
                          font-semibold
                          text-slate-900
                          outline-none
                          transition
                          focus:border-[var(--flascam-blue)]
                          focus:ring-4
                          focus:ring-[#dcefff]
                        "
                      >
                        <option value="">
                          Aucun
                        </option>

                        {Object.entries(
                          identifierTypeLabels,
                        ).map(
                          ([
                            value,
                            label,
                          ]) => (
                            <option
                              key={
                                value
                              }
                              value={
                                value
                              }
                            >
                              {label}
                            </option>
                          ),
                        )}
                      </select>
                    </div>

                    <div>
                      <InputLabel
                        htmlFor="identifier-value"
                      >
                        Numéro de
                        l’identifiant
                      </InputLabel>

                      <input
                        id="identifier-value"
                        type="text"
                        value={
                          form.identifierValue
                        }
                        onChange={(
                          event,
                        ) =>
                          updateField(
                            'identifierValue',
                            event.target.value,
                          )
                        }
                        disabled={
                          !form.identifierType
                        }
                        maxLength={
                          120
                        }
                        placeholder={
                          form.identifierType
                            ? 'Saisissez le numéro'
                            : 'Sélectionnez d’abord un type'
                        }
                        className="
                          h-12
                          w-full
                          rounded-2xl
                          border
                          border-[var(--flascam-border)]
                          bg-white
                          px-4
                          text-sm
                          font-semibold
                          text-slate-900
                          outline-none
                          transition
                          placeholder:text-slate-400
                          focus:border-[var(--flascam-blue)]
                          focus:ring-4
                          focus:ring-[#dcefff]
                          disabled:cursor-not-allowed
                          disabled:bg-slate-100
                          disabled:text-slate-500
                        "
                      />
                    </div>

                    <div
                      className="
                        md:col-span-2
                      "
                    >
                      <InputLabel
                        htmlFor="address"
                      >
                        Adresse
                      </InputLabel>

                      <input
                        id="address"
                        type="text"
                        value={
                          form.address
                        }
                        onChange={(
                          event,
                        ) =>
                          updateField(
                            'address',
                            event.target.value,
                          )
                        }
                        maxLength={
                          255
                        }
                        autoComplete="street-address"
                        placeholder="Adresse complète"
                        className="
                          h-12
                          w-full
                          rounded-2xl
                          border
                          border-[var(--flascam-border)]
                          bg-white
                          px-4
                          text-sm
                          font-semibold
                          text-slate-900
                          outline-none
                          transition
                          placeholder:text-slate-400
                          focus:border-[var(--flascam-blue)]
                          focus:ring-4
                          focus:ring-[#dcefff]
                        "
                      />
                    </div>

                    <div>
                      <InputLabel
                        htmlFor="city"
                      >
                        Ville
                      </InputLabel>

                      <input
                        id="city"
                        type="text"
                        value={
                          form.city
                        }
                        onChange={(
                          event,
                        ) =>
                          updateField(
                            'city',
                            event.target.value,
                          )
                        }
                        maxLength={
                          180
                        }
                        autoComplete="address-level2"
                        placeholder="Ex. Casablanca"
                        className="
                          h-12
                          w-full
                          rounded-2xl
                          border
                          border-[var(--flascam-border)]
                          bg-white
                          px-4
                          text-sm
                          font-semibold
                          text-slate-900
                          outline-none
                          transition
                          placeholder:text-slate-400
                          focus:border-[var(--flascam-blue)]
                          focus:ring-4
                          focus:ring-[#dcefff]
                        "
                      />
                    </div>

                    <div>
                      <InputLabel
                        htmlFor="postal-code"
                      >
                        Code postal
                      </InputLabel>

                      <input
                        id="postal-code"
                        type="text"
                        value={
                          form.postalCode
                        }
                        onChange={(
                          event,
                        ) =>
                          updateField(
                            'postalCode',
                            event.target.value,
                          )
                        }
                        maxLength={
                          30
                        }
                        autoComplete="postal-code"
                        placeholder="Ex. 20000"
                        className="
                          h-12
                          w-full
                          rounded-2xl
                          border
                          border-[var(--flascam-border)]
                          bg-white
                          px-4
                          text-sm
                          font-semibold
                          text-slate-900
                          outline-none
                          transition
                          placeholder:text-slate-400
                          focus:border-[var(--flascam-blue)]
                          focus:ring-4
                          focus:ring-[#dcefff]
                        "
                      />
                    </div>

                    <div
                      className="
                        md:col-span-2
                      "
                    >
                      <InputLabel
                        htmlFor="notes"
                      >
                        Informations
                        complémentaires
                      </InputLabel>

                      <textarea
                        id="notes"
                        value={
                          form.notes
                        }
                        onChange={(
                          event,
                        ) =>
                          updateField(
                            'notes',
                            event.target.value,
                          )
                        }
                        rows={
                          4
                        }
                        maxLength={
                          2000
                        }
                        placeholder="Ajoutez uniquement les informations utiles à l’étude du dossier."
                        className="
                          min-h-28
                          w-full
                          resize-y
                          rounded-2xl
                          border
                          border-[var(--flascam-border)]
                          bg-white
                          px-4
                          py-3
                          text-sm
                          font-semibold
                          leading-6
                          text-slate-900
                          outline-none
                          transition
                          placeholder:text-slate-400
                          focus:border-[var(--flascam-blue)]
                          focus:ring-4
                          focus:ring-[#dcefff]
                        "
                      />
                    </div>
                  </div>
                </div>

                <div
                  className="
                    mt-6
                    rounded-3xl
                    border
                    border-[var(--flascam-border)]
                    bg-[#fbfdff]
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
                    <div
                      className="
                        grid
                        size-11
                        shrink-0
                        place-items-center
                        rounded-2xl
                        bg-[#fff1ec]
                        text-[var(--flascam-terracotta)]
                      "
                    >
                      <UserRound
                        size={21}
                      />
                    </div>

                    <div>
                      <h3
                        className="
                          text-lg
                          font-extrabold
                          text-slate-950
                        "
                      >
                        Responsable du
                        compte
                      </h3>

                      <p
                        className="
                          mt-1
                          text-sm
                          leading-6
                          text-[var(--flascam-slate)]
                        "
                      >
                        Ces informations
                        serviront à
                        identifier la
                        personne qui
                        utilisera l’espace
                        professionnel.
                      </p>
                    </div>
                  </div>

                  <div
                    className="
                      mt-6
                      grid
                      gap-5
                      md:grid-cols-2
                    "
                  >
                    <div>
                      <InputLabel
                        htmlFor="first-name"
                        required
                      >
                        Prénom
                      </InputLabel>

                      <input
                        id="first-name"
                        type="text"
                        value={
                          form.firstName
                        }
                        onChange={(
                          event,
                        ) =>
                          updateField(
                            'firstName',
                            event.target.value,
                          )
                        }
                        maxLength={
                          100
                        }
                        autoComplete="given-name"
                        placeholder="Prénom"
                        className="
                          h-12
                          w-full
                          rounded-2xl
                          border
                          border-[var(--flascam-border)]
                          bg-white
                          px-4
                          text-sm
                          font-semibold
                          text-slate-900
                          outline-none
                          transition
                          placeholder:text-slate-400
                          focus:border-[var(--flascam-blue)]
                          focus:ring-4
                          focus:ring-[#dcefff]
                        "
                      />
                    </div>

                    <div>
                      <InputLabel
                        htmlFor="last-name"
                        required
                      >
                        Nom
                      </InputLabel>

                      <input
                        id="last-name"
                        type="text"
                        value={
                          form.lastName
                        }
                        onChange={(
                          event,
                        ) =>
                          updateField(
                            'lastName',
                            event.target.value,
                          )
                        }
                        maxLength={
                          100
                        }
                        autoComplete="family-name"
                        placeholder="Nom"
                        className="
                          h-12
                          w-full
                          rounded-2xl
                          border
                          border-[var(--flascam-border)]
                          bg-white
                          px-4
                          text-sm
                          font-semibold
                          text-slate-900
                          outline-none
                          transition
                          placeholder:text-slate-400
                          focus:border-[var(--flascam-blue)]
                          focus:ring-4
                          focus:ring-[#dcefff]
                        "
                      />
                    </div>

                    <div>
                      <InputLabel
                        htmlFor="account-email"
                        required
                      >
                        E-mail de
                        connexion
                      </InputLabel>

                      <input
                        id="account-email"
                        type="email"
                        value={
                          form.email
                        }
                        onChange={(
                          event,
                        ) =>
                          updateField(
                            'email',
                            event.target.value,
                          )
                        }
                        maxLength={
                          255
                        }
                        autoComplete="email"
                        placeholder="responsable@entreprise.ma"
                        className="
                          h-12
                          w-full
                          rounded-2xl
                          border
                          border-[var(--flascam-border)]
                          bg-white
                          px-4
                          text-sm
                          font-semibold
                          text-slate-900
                          outline-none
                          transition
                          placeholder:text-slate-400
                          focus:border-[var(--flascam-blue)]
                          focus:ring-4
                          focus:ring-[#dcefff]
                        "
                      />
                    </div>

                    <div>
                      <InputLabel
                        htmlFor="account-phone"
                      >
                        Téléphone
                      </InputLabel>

                      <input
                        id="account-phone"
                        type="tel"
                        value={
                          form.phone
                        }
                        onChange={(
                          event,
                        ) =>
                          updateField(
                            'phone',
                            event.target.value,
                          )
                        }
                        maxLength={
                          30
                        }
                        autoComplete="tel"
                        placeholder="+212 6 00 00 00 00"
                        className="
                          h-12
                          w-full
                          rounded-2xl
                          border
                          border-[var(--flascam-border)]
                          bg-white
                          px-4
                          text-sm
                          font-semibold
                          text-slate-900
                          outline-none
                          transition
                          placeholder:text-slate-400
                          focus:border-[var(--flascam-blue)]
                          focus:ring-4
                          focus:ring-[#dcefff]
                        "
                      />
                    </div>
                  </div>
                </div>

                <div
                  className="
                    mt-6
                    rounded-3xl
                    border
                    border-[#f1c7b8]
                    bg-[#fff8f5]
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
                    <div
                      className="
                        grid
                        size-11
                        shrink-0
                        place-items-center
                        rounded-2xl
                        bg-white
                        text-[var(--flascam-terracotta)]
                        shadow-sm
                      "
                    >
                      <KeyRound
                        size={21}
                      />
                    </div>

                    <div>
                      <h3
                        className="
                          text-lg
                          font-extrabold
                          text-slate-950
                        "
                      >
                        Mot de passe
                        initial
                      </h3>

                      <p
                        className="
                          mt-1
                          text-sm
                          leading-6
                          text-slate-700
                        "
                      >
                        Vous définissez
                        directement le
                        mot de passe
                        initial de
                        l’adhérent.
                        Communiquez-le
                        uniquement par un
                        moyen sécurisé.
                      </p>
                    </div>
                  </div>

                  <div
                    className="
                      mt-6
                      grid
                      gap-5
                      md:grid-cols-2
                    "
                  >
                    <div>
                      <InputLabel
                        htmlFor="initial-password"
                        required
                      >
                        Mot de passe
                        initial
                      </InputLabel>

                      <div
                        className="
                          relative
                        "
                      >
                        <input
                          id="initial-password"
                          type={
                            showPassword
                              ? 'text'
                              : 'password'
                          }
                          value={
                            form.password
                          }
                          onChange={(
                            event,
                          ) =>
                            updateField(
                              'password',
                              event.target.value,
                            )
                          }
                          minLength={
                            12
                          }
                          maxLength={
                            128
                          }
                          autoComplete="new-password"
                          placeholder="12 caractères minimum"
                          className="
                            h-12
                            w-full
                            rounded-2xl
                            border
                            border-[#e7b7a6]
                            bg-white
                            pl-4
                            pr-12
                            text-sm
                            font-semibold
                            text-slate-900
                            outline-none
                            transition
                            placeholder:text-slate-400
                            focus:border-[var(--flascam-terracotta)]
                            focus:ring-4
                            focus:ring-[#f7ddd3]
                          "
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowPassword(
                              (
                                current,
                              ) =>
                                !current,
                            )
                          }
                          className="
                            absolute
                            right-2
                            top-1/2
                            grid
                            size-9
                            -translate-y-1/2
                            place-items-center
                            rounded-xl
                            text-slate-500
                            transition
                            hover:bg-slate-100
                            hover:text-slate-900
                          "
                          aria-label={
                            showPassword
                              ? 'Masquer le mot de passe'
                              : 'Afficher le mot de passe'
                          }
                        >
                          {showPassword ? (
                            <EyeOff
                              size={18}
                            />
                          ) : (
                            <Eye
                              size={18}
                            />
                          )}
                        </button>
                      </div>

                      <p
                        className="
                          mt-2
                          text-xs
                          leading-5
                          text-slate-600
                        "
                      >
                        Utilisez au
                        minimum 12
                        caractères, avec
                        idéalement des
                        majuscules,
                        minuscules,
                        chiffres et
                        caractères
                        spéciaux.
                      </p>
                    </div>

                    <div>
                      <InputLabel
                        htmlFor="password-confirmation"
                        required
                      >
                        Confirmer le mot
                        de passe
                      </InputLabel>

                      <div
                        className="
                          relative
                        "
                      >
                        <input
                          id="password-confirmation"
                          type={
                            showPasswordConfirmation
                              ? 'text'
                              : 'password'
                          }
                          value={
                            form.passwordConfirmation
                          }
                          onChange={(
                            event,
                          ) =>
                            updateField(
                              'passwordConfirmation',
                              event.target.value,
                            )
                          }
                          minLength={
                            12
                          }
                          maxLength={
                            128
                          }
                          autoComplete="new-password"
                          placeholder="Saisissez à nouveau le mot de passe"
                          className={`
                            h-12
                            w-full
                            rounded-2xl
                            border
                            bg-white
                            pl-4
                            pr-12
                            text-sm
                            font-semibold
                            text-slate-900
                            outline-none
                            transition
                            placeholder:text-slate-400
                            focus:ring-4
                            ${
                              form.passwordConfirmation &&
                              form.password !==
                                form.passwordConfirmation
                                ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                                : 'border-[#e7b7a6] focus:border-[var(--flascam-terracotta)] focus:ring-[#f7ddd3]'
                            }
                          `}
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowPasswordConfirmation(
                              (
                                current,
                              ) =>
                                !current,
                            )
                          }
                          className="
                            absolute
                            right-2
                            top-1/2
                            grid
                            size-9
                            -translate-y-1/2
                            place-items-center
                            rounded-xl
                            text-slate-500
                            transition
                            hover:bg-slate-100
                            hover:text-slate-900
                          "
                          aria-label={
                            showPasswordConfirmation
                              ? 'Masquer la confirmation'
                              : 'Afficher la confirmation'
                          }
                        >
                          {showPasswordConfirmation ? (
                            <EyeOff
                              size={18}
                            />
                          ) : (
                            <Eye
                              size={18}
                            />
                          )}
                        </button>
                      </div>

                      {form.passwordConfirmation &&
                        form.password ===
                          form.passwordConfirmation && (
                          <p
                            className="
                              mt-2
                              flex
                              items-center
                              gap-1.5
                              text-xs
                              font-bold
                              text-emerald-700
                            "
                          >
                            <CheckCircle2
                              size={15}
                            />

                            Les mots de
                            passe
                            correspondent.
                          </p>
                        )}

                      {form.passwordConfirmation &&
                        form.password !==
                          form.passwordConfirmation && (
                          <p
                            className="
                              mt-2
                              flex
                              items-center
                              gap-1.5
                              text-xs
                              font-bold
                              text-red-700
                            "
                          >
                            <AlertCircle
                              size={15}
                            />

                            Les mots de
                            passe ne
                            correspondent
                            pas.
                          </p>
                        )}
                    </div>
                  </div>
                </div>

                <div
                  className="
                    mt-6
                    flex
                    items-start
                    gap-3
                    rounded-2xl
                    border
                    border-blue-200
                    bg-blue-50
                    p-4
                  "
                >
                  <ShieldCheck
                    size={20}
                    className="
                      mt-0.5
                      shrink-0
                      text-blue-700
                    "
                  />

                  <p
                    className="
                      text-sm
                      leading-6
                      text-blue-900
                    "
                  >
                    Après l’envoi, le
                    compte restera
                    inactif. L’adhérent
                    pourra se connecter
                    avec le mot de passe
                    que vous avez défini
                    uniquement après la
                    validation de
                    FLASCAM.
                  </p>
                </div>
              </div>

              <div
                className="
                  flex
                  shrink-0
                  flex-col-reverse
                  gap-3
                  border-t
                  border-[var(--flascam-border)]
                  bg-white
                  px-5
                  py-4
                  sm:flex-row
                  sm:items-center
                  sm:justify-end
                  sm:px-7
                "
              >
                <button
                  type="button"
                  onClick={
                    closeForm
                  }
                  disabled={
                    submitting
                  }
                  className="
                    inline-flex
                    min-h-12
                    items-center
                    justify-center
                    rounded-2xl
                    border
                    border-[var(--flascam-border)]
                    bg-white
                    px-5
                    text-sm
                    font-extrabold
                    text-slate-700
                    transition
                    hover:border-slate-400
                    hover:text-slate-950
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  Annuler
                </button>

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
                    rounded-2xl
                    bg-[var(--flascam-terracotta)]
                    px-6
                    text-sm
                    font-extrabold
                    text-white
                    shadow-[0_14px_30px_rgba(190,94,67,0.20)]
                    transition
                    hover:brightness-95
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >
                  {submitting ? (
                    <>
                      <Loader2
                        size={19}
                        className="
                          animate-spin
                        "
                      />

                      Envoi en cours…
                    </>
                  ) : (
                    <>
                      <ShieldCheck
                        size={19}
                      />

                      Créer et soumettre
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}