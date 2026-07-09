import Image from 'next/image';
import Link from 'next/link';

import {
  Menu,
} from 'lucide-react';

const navItems = [
  {
    href: '/',
    label: 'Accueil',
  },
  {
    href: '/la-federation',
    label: 'La fédération',
  },
  {
    href: '/actualites',
    label: 'Actualités',
  },
  {
    href: '/associations',
    label: 'Associations',
  },
  {
    href: '/marketplace',
    label: 'Marketplace',
  },
  {
    href: '/videotheque',
    label: 'Vidéothèque',
  },
  {
    href: '/contact',
    label: 'Contact',
  },
];

export function PublicHeader() {
  return (
    <header
      className="
        sticky
        top-0
        z-50
        border-b
        border-slate-200/80
        bg-white/92
        text-[var(--flascam-black)]
        shadow-[0_8px_30px_rgba(15,23,42,0.04)]
        backdrop-blur-xl
      "
    >
      <div
        className="
          site-container
          flex
          min-h-20
          items-center
          justify-between
          gap-6
        "
      >
        <Link
          href="/"
          className="flex items-center gap-3"
          aria-label="Accueil FLASCAM"
        >
          <Image
            src="/Logo-flascam.png"
            alt="Logo FLASCAM"
            width={190}
            height={80}
            priority
            className="h-14 w-auto object-contain"
          />
        </Link>

        <nav
          className="
            hidden
            items-center
            gap-7
            text-sm
            font-semibold
            lg:flex
          "
          aria-label="Navigation principale"
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="nav-link"
            >
              {item.label}
            </Link>
          ))}

          <Link
            href="/admin/login"
            className="
              rounded-full
              bg-[var(--flascam-blue-dark)]
              px-5
              py-2.5
              text-white
              shadow-[0_10px_25px_rgba(7,53,93,0.22)]
              transition
              hover:bg-[var(--flascam-blue)]
            "
          >
            Espace pro
          </Link>
        </nav>

        <details className="relative lg:hidden">
          <summary
            className="
              grid
              size-11
              cursor-pointer
              list-none
              place-items-center
              rounded-full
              border
              border-slate-200
              bg-white
              text-[var(--flascam-black)]
              shadow-sm
            "
            aria-label="Ouvrir le menu"
          >
            <Menu size={20} />
          </summary>

          <nav
            className="
              absolute
              right-0
              top-14
              flex
              w-72
              max-w-[calc(100vw-2rem)]
              flex-col
              rounded-2xl
              border
              border-slate-200
              bg-white
              p-3
              text-[var(--flascam-black)]
              shadow-2xl
            "
            aria-label="Navigation mobile"
          >
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="
                  rounded-xl
                  px-4
                  py-3
                  text-sm
                  font-semibold
                  text-slate-700
                  hover:bg-[var(--flascam-blue-light)]
                  hover:text-[var(--flascam-blue)]
                "
              >
                {item.label}
              </Link>
            ))}

            <Link
              href="/admin/login"
              className="
                mt-2
                rounded-xl
                bg-[var(--flascam-blue-dark)]
                px-4
                py-3
                text-center
                text-sm
                font-semibold
                text-white
              "
            >
              Espace pro
            </Link>
          </nav>
        </details>
      </div>
    </header>
  );
}