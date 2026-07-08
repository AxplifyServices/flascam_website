'use client';

import {
  useEffect,
  useState,
} from 'react';

import {
  useRouter,
} from 'next/navigation';

import {
  apiFetch,
} from '@/lib/api';
import Link from 'next/link';

type SessionUser = {
  email: string;
  firstName: string | null;
  lastName: string | null;

  role: {
    code: string;
    name: string;
  };

  permissions: string[];
};

export default function AdminPage() {
  const router = useRouter();

  const [
    user,
    setUser,
  ] = useState<
    SessionUser | null
  >(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadSession() {
      let response =
        await apiFetch(
          '/auth/me',
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
            '/auth/me',
            {
              cache: 'no-store',
            },
          );
      }

      if (!response.ok) {
        router.replace(
          '/admin/login',
        );

        return;
      }

      const data =
        await response.json() as {
          user: SessionUser;
        };

      if (active) {
        setUser(data.user);
        setLoading(false);
      }
    }

    void loadSession();

    return () => {
      active = false;
    };
  }, [router]);

  async function logout() {
    await apiFetch(
      '/auth/logout',
      {
        method: 'POST',
      },
    );

    router.replace(
      '/admin/login',
    );

    router.refresh();
  }

  if (loading) {
    return (
      <main
        className="
          grid
          min-h-screen
          place-items-center
          bg-slate-100
        "
      >
        Chargement…
      </main>
    );
  }

  return (
    <main
      className="
        min-h-screen
        bg-slate-100
        p-4
        sm:p-8
      "
    >
      <section
        className="
          mx-auto
          max-w-6xl
          rounded-3xl
          bg-white
          p-6
          shadow-sm
          sm:p-10
        "
      >
        <div
          className="
            flex
            flex-col
            gap-5
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <div>
            <p
              className="
                text-sm
                font-semibold
                uppercase
                tracking-[0.2em]
                text-red-700
              "
            >
              FLASCAM
            </p>

            <h1
              className="
                mt-2
                text-3xl
                font-bold
                text-slate-950
              "
            >
              Tableau de bord
            </h1>

            <p
              className="
                mt-2
                text-slate-600
              "
            >
              {user?.firstName}{' '}
              {user?.lastName}
              {' · '}
              {user?.role.name}
            </p>
          </div>

          <button
            type="button"
            onClick={logout}
            className="
              h-11
              rounded-xl
              border
              border-slate-300
              px-5
              font-medium
              text-slate-800
              hover:bg-slate-50
            "
          >
            Se déconnecter
          </button>
        </div>

        <div
          className="
            mt-8
            rounded-2xl
            border
            border-emerald-200
            bg-emerald-50
            p-5
            text-emerald-900
          "
        >
          Session sécurisée active
          pour{' '}
          <strong>
            {user?.email}
          </strong>.
        </div>

        <div
  className="
    mt-6
    grid
    gap-4
    sm:grid-cols-2
  "
>
  <Link
    href="/admin/institutional"
    className="
      rounded-2xl
      border
      border-slate-200
      p-6
      transition
      hover:border-red-300
      hover:shadow-sm
    "
  >
    <p
      className="
        text-sm
        font-semibold
        text-red-700
      "
    >
      Portail public
    </p>

    <h2
      className="
        mt-2
        text-xl
        font-bold
        text-slate-950
      "
    >
      Contenus institutionnels
    </h2>

    <p
      className="
        mt-2
        text-sm
        leading-6
        text-slate-600
      "
    >
      Modifier la page d’accueil,
      les missions, les chiffres
      clés, le bureau, les partenaires
      et les documents.
    </p>
  </Link>

  <Link
    href="/admin/contact-messages"
    className="
      rounded-2xl
      border
      border-slate-200
      p-6
      transition
      hover:border-red-300
      hover:shadow-sm
    "
  >
    <p
      className="
        text-sm
        font-semibold
        text-red-700
      "
    >
      Contact
    </p>

    <h2
      className="
        mt-2
        text-xl
        font-bold
        text-slate-950
      "
    >
      Messages reçus
    </h2>

    <p
      className="
        mt-2
        text-sm
        leading-6
        text-slate-600
      "
    >
      Consulter et traiter les
      demandes envoyées depuis le
      portail public.
    </p>
  </Link>
</div>
      </section>
    </main>
  );
}