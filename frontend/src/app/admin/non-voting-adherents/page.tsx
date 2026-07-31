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
  BadgeCheck,
  Ban,
  Banknote,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Copy,
  CreditCard,
  Loader2,
  MapPin,
  Phone,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldCheck,
  UserRound,
  WalletCards,
  X,
  XCircle,
} from 'lucide-react';

import {
  approveNonVotingAdherentWafacash,
  createAdminNonVotingAdherent,
  createNonVotingAdherentPayload,
  getAdminNonVotingAdherents,
  reactivateNonVotingAdherent,
  rejectNonVotingAdherentWafacash,
  suspendNonVotingAdherent,
} from '@/lib/non-voting-adherents-api';

import type {
  CreateNonVotingAdherentResponse,
  NonVotingAdherent,
  NonVotingAdherentFormState,
  NonVotingMembershipStatus,
} from '@/types/non-voting-adherents';

const emptyForm:
  NonVotingAdherentFormState = {
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

    depositPaymentMethod:
      'CARD',

    wafacashReference:
      '',

    temporaryPassword:
      '',

    temporaryPasswordConfirmation:
      '',

    generateTemporaryPassword:
      true,
  };

type StatusFilter =
  | 'ALL'
  | NonVotingMembershipStatus;

type ActionDialog =
  | {
      type:
        'APPROVE_WAFACASH';

      adherent:
        NonVotingAdherent;
    }
  | {
      type:
        'REJECT_WAFACASH';

      adherent:
        NonVotingAdherent;
    }
  | {
      type:
        'SUSPEND';

      adherent:
        NonVotingAdherent;
    }
  | {
      type:
        'REACTIVATE';

      adherent:
        NonVotingAdherent;
    }
  | null;

const statusLabels:
  Record<
    NonVotingMembershipStatus,
    string
  > = {
    PENDING_PAYMENT:
      'Caution à payer',

    PENDING_REVIEW:
      'Paiement à vérifier',

    ACTIVE:
      'Actif',

    REJECTED:
      'Paiement refusé',

    SUSPENDED:
      'Suspendu',
  };

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
        'short',

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
    'fr-FR',
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

function statusClasses(
  status:
    NonVotingMembershipStatus,
) {
  if (
    status ===
    'ACTIVE'
  ) {
    return 'border-emerald-200 bg-emerald-50 text-emerald-800';
  }

  if (
    status ===
    'PENDING_REVIEW'
  ) {
    return 'border-blue-200 bg-blue-50 text-blue-800';
  }

  if (
    status ===
    'PENDING_PAYMENT'
  ) {
    return 'border-amber-200 bg-amber-50 text-amber-800';
  }

  if (
    status ===
    'REJECTED'
  ) {
    return 'border-red-200 bg-red-50 text-red-800';
  }

  return 'border-slate-300 bg-slate-100 text-slate-700';
}

function getInitials(
  adherent:
    NonVotingAdherent,
) {
  const firstName =
    adherent.account
      ?.firstName
      ?.trim() ||
    '';

  const lastName =
    adherent.account
      ?.lastName
      ?.trim() ||
    '';

  const value =
    `${firstName.charAt(0)}${lastName.charAt(0)}`
      .trim()
      .toUpperCase();

  return value ||
    'AN';
}

function getFullName(
  adherent:
    NonVotingAdherent,
) {
  return adherent.account
    ?.fullName
    ?.trim() ||
    'Adhérent non votant';
}

