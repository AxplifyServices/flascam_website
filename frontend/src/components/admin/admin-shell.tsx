'use client';

import {
  ReactNode,
  useEffect,
  useMemo,
  useState,
} from 'react';

import Image from 'next/image';
import Link from 'next/link';

import {
  BarChart3,
  Building2,
  ChevronLeft,
  ChevronRight,
  Home,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  ShieldCheck,
  X,
  UserRound,
} from 'lucide-react';

import type {
  LucideIcon,
} from 'lucide-react';

import {
  usePathname,
  useRouter,
} from 'next/navigation';

import {
  apiFetch,
} from '@/lib/api';

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

type AdminNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  permission?: string;
  roles?: string[];
  disabled?: boolean;
};

const navItems: AdminNavItem[] = [
  {
    label: 'Tableau de bord',
    href: '/admin',
    icon: LayoutDashboard,
  },

  {
    label: 'Ma fiche',
    href: '/admin/my-association',
    icon: UserRound,
    permission:
      'association.profile.read',
    roles: [
      'ASSOCIATION_ADMIN',
    ],
  },

  {
    label: 'Page d’accueil',
    href: '/admin/homepage',
    icon: Home,
    permission:
      'homepage.manage',
  },
  {
    label: 'Associations',
    href: '/admin/associations',
    icon: Building2,
    permission:
      'associations.read',
  },
{
  label: 'Messages reçus',
  href: '/admin/contact-messages',
  icon: Inbox,
  permission:
    'content.manage',
  roles: [
    'SUPER_ADMIN',
    'FLASCAM_ADMIN',
  ],
},
  {
    label: 'Utilisateurs & rôles',
    href: '/admin/users',
    icon: ShieldCheck,
    roles: [
      'SUPER_ADMIN',
      'FLASCAM_ADMIN',
    ],
    disabled: true,
  },
  {
    label: 'Statistiques',
    href: '/admin/statistics',
    icon: BarChart3,
    roles: [
      'SUPER_ADMIN',
      'FLASCAM_ADMIN',
    ],
    disabled: true,
  },
  {
    label: 'Paramètres',
    href: '/admin/settings',
    icon: Settings,
    roles: [
      'SUPER_ADMIN',
      'FLASCAM_ADMIN',
    ],
    disabled: true,
  },
];

