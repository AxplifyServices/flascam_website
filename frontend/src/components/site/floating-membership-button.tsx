'use client';

import Link from 'next/link';

import {
  usePathname,
} from 'next/navigation';

import {
  UserPlus,
} from 'lucide-react';

export function FloatingMembershipButton() {
  const pathname =
    usePathname();

  const isAdminPage =
    pathname === '/admin' ||
    pathname.startsWith(
      '/admin/',
    );

  if (isAdminPage) {
    return null;
  }

  return (
    <Link
      href="/contact"
      aria-label="Devenir adhérent"
      className="
        fixed
        bottom-4
        right-4
        z-[60]
        inline-flex
        min-h-12
        items-center
        justify-center
        gap-2
        rounded-full
        border
        border-white/20
        bg-[#c96f4a]
        px-4
        py-3
        text-sm
        font-extrabold
        !text-white
        shadow-[0_14px_35px_rgba(96,43,24,0.30)]
        transition
        duration-200
        hover:-translate-y-0.5
        hover:bg-[#a95235]
        hover:!text-white
        hover:shadow-[0_18px_40px_rgba(96,43,24,0.36)]
        focus-visible:outline-none
        focus-visible:ring-4
        focus-visible:ring-[#c96f4a]/30
        active:translate-y-0
        sm:bottom-6
        sm:right-6
        sm:min-h-14
        sm:px-6
        sm:text-base
      "
    >
      <UserPlus
        size={19}
        className="shrink-0"
        aria-hidden="true"
      />

      <span>
        Devenir adhérent
      </span>
    </Link>
  );
}