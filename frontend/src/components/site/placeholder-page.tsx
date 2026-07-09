import Link from 'next/link';

import {
  ArrowLeft,
} from 'lucide-react';

import {
  PublicFooter,
} from '@/components/site/public-footer';
import {
  PublicHeader,
} from '@/components/site/public-header';

type PlaceholderPageProps = {
  title: string;
  description: string;
};

export function PlaceholderPage({
  title,
  description,
}: PlaceholderPageProps) {
  return (
    <>
      <PublicHeader />

      <main>
        <section className="bg-[var(--ivory)] py-16 sm:py-24">
          <div className="site-container">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--flascam-blue)] hover:text-[var(--flascam-blue-dark)]"
            >
              <ArrowLeft
                size={17}
                aria-hidden="true"
              />

              Retour à l’accueil
            </Link>

            <div className="mt-10 max-w-3xl">
              <p className="section-eyebrow">
                FLASCAM
              </p>

              <h1 className="section-title">
                {title}
              </h1>

              <p className="section-body">
                {description}
              </p>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </>
  );
}