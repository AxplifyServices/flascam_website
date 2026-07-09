'use client';

import {
  useEffect,
  useState,
} from 'react';

import {
  ArrowLeft,
  Loader2,
  Mail,
  Phone,
} from 'lucide-react';

import {
  apiFetch,
} from '@/lib/api';

type ContactMessage = {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  subject: string;
  message: string;

  status:
    | 'NEW'
    | 'IN_PROGRESS'
    | 'PROCESSED'
    | 'ARCHIVED';

  createdAt: string;
};

const labels = {
  NEW: 'Nouveau',
  IN_PROGRESS:
    'En cours',
  PROCESSED: 'Traité',
  ARCHIVED: 'Archivé',
};

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

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    setLoading(true);

    let response =
      await apiFetch(
        '/institutional/contact-messages',
        {
          cache: 'no-store',
        },
      );

    if (
      response.status === 401
    ) {
      await apiFetch(
        '/auth/refresh',
        {
          method: 'POST',
        },
      );

      response =
        await apiFetch(
          '/institutional/contact-messages',
          {
            cache: 'no-store',
          },
        );
    }

    if (!response.ok) {
      setError(
        'Impossible de charger les messages.',
      );
      setLoading(false);
      return;
    }

    setMessages(
      await response.json(),
    );

    setLoading(false);
  }

  async function changeStatus(
    id: string,
    status:
      ContactMessage['status'],
  ) {
    const response =
      await apiFetch(
        `/institutional/contact-messages/${id}/status`,
        {
          method: 'PATCH',
          body: JSON.stringify({
            status,
          }),
        },
      );

    if (!response.ok) {
      setError(
        'Le statut n’a pas pu être modifié.',
      );
      return;
    }

    setMessages(
      (current) =>
        current.map(
          (message) =>
            message.id === id
              ? {
                  ...message,
                  status,
                }
              : message,
        ),
    );
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
            bg-white
            p-5
            shadow-sm
          "
        >


<h1
  className="
    text-2xl
    font-extrabold
    text-slate-950
  "
>
  Messages reçus
</h1>
        </header>

        {error && (
          <p
            className="
              mt-5
              rounded-xl
              bg-red-50
              p-4
              text-red-800
            "
          >
            {error}
          </p>
        )}

        {loading ? (
          <div
            className="
              grid
              min-h-60
              place-items-center
            "
          >
            <Loader2
              className=
                "animate-spin"
            />
          </div>
        ) : (
          <div
            className="
              mt-5
              space-y-4
            "
          >
            {messages.map(
              (message) => (
                <article
                  key={message.id}
                  className="
                    rounded-2xl
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
                      sm:items-start
                      sm:justify-between
                    "
                  >
                    <div>
                      <p
                        className="
                          text-xs
                          font-semibold
                          uppercase
                          tracking-wider
                          text-red-700
                        "
                      >
                        {
                          labels[
                            message.status
                          ]
                        }
                      </p>

                      <h2
                        className="
                          mt-2
                          text-xl
                          font-bold
                          text-slate-950
                        "
                      >
                        {
                          message.subject
                        }
                      </h2>

                      <p
                        className="
                          mt-1
                          text-sm
                          text-slate-500
                        "
                      >
                        {
                          message.fullName
                        }
                        {' · '}
                        {new Date(
                          message.createdAt,
                        ).toLocaleString(
                          'fr-MA',
                        )}
                      </p>
                    </div>

                    <select
                      value={
                        message.status
                      }
                      onChange={(event) =>
                        changeStatus(
                          message.id,
                          event
                            .target
                            .value as
                            ContactMessage['status'],
                        )
                      }
                      className="
                        h-11
                        rounded-xl
                        border
                        border-slate-300
                        px-3
                        text-sm
                      "
                    >
                      {Object.entries(
                        labels,
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

                  <div
                    className="
                      mt-5
                      flex
                      flex-wrap
                      gap-4
                      text-sm
                      text-slate-600
                    "
                  >
                    <a
                      href={
                        `mailto:${message.email}`
                      }
                      className="
                        inline-flex
                        items-center
                        gap-2
                      "
                    >
                      <Mail
                        size={16}
                      />

                      {message.email}
                    </a>

                    {message.phone && (
                      <a
                        href={
                          `tel:${message.phone}`
                        }
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
                          message.phone
                        }
                      </a>
                    )}
                  </div>

                  <p
                    className="
                      mt-5
                      whitespace-pre-line
                      rounded-xl
                      bg-slate-50
                      p-4
                      leading-7
                      text-slate-700
                    "
                  >
                    {message.message}
                  </p>
                </article>
            
            ))}

            {messages.length === 0 && (
              <div
                className="
                  rounded-2xl
                  bg-white
                  p-10
                  text-center
                  text-slate-500
                "
              >
                Aucun message reçu.
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}