export default function AdminNonVotingAdherentsPage() {
  const [
    adherents,
    setAdherents,
  ] = useState<
    NonVotingAdherent[]
  >([]);

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

  const [
    success,
    setSuccess,
  ] = useState<
    string | null
  >(
    null,
  );

  const [
    search,
    setSearch,
  ] = useState(
    '',
  );

  const [
    debouncedSearch,
    setDebouncedSearch,
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
    page,
    setPage,
  ] = useState(
    1,
  );

  const [
    totalPages,
    setTotalPages,
  ] = useState(
    0,
  );

  const [
    total,
    setTotal,
  ] = useState(
    0,
  );

  const [
    formOpen,
    setFormOpen,
  ] = useState(
    false,
  );

  const [
    form,
    setForm,
  ] = useState<
    NonVotingAdherentFormState
  >(
    emptyForm,
  );

  const [
    actionDialog,
    setActionDialog,
  ] = useState<
    ActionDialog
  >(
    null,
  );

  const [
    actionReason,
    setActionReason,
  ] = useState(
    '',
  );

  const [
    createdAccount,
    setCreatedAccount,
  ] = useState<
    CreateNonVotingAdherentResponse | null
  >(
    null,
  );

  const [
    copiedPassword,
    setCopiedPassword,
  ] = useState(
    false,
  );

  const limit =
    20;

  useEffect(() => {
    const timeout =
      window.setTimeout(
        () => {
          setDebouncedSearch(
            search.trim(),
          );

          setPage(
            1,
          );
        },
        350,
      );

    return () => {
      window.clearTimeout(
        timeout,
      );
    };
  }, [
    search,
  ]);

  const loadAdherents =
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
            await getAdminNonVotingAdherents({
              page,
              limit,

              search:
                debouncedSearch ||
                undefined,

              status:
                statusFilter ===
                'ALL'
                  ? ''
                  : statusFilter,
            });

          setAdherents(
            response.items,
          );

          setTotal(
            response.pagination.total,
          );

          setTotalPages(
            response.pagination.totalPages,
          );

          if (
            response.pagination.totalPages >
              0 &&
            page >
              response.pagination.totalPages
          ) {
            setPage(
              response.pagination.totalPages,
            );
          }
        } catch (
          currentError
        ) {
          setError(
            currentError instanceof
              Error
              ? currentError.message
              : 'Impossible de charger les adhérents non votants.',
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
      [
        debouncedSearch,
        page,
        statusFilter,
      ],
    );

  useEffect(() => {
    void loadAdherents();
  }, [
    loadAdherents,
  ]);

  const statistics =
    useMemo(
      () => {
        return {
          active:
            adherents.filter(
              (
                adherent,
              ) =>
                adherent.membershipStatus ===
                'ACTIVE',
            ).length,

          pendingReview:
            adherents.filter(
              (
                adherent,
              ) =>
                adherent.membershipStatus ===
                'PENDING_REVIEW',
            ).length,

          pendingPayment:
            adherents.filter(
              (
                adherent,
              ) =>
                adherent.membershipStatus ===
                'PENDING_PAYMENT',
            ).length,

          blocked:
            adherents.filter(
              (
                adherent,
              ) =>
                [
                  'REJECTED',
                  'SUSPENDED',
                ].includes(
                  adherent.membershipStatus,
                ),
            ).length,
        };
      },
      [
        adherents,
      ],
    );

  function updateField<
    Key extends
      keyof NonVotingAdherentFormState,
  >(
    key:
      Key,

    value:
      NonVotingAdherentFormState[Key],
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

    setError(
      null,
    );
  }

  function validateForm() {
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
      !form.email.trim()
    ) {
      return 'L’adresse e-mail est obligatoire.';
    }

    if (
      !form.city.trim()
    ) {
      return 'La ville est obligatoire.';
    }

    if (
      form.depositPaymentMethod ===
        'WAFACASH' &&
      !form.wafacashReference.trim()
    ) {
      return 'La référence Wafacash est obligatoire.';
    }

    if (
      !form.generateTemporaryPassword
    ) {
      if (
        form.temporaryPassword.length <
        12
      ) {
        return 'Le mot de passe temporaire doit contenir au moins 12 caractères.';
      }

      if (
        form.temporaryPassword !==
        form.temporaryPasswordConfirmation
      ) {
        return 'Les deux mots de passe ne correspondent pas.';
      }
    }

    return null;
  }

  async function submitCreation(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

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

    setError(
      null,
    );

    setSuccess(
      null,
    );

    try {
      const response =
        await createAdminNonVotingAdherent(
          createNonVotingAdherentPayload(
            form,
          ),
        );

      setCreatedAccount(
        response,
      );

      setFormOpen(
        false,
      );

      setForm(
        emptyForm,
      );

      setSuccess(
        'Le compte de l’adhérent non votant a été créé.',
      );

      await loadAdherents(
        true,
      );
    } catch (
      currentError
    ) {
      setError(
        currentError instanceof
          Error
          ? currentError.message
          : 'La création du compte a échoué.',
      );
    } finally {
      setSubmitting(
        false,
      );
    }
  }

  async function confirmAction() {
    if (
      !actionDialog
    ) {
      return;
    }

    if (
      actionDialog.type ===
        'REJECT_WAFACASH' &&
      !actionReason.trim()
    ) {
      setError(
        'Le motif du refus est obligatoire.',
      );

      return;
    }

    if (
      actionDialog.type ===
        'SUSPEND' &&
      !actionReason.trim()
    ) {
      setError(
        'Le motif de suspension est obligatoire.',
      );

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
      if (
        actionDialog.type ===
        'APPROVE_WAFACASH'
      ) {
        await approveNonVotingAdherentWafacash(
          actionDialog.adherent.id,
        );

        setSuccess(
          'Le paiement Wafacash a été validé. L’adhérent peut maintenant envoyer des offres.',
        );
      }

      if (
        actionDialog.type ===
        'REJECT_WAFACASH'
      ) {
        await rejectNonVotingAdherentWafacash(
          actionDialog.adherent.id,
          actionReason,
        );

        setSuccess(
          'Le paiement Wafacash a été refusé.',
        );
      }

      if (
        actionDialog.type ===
        'SUSPEND'
      ) {
        await suspendNonVotingAdherent(
          actionDialog.adherent.id,
          actionReason,
        );

        setSuccess(
          'Le compte a été suspendu et ses sessions ont été révoquées.',
        );
      }

      if (
        actionDialog.type ===
        'REACTIVATE'
      ) {
        await reactivateNonVotingAdherent(
          actionDialog.adherent.id,
        );

        setSuccess(
          'Le compte a été réactivé.',
        );
      }

      setActionDialog(
        null,
      );

      setActionReason(
        '',
      );

      await loadAdherents(
        true,
      );
    } catch (
      currentError
    ) {
      setError(
        currentError instanceof
          Error
          ? currentError.message
          : 'L’action demandée a échoué.',
      );
    } finally {
      setSubmitting(
        false,
      );
    }
  }

  async function copyPassword() {
    if (
      !createdAccount
    ) {
      return;
    }

    await navigator.clipboard.writeText(
      createdAccount.temporaryPassword,
    );

    setCopiedPassword(
      true,
    );

    window.setTimeout(
      () => {
        setCopiedPassword(
          false,
        );
      },
      1800,
    );
  }

  return (
    <section
      className="
        min-h-0
        w-full
      "
    >
      <div
        className="
          mx-auto
          w-full
          max-w-[1600px]
        "
      >
        <div
          className="
            flex
            flex-col
            gap-5
            xl:flex-row
            xl:items-end
            xl:justify-between
          "
        >
          <div>
            <div
              className="
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-[#ead0c7]
                bg-[#fff8f5]
                px-4
                py-2
                text-xs
                font-black
                uppercase
                tracking-[0.16em]
                text-[#9b4028]
              "
            >
              <WalletCards
                size={16}
              />

              Marketplace
            </div>

            <h1
              className="
                mt-4
                text-3xl
                font-black
                tracking-tight
                text-slate-950
                sm:text-4xl
              "
            >
              Adhérents non votants
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
              Gérez les acheteurs autorisés à envoyer
              des offres sur les véhicules de la
              marketplace. Leur accès devient actif
              uniquement après validation de la caution.
            </p>
          </div>

          <div
            className="
              flex
              flex-col
              gap-3
              sm:flex-row
            "
          >
            <button
              type="button"
              onClick={() =>
                void loadAdherents(
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
                border-slate-200
                bg-white
                px-5
                text-sm
                font-extrabold
                text-slate-700
                transition
                hover:border-slate-300
                hover:text-slate-950
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

            <button
              type="button"
              onClick={() => {
                setForm(
                  emptyForm,
                );

                setError(
                  null,
                );

                setFormOpen(
                  true,
                );
              }}
              className="
                inline-flex
                min-h-12
                items-center
                justify-center
                gap-2
                rounded-2xl
                bg-[#A9472B]
                px-5
                text-sm
                font-extrabold
                text-white
                shadow-[0_14px_30px_rgba(169,71,43,0.25)]
                transition
                hover:bg-[#913B24]
              "
            >
              <Plus
                size={19}
              />

              Créer un adhérent
            </button>
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

        <div
          className="
            mt-7
            grid
            gap-4
            sm:grid-cols-2
            xl:grid-cols-4
          "
        >
          <StatisticCard
            label="Actifs sur cette page"
            value={
              statistics.active
            }
            icon={
              BadgeCheck
            }
            description="Caution validée"
          />

          <StatisticCard
            label="À vérifier"
            value={
              statistics.pendingReview
            }
            icon={
              Clock3
            }
            description="Paiements Wafacash"
          />

          <StatisticCard
            label="À payer"
            value={
              statistics.pendingPayment
            }
            icon={
              CreditCard
            }
            description="Paiements par carte"
          />

          <StatisticCard
            label="Bloqués"
            value={
              statistics.blocked
            }
            icon={
              Ban
            }
            description="Refusés ou suspendus"
          />
        </div>

        <div
          className="
            mt-7
            rounded-[2rem]
            border
            border-[var(--flascam-border)]
            bg-white
            p-4
            shadow-[0_18px_45px_rgba(15,23,42,0.06)]
            sm:p-6
          "
        >
          <div
            className="
              flex
              flex-col
              gap-4
              xl:flex-row
              xl:items-center
              xl:justify-between
            "
          >
            <div
              className="
                relative
                w-full
                xl:max-w-xl
              "
            >
              <Search
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
                placeholder="Rechercher par nom, e-mail, téléphone, ville ou référence Wafacash"
                className="
                  min-h-12
                  w-full
                  rounded-2xl
                  border
                  border-slate-200
                  bg-slate-50
                  pl-12
                  pr-4
                  text-sm
                  font-semibold
                  text-slate-950
                  outline-none
                  transition
                  placeholder:font-medium
                  placeholder:text-slate-400
                  focus:border-[#A9472B]
                  focus:bg-white
                  focus:ring-4
                  focus:ring-[#A9472B]/10
                "
              />
            </div>

            <div
              className="
                flex
                gap-2
                overflow-x-auto
                pb-1
              "
            >
              {(
                [
                  [
                    'ALL',
                    'Tous',
                  ],

                  [
                    'PENDING_REVIEW',
                    'À vérifier',
                  ],

                  [
                    'PENDING_PAYMENT',
                    'À payer',
                  ],

                  [
                    'ACTIVE',
                    'Actifs',
                  ],

                  [
                    'REJECTED',
                    'Refusés',
                  ],

                  [
                    'SUSPENDED',
                    'Suspendus',
                  ],
                ] as const
              ).map(
                (
                  [
                    value,
                    label,
                  ],
                ) => (
                  <button
                    key={
                      value
                    }
                    type="button"
                    onClick={() => {
                      setStatusFilter(
                        value,
                      );

                      setPage(
                        1,
                      );
                    }}
                    className={`
                      min-h-10
                      shrink-0
                      rounded-xl
                      border
                      px-4
                      text-sm
                      font-extrabold
                      transition
                      ${
                        statusFilter ===
                        value
                          ? 'border-[#A9472B] bg-[#A9472B] text-white'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-950'
                      }
                    `}
                  >
                    {label}
                  </button>
                ),
              )}
            </div>
          </div>

          {loading ? (
            <div
              className="
                grid
                min-h-80
                place-items-center
              "
            >
              <div
                className="
                  text-center
                "
              >
                <Loader2
                  size={36}
                  className="
                    mx-auto
                    animate-spin
                    text-[#A9472B]
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
                  Chargement des adhérents…
                </p>
              </div>
            </div>
          ) : adherents.length ===
            0 ? (
            <div
              className="
                grid
                min-h-80
                place-items-center
                px-4
                text-center
              "
            >
              <div>
                <UserRound
                  size={42}
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
                    text-slate-950
                  "
                >
                  Aucun adhérent trouvé
                </h2>

                <p
                  className="
                    mt-2
                    max-w-md
                    text-sm
                    leading-6
                    text-slate-600
                  "
                >
                  Modifiez les filtres ou créez un
                  nouveau compte d’adhérent non votant.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div
                className="
                  mt-6
                  hidden
                  overflow-x-auto
                  lg:block
                "
              >
                <table
                  className="
                    w-full
                    min-w-[1100px]
                    border-separate
                    border-spacing-y-3
                  "
                >
                  <thead>
                    <tr
                      className="
                        text-left
                        text-xs
                        font-black
                        uppercase
                        tracking-[0.12em]
                        text-slate-500
                      "
                    >
                      <th
                        className="
                          px-4
                          py-2
                        "
                      >
                        Adhérent
                      </th>

                      <th
                        className="
                          px-4
                          py-2
                        "
                      >
                        Localisation
                      </th>

                      <th
                        className="
                          px-4
                          py-2
                        "
                      >
                        Caution
                      </th>

                      <th
                        className="
                          px-4
                          py-2
                        "
                      >
                        Statut
                      </th>

                      <th
                        className="
                          px-4
                          py-2
                        "
                      >
                        Création
                      </th>

                      <th
                        className="
                          px-4
                          py-2
                          text-right
                        "
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {adherents.map(
                      (
                        adherent,
                      ) => (
                        <AdherentTableRow
                          key={
                            adherent.id
                          }
                          adherent={
                            adherent
                          }
                          onAction={
                            setActionDialog
                          }
                        />
                      ),
                    )}
                  </tbody>
                </table>
              </div>

              <div
                className="
                  mt-6
                  grid
                  gap-4
                  lg:hidden
                "
              >
                {adherents.map(
                  (
                    adherent,
                  ) => (
                    <AdherentMobileCard
                      key={
                        adherent.id
                      }
                      adherent={
                        adherent
                      }
                      onAction={
                        setActionDialog
                      }
                    />
                  ),
                )}
              </div>

              <div
                className="
                  mt-7
                  flex
                  flex-col
                  gap-4
                  border-t
                  border-slate-100
                  pt-5
                  sm:flex-row
                  sm:items-center
                  sm:justify-between
                "
              >
                <p
                  className="
                    text-sm
                    font-semibold
                    text-slate-600
                  "
                >
                  {total}{' '}
                  adhérent
                  {total >
                  1
                    ? 's'
                    : ''}{' '}
                  au total
                </p>

                {totalPages >
                  1 && (
                  <div
                    className="
                      flex
                      items-center
                      justify-between
                      gap-3
                      sm:justify-end
                    "
                  >
                    <button
                      type="button"
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
                      disabled={
                        page <=
                        1
                      }
                      className="
                        inline-flex
                        min-h-10
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        border
                        border-slate-200
                        bg-white
                        px-4
                        text-sm
                        font-extrabold
                        text-slate-700
                        transition
                        hover:border-slate-300
                        disabled:cursor-not-allowed
                        disabled:opacity-40
                      "
                    >
                      <ChevronLeft
                        size={17}
                      />

                      Précédent
                    </button>

                    <span
                      className="
                        text-sm
                        font-extrabold
                        text-slate-700
                      "
                    >
                      {page} /{' '}
                      {totalPages}
                    </span>

                    <button
                      type="button"
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
                      disabled={
                        page >=
                        totalPages
                      }
                      className="
                        inline-flex
                        min-h-10
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        border
                        border-slate-200
                        bg-white
                        px-4
                        text-sm
                        font-extrabold
                        text-slate-700
                        transition
                        hover:border-slate-300
                        disabled:cursor-not-allowed
                        disabled:opacity-40
                      "
                    >
                      Suivant

                      <ChevronRight
                        size={17}
                      />
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {formOpen && (
        <div
          className="
            fixed
            inset-0
            z-[120]
            flex
            items-end
            justify-center
            bg-slate-950/60
            p-0
            backdrop-blur-sm
            sm:items-center
            sm:p-5
          "
        >
          <form
            onSubmit={
              submitCreation
            }
            className="
              flex
              max-h-[96vh]
              w-full
              max-w-4xl
              flex-col
              overflow-hidden
              rounded-t-[2rem]
              bg-white
              shadow-2xl
              sm:rounded-[2rem]
            "
          >
            <div
              className="
                flex
                items-start
                justify-between
                gap-5
                border-b
                border-slate-100
                px-5
                py-5
                sm:px-7
              "
            >
              <div>
                <h2
                  className="
                    text-xl
                    font-black
                    text-slate-950
                    sm:text-2xl
                  "
                >
                  Créer un adhérent non votant
                </h2>

                <p
                  className="
                    mt-2
                    text-sm
                    leading-6
                    text-slate-600
                  "
                >
                  Ce compte pourra uniquement consulter
                  la marketplace et envoyer des offres
                  après validation de sa caution.
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
                  border-slate-200
                  text-slate-500
                  transition
                  hover:bg-slate-50
                  hover:text-slate-950
                "
                aria-label="Fermer"
              >
                <X
                  size={19}
                />
              </button>
            </div>

            <div
              className="
                flex-1
                overflow-y-auto
                px-5
                py-6
                sm:px-7
              "
            >
              <div
                className="
                  grid
                  gap-5
                  md:grid-cols-2
                "
              >
                <FormInput
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
                  required
                />

                <FormInput
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
                  required
                />

                <FormInput
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
                  required
                />

                <FormInput
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
                  required
                />

                <div
                  className="
                    md:col-span-2
                  "
                >
                  <FormInput
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
                    required
                  />
                </div>
              </div>

              <section
                className="
                  mt-7
                  rounded-3xl
                  border
                  border-slate-200
                  bg-slate-50
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
                  <div
                    className="
                      grid
                      size-11
                      shrink-0
                      place-items-center
                      rounded-2xl
                      bg-[#fff1eb]
                      text-[#A9472B]
                    "
                  >
                    <CircleDollarSign
                      size={22}
                    />
                  </div>

                  <div>
                    <h3
                      className="
                        font-black
                        text-slate-950
                      "
                    >
                      Mode de paiement de la caution
                    </h3>

                    <p
                      className="
                        mt-1
                        text-sm
                        leading-6
                        text-slate-600
                      "
                    >
                      Le compte restera limité tant que
                      le paiement n’aura pas été confirmé.
                    </p>
                  </div>
                </div>

                <div
                  className="
                    mt-5
                    grid
                    gap-3
                    sm:grid-cols-2
                  "
                >
                  <button
                    type="button"
                    onClick={() =>
                      updateField(
                        'depositPaymentMethod',
                        'CARD',
                      )
                    }
                    className={`
                      rounded-2xl
                      border
                      p-4
                      text-left
                      transition
                      ${
                        form.depositPaymentMethod ===
                        'CARD'
                          ? 'border-[#A9472B] bg-[#fff8f5] ring-2 ring-[#A9472B]/15'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }
                    `}
                  >
                    <CreditCard
                      size={22}
                      className="text-[#A9472B]"
                    />

                    <strong
                      className="
                        mt-3
                        block
                        text-sm
                        text-slate-950
                      "
                    >
                      Carte bancaire
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
                      L’adhérent paiera depuis son espace
                      personnel.
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      updateField(
                        'depositPaymentMethod',
                        'WAFACASH',
                      )
                    }
                    className={`
                      rounded-2xl
                      border
                      p-4
                      text-left
                      transition
                      ${
                        form.depositPaymentMethod ===
                        'WAFACASH'
                          ? 'border-[#A9472B] bg-[#fff8f5] ring-2 ring-[#A9472B]/15'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }
                    `}
                  >
                    <Banknote
                      size={22}
                      className="text-[#A9472B]"
                    />

                    <strong
                      className="
                        mt-3
                        block
                        text-sm
                        text-slate-950
                      "
                    >
                      Wafacash
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
                      FLASCAM vérifiera manuellement la
                      référence fournie.
                    </span>
                  </button>
                </div>

                {form.depositPaymentMethod ===
                  'WAFACASH' && (
                  <div
                    className="
                      mt-5
                    "
                  >
                    <FormInput
                      label="Référence Wafacash"
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
                      required
                    />
                  </div>
                )}
              </section>

              <section
                className="
                  mt-7
                  rounded-3xl
                  border
                  border-slate-200
                  bg-white
                  p-5
                "
              >
                <div
                  className="
                    flex
                    items-center
                    justify-between
                    gap-4
                  "
                >
                  <div>
                    <h3
                      className="
                        font-black
                        text-slate-950
                      "
                    >
                      Mot de passe temporaire
                    </h3>

                    <p
                      className="
                        mt-1
                        text-sm
                        leading-6
                        text-slate-600
                      "
                    >
                      Il sera affiché une seule fois après
                      la création du compte.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      updateField(
                        'generateTemporaryPassword',
                        !form.generateTemporaryPassword,
                      )
                    }
                    className={`
                      relative
                      h-7
                      w-12
                      shrink-0
                      rounded-full
                      transition
                      ${
                        form.generateTemporaryPassword
                          ? 'bg-[#A9472B]'
                          : 'bg-slate-300'
                      }
                    `}
                    aria-pressed={
                      form.generateTemporaryPassword
                    }
                  >
                    <span
                      className={`
                        absolute
                        top-1
                        size-5
                        rounded-full
                        bg-white
                        shadow
                        transition
                        ${
                          form.generateTemporaryPassword
                            ? 'left-6'
                            : 'left-1'
                        }
                      `}
                    />
                  </button>
                </div>

                <p
                  className="
                    mt-3
                    text-sm
                    font-bold
                    text-slate-700
                  "
                >
                  {form.generateTemporaryPassword
                    ? 'Le backend générera automatiquement un mot de passe sécurisé.'
                    : 'Saisissez manuellement un mot de passe temporaire.'}
                </p>

                {!form.generateTemporaryPassword && (
                  <div
                    className="
                      mt-5
                      grid
                      gap-5
                      md:grid-cols-2
                    "
                  >
                    <FormInput
                      label="Mot de passe"
                      value={
                        form.temporaryPassword
                      }
                      onChange={(
                        value,
                      ) =>
                        updateField(
                          'temporaryPassword',
                          value,
                        )
                      }
                      type="password"
                      required
                    />

                    <FormInput
                      label="Confirmation"
                      value={
                        form.temporaryPasswordConfirmation
                      }
                      onChange={(
                        value,
                      ) =>
                        updateField(
                          'temporaryPasswordConfirmation',
                          value,
                        )
                      }
                      type="password"
                      required
                    />
                  </div>
                )}
              </section>
            </div>

            <div
              className="
                flex
                shrink-0
                flex-col-reverse
                gap-3
                border-t
                border-slate-100
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
                  border-slate-200
                  bg-white
                  px-5
                  text-sm
                  font-extrabold
                  text-slate-700
                  transition
                  hover:border-slate-300
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
                      size={18}
                      className="animate-spin"
                    />

                    Création…
                  </>
                ) : (
                  <>
                    <Plus
                      size={18}
                    />

                    Créer le compte
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {createdAccount && (
        <div
          className="
            fixed
            inset-0
            z-[130]
            grid
            place-items-center
            bg-slate-950/60
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
              sm:p-8
            "
          >
            <div
              className="
                grid
                size-14
                place-items-center
                rounded-2xl
                bg-emerald-100
                text-emerald-700
              "
            >
              <ShieldCheck
                size={28}
              />
            </div>

            <h2
              className="
                mt-5
                text-2xl
                font-black
                text-slate-950
              "
            >
              Compte créé
            </h2>

            <p
              className="
                mt-2
                text-sm
                leading-6
                text-slate-600
              "
            >
              Transmettez ces informations à
              l’adhérent par un canal sécurisé. Le mot de
              passe ne sera plus affiché après la
              fermeture de cette fenêtre.
            </p>

            <div
              className="
                mt-6
                rounded-2xl
                border
                border-slate-200
                bg-slate-50
                p-4
              "
            >
              <span
                className="
                  text-xs
                  font-black
                  uppercase
                  tracking-[0.12em]
                  text-slate-500
                "
              >
                Adresse e-mail
              </span>

              <strong
                className="
                  mt-1
                  block
                  break-all
                  text-sm
                  text-slate-950
                "
              >
                {
                  createdAccount
                    .adherent
                    .account
                    ?.email
                }
              </strong>
            </div>

            <div
              className="
                mt-3
                rounded-2xl
                border
                border-[#ead0c7]
                bg-[#fff8f5]
                p-4
              "
            >
              <span
                className="
                  text-xs
                  font-black
                  uppercase
                  tracking-[0.12em]
                  text-[#9b4028]
                "
              >
                Mot de passe temporaire
              </span>

              <div
                className="
                  mt-2
                  flex
                  items-center
                  gap-3
                "
              >
                <code
                  className="
                    min-w-0
                    flex-1
                    break-all
                    rounded-xl
                    bg-white
                    px-3
                    py-3
                    text-sm
                    font-black
                    text-slate-950
                  "
                >
                  {
                    createdAccount
                      .temporaryPassword
                  }
                </code>

                <button
                  type="button"
                  onClick={() =>
                    void copyPassword()
                  }
                  className="
                    inline-flex
                    size-11
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-[#A9472B]
                    text-white
                    transition
                    hover:bg-[#913B24]
                  "
                  aria-label="Copier le mot de passe"
                >
                  {copiedPassword ? (
                    <CheckCircle2
                      size={19}
                    />
                  ) : (
                    <Copy
                      size={19}
                    />
                  )}
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setCreatedAccount(
                  null,
                );

                setCopiedPassword(
                  false,
                );
              }}
              className="
                mt-6
                inline-flex
                min-h-12
                w-full
                items-center
                justify-center
                rounded-2xl
                bg-[#A9472B]
                px-5
                text-sm
                font-extrabold
                text-white
                transition
                hover:bg-[#913B24]
              "
            >
              J’ai enregistré les identifiants
            </button>
          </div>
        </div>
      )}

      {actionDialog && (
        <ActionConfirmationDialog
          dialog={
            actionDialog
          }
          reason={
            actionReason
          }
          submitting={
            submitting
          }
          onReasonChange={
            setActionReason
          }
          onCancel={() => {
            if (
              submitting
            ) {
              return;
            }

            setActionDialog(
              null,
            );

            setActionReason(
              '',
            );

            setError(
              null,
            );
          }}
          onConfirm={() =>
            void confirmAction()
          }
        />
      )}
    </section>
  );
}

function StatisticCard({
  label,
  value,
  icon:
    Icon,
  description,
}: {
  label: string;
  value: number;
  icon:
    typeof BadgeCheck;
  description: string;
}) {
  return (
    <div
      className="
        rounded-3xl
        border
        border-[var(--flascam-border)]
        bg-white
        p-5
        shadow-[0_16px_35px_rgba(15,23,42,0.05)]
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
              text-sm
              font-bold
              text-slate-500
            "
          >
            {label}
          </p>

          <strong
            className="
              mt-2
              block
              text-3xl
              font-black
              text-slate-950
            "
          >
            {value}
          </strong>

          <span
            className="
              mt-1
              block
              text-xs
              font-semibold
              text-slate-500
            "
          >
            {description}
          </span>
        </div>

        <div
          className="
            grid
            size-11
            place-items-center
            rounded-2xl
            bg-[#fff1eb]
            text-[#A9472B]
          "
        >
          <Icon
            size={21}
          />
        </div>
      </div>
    </div>
  );
}

function AdherentTableRow({
  adherent,
  onAction,
}: {
  adherent:
    NonVotingAdherent;

  onAction: (
    dialog:
      ActionDialog,
  ) => void;
}) {
  return (
    <tr
      className="
        bg-slate-50
        text-sm
      "
    >
      <td
        className="
          rounded-l-2xl
          px-4
          py-4
        "
      >
        <div
          className="
            flex
            items-center
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
              bg-[#fff1eb]
              text-sm
              font-black
              text-[#A9472B]
            "
          >
            {getInitials(
              adherent,
            )}
          </div>

          <div
            className="
              min-w-0
            "
          >
            <strong
              className="
                block
                truncate
                text-slate-950
              "
            >
              {getFullName(
                adherent,
              )}
            </strong>

            <span
              className="
                mt-1
                block
                truncate
                text-xs
                font-semibold
                text-slate-500
              "
            >
              {
                adherent
                  .account
                  ?.email
              }
            </span>

            <span
              className="
                mt-1
                flex
                items-center
                gap-1
                text-xs
                font-semibold
                text-slate-500
              "
            >
              <Phone
                size={13}
              />

              {
                adherent
                  .account
                  ?.phone ||
                '—'
              }
            </span>
          </div>
        </div>
      </td>

      <td
        className="
          px-4
          py-4
        "
      >
        <div
          className="
            flex
            items-center
            gap-2
            font-bold
            text-slate-700
          "
        >
          <MapPin
            size={16}
            className="text-[#A9472B]"
          />

          {
            adherent.city
          }
        </div>
      </td>

      <td
        className="
          px-4
          py-4
        "
      >
        <strong
          className="
            block
            text-slate-950
          "
        >
          {formatAmount(
            adherent.deposit.amount,
            adherent.deposit.currency,
          )}
        </strong>

        <span
          className="
            mt-1
            flex
            items-center
            gap-1.5
            text-xs
            font-bold
            text-slate-500
          "
        >
          {adherent.deposit.paymentMethod ===
          'CARD' ? (
            <CreditCard
              size={14}
            />
          ) : (
            <Banknote
              size={14}
            />
          )}

          {adherent.deposit.paymentMethod ===
          'CARD'
            ? 'Carte bancaire'
            : 'Wafacash'}
        </span>

        {adherent.deposit.wafacashReference && (
          <code
            className="
              mt-2
              block
              max-w-48
              truncate
              rounded-lg
              bg-white
              px-2
              py-1
              text-xs
              font-bold
              text-slate-700
            "
          >
            {
              adherent
                .deposit
                .wafacashReference
            }
          </code>
        )}
      </td>

      <td
        className="
          px-4
          py-4
        "
      >
        <span
          className={`
            inline-flex
            items-center
            rounded-full
            border
            px-3
            py-1.5
            text-xs
            font-black
            ${statusClasses(
              adherent.membershipStatus,
            )}
          `}
        >
          {
            statusLabels[
              adherent
                .membershipStatus
            ]
          }
        </span>
      </td>

      <td
        className="
          px-4
          py-4
          text-xs
          font-semibold
          text-slate-600
        "
      >
        {formatDate(
          adherent.createdAt,
        )}
      </td>

      <td
        className="
          rounded-r-2xl
          px-4
          py-4
        "
      >
        <AdherentActions
          adherent={
            adherent
          }
          onAction={
            onAction
          }
        />
      </td>
    </tr>
  );
}

function AdherentMobileCard({
  adherent,
  onAction,
}: {
  adherent:
    NonVotingAdherent;

  onAction: (
    dialog:
      ActionDialog,
  ) => void;
}) {
  return (
    <article
      className="
        rounded-3xl
        border
        border-slate-200
        bg-slate-50
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
        <div
          className="
            grid
            size-12
            shrink-0
            place-items-center
            rounded-2xl
            bg-[#fff1eb]
            font-black
            text-[#A9472B]
          "
        >
          {getInitials(
            adherent,
          )}
        </div>

        <div
          className="
            min-w-0
            flex-1
          "
        >
          <strong
            className="
              block
              truncate
              text-base
              text-slate-950
            "
          >
            {getFullName(
              adherent,
            )}
          </strong>

          <span
            className="
              mt-1
              block
              truncate
              text-sm
              font-semibold
              text-slate-500
            "
          >
            {
              adherent
                .account
                ?.email
            }
          </span>
        </div>

        <span
          className={`
            shrink-0
            rounded-full
            border
            px-2.5
            py-1
            text-[11px]
            font-black
            ${statusClasses(
              adherent.membershipStatus,
            )}
          `}
        >
          {
            statusLabels[
              adherent
                .membershipStatus
            ]
          }
        </span>
      </div>

      <div
        className="
          mt-5
          grid
          gap-3
          sm:grid-cols-2
        "
      >
        <MobileInformation
          label="Téléphone"
          value={
            adherent
              .account
              ?.phone ||
            '—'
          }
        />

        <MobileInformation
          label="Ville"
          value={
            adherent.city
          }
        />

        <MobileInformation
          label="Caution"
          value={
            formatAmount(
              adherent.deposit.amount,
              adherent.deposit.currency,
            )
          }
        />

        <MobileInformation
          label="Paiement"
          value={
            adherent.deposit.paymentMethod ===
            'CARD'
              ? 'Carte bancaire'
              : 'Wafacash'
          }
        />
      </div>

      {adherent.deposit.wafacashReference && (
        <div
          className="
            mt-4
            rounded-2xl
            border
            border-slate-200
            bg-white
            p-3
          "
        >
          <span
            className="
              text-xs
              font-black
              uppercase
              tracking-[0.1em]
              text-slate-500
            "
          >
            Référence Wafacash
          </span>

          <code
            className="
              mt-1
              block
              break-all
              text-sm
              font-bold
              text-slate-950
            "
          >
            {
              adherent
                .deposit
                .wafacashReference
            }
          </code>
        </div>
      )}

      <div
        className="
          mt-5
          border-t
          border-slate-200
          pt-4
        "
      >
        <AdherentActions
          adherent={
            adherent
          }
          onAction={
            onAction
          }
          mobile
        />
      </div>
    </article>
  );
}

function MobileInformation({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      className="
        rounded-2xl
        bg-white
        p-3
      "
    >
      <span
        className="
          text-xs
          font-bold
          text-slate-500
        "
      >
        {label}
      </span>

      <strong
        className="
          mt-1
          block
          text-sm
          text-slate-950
        "
      >
        {value}
      </strong>
    </div>
  );
}

function AdherentActions({
  adherent,
  onAction,
  mobile =
    false,
}: {
  adherent:
    NonVotingAdherent;

  onAction: (
    dialog:
      ActionDialog,
  ) => void;

  mobile?: boolean;
}) {
  const buttonClassName =
    mobile
      ? 'w-full'
      : '';

  return (
    <div
      className={`
        flex
        flex-wrap
        gap-2
        ${
          mobile
            ? 'flex-col sm:flex-row'
            : 'justify-end'
        }
      `}
    >
      {adherent.requiresWafacashReview && (
        <>
          <button
            type="button"
            onClick={() =>
              onAction({
                type:
                  'APPROVE_WAFACASH',

                adherent,
              })
            }
            className={`
              inline-flex
              min-h-10
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-emerald-700
              px-3
              text-xs
              font-black
              text-white
              transition
              hover:bg-emerald-800
              ${buttonClassName}
            `}
          >
            <CheckCircle2
              size={16}
            />

            Valider
          </button>

          <button
            type="button"
            onClick={() =>
              onAction({
                type:
                  'REJECT_WAFACASH',

                adherent,
              })
            }
            className={`
              inline-flex
              min-h-10
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              border-red-200
              bg-red-50
              px-3
              text-xs
              font-black
              text-red-700
              transition
              hover:bg-red-100
              ${buttonClassName}
            `}
          >
            <XCircle
              size={16}
            />

            Refuser
          </button>
        </>
      )}

      {adherent.membershipStatus !==
        'SUSPENDED' && (
        <button
          type="button"
          onClick={() =>
            onAction({
              type:
                'SUSPEND',

              adherent,
            })
          }
          className={`
            inline-flex
            min-h-10
            items-center
            justify-center
            gap-2
            rounded-xl
            border
            border-slate-300
            bg-white
            px-3
            text-xs
            font-black
            text-slate-700
            transition
            hover:bg-slate-100
            ${buttonClassName}
          `}
        >
          <Ban
            size={16}
          />

          Suspendre
        </button>
      )}

      {adherent.membershipStatus ===
        'SUSPENDED' && (
        <button
          type="button"
          onClick={() =>
            onAction({
              type:
                'REACTIVATE',

              adherent,
            })
          }
          className={`
            inline-flex
            min-h-10
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-[#A9472B]
            px-3
            text-xs
            font-black
            text-white
            transition
            hover:bg-[#913B24]
            ${buttonClassName}
          `}
        >
          <RotateCcw
            size={16}
          />

          Réactiver
        </button>
      )}
    </div>
  );
}

function ActionConfirmationDialog({
  dialog,
  reason,
  submitting,
  onReasonChange,
  onCancel,
  onConfirm,
}: {
  dialog:
    Exclude<
      ActionDialog,
      null
    >;

  reason: string;

  submitting: boolean;

  onReasonChange: (
    value:
      string,
  ) => void;

  onCancel: () => void;

  onConfirm: () => void;
}) {
  const needsReason =
    dialog.type ===
      'REJECT_WAFACASH' ||
    dialog.type ===
      'SUSPEND';

  const title =
    dialog.type ===
    'APPROVE_WAFACASH'
      ? 'Valider le paiement Wafacash'
      : dialog.type ===
          'REJECT_WAFACASH'
        ? 'Refuser le paiement Wafacash'
        : dialog.type ===
            'SUSPEND'
          ? 'Suspendre le compte'
          : 'Réactiver le compte';

  const description =
    dialog.type ===
    'APPROVE_WAFACASH'
      ? 'Après confirmation, l’adhérent pourra immédiatement envoyer des offres.'
      : dialog.type ===
          'REJECT_WAFACASH'
        ? 'L’adhérent devra fournir une nouvelle référence valide.'
        : dialog.type ===
            'SUSPEND'
          ? 'Le compte sera désactivé et toutes ses sessions seront révoquées.'
          : 'L’accès au compte sera rétabli selon le statut actuel de sa caution.';

  return (
    <div
      className="
        fixed
        inset-0
        z-[140]
        grid
        place-items-center
        bg-slate-950/60
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
              bg-[#fff1eb]
              text-[#A9472B]
            "
          >
            {dialog.type ===
            'APPROVE_WAFACASH' ? (
              <CheckCircle2
                size={24}
              />
            ) : dialog.type ===
              'REACTIVATE' ? (
              <RotateCcw
                size={24}
              />
            ) : (
              <AlertCircle
                size={24}
              />
            )}
          </div>

          <div>
            <h2
              className="
                text-xl
                font-black
                text-slate-950
              "
            >
              {title}
            </h2>

            <p
              className="
                mt-2
                text-sm
                leading-6
                text-slate-600
              "
            >
              {description}
            </p>
          </div>
        </div>

        <div
          className="
            mt-5
            rounded-2xl
            bg-slate-50
            p-4
          "
        >
          <strong
            className="
              block
              text-sm
              text-slate-950
            "
          >
            {getFullName(
              dialog.adherent,
            )}
          </strong>

          <span
            className="
              mt-1
              block
              text-sm
              font-semibold
              text-slate-500
            "
          >
            {
              dialog
                .adherent
                .account
                ?.email
            }
          </span>

          {dialog.adherent.deposit.wafacashReference && (
            <code
              className="
                mt-3
                block
                rounded-xl
                bg-white
                px-3
                py-2
                text-sm
                font-bold
                text-slate-950
              "
            >
              {
                dialog
                  .adherent
                  .deposit
                  .wafacashReference
              }
            </code>
          )}
        </div>

        {needsReason && (
          <label
            className="
              mt-5
              block
              text-sm
              font-black
              text-slate-800
            "
          >
            {dialog.type ===
            'SUSPEND'
              ? 'Motif de suspension'
              : 'Motif du refus'}

            <span
              className="
                text-red-600
              "
            >
              {' '}*
            </span>

            <textarea
              value={
                reason
              }
              onChange={(
                event,
              ) =>
                onReasonChange(
                  event.target.value,
                )
              }
              rows={4}
              maxLength={2000}
              placeholder={
                dialog.type ===
                'SUSPEND'
                  ? 'Expliquez pourquoi ce compte doit être suspendu…'
                  : 'Expliquez pourquoi le paiement ne peut pas être validé…'
              }
              className="
                mt-2
                w-full
                resize-none
                rounded-2xl
                border
                border-slate-200
                bg-white
                p-4
                text-sm
                font-semibold
                text-slate-950
                outline-none
                transition
                focus:border-[#A9472B]
                focus:ring-4
                focus:ring-[#A9472B]/10
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
            onClick={
              onCancel
            }
            disabled={
              submitting
            }
            className="
              min-h-11
              rounded-xl
              border
              border-slate-200
              bg-white
              px-5
              text-sm
              font-extrabold
              text-slate-700
              transition
              hover:border-slate-300
              disabled:opacity-50
            "
          >
            Annuler
          </button>

          <button
            type="button"
            onClick={
              onConfirm
            }
            disabled={
              submitting
            }
            className="
              inline-flex
              min-h-11
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-[#A9472B]
              px-5
              text-sm
              font-extrabold
              text-white
              transition
              hover:bg-[#913B24]
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            {submitting && (
              <Loader2
                size={17}
                className="animate-spin"
              />
            )}

            Confirmer
          </button>
        </div>
      </div>
    </div>
  );
}

function FormInput({
  label,
  value,
  onChange,
  type =
    'text',
  placeholder,
  autoComplete,
  required =
    false,
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

  required?: boolean;
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

      {required && (
        <span
          className="
            text-red-600
          "
        >
          {' '}*
        </span>
      )}

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
        required={
          required
        }
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
          focus:border-[#A9472B]
          focus:ring-4
          focus:ring-[#A9472B]/10
        "
      />
    </label>
  );
}