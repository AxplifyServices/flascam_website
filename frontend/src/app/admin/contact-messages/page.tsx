'use client';

import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  Ban,
  Building2,
  CalendarDays,
  CheckCircle2,
  CircleUserRound,
  Clock3,
  Loader2,
  Mail,
  MapPin,
  PlayCircle,
  Phone,
} from 'lucide-react';

import {
  apiFetch,
} from '@/lib/api';

type ContactMessageStatus =
  | 'NEW'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

type ContactRequesterType =
  | 'INDIVIDUAL'
  | 'PROFESSIONAL';

type ContactMessage = {
  id: string;

  firstName:
    | string
    | null;

  lastName:
    | string
    | null;

  fullName: string;

  city:
    | string
    | null;

  email: string;

  phone:
    | string
    | null;

  requesterType:
    ContactRequesterType;

  companyName:
    | string
    | null;

  businessSector:
    | string
    | null;

  yearsInBusiness:
    | number
    | null;

  subject: string;
  description: string;

  status:
    ContactMessageStatus;

  association: {
    id: string;
    name: string;
    slug: string;
  } | null;

  processedBy?: {
    id: string;
    firstName:
      | string
      | null;
    lastName:
      | string
      | null;
    email: string;
  } | null;

  processedAt:
    | string
    | null;

  createdAt: string;
  updatedAt: string;
};

const statusLabels: Record<
  ContactMessageStatus,
  string
> = {
  NEW:
    'Nouveau',

  IN_PROGRESS:
    'En cours de traitement',

  COMPLETED:
    'Terminé',

  CANCELLED:
    'Annulé',
};

const statusClasses: Record<
  ContactMessageStatus,
  string
> = {
  NEW:
    'border-red-200 bg-red-50 text-red-700',

  IN_PROGRESS:
    'border-amber-200 bg-amber-50 text-amber-800',

  COMPLETED:
    'border-emerald-200 bg-emerald-50 text-emerald-800',

  CANCELLED:
    'border-slate-200 bg-slate-100 text-slate-600',
};

const allowedStatusTransitions: Record<
  ContactMessageStatus,
  ContactMessageStatus[]
> = {
  NEW: [
    'IN_PROGRESS',
    'CANCELLED',
  ],

  IN_PROGRESS: [
    'COMPLETED',
    'CANCELLED',
  ],

  COMPLETED: [],

  CANCELLED: [],
};

function canChangeStatus(
  currentStatus:
    ContactMessageStatus,
  nextStatus:
    ContactMessageStatus,
) {
  return allowedStatusTransitions[
    currentStatus
  ].includes(nextStatus);
}

function formatDate(
  value:
    | string
    | null
    | undefined,
) {
  if (!value) {
    return '—';
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return '—';
  }

  return date.toLocaleString(
    'fr-MA',
    {
      dateStyle:
        'medium',
      timeStyle:
        'short',
    },
  );
}

function getDisplayName(
  message:
    ContactMessage,
) {
  const composedName = [
    message.firstName,
    message.lastName,
  ]
    .filter(Boolean)
    .join(' ')
    .trim();

  return (
    composedName ||
    message.fullName ||
    'Expéditeur non renseigné'
  );
}

function getProcessedByName(
  message:
    ContactMessage,
) {
  if (!message.processedBy) {
    return null;
  }

  const name = [
    message.processedBy
      .firstName,
    message.processedBy
      .lastName,
  ]
    .filter(Boolean)
    .join(' ')
    .trim();

  return (
    name ||
    message.processedBy
      .email
  );
}

