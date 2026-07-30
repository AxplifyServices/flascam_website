'use client';

import {
  FormEvent,
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
  PauseCircle,
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
  createAdminAdherent,
  createAdherentPayload,
  getAdminAdherents,
  updateAdherentStatus,
} from '@/lib/adherents-api';

import {
  getAdminAssociations,
} from '@/lib/associations-api';

import type {
  Adherent,
  AdherentFormState,
  AdherentStatus,
} from '@/types/adherents';

import type {
  AssociationSummary,
} from '@/types/associations';

const emptyForm:
  AdherentFormState = {
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

    /*
     * Une création directe par FLASCAM
     * est activée par défaut.
     */
    approveImmediately:
      true,
  };

const statusLabels:
  Record<
    AdherentStatus,
    string
  > = {
    PENDING:
      'En attente',

    APPROVED:
      'Validé',

    REJECTED:
      'Refusé',

    SUSPENDED:
      'Suspendu',
  };

type StatusFilter =
  | 'ALL'
  | AdherentStatus;

type StatusDialog = {
  adherent:
    Adherent;

  nextStatus:
    AdherentStatus;
} | null;

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

function statusClasses(
  status:
    AdherentStatus,
) {
  if (
    status ===
    'APPROVED'
  ) {
    return 'border-emerald-200 bg-emerald-50 text-emerald-800';
  }

  if (
    status ===
    'REJECTED'
  ) {
    return 'border-red-200 bg-red-50 text-red-800';
  }

  if (
    status ===
    'SUSPENDED'
  ) {
    return 'border-slate-300 bg-slate-100 text-slate-700';
  }

  return 'border-amber-200 bg-amber-50 text-amber-800';
}