export function AdminShell({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const isLoginPage =
    pathname === '/admin/login';

  const [
    user,
    setUser,
  ] = useState<
    SessionUser | null
  >(null);

  const [
    loading,
    setLoading,
  ] = useState(!isLoginPage);

  const [
    collapsed,
    setCollapsed,
  ] = useState(false);

  const [
    mobileOpen,
    setMobileOpen,
  ] = useState(false);

  const userName = useMemo(() => {
    const fullName = [
      user?.firstName,
      user?.lastName,
    ]
      .filter(Boolean)
      .join(' ')
      .trim();

    return fullName ||
      user?.email ||
      'Administrateur';
  }, [user]);

  const visibleNavItems =
    useMemo(
      () =>
        navItems.filter(
          (item) => {
            if (!user) {
              return false;
            }

            if (
              item.roles &&
              !item.roles.includes(
                user.role.code,
              )
            ) {
              return false;
            }

            if (
              item.permission &&
              !user.permissions.includes(
                item.permission,
              )
            ) {
              return false;
            }

            return true;
          },
        ),
      [user],
    );  

  useEffect(() => {
    if (isLoginPage) {
      setLoading(false);
      return;
    }

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

      if (!active) {
        return;
      }

      setUser(data.user);
      setLoading(false);
    }

    void loadSession();

    return () => {
      active = false;
    };
  }, [
    isLoginPage,
    router,
  ]);

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

  function isActive(
    href: string,
  ) {
    if (href === '/admin') {
      return pathname === '/admin';
    }

    return pathname.startsWith(
      href,
    );
  }

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <main
        className="
          grid
          min-h-screen
          place-items-center
          bg-[#f3f9ff]
          px-4
          text-[var(--flascam-black)]
        "
      >
        <div
          className="
            rounded-3xl
            border
            border-[var(--flascam-border)]
            bg-white
            px-8
            py-7
            text-center
            shadow-[0_24px_70px_rgba(7,53,93,0.10)]
          "
        >
          <Image
            src="/Logo-flascam.png"
            alt="Logo FLASCAM"
            width={190}
            height={80}
            priority
            className="
              mx-auto
              h-14
              w-auto
              object-contain
            "
          />

          <p
            className="
              mt-4
              text-sm
              font-semibold
              text-[var(--flascam-slate)]
            "
          >
            Chargement du back-office…
          </p>
        </div>
      </main>
    );
  }

  const sidebar = (
    <aside
      className={`
        flex
        h-full
        flex-col
        border-r
        border-[var(--flascam-border)]
        bg-white
        transition-all
        duration-200
        ${
          collapsed
            ? 'w-20'
            : 'w-72'
        }
      `}
    >
      <div
        className="
          flex
          h-20
          items-center
          justify-between
          gap-3
          border-b
          border-[var(--flascam-border)]
          px-4
        "
      >
        <Link
          href="/admin"
          className="
            flex
            min-w-0
            items-center
            gap-3
          "
          onClick={() =>
            setMobileOpen(false)
          }
        >
          <Image
            src="/Logo-flascam.png"
            alt="Logo FLASCAM"
            width={170}
            height={72}
            priority
            className="
              h-12
              w-auto
              object-contain
            "
          />
        </Link>

        <button
          type="button"
          onClick={() =>
            setCollapsed(
              (value) => !value,
            )
          }
          className="
            hidden
            size-9
            shrink-0
            place-items-center
            rounded-full
            border
            border-[var(--flascam-border)]
            bg-white
            text-slate-700
            transition
            hover:border-[var(--flascam-blue)]
            hover:text-[var(--flascam-blue)]
            lg:grid
          "
          aria-label="Réduire ou agrandir la sidebar"
        >
          {collapsed ? (
            <ChevronRight
              size={18}
            />
          ) : (
            <ChevronLeft
              size={18}
            />
          )}
        </button>

        <button
          type="button"
          onClick={() =>
            setMobileOpen(false)
          }
          className="
            grid
            size-9
            shrink-0
            place-items-center
            rounded-full
            border
            border-[var(--flascam-border)]
            text-slate-700
            lg:hidden
          "
          aria-label="Fermer le menu"
        >
          <X size={18} />
        </button>
      </div>

      <nav
        className="
          flex-1
          space-y-2
          overflow-y-auto
          px-3
          py-5
        "
        aria-label="Navigation administration"
      >
        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          const active =
            isActive(item.href);

          if (item.disabled) {
            return (
              <div
                key={item.href}
                className="
                  flex
                  h-12
                  items-center
                  gap-3
                  rounded-2xl
                  px-3
                  text-sm
                  text-slate-400
                "
              >
                <Icon
                  size={20}
                  className="shrink-0"
                />

                {!collapsed && (
                  <>
                    <span
                      className="
                        flex-1
                        truncate
                        font-semibold
                      "
                    >
                      {item.label}
                    </span>

                    <span
                      className="
                        rounded-full
                        bg-slate-100
                        px-2
                        py-1
                        text-[0.65rem]
                        font-bold
                        uppercase
                        text-slate-500
                      "
                    >
                      Bientôt
                    </span>
                  </>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() =>
                setMobileOpen(false)
              }
              className={`
                flex
                h-12
                items-center
                gap-3
                rounded-2xl
                px-3
                text-sm
                font-semibold
                transition
                ${
                  active
                    ? 'bg-[#eaf5ff] text-[var(--flascam-blue)]'
                    : 'text-slate-700 hover:bg-[#eaf5ff] hover:text-[var(--flascam-blue)]'
                }
              `}
            >
              <Icon
                size={20}
                className="shrink-0"
              />

              {!collapsed && (
                <span
                  className="
                    truncate
                  "
                >
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div
        className="
          border-t
          border-[var(--flascam-border)]
          p-3
        "
      >
        {!collapsed && (
          <div
            className="
              mb-3
              rounded-2xl
              bg-[#f8fbff]
              p-3
            "
          >
            <p
              className="
                truncate
                text-sm
                font-bold
                text-slate-950
              "
            >
              {userName}
            </p>

            <p
              className="
                mt-1
                truncate
                text-xs
                text-[var(--flascam-slate)]
              "
            >
              {user?.role.name}
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={logout}
          className="
            flex
            h-11
            w-full
            items-center
            justify-center
            gap-2
            rounded-2xl
            border
            border-[var(--flascam-border)]
            bg-white
            text-sm
            font-semibold
            text-slate-700
            transition
            hover:border-red-200
            hover:bg-red-50
            hover:text-red-700
          "
        >
          <LogOut
            size={18}
          />

          {!collapsed && (
            <span>
              Se déconnecter
            </span>
          )}
        </button>
      </div>
    </aside>
  );

  return (
    <main
      className="
        min-h-screen
        bg-[#f3f9ff]
        text-[var(--flascam-black)]
      "
    >
      <div
        className="
          flex
          min-h-screen
        "
      >
        <div
          className="
            hidden
            lg:block
          "
        >
          {sidebar}
        </div>

        {mobileOpen && (
          <div
            className="
              fixed
              inset-0
              z-50
              lg:hidden
            "
          >
            <button
              type="button"
              className="
                absolute
                inset-0
                bg-slate-950/40
              "
              onClick={() =>
                setMobileOpen(false)
              }
              aria-label="Fermer le menu administration"
            />

            <div
              className="
                relative
                h-full
                w-72
                max-w-[85vw]
              "
            >
              {sidebar}
            </div>
          </div>
        )}

        <section
          className="
            flex
            min-w-0
            flex-1
            flex-col
          "
        >
          <header
            className="
              sticky
              top-0
              z-30
              flex
              h-16
              items-center
              justify-between
              border-b
              border-[var(--flascam-border)]
              bg-white/95
              px-4
              backdrop-blur-xl
              lg:hidden
            "
          >
            <button
              type="button"
              onClick={() =>
                setMobileOpen(true)
              }
              className="
                grid
                size-11
                place-items-center
                rounded-full
                border
                border-[var(--flascam-border)]
                bg-white
                text-slate-800
              "
              aria-label="Ouvrir la sidebar"
            >
              <Menu size={21} />
            </button>

            <Image
              src="/Logo-flascam.png"
              alt="Logo FLASCAM"
              width={145}
              height={62}
              priority
              className="
                h-10
                w-auto
                object-contain
              "
            />
          </header>

          <div
            className="
              min-w-0
              flex-1
              px-4
              py-5
              sm:px-6
              lg:px-8
              lg:py-8
            "
          >
            {children}
          </div>
        </section>
      </div>
    </main>
  );
}