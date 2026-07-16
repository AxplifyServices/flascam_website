'use client';

import {
  FormEvent,
  useState,
} from 'react';

import {
  useRouter,
} from 'next/navigation';

import {
  apiFetch,
} from '@/lib/api';

export default function AdminLoginPage() {
  const router = useRouter();

  const [
    email,
    setEmail,
  ] = useState('');

  const [
    password,
    setPassword,
  ] = useState('');

  const [
    error,
    setError,
  ] = useState('');

  const [
    loading,
    setLoading,
  ] = useState(false);

  async function submit(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError('');
    setLoading(true);

    try {
      const response =
        await apiFetch(
          '/auth/login',
          {
            method: 'POST',
            body: JSON.stringify({
              email,
              password,
            }),
          },
        );

if (!response.ok) {
  let message =
    'Impossible de se connecter.';

  try {
    const data =
      await response.json() as {
        message?: string | string[];
      };

    if (
      Array.isArray(
        data.message,
      )
    ) {
      message =
        data.message.join(
          ' ',
        );
    } else if (
      data.message
    ) {
      message =
        data.message;
    }
  } catch {
    message =
      `Erreur HTTP ${response.status}.`;
  }

  setError(message);

  return;
}

      router.replace('/admin');
      router.refresh();
    } catch {
      setError(
        'Le serveur est momentanément indisponible.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      className="
        min-h-screen
        bg-slate-950
        px-4
        py-10
        sm:px-6
      "
    >
      <div
        className="
          mx-auto
          flex
          min-h-[calc(100vh-5rem)]
          max-w-md
          items-center
        "
      >
        <section
          className="
            w-full
            rounded-3xl
            bg-white
            p-6
            shadow-2xl
            sm:p-9
          "
        >
          <p
            className="
              text-sm
              font-semibold
              uppercase
              tracking-[0.2em]
              text-[var(--flascam-blue)]
            "
          >
            FLASCAM
          </p>

          <h1
            className="
              mt-3
              text-3xl
              font-bold
              text-slate-950
            "
          >
            Administration
          </h1>

          <p
            className="
              mt-2
              text-sm
              leading-6
              text-slate-600
            "
          >
            Connectez-vous avec
            un compte autorisé pour
            accéder au back-office.
          </p>

          <form
            className="
              mt-8
              space-y-5
            "
            onSubmit={submit}
          >
            <label
              className="
                block
                text-sm
                font-medium
                text-slate-800
              "
            >
              Adresse e-mail

              <input
                className="
                  mt-2
                  h-12
                  w-full
                  rounded-xl
                  border
                  border-slate-300
                  px-4
                  outline-none
                  transition
                  focus:border-[var(--flascam-blue)]
                  focus:ring-2
                  focus:ring-[#eaf5ff]
                "
                type="email"
                autoComplete="username"
                value={email}
                onChange={(event) =>
                  setEmail(
                    event.target.value,
                  )
                }
                required
              />
            </label>

            <label
              className="
                block
                text-sm
                font-medium
                text-slate-800
              "
            >
              Mot de passe

              <input
                className="
                  mt-2
                  h-12
                  w-full
                  rounded-xl
                  border
                  border-slate-300
                  px-4
                  outline-none
                  transition
                  focus:border-[var(--flascam-blue)]
                  focus:ring-2
                  focus:ring-[#eaf5ff]
                "
                type="password"
                autoComplete=
                  "current-password"
                value={password}
                onChange={(event) =>
                  setPassword(
                    event.target.value,
                  )
                }
                minLength={8}
                required
              />
            </label>

            {error && (
              <p
                role="alert"
                className="
                  rounded-xl
                  bg-red-50
                  px-4
                  py-3
                  text-sm
                  text-red-800
                "
              >
                {error}
              </p>
            )}

            <button
              className="
                h-12
                w-full
                rounded-xl
                bg-[var(--flascam-blue)]
                px-4
                font-semibold
                text-white
                transition
                hover:bg-[var(--flascam-blue-dark)]
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
              type="submit"
              disabled={loading}
            >
              {loading
                ? 'Connexion…'
                : 'Se connecter'}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}