export default function AdminAdherentsPage() {
  const [
    adherents,
    setAdherents,
  ] = useState<
    Adherent[]
  >([]);

  const [
    associations,
    setAssociations,
  ] = useState<
    AssociationSummary[]
  >([]);

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
    statusDialog,
    setStatusDialog,
  ] = useState<
    StatusDialog
  >(
    null,
  );

  const [
    reason,
    setReason,
  ] = useState(
    '',
  );

  const [
    form,
    setForm,
  ] = useState<
    AdherentFormState
  >(
    emptyForm,
  );

  const [
    showPassword,
    setShowPassword,
  ] = useState(
    false,
  );

  const [
    showConfirmation,
    setShowConfirmation,
  ] = useState(
    false,
  );

  const [
    search,
    setSearch,
  ] = useState(
    '',
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
    associationFilter,
    setAssociationFilter,
  ] = useState(
    'ALL',
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

  const loadData =
    useCallback(
      async () => {
        setLoading(
          true,
        );

        setError(
          null,
        );

        try {
          const [
            adherentsData,
            associationsData,
          ] =
            await Promise.all([
              getAdminAdherents(),
              getAdminAssociations(),
            ]);

          setAdherents(
            adherentsData,
          );

          setAssociations(
            [
              ...associationsData,
            ].sort(
              (
                first,
                second,
              ) =>
                first.name.localeCompare(
                  second.name,
                  'fr',
                ),
            ),
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
    void loadData();
  }, [
    loadData,
  ]);

useEffect(() => {
  if (
    !formOpen &&
    !statusDialog
  ) {
    return;
  }

  const previousOverflow =
    document.body.style.overflow;

  document.body.style.overflow =
    'hidden';

  function handleKeyDown(
    event: KeyboardEvent,
  ) {
    if (
      event.key !==
      'Escape' ||
      submitting
    ) {
      return;
    }

    if (statusDialog) {
      setStatusDialog(null);
      setReason('');
      setError(null);
      return;
    }

    setFormOpen(false);
    setForm(emptyForm);
    setError(null);
    setShowPassword(false);
    setShowConfirmation(false);
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
  statusDialog,
  submitting,
]);  

  const filteredAdherents =
    useMemo(
      () => {
        const normalized =
          search
            .trim()
            .toLocaleLowerCase(
              'fr',
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
              associationFilter !==
                'ALL' &&
              adherent.association.id !==
                associationFilter
            ) {
              return false;
            }

            if (!normalized) {
              return true;
            }

            return [
              adherent.displayName,
              adherent.legalName,
              adherent.identifierValue,
              adherent.association.name,
              adherent.account.firstName,
              adherent.account.lastName,
              adherent.account.email,
            ]
              .filter(
                Boolean,
              )
              .join(
                ' ',
              )
              .toLocaleLowerCase(
                'fr',
              )
              .includes(
                normalized,
              );
          },
        );
      },
      [
        adherents,
        associationFilter,
        search,
        statusFilter,
      ],
    );

  const counters =
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

        suspended:
          adherents.filter(
            (
              adherent,
            ) =>
              adherent.status ===
              'SUSPENDED',
          ).length,
      }),
      [
        adherents,
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

  function openCreateForm() {
    setForm(
      emptyForm,
    );

    setError(
      null,
    );

    setSuccess(
      null,
    );

    setShowPassword(
      false,
    );

    setShowConfirmation(
      false,
    );

    setFormOpen(
      true,
    );
  }

  function validateForm() {
    if (
      !form.regionalAssociationId
    ) {
      return 'Sélectionnez une association.';
    }

    if (
      !form.displayName.trim()
    ) {
      return 'Le nom de l’adhérent est obligatoire.';
    }

    if (
      !form.firstName.trim() ||
      !form.lastName.trim()
    ) {
      return 'Le prénom et le nom du responsable sont obligatoires.';
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        form.email.trim(),
      )
    ) {
      return 'L’adresse e-mail n’est pas valide.';
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
      return 'Les mots de passe ne correspondent pas.';
    }

    return null;
  }

  async function handleCreate(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError(
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
      const created =
        await createAdminAdherent(
          createAdherentPayload(
            form,
            true,
          ),
        );

      setAdherents(
        (
          current,
        ) => [
          created,
          ...current,
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

setShowConfirmation(
  false,
);

setAssociationFilter(
  'ALL',
);

setStatusFilter(
  'ALL',
);

setSearch(
  '',
);      

      setSuccess(
        form.approveImmediately
          ? 'L’adhérent a été créé et son compte est actif.'
          : 'L’adhérent a été créé en attente de validation.',
      );
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

  async function confirmStatusChange() {
    if (
      !statusDialog
    ) {
      return;
    }

    if (
      statusDialog.nextStatus ===
        'REJECTED' &&
      !reason.trim()
    ) {
      setError(
        'Le motif du refus est obligatoire.',
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
      const updated =
        await updateAdherentStatus(
          statusDialog.adherent.id,
          {
            status:
              statusDialog.nextStatus,

            reason:
              reason.trim() ||
              undefined,
          },
        );

      setAdherents(
        (
          current,
        ) =>
          current.map(
            (
              adherent,
            ) =>
              adherent.id ===
              updated.id
                ? updated
                : adherent,
          ),
      );

      setStatusDialog(
        null,
      );

      setReason(
        '',
      );

      setSuccess(
        `Le statut est maintenant « ${statusLabels[updated.status]} ».`,
      );
    } catch (
      caughtError
    ) {
      setError(
        caughtError instanceof
        Error
          ? caughtError.message
          : 'Impossible de modifier le statut.',
      );
    } finally {
      setSubmitting(
        false,
      );
    }
  }

  return (
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

            Administration FLASCAM
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
            Adhérents
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
            Validez les demandes des
            associations, créez
            directement des comptes et
            gérez leur activation.
          </p>
        </div>

        <button
          type="button"
          onClick={
            openCreateForm
          }
          className="
            inline-flex
            min-h-12
            w-full
            items-center
            justify-center
            gap-2
            rounded-2xl
            bg-[#A9472B]
            px-5
            py-3
            text-sm
            font-extrabold
            text-white
            shadow-[0_14px_30px_rgba(169,71,43,0.30)]
            transition
            hover:bg-[#913B24]
            focus-visible:outline-none
            focus-visible:ring-4
            focus-visible:ring-[#f1c6b8]
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

    <p className="flex-1">
      {success}
    </p>

    <button
      type="button"
      onClick={() =>
        setSuccess(null)
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
      <X size={17} />
    </button>
  </div>
)}

{error &&
  !formOpen &&
  !statusDialog && (
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

      <p className="flex-1">
        {error}
      </p>

      <button
        type="button"
        onClick={() =>
          setError(null)
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
        <X size={17} />
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
          className="
            rounded-3xl
            border
            border-[var(--flascam-border)]
            bg-white
            p-5
            text-left
          "
        >
          <UsersRound
            size={22}
          />

          <p
            className="
              mt-3
              text-sm
              font-bold
              text-slate-600
            "
          >
            Tous
          </p>

          <p
            className="
              mt-1
              text-3xl
              font-extrabold
            "
          >
            {counters.total}
          </p>
        </button>

        <button
          type="button"
          onClick={() =>
            setStatusFilter(
              'PENDING',
            )
          }
          className="
            rounded-3xl
            border
            border-amber-200
            bg-white
            p-5
            text-left
          "
        >
          <Clock3
            size={22}
          />

          <p
            className="
              mt-3
              text-sm
              font-bold
              text-slate-600
            "
          >
            En attente
          </p>

          <p
            className="
              mt-1
              text-3xl
              font-extrabold
            "
          >
            {counters.pending}
          </p>
        </button>

        <button
          type="button"
          onClick={() =>
            setStatusFilter(
              'APPROVED',
            )
          }
          className="
            rounded-3xl
            border
            border-emerald-200
            bg-white
            p-5
            text-left
          "
        >
          <CheckCircle2
            size={22}
          />

          <p
            className="
              mt-3
              text-sm
              font-bold
              text-slate-600
            "
          >
            Validés
          </p>

          <p
            className="
              mt-1
              text-3xl
              font-extrabold
            "
          >
            {counters.approved}
          </p>
        </button>

        <button
          type="button"
          onClick={() =>
            setStatusFilter(
              'SUSPENDED',
            )
          }
          className="
            rounded-3xl
            border
            border-slate-300
            bg-white
            p-5
            text-left
          "
        >
          <PauseCircle
            size={22}
          />

          <p
            className="
              mt-3
              text-sm
              font-bold
              text-slate-600
            "
          >
            Suspendus
          </p>

          <p
            className="
              mt-1
              text-3xl
              font-extrabold
            "
          >
            {counters.suspended}
          </p>
        </button>
      </div>

      <div
        className="
          mt-6
          grid
          gap-3
          rounded-3xl
          border
          border-[var(--flascam-border)]
          bg-white
          p-4
          lg:grid-cols-[1fr_320px_auto]
        "
      >
        <div
          className="
            relative
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
            placeholder="Rechercher un adhérent…"
            className="
              h-12
              w-full
              rounded-2xl
              border
              border-[var(--flascam-border)]
              pl-11
              pr-4
              text-sm
              font-semibold
              outline-none
              focus:border-[var(--flascam-blue)]
              focus:ring-4
              focus:ring-[#dcefff]
            "
          />
        </div>

        <select
          value={
            associationFilter
          }
          onChange={(
            event,
          ) =>
            setAssociationFilter(
              event.target.value,
            )
          }
          className="
            h-12
            rounded-2xl
            border
            border-[var(--flascam-border)]
            bg-white
            px-4
            text-sm
            font-semibold
          "
        >
          <option value="ALL">
            Toutes les associations
          </option>

          {associations.map(
            (
              association,
            ) => (
              <option
                key={
                  association.id
                }
                value={
                  association.id
                }
              >
                {
                  association.name
                }
              </option>
            ),
          )}
        </select>

        <button
          type="button"
          onClick={() =>
            void loadData()
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
            px-4
            text-sm
            font-extrabold
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
            bg-white
          "
        >
          <Loader2
            className="
              animate-spin
              text-[var(--flascam-blue)]
            "
            size={34}
          />
        </div>
      ) : (
<div
  className="
    mt-6
    space-y-4
  "
>
  {filteredAdherents.length === 0 ? (
    <div
      className="
        rounded-[2rem]
        border
        border-dashed
        border-[#b8d7eb]
        bg-white
        px-5
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
          rounded-3xl
          bg-[#eaf5ff]
          text-[var(--flascam-blue)]
        "
      >
        <UsersRound size={30} />
      </div>

      <h2
        className="
          mt-5
          text-xl
          font-extrabold
          text-slate-950
        "
      >
        Aucun adhérent trouvé
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
        Aucun adhérent ne correspond aux
        critères sélectionnés ou aucun compte
        n’a encore été créé.
      </p>

      {adherents.length === 0 && (
        <button
          type="button"
          onClick={openCreateForm}
          className="
            mt-6
            inline-flex
            min-h-11
            items-center
            justify-center
            gap-2
            rounded-2xl
            bg-[#A9472B]
            px-5
            py-3
            text-sm
            font-extrabold
            text-white
            hover:bg-[#913B24]
          "
        >
          <Plus size={18} />

          Créer un adhérent
        </button>
      )}
    </div>
  ) : (
    filteredAdherents.map(
            (
              adherent,
            ) => (
              <article
                key={
                  adherent.id
                }
                className="
                  rounded-[1.75rem]
                  border
                  border-[var(--flascam-border)]
                  bg-white
                  p-5
                  shadow-[0_16px_45px_rgba(7,53,93,0.06)]
                  sm:p-6
                "
              >
                <div
                  className="
                    flex
                    flex-col
                    gap-5
                    xl:flex-row
                    xl:items-start
                    xl:justify-between
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
                      className="
                        grid
                        size-12
                        shrink-0
                        place-items-center
                        rounded-2xl
                        bg-[#eaf5ff]
                        text-[var(--flascam-blue)]
                      "
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
                          flex-wrap
                          items-center
                          gap-2
                        "
                      >
                        <h2
                          className="
                            text-lg
                            font-extrabold
                            text-slate-950
                          "
                        >
                          {
                            adherent.displayName
                          }
                        </h2>

                        <span
                          className={`
                            rounded-full
                            border
                            px-3
                            py-1
                            text-xs
                            font-extrabold
                            ${statusClasses(
                              adherent.status,
                            )}
                          `}
                        >
                          {
                            statusLabels[
                              adherent.status
                            ]
                          }
                        </span>
                      </div>

                      <p
                        className="
                          mt-1
                          text-sm
                          font-semibold
                          text-[var(--flascam-slate)]
                        "
                      >
                        {
                          adherent
                            .association
                            .name
                        }
                      </p>

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

                        <span>
                          {
                            adherent
                              .account
                              .email
                          }
                        </span>

                        <span>
                          Soumis le{' '}
                          {
                            formatDate(
                              adherent
                                .submittedAt,
                            )
                          }
                        </span>
                      </div>

                      {adherent.rejectionReason && (
                        <p
                          className="
                            mt-4
                            rounded-2xl
                            border
                            border-red-200
                            bg-red-50
                            p-3
                            text-sm
                            text-red-900
                          "
                        >
                          <strong>
                            Motif :
                          </strong>{' '}
                          {
                            adherent
                              .rejectionReason
                          }
                        </p>
                      )}
                    </div>
                  </div>

                  <div
                    className="
                      flex
                      flex-wrap
                      gap-2
                    "
                  >
                    {adherent.status ===
                      'PENDING' && (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            setStatusDialog({
                              adherent,
                              nextStatus:
                                'APPROVED',
                            })
                          }
                          className="
                            inline-flex
                            min-h-10
                            items-center
                            gap-2
                            rounded-xl
                            bg-emerald-700
                            px-4
                            text-sm
                            font-extrabold
                            text-white
                            hover:bg-emerald-800
                          "
                        >
                          <CheckCircle2
                            size={17}
                          />

                          Valider
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setStatusDialog({
                              adherent,
                              nextStatus:
                                'REJECTED',
                            })
                          }
                          className="
                            inline-flex
                            min-h-10
                            items-center
                            gap-2
                            rounded-xl
                            border
                            border-red-300
                            bg-white
                            px-4
                            text-sm
                            font-extrabold
                            text-red-700
                            hover:bg-red-50
                          "
                        >
                          <XCircle
                            size={17}
                          />

                          Refuser
                        </button>
                      </>
                    )}

                    {adherent.status ===
                      'APPROVED' && (
                      <button
                        type="button"
                        onClick={() =>
                          setStatusDialog({
                            adherent,
                            nextStatus:
                              'SUSPENDED',
                          })
                        }
                        className="
                          inline-flex
                          min-h-10
                          items-center
                          gap-2
                          rounded-xl
                          border
                          border-slate-300
                          bg-white
                          px-4
                          text-sm
                          font-extrabold
                          text-slate-700
                        "
                      >
                        <PauseCircle
                          size={17}
                        />

                        Suspendre
                      </button>
                    )}

                    {adherent.status ===
                      'SUSPENDED' && (
                      <button
                        type="button"
                        onClick={() =>
                          setStatusDialog({
                            adherent,
                            nextStatus:
                              'APPROVED',
                          })
                        }
                        className="
                          inline-flex
                          min-h-10
                          items-center
                          gap-2
                          rounded-xl
                          bg-emerald-700
                          px-4
                          text-sm
                          font-extrabold
                          text-white
                        "
                      >
                        <CheckCircle2
                          size={17}
                        />

                        Réactiver
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ),
          )
        )}
      </div>
    )}

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
    onMouseDown={(event) => {
      if (
        event.target === event.currentTarget &&
        !submitting
      ) {
        setFormOpen(false);
      }
    }}
  >
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-admin-adherent-title"
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
            Administration FLASCAM
          </p>

          <h2
            id="create-admin-adherent-title"
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
            Choisissez l’association de rattachement,
            définissez les identifiants du compte et
            décidez si l’adhérent doit être activé
            immédiatement.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (!submitting) {
              setFormOpen(false);
              setForm(emptyForm);
              setError(null);
              setShowPassword(false);
              setShowConfirmation(false);
            }
          }}
          disabled={submitting}
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
          <X size={20} />
        </button>
      </div>

      <form
        onSubmit={handleCreate}
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

              <p>{error}</p>
            </div>
          )}

          <section
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
                <Building2 size={21} />
              </div>

              <div>
                <h3
                  className="
                    text-lg
                    font-extrabold
                    text-slate-950
                  "
                >
                  Association et identité
                </h3>

                <p
                  className="
                    mt-1
                    text-sm
                    leading-6
                    text-[var(--flascam-slate)]
                  "
                >
                  L’association sélectionnée sera le
                  rattachement définitif du compte lors
                  de sa création.
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
              <div className="md:col-span-2">
                <label
                  htmlFor="admin-adherent-association"
                  className="
                    mb-2
                    block
                    text-sm
                    font-extrabold
                    text-slate-800
                  "
                >
                  Association de rattachement
                  <span className="ml-1 text-red-600">*</span>
                </label>

                <select
                  id="admin-adherent-association"
                  value={form.regionalAssociationId}
                  onChange={(event) =>
                    updateField(
                      'regionalAssociationId',
                      event.target.value,
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
                    Sélectionner une association
                  </option>

                  {associations.map((association) => (
                    <option
                      key={association.id}
                      value={association.id}
                    >
                      {association.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="admin-adherent-display-name"
                  className="
                    mb-2
                    block
                    text-sm
                    font-extrabold
                    text-slate-800
                  "
                >
                  Nom affiché
                  <span className="ml-1 text-red-600">*</span>
                </label>

                <input
                  id="admin-adherent-display-name"
                  type="text"
                  value={form.displayName}
                  onChange={(event) =>
                    updateField(
                      'displayName',
                      event.target.value,
                    )
                  }
                  maxLength={255}
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
                <label
                  htmlFor="admin-adherent-legal-name"
                  className="
                    mb-2
                    block
                    text-sm
                    font-extrabold
                    text-slate-800
                  "
                >
                  Raison sociale
                </label>

                <input
                  id="admin-adherent-legal-name"
                  type="text"
                  value={form.legalName}
                  onChange={(event) =>
                    updateField(
                      'legalName',
                      event.target.value,
                    )
                  }
                  maxLength={255}
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
                <label
                  htmlFor="admin-adherent-identifier-type"
                  className="
                    mb-2
                    block
                    text-sm
                    font-extrabold
                    text-slate-800
                  "
                >
                  Type d’identifiant
                </label>

                <select
                  id="admin-adherent-identifier-type"
                  value={form.identifierType}
                  onChange={(event) =>
                    updateField(
                      'identifierType',
                      event.target.value as
                        AdherentFormState['identifierType'],
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
                  <option value="">Aucun</option>
                  <option value="ICE">ICE</option>
                  <option value="IF">Identifiant fiscal</option>
                  <option value="RC">Registre de commerce</option>
                  <option value="CIN">CIN</option>
                  <option value="OTHER">Autre</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="admin-adherent-identifier-value"
                  className="
                    mb-2
                    block
                    text-sm
                    font-extrabold
                    text-slate-800
                  "
                >
                  Numéro de l’identifiant
                </label>

                <input
                  id="admin-adherent-identifier-value"
                  type="text"
                  value={form.identifierValue}
                  onChange={(event) =>
                    updateField(
                      'identifierValue',
                      event.target.value,
                    )
                  }
                  disabled={!form.identifierType}
                  maxLength={120}
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

              <div className="md:col-span-2">
                <label
                  htmlFor="admin-adherent-address"
                  className="
                    mb-2
                    block
                    text-sm
                    font-extrabold
                    text-slate-800
                  "
                >
                  Adresse
                </label>

                <input
                  id="admin-adherent-address"
                  type="text"
                  value={form.address}
                  onChange={(event) =>
                    updateField(
                      'address',
                      event.target.value,
                    )
                  }
                  maxLength={255}
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
                <label
                  htmlFor="admin-adherent-city"
                  className="
                    mb-2
                    block
                    text-sm
                    font-extrabold
                    text-slate-800
                  "
                >
                  Ville
                </label>

                <input
                  id="admin-adherent-city"
                  type="text"
                  value={form.city}
                  onChange={(event) =>
                    updateField(
                      'city',
                      event.target.value,
                    )
                  }
                  maxLength={180}
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
                <label
                  htmlFor="admin-adherent-postal-code"
                  className="
                    mb-2
                    block
                    text-sm
                    font-extrabold
                    text-slate-800
                  "
                >
                  Code postal
                </label>

                <input
                  id="admin-adherent-postal-code"
                  type="text"
                  value={form.postalCode}
                  onChange={(event) =>
                    updateField(
                      'postalCode',
                      event.target.value,
                    )
                  }
                  maxLength={30}
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

              <div className="md:col-span-2">
                <label
                  htmlFor="admin-adherent-notes"
                  className="
                    mb-2
                    block
                    text-sm
                    font-extrabold
                    text-slate-800
                  "
                >
                  Notes internes
                </label>

                <textarea
                  id="admin-adherent-notes"
                  value={form.notes}
                  onChange={(event) =>
                    updateField(
                      'notes',
                      event.target.value,
                    )
                  }
                  rows={4}
                  maxLength={2000}
                  placeholder="Informations complémentaires utiles."
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
          </section>

          <section
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
                  text-[#A9472B]
                "
              >
                <UserRound size={21} />
              </div>

              <div>
                <h3
                  className="
                    text-lg
                    font-extrabold
                    text-slate-950
                  "
                >
                  Responsable du compte
                </h3>

                <p
                  className="
                    mt-1
                    text-sm
                    leading-6
                    text-[var(--flascam-slate)]
                  "
                >
                  Cette personne utilisera l’adresse
                  e-mail et le mot de passe ci-dessous
                  pour se connecter.
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
                <label
                  htmlFor="admin-adherent-first-name"
                  className="
                    mb-2
                    block
                    text-sm
                    font-extrabold
                    text-slate-800
                  "
                >
                  Prénom
                  <span className="ml-1 text-red-600">*</span>
                </label>

                <input
                  id="admin-adherent-first-name"
                  type="text"
                  value={form.firstName}
                  onChange={(event) =>
                    updateField(
                      'firstName',
                      event.target.value,
                    )
                  }
                  maxLength={100}
                  autoComplete="given-name"
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
                    outline-none
                    focus:border-[var(--flascam-blue)]
                    focus:ring-4
                    focus:ring-[#dcefff]
                  "
                />
              </div>

              <div>
                <label
                  htmlFor="admin-adherent-last-name"
                  className="
                    mb-2
                    block
                    text-sm
                    font-extrabold
                    text-slate-800
                  "
                >
                  Nom
                  <span className="ml-1 text-red-600">*</span>
                </label>

                <input
                  id="admin-adherent-last-name"
                  type="text"
                  value={form.lastName}
                  onChange={(event) =>
                    updateField(
                      'lastName',
                      event.target.value,
                    )
                  }
                  maxLength={100}
                  autoComplete="family-name"
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
                    outline-none
                    focus:border-[var(--flascam-blue)]
                    focus:ring-4
                    focus:ring-[#dcefff]
                  "
                />
              </div>

              <div>
                <label
                  htmlFor="admin-adherent-email"
                  className="
                    mb-2
                    block
                    text-sm
                    font-extrabold
                    text-slate-800
                  "
                >
                  E-mail de connexion
                  <span className="ml-1 text-red-600">*</span>
                </label>

                <input
                  id="admin-adherent-email"
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    updateField(
                      'email',
                      event.target.value,
                    )
                  }
                  maxLength={255}
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
                    outline-none
                    focus:border-[var(--flascam-blue)]
                    focus:ring-4
                    focus:ring-[#dcefff]
                  "
                />
              </div>

              <div>
                <label
                  htmlFor="admin-adherent-phone"
                  className="
                    mb-2
                    block
                    text-sm
                    font-extrabold
                    text-slate-800
                  "
                >
                  Téléphone
                </label>

                <input
                  id="admin-adherent-phone"
                  type="tel"
                  value={form.phone}
                  onChange={(event) =>
                    updateField(
                      'phone',
                      event.target.value,
                    )
                  }
                  maxLength={30}
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
                    outline-none
                    focus:border-[var(--flascam-blue)]
                    focus:ring-4
                    focus:ring-[#dcefff]
                  "
                />
              </div>
            </div>
          </section>

          <section
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
                  text-[#A9472B]
                  shadow-sm
                "
              >
                <KeyRound size={21} />
              </div>

              <div>
                <h3
                  className="
                    text-lg
                    font-extrabold
                    text-slate-950
                  "
                >
                  Mot de passe initial
                </h3>

                <p
                  className="
                    mt-1
                    text-sm
                    leading-6
                    text-slate-700
                  "
                >
                  Le mot de passe est défini par
                  l’administrateur FLASCAM et ne sera
                  jamais affiché après la création.
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
                <label
                  htmlFor="admin-adherent-password"
                  className="
                    mb-2
                    block
                    text-sm
                    font-extrabold
                    text-slate-800
                  "
                >
                  Mot de passe
                  <span className="ml-1 text-red-600">*</span>
                </label>

                <div className="relative">
                  <input
                    id="admin-adherent-password"
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={(event) =>
                      updateField(
                        'password',
                        event.target.value,
                      )
                    }
                    minLength={12}
                    maxLength={128}
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
                      outline-none
                      focus:border-[#A9472B]
                      focus:ring-4
                      focus:ring-[#f7ddd3]
                    "
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((current) => !current)
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
                      hover:bg-slate-100
                    "
                    aria-label={
                      showPassword
                        ? 'Masquer le mot de passe'
                        : 'Afficher le mot de passe'
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="admin-adherent-password-confirmation"
                  className="
                    mb-2
                    block
                    text-sm
                    font-extrabold
                    text-slate-800
                  "
                >
                  Confirmation
                  <span className="ml-1 text-red-600">*</span>
                </label>

                <div className="relative">
                  <input
                    id="admin-adherent-password-confirmation"
                    type={
                      showConfirmation
                        ? 'text'
                        : 'password'
                    }
                    value={form.passwordConfirmation}
                    onChange={(event) =>
                      updateField(
                        'passwordConfirmation',
                        event.target.value,
                      )
                    }
                    minLength={12}
                    maxLength={128}
                    autoComplete="new-password"
                    placeholder="Confirmer le mot de passe"
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
                      outline-none
                      focus:border-[#A9472B]
                      focus:ring-4
                      focus:ring-[#f7ddd3]
                    "
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmation(
                        (current) => !current,
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
                      hover:bg-slate-100
                    "
                    aria-label={
                      showConfirmation
                        ? 'Masquer la confirmation'
                        : 'Afficher la confirmation'
                    }
                  >
                    {showConfirmation ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section
            className="
              mt-6
              rounded-3xl
              border
              border-[var(--flascam-border)]
              bg-white
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
                <ShieldCheck size={21} />
              </div>

              <div>
                <h3
                  className="
                    text-lg
                    font-extrabold
                    text-slate-950
                  "
                >
                  Activation du compte
                </h3>

                <p
                  className="
                    mt-1
                    text-sm
                    leading-6
                    text-[var(--flascam-slate)]
                  "
                >
                  Choisissez clairement si le compte
                  doit être utilisable immédiatement.
                </p>
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
              <button
                type="button"
                onClick={() =>
                  updateField(
                    'approveImmediately',
                    true,
                  )
                }
                className={`
                  rounded-2xl
                  border
                  p-4
                  text-left
                  transition
                  ${
                    form.approveImmediately
                      ? 'border-[#A9472B] bg-[#fff8f5] ring-2 ring-[#f1c6b8]'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }
                `}
              >
                <CheckCircle2
                  size={21}
                  className="text-emerald-700"
                />

                <strong
                  className="
                    mt-3
                    block
                    text-sm
                    text-slate-950
                  "
                >
                  Créer et activer maintenant
                </strong>

                <span
                  className="
                    mt-1
                    block
                    text-sm
                    leading-6
                    text-slate-600
                  "
                >
                  L’adhérent pourra se connecter
                  immédiatement.
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  updateField(
                    'approveImmediately',
                    false,
                  )
                }
                className={`
                  rounded-2xl
                  border
                  p-4
                  text-left
                  transition
                  ${
                    !form.approveImmediately
                      ? 'border-[#A9472B] bg-[#fff8f5] ring-2 ring-[#f1c6b8]'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }
                `}
              >
                <Clock3
                  size={21}
                  className="text-amber-700"
                />

                <strong
                  className="
                    mt-3
                    block
                    text-sm
                    text-slate-950
                  "
                >
                  Créer en attente
                </strong>

                <span
                  className="
                    mt-1
                    block
                    text-sm
                    leading-6
                    text-slate-600
                  "
                >
                  Le compte restera inactif jusqu’à
                  validation.
                </span>
              </button>
            </div>
          </section>
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
            onClick={() => {
              if (!submitting) {
                setFormOpen(false);
                setForm(emptyForm);
                setError(null);
                setShowPassword(false);
                setShowConfirmation(false);
              }
            }}
            disabled={submitting}
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
            disabled={submitting}
            className="
              inline-flex
              min-h-12
              items-center
              justify-center
              gap-2
              rounded-2xl
              bg-[#A9472B]
              px-6
              text-sm
              font-extrabold
              text-white
              shadow-[0_14px_30px_rgba(169,71,43,0.25)]
              transition
              hover:bg-[#913B24]
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            {submitting ? (
              <>
                <Loader2
                  size={19}
                  className="animate-spin"
                />

                Création en cours…
              </>
            ) : (
              <>
                <Plus size={19} />

                {form.approveImmediately
                  ? 'Créer et activer'
                  : 'Créer en attente'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  </div>
)}

      {statusDialog && (
        <div
          className="
            fixed
            inset-0
            z-[110]
            grid
            place-items-center
            bg-slate-950/55
            p-4
            backdrop-blur-sm
          "
        >
          <div
            className="
              w-full
              max-w-lg
              rounded-[2rem]
              bg-white
              p-6
              shadow-2xl
            "
          >
            <h2
              className="
                text-xl
                font-extrabold
              "
            >
              Modifier le statut
            </h2>

            <p
              className="
                mt-2
                text-sm
                text-slate-600
              "
            >
              Adhérent :{' '}
              <strong>
                {
                  statusDialog
                    .adherent
                    .displayName
                }
              </strong>
            </p>

            {(statusDialog.nextStatus ===
              'REJECTED' ||
              statusDialog.nextStatus ===
                'SUSPENDED') && (
              <label
                className="
                  mt-5
                  block
                  text-sm
                  font-extrabold
                "
              >
                Motif
                {statusDialog.nextStatus ===
                  'REJECTED' && (
                  <span
                    className="
                      text-red-600
                    "
                  >
                    {' '}*
                  </span>
                )}

                <textarea
                  value={
                    reason
                  }
                  onChange={(
                    event,
                  ) =>
                    setReason(
                      event.target.value,
                    )
                  }
                  rows={4}
                  className="
                    mt-2
                    w-full
                    rounded-2xl
                    border
                    p-4
                    font-semibold
                  "
                />
              </label>
            )}

            <div
              className="
                mt-6
                flex
                flex-col-reverse
                gap-3
                sm:flex-row
                sm:justify-end
              "
            >
              <button
                type="button"
                onClick={() => {
                  setStatusDialog(
                    null,
                  );

                  setReason(
                    '',
                  );
                }}
                className="
                  min-h-11
                  rounded-xl
                  border
                  px-4
                  font-extrabold
                "
              >
                Annuler
              </button>

              <button
                type="button"
                onClick={() =>
                  void confirmStatusChange()
                }
                disabled={
                  submitting
                }
                className="
                  min-h-11
                  rounded-xl
                  bg-[#A9472B]
                  px-5
                  font-extrabold
                  text-white
                  disabled:opacity-60
                "
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}