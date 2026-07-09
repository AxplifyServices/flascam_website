import Image from 'next/image';
import Link from 'next/link';

export function PublicFooter() {
  return (
    <footer className="bg-[var(--flascam-blue-dark)] py-10 text-white">
      <div
        className="
          site-container
          flex
          flex-col
          gap-6
          border-t
          border-white/10
          pt-8
          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >
        <div>
          <Image
            src="/Logo-flascam.png"
            alt="Logo FLASCAM"
            width={170}
            height={72}
            className="h-12 w-auto rounded-md bg-white object-contain px-2 py-1"
          />

          <p className="mt-3 max-w-md text-sm leading-6 text-white/65">
            Fédération des loueurs automobiles sans chauffeur au Maroc.
          </p>
        </div>

        <div className="text-sm text-white/55">
          <p>
            © {new Date().getFullYear()} FLASCAM. Tous droits réservés.
          </p>

          <Link
            href="/admin/login"
            className="mt-2 inline-flex font-semibold text-white/75 hover:text-white"
          >
            Espace pro
          </Link>
        </div>
      </div>
    </footer>
  );
}