export default function ContactMessagesPage() {
  const [
    messages,
    setMessages,
  ] = useState<
    ContactMessage[]
  >([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState('');

  const [
    updatingMessageId,
    setUpdatingMessageId,
  ] = useState<
    string | null
  >(null);

  const loadMessages =
    useCallback(
      async () => {
        setLoading(true);
        setError('');

        try {
          let response =
            await apiFetch(
              '/institutional/contact-messages',
              {
                cache:
                  'no-store',
              },
            );

          if (
            response.status ===
            401
          ) {
            const refreshResponse =
              await apiFetch(
                '/auth/refresh',
                {
                  method:
                    'POST',
                },
              );

            if (
              !refreshResponse.ok
            ) {
              throw new Error(
                'Votre session a expiré. Veuillez vous reconnecter.',
              );
            }

            response =
              await apiFetch(
                '/institutional/contact-messages',
                {
                  cache:
                    'no-store',
                },
              );
          }

          if (!response.ok) {
            const responseBody =
              await response
                .json()
                .catch(
                  () => null,
                );

            const apiMessage =
              Array.isArray(
                responseBody
                  ?.message,
              )
                ? responseBody
                    .message[0]
                : responseBody
                    ?.message;

            throw new Error(
              typeof apiMessage ===
                'string'
                ? apiMessage
                : 'Impossible de charger les demandes reçues.',
            );
          }

          const data =
            await response.json();

          setMessages(
            Array.isArray(data)
              ? data
              : [],
          );
        } catch (
          caughtError
        ) {
          setError(
            caughtError instanceof
              Error
              ? caughtError.message
              : 'Impossible de charger les demandes reçues.',
          );
        } finally {
          setLoading(false);
        }
      },
      [],
    );

  useEffect(() => {
    void loadMessages();
  }, [loadMessages]);

  async function changeStatus(
    id: string,
    status:
      ContactMessageStatus,
  ) {
    const currentMessage =
      messages.find(
        (message) =>
          message.id === id,
      );

if (!currentMessage) {
  return;
}

if (
  !canChangeStatus(
    currentMessage.status,
    status,
  )
) {
  setError(
    'Cette transition de statut n’est pas autorisée.',
  );

  return;
}

    setUpdatingMessageId(
      id,
    );
    setError('');

    try {
      let response =
        await apiFetch(
          `/institutional/contact-messages/${id}/status`,
          {
            method:
              'PATCH',

            body:
              JSON.stringify({
                status,
              }),
          },
        );

      if (
        response.status ===
        401
      ) {
        const refreshResponse =
          await apiFetch(
            '/auth/refresh',
            {
              method:
                'POST',
            },
          );

        if (
          !refreshResponse.ok
        ) {
          throw new Error(
            'Votre session a expiré. Veuillez vous reconnecter.',
          );
        }

        response =
          await apiFetch(
            `/institutional/contact-messages/${id}/status`,
            {
              method:
                'PATCH',

              body:
                JSON.stringify({
                  status,
                }),
            },
          );
      }

      if (!response.ok) {
        const responseBody =
          await response
            .json()
            .catch(
              () => null,
            );

        const apiMessage =
          Array.isArray(
            responseBody
              ?.message,
          )
            ? responseBody
                .message[0]
            : responseBody
                ?.message;

        throw new Error(
          typeof apiMessage ===
            'string'
            ? apiMessage
            : 'Le statut n’a pas pu être modifié.',
        );
      }

      const updatedMessage =
        await response
          .json()
          .catch(
            () => null,
          );

      setMessages(
        (current) =>
          current.map(
            (message) =>
              message.id ===
              id
                ? {
                    ...message,

                    status,

processedAt:
  updatedMessage
    ?.processedAt ??
  new Date()
    .toISOString(),

                    updatedAt:
                      updatedMessage
                        ?.updatedAt ??
                      new Date()
                        .toISOString(),
                  }
                : message,
          ),
      );
    } catch (
      caughtError
    ) {
      setError(
        caughtError instanceof
          Error
          ? caughtError.message
          : 'Le statut n’a pas pu être modifié.',
      );
    } finally {
      setUpdatingMessageId(
        null,
      );
    }
  }

  return (
    <main>
      <div
        className="
          mx-auto
          max-w-6xl
        "
      >
        <header
          className="
            rounded-2xl
            border
            border-slate-200
            bg-white
            p-5
            shadow-sm
            sm:p-6
          "
        >
          <div
            className="
              flex
              flex-col
              gap-4
              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >
            <div>
              <p
                className="
                  text-xs
                  font-extrabold
                  uppercase
                  tracking-[0.16em]
                  text-[#c96f4a]
                "
              >
                Suivi des demandes
              </p>

              <h1
                className="
                  mt-2
                  text-2xl
                  font-extrabold
                  text-slate-950
                  sm:text-3xl
                "
              >
                Demandes reçues
              </h1>

              <p
                className="
                  mt-2
                  max-w-2xl
                  text-sm
                  leading-6
                  text-slate-600
                "
              >
                Consultez les
                demandes reçues et
                mettez à jour leur
                état de traitement.
              </p>
            </div>

            {!loading && (
              <div
                className="
                  inline-flex
                  w-fit
                  items-center
                  rounded-full
                  bg-[#0f5f9f]/10
                  px-4
                  py-2
                  text-sm
                  font-bold
                  text-[#0f5f9f]
                "
              >
                {messages.length}{' '}
                demande
                {messages.length >
                1
                  ? 's'
                  : ''}
              </div>
            )}
          </div>
        </header>

        {error && (
          <div
            role="alert"
            className="
              mt-5
              flex
              flex-col
              gap-3
              rounded-xl
              border
              border-red-200
              bg-red-50
              p-4
              text-sm
              text-red-800
              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >
            <p>{error}</p>

            <button
              type="button"
              onClick={() =>
                void loadMessages()
              }
              className="
                inline-flex
                min-h-10
                shrink-0
                items-center
                justify-center
                rounded-lg
                border
                border-red-300
                bg-white
                px-4
                font-bold
                text-red-800
                transition
                hover:bg-red-100
              "
            >
              Réessayer
            </button>
          </div>
        )}

        {loading ? (
          <div
            className="
              mt-5
              grid
              min-h-72
              place-items-center
              rounded-2xl
              border
              border-slate-200
              bg-white
            "
          >
            <div
              className="
                flex
                flex-col
                items-center
                gap-3
                text-slate-600
              "
            >
              <Loader2
                className="
                  animate-spin
                  text-[#0f5f9f]
                "
                size={28}
                aria-hidden="true"
              />

              <p className="text-sm">
                Chargement des
                demandes…
              </p>
            </div>
          </div>
        ) : (
          <div
            className="
              mt-5
              space-y-5
            "
          >
            {messages.map(
              (message) => {
                const isUpdating =
                  updatingMessageId ===
                  message.id;

                const processedBy =
                  getProcessedByName(
                    message,
                  );

                return (
                  <article
                    key={
                      message.id
                    }
                    className="
                      overflow-hidden
                      rounded-2xl
                      border
                      border-slate-200
                      bg-white
                      shadow-sm
                    "
                  >
                    <div
                      className="
                        p-5
                        sm:p-6
                      "
                    >
                      <div
                        className="
                          flex
                          flex-col
                          gap-5
                          lg:flex-row
                          lg:items-start
                          lg:justify-between
                        "
                      >
                        <div
                          className="
                            min-w-0
                            flex-1
                          "
                        >
                          <span
                            className={`
                              inline-flex
                              rounded-full
                              border
                              px-3
                              py-1
                              text-xs
                              font-extrabold
                              ${statusClasses[
                                message
                                  .status
                              ]}
                            `}
                          >
                            {
                              statusLabels[
                                message
                                  .status
                              ]
                            }
                          </span>

                          <h2
                            className="
                              mt-3
                              break-words
                              text-xl
                              font-extrabold
                              text-slate-950
                            "
                          >
                            {
                              message.subject
                            }
                          </h2>

                          <div
                            className="
                              mt-3
                              flex
                              flex-wrap
                              items-center
                              gap-x-4
                              gap-y-2
                              text-sm
                              text-slate-500
                            "
                          >
                            <span
                              className="
                                inline-flex
                                items-center
                                gap-2
                              "
                            >
                              <CircleUserRound
                                size={
                                  16
                                }
                                aria-hidden="true"
                              />

                              {getDisplayName(
                                message,
                              )}
                            </span>

                            <span
                              className="
                                inline-flex
                                items-center
                                gap-2
                              "
                            >
                              <CalendarDays
                                size={
                                  16
                                }
                                aria-hidden="true"
                              />

                              {formatDate(
                                message.createdAt,
                              )}
                            </span>
                          </div>
                        </div>

<div
  className="
    w-full
    lg:w-72
  "
>
  <p
    className="
      mb-2
      text-xs
      font-extrabold
      uppercase
      tracking-wide
      text-slate-500
    "
  >
    Actions disponibles
  </p>

  {message.status ===
    'NEW' && (
    <div
      className="
        grid
        gap-2
        sm:grid-cols-2
        lg:grid-cols-1
      "
    >
      <button
        type="button"
        disabled={isUpdating}
        onClick={() =>
          void changeStatus(
            message.id,
            'IN_PROGRESS',
          )
        }
        className="
          inline-flex
          min-h-11
          w-full
          items-center
          justify-center
          gap-2
          rounded-xl
          bg-[#0f5f9f]
          px-4
          text-sm
          font-extrabold
          !text-white
          transition
          hover:bg-[#0b4c80]
          hover:!text-white
          disabled:cursor-not-allowed
          disabled:opacity-60
        "
      >
        {isUpdating ? (
          <Loader2
            size={17}
            className="animate-spin"
            aria-hidden="true"
          />
        ) : (
          <PlayCircle
            size={17}
            aria-hidden="true"
          />
        )}

        Prendre en charge
      </button>

      <button
        type="button"
        disabled={isUpdating}
        onClick={() =>
          void changeStatus(
            message.id,
            'CANCELLED',
          )
        }
        className="
          inline-flex
          min-h-11
          w-full
          items-center
          justify-center
          gap-2
          rounded-xl
          border
          border-red-200
          bg-white
          px-4
          text-sm
          font-extrabold
          text-red-700
          transition
          hover:bg-red-50
          disabled:cursor-not-allowed
          disabled:opacity-60
        "
      >
        <Ban
          size={17}
          aria-hidden="true"
        />

        Annuler
      </button>
    </div>
  )}

  {message.status ===
    'IN_PROGRESS' && (
    <div
      className="
        grid
        gap-2
        sm:grid-cols-2
        lg:grid-cols-1
      "
    >
      <button
        type="button"
        disabled={isUpdating}
        onClick={() =>
          void changeStatus(
            message.id,
            'COMPLETED',
          )
        }
        className="
          inline-flex
          min-h-11
          w-full
          items-center
          justify-center
          gap-2
          rounded-xl
          bg-emerald-700
          px-4
          text-sm
          font-extrabold
          !text-white
          transition
          hover:bg-emerald-800
          hover:!text-white
          disabled:cursor-not-allowed
          disabled:opacity-60
        "
      >
        {isUpdating ? (
          <Loader2
            size={17}
            className="animate-spin"
            aria-hidden="true"
          />
        ) : (
          <CheckCircle2
            size={17}
            aria-hidden="true"
          />
        )}

        Marquer comme terminé
      </button>

      <button
        type="button"
        disabled={isUpdating}
        onClick={() =>
          void changeStatus(
            message.id,
            'CANCELLED',
          )
        }
        className="
          inline-flex
          min-h-11
          w-full
          items-center
          justify-center
          gap-2
          rounded-xl
          border
          border-red-200
          bg-white
          px-4
          text-sm
          font-extrabold
          text-red-700
          transition
          hover:bg-red-50
          disabled:cursor-not-allowed
          disabled:opacity-60
        "
      >
        <Ban
          size={17}
          aria-hidden="true"
        />

        Annuler
      </button>
    </div>
  )}

  {message.status ===
    'COMPLETED' && (
    <div
      className="
        flex
        min-h-11
        items-center
        gap-2
        rounded-xl
        border
        border-emerald-200
        bg-emerald-50
        px-4
        text-sm
        font-bold
        text-emerald-800
      "
    >
      <CheckCircle2
        size={18}
        className="shrink-0"
        aria-hidden="true"
      />

      Ticket terminé
    </div>
  )}

  {message.status ===
    'CANCELLED' && (
    <div
      className="
        flex
        min-h-11
        items-center
        gap-2
        rounded-xl
        border
        border-slate-200
        bg-slate-100
        px-4
        text-sm
        font-bold
        text-slate-600
      "
    >
      <Ban
        size={18}
        className="shrink-0"
        aria-hidden="true"
      />

      Ticket annulé
    </div>
  )}
</div>
                      </div>

                      <div
                        className="
                          mt-5
                          flex
                          flex-wrap
                          gap-2
                        "
                      >
                        <span
                          className="
                            rounded-full
                            bg-slate-100
                            px-3
                            py-1.5
                            text-xs
                            font-bold
                            text-slate-700
                          "
                        >
                          {message.requesterType ===
                          'PROFESSIONAL'
                            ? 'Professionnel'
                            : 'Particulier'}
                        </span>

                        {message.city && (
                          <span
                            className="
                              inline-flex
                              items-center
                              gap-1.5
                              rounded-full
                              bg-slate-100
                              px-3
                              py-1.5
                              text-xs
                              font-bold
                              text-slate-700
                            "
                          >
                            <MapPin
                              size={
                                14
                              }
                              aria-hidden="true"
                            />

                            {
                              message.city
                            }
                          </span>
                        )}

                        {message.association && (
                          <span
                            className="
                              inline-flex
                              items-center
                              gap-1.5
                              rounded-full
                              bg-[#0f5f9f]/10
                              px-3
                              py-1.5
                              text-xs
                              font-bold
                              text-[#0f5f9f]
                            "
                          >
                            <Building2
                              size={
                                14
                              }
                              aria-hidden="true"
                            />

                            {
                              message
                                .association
                                .name
                            }
                          </span>
                        )}
                      </div>

                      <div
                        className="
                          mt-5
                          flex
                          flex-wrap
                          gap-x-6
                          gap-y-3
                          text-sm
                          text-slate-600
                        "
                      >
                        <a
                          href={`mailto:${message.email}`}
                          className="
                            inline-flex
                            items-center
                            gap-2
                            break-all
                            font-semibold
                            text-[#0f5f9f]
                            transition
                            hover:underline
                          "
                        >
                          <Mail
                            size={16}
                            className="shrink-0"
                            aria-hidden="true"
                          />

                          {message.email}
                        </a>

                        {message.phone && (
                          <a
                            href={`tel:${message.phone.replace(
                              /[^\d+]/g,
                              '',
                            )}`}
                            className="
                              inline-flex
                              items-center
                              gap-2
                              font-semibold
                              text-[#0f5f9f]
                              transition
                              hover:underline
                            "
                          >
                            <Phone
                              size={16}
                              className="shrink-0"
                              aria-hidden="true"
                            />

                            {message.phone}
                          </a>
                        )}
                      </div>

                      {message.requesterType ===
                        'PROFESSIONAL' && (
                        <div
                          className="
                            mt-5
                            grid
                            gap-4
                            rounded-xl
                            border
                            border-[#c96f4a]/20
                            bg-[#c96f4a]/5
                            p-4
                            sm:grid-cols-3
                          "
                        >
                          <div>
                            <p
                              className="
                                text-xs
                                font-extrabold
                                uppercase
                                tracking-wide
                                text-slate-500
                              "
                            >
                              Entreprise
                            </p>

                            <p
                              className="
                                mt-1.5
                                break-words
                                font-semibold
                                text-slate-900
                              "
                            >
                              {message.companyName ||
                                'Non renseignée'}
                            </p>
                          </div>

                          <div>
                            <p
                              className="
                                text-xs
                                font-extrabold
                                uppercase
                                tracking-wide
                                text-slate-500
                              "
                            >
                              Secteur
                              d’activité
                            </p>

                            <p
                              className="
                                mt-1.5
                                break-words
                                font-semibold
                                text-slate-900
                              "
                            >
                              {message.businessSector ||
                                'Non renseigné'}
                            </p>
                          </div>

                          <div>
                            <p
                              className="
                                text-xs
                                font-extrabold
                                uppercase
                                tracking-wide
                                text-slate-500
                              "
                            >
                              Ancienneté
                            </p>

                            <p
                              className="
                                mt-1.5
                                font-semibold
                                text-slate-900
                              "
                            >
                              {typeof message.yearsInBusiness ===
                              'number'
                                ? `${message.yearsInBusiness} ${
                                    message.yearsInBusiness >
                                    1
                                      ? 'ans'
                                      : 'an'
                                  }`
                                : 'Non renseignée'}
                            </p>
                          </div>
                        </div>
                      )}

                      <div
                        className="
                          mt-5
                          rounded-xl
                          bg-slate-50
                          p-4
                          sm:p-5
                        "
                      >
                        <p
                          className="
                            text-xs
                            font-extrabold
                            uppercase
                            tracking-wide
                            text-slate-500
                          "
                        >
                          Description de
                          la demande
                        </p>

                        <p
                          className="
                            mt-3
                            whitespace-pre-line
                            break-words
                            leading-7
                            text-slate-700
                          "
                        >
                          {
                            message.description
                          }
                        </p>
                      </div>
                    </div>

                    {(message.processedAt ||
                      processedBy) && (
                      <footer
                        className="
                          flex
                          flex-col
                          gap-2
                          border-t
                          border-slate-100
                          bg-slate-50/70
                          px-5
                          py-4
                          text-xs
                          text-slate-500
                          sm:flex-row
                          sm:items-center
                          sm:justify-between
                          sm:px-6
                        "
                      >
                        {message.processedAt && (
                          <span
                            className="
                              inline-flex
                              items-center
                              gap-2
                            "
                          >
                            <Clock3
                              size={
                                15
                              }
                              aria-hidden="true"
                            />

                            Dernière prise
                            en charge le{' '}
                            {formatDate(
                              message.processedAt,
                            )}
                          </span>
                        )}

                        {processedBy && (
                          <span
                            className="
                              inline-flex
                              items-center
                              gap-2
                            "
                          >
                            <CheckCircle2
                              size={
                                15
                              }
                              aria-hidden="true"
                            />

                            Traité par{' '}
                            {
                              processedBy
                            }
                          </span>
                        )}
                      </footer>
                    )}
                  </article>
                );
              },
            )}

            {messages.length ===
              0 && (
              <div
                className="
                  rounded-2xl
                  border
                  border-slate-200
                  bg-white
                  p-10
                  text-center
                  shadow-sm
                "
              >
                <Mail
                  size={36}
                  className="
                    mx-auto
                    text-slate-300
                  "
                  aria-hidden="true"
                />

                <h2
                  className="
                    mt-4
                    text-lg
                    font-extrabold
                    text-slate-900
                  "
                >
                  Aucune demande reçue
                </h2>

                <p
                  className="
                    mx-auto
                    mt-2
                    max-w-md
                    text-sm
                    leading-6
                    text-slate-500
                  "
                >
                  Les nouvelles
                  demandes envoyées
                  depuis le formulaire
                  de contact
                  apparaîtront ici.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}