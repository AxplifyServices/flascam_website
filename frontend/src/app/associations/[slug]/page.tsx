import type {
  Metadata,
} from 'next';

import Link from 'next/link';

import {
  notFound,
} from 'next/navigation';

import {
  ArrowLeft,
  CalendarDays,
  ExternalLink,
  Globe,
  Mail,
  MapPin,
  Phone,
  UsersRound,
} from 'lucide-react';

import {
  PublicFooter,
} from '@/components/site/public-footer';

import {
  PublicHeader,
} from '@/components/site/public-header';

import {
  getPublicAssociationBySlug,
} from '@/lib/associations-api';

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function formatDate(
  value?: string | null,
) {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat(
    'fr-MA',
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    },
  )
    .format(new Date(value))
    .replace('.', '')
    .toUpperCase();
}

function dayMonth(
  value?: string | null,
) {
  if (!value) {
    return {
      day: '',
      month: '',
    };
  }

  const date = new Date(value);

  return {
    day: new Intl.DateTimeFormat(
      'fr-MA',
      {
        day: '2-digit',
      },
    ).format(date),
    month: new Intl.DateTimeFormat(
      'fr-MA',
      {
        month: 'short',
      },
    )
      .format(date)
      .replace('.', '')
      .toUpperCase(),
  };
}

function normalizeUrl(
  value?: string | null,
) {
  if (!value) {
    return null;
  }

  if (
    value.startsWith('http://') ||
    value.startsWith('https://')
  ) {
    return value;
  }

  return `https://${value}`;
}

function AssociationLogo({
  name,
  logoText,
  logoUrl,
}: {
  name: string;
  logoText?: string | null;
  logoUrl?: string | null;
}) {
  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt={`Logo ${name}`}
        className="h-full w-full object-cover"
      />
    );
  }

  return (
    <span className="text-2xl font-black text-white">
      {logoText || name.slice(0, 2).toUpperCase()}
    </span>
  );
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const {
    slug,
  } = await params;

  const association =
    await getPublicAssociationBySlug(slug);

  if (!association) {
    return {
      title: 'Association introuvable',
    };
  }

  const title =
    association.seoTitle ||
    association.name;

  const description =
    association.seoDescription ||
    association.presentation ||
    `Page officielle de ${association.name}, association régionale affiliée à FLASCAM.`;

  return {
    title,
    description,
    alternates: {
      canonical: `/associations/${association.slug}`,
    },
    openGraph: {
      title,
      description,
      type: 'article',
      locale: 'fr_MA',
      images: association.logoUrl
        ? [
            {
              url: association.logoUrl,
              alt: association.name,
            },
          ]
        : undefined,
    },
  };
}

export default async function AssociationDetailPage({
  params,
}: PageProps) {
  const {
    slug,
  } = await params;

  const association =
    await getPublicAssociationBySlug(slug);

  if (!association) {
    notFound();
  }

  const website =
    normalizeUrl(association.websiteUrl);

const actualities =
  association.actualities ?? [];

const events =
  association.events ?? [];

const photos =
  association.photos ?? [];

const videos =
  association.videos ?? [];    

  const socialLinks = [
    {
      label: 'Facebook',
      href: normalizeUrl(
        association.facebookUrl,
      ),
    },
    {
      label: 'Instagram',
      href: normalizeUrl(
        association.instagramUrl,
      ),
    },
    {
      label: 'LinkedIn',
      href: normalizeUrl(
        association.linkedinUrl,
      ),
    },
    {
      label: 'YouTube',
      href: normalizeUrl(
        association.youtubeUrl,
      ),
    },
  ].filter((item) => item.href);

  return (
    <>
      <PublicHeader />

      <main>
        <section className="bg-white py-8 sm:py-12">
          <div className="site-container">
            <nav className="flex flex-wrap items-center gap-2 text-sm font-medium text-[var(--flascam-slate)]">
              <Link
                href="/"
                className="hover:text-[var(--flascam-blue)]"
              >
                Accueil
              </Link>
              <span>/</span>
              <Link
                href="/associations"
                className="hover:text-[var(--flascam-blue)]"
              >
                Associations
              </Link>
              <span>/</span>
              <span className="text-[var(--flascam-black)]">
                {association.name}
              </span>
            </nav>

            <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                <div className="grid size-24 shrink-0 place-items-center overflow-hidden rounded-[1.5rem] bg-[var(--flascam-blue-dark)] sm:size-30">
                  <AssociationLogo
                    name={association.name}
                    logoText={association.logoText}
                    logoUrl={association.logoUrl}
                  />
                </div>

                <div>
                  <p className="inline-flex rounded-full bg-emerald-50 px-4 py-2 text-xs font-extrabold text-emerald-700">
                    • Page publiée
                  </p>

                  <h1 className="mt-4 max-w-4xl text-3xl font-extrabold leading-tight tracking-[-0.04em] text-[var(--flascam-black)] sm:text-4xl">
                    {association.name}
                  </h1>

                  <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium text-[var(--flascam-slate)]">
                    <span className="inline-flex items-center gap-2">
                      <MapPin size={16} className="text-[var(--flascam-blue)]" />
                      {association.city
                        ? `${association.city} · ${association.region}`
                        : association.region}
                    </span>

                    {association.memberCount !== null &&
                      association.memberCount !== undefined && (
                        <span className="inline-flex items-center gap-2">
                          <UsersRound size={16} className="text-[var(--flascam-blue)]" />
                          {association.memberCount} loueurs membres
                        </span>
                      )}

                    {association.affiliatedSinceYear && (
                      <span className="inline-flex items-center gap-2">
                        <CalendarDays size={16} className="text-[var(--flascam-blue)]" />
                        Affiliée depuis {association.affiliatedSinceYear}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {association.email && (
                <a
                  href={`mailto:${association.email}`}
                  className="inline-flex h-12 items-center justify-center rounded-xl bg-[var(--flascam-blue)] px-6 text-sm font-extrabold !text-white shadow-[0_18px_45px_rgba(15,95,159,0.22)] transition hover:bg-[var(--flascam-blue-dark)]"
                >
                  Contacter l’association
                </a>
              )}
            </div>
          </div>
        </section>

        <section className="border-t border-[var(--flascam-border)] bg-[var(--ivory)] py-12 sm:py-16">
          <div className="site-container grid gap-8 lg:grid-cols-[1fr_25rem]">
            <div className="space-y-12">
              <section>
                <p className="section-eyebrow">
                  Présentation
                </p>

                <div className="mt-4 h-px bg-[var(--flascam-border)]" />

                <div className="mt-6 space-y-5 text-base leading-8 text-[var(--flascam-slate)]">
                  {association.presentation ? (
                    association.presentation
                      .split('\n')
                      .filter(Boolean)
                      .map((paragraph) => (
                        <p key={paragraph}>
                          {paragraph}
                        </p>
                      ))
                  ) : (
                    <p>
                      La présentation de cette association sera bientôt disponible.
                    </p>
                  )}
                </div>
              </section>

              <section>
                <p className="section-eyebrow">
                  Actualités de l’association
                </p>

                <div className="mt-4 h-px bg-[var(--flascam-border)]" />

                {actualities.length === 0 ? (
                  <p className="mt-6 text-sm text-[var(--flascam-slate)]">
                    Aucune actualité publiée pour le moment.
                  </p>
                ) : (
                  <div className="mt-6 grid gap-5 md:grid-cols-2">
                    {actualities.map((post) => (
                      <article
                        key={post.id}
                        className="overflow-hidden rounded-[1.4rem] border border-[var(--flascam-border)] bg-white shadow-sm"
                      >
                        <div className="h-44 bg-slate-200">
                          {post.coverUrl && (
                            <img
                              src={post.coverUrl}
                              alt={post.title}
                              className="h-full w-full object-cover"
                            />
                          )}
                        </div>

                        <div className="p-5">
                          <p className="text-xs font-extrabold uppercase tracking-wide text-[var(--flascam-slate)]">
                            {formatDate(post.publishedAt || post.createdAt)}
                          </p>

                          <h2 className="mt-3 text-lg font-extrabold leading-tight text-[var(--flascam-black)]">
                            {post.title}
                          </h2>

                          {post.excerpt && (
                            <p className="mt-3 text-sm leading-6 text-[var(--flascam-slate)]">
                              {post.excerpt}
                            </p>
                          )}
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>

              <section>
                <p className="section-eyebrow">
                  Galerie
                </p>

                <div className="mt-4 h-px bg-[var(--flascam-border)]" />

                {photos.length === 0 ? (
                  <p className="mt-6 text-sm text-[var(--flascam-slate)]">
                    Aucune photo publiée pour le moment.
                  </p>
                ) : (
                  <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {photos.map((photo) => (
                      <figure
                        key={photo.id}
                        className="overflow-hidden rounded-2xl bg-slate-200"
                      >
                        {photo.url && (
                          <img
                            src={photo.url}
                            alt={photo.title || 'Photo association'}
                            className="aspect-[4/3] w-full object-cover"
                          />
                        )}
                      </figure>
                    ))}
                  </div>
                )}
              </section>

              <section>
                <p className="section-eyebrow">
                  Vidéos
                </p>

                <div className="mt-4 h-px bg-[var(--flascam-border)]" />

                {videos.length === 0 ? (
                  <p className="mt-6 text-sm text-[var(--flascam-slate)]">
                    Aucune vidéo publiée pour le moment.
                  </p>
                ) : (
                  <div className="mt-6 grid gap-5 md:grid-cols-2">
                    {videos.map((video) => (
                      <div
                        key={video.id}
                        className="overflow-hidden rounded-[1.4rem] border border-[var(--flascam-border)] bg-white shadow-sm"
                      >
                        {video.url && (
                          <video
                            controls
                            className="aspect-video w-full bg-[var(--flascam-blue-dark)]"
                            src={video.url}
                          />
                        )}

                        {(video.title || video.caption) && (
                          <div className="p-4">
                            {video.title && (
                              <h2 className="font-extrabold text-[var(--flascam-black)]">
                                {video.title}
                              </h2>
                            )}

                            {video.caption && (
                              <p className="mt-2 text-sm leading-6 text-[var(--flascam-slate)]">
                                {video.caption}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>

            <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
              <section className="rounded-[1.5rem] border border-[var(--flascam-border)] bg-white p-6 shadow-sm">
                <h2 className="text-lg font-extrabold text-[var(--flascam-black)]">
                  Coordonnées
                </h2>

                <div className="mt-6 divide-y divide-[var(--flascam-border)] text-sm text-[var(--flascam-slate)]">
                  {association.address && (
                    <p className="flex gap-3 py-4">
                      <MapPin size={17} className="shrink-0 text-[var(--flascam-blue)]" />
                      {association.address}
                    </p>
                  )}

                  {association.phone && (
                    <a
                      href={`tel:${association.phone}`}
                      className="flex gap-3 py-4 hover:text-[var(--flascam-blue)]"
                    >
                      <Phone size={17} className="shrink-0 text-[var(--flascam-blue)]" />
                      {association.phone}
                    </a>
                  )}

                  {association.email && (
                    <a
                      href={`mailto:${association.email}`}
                      className="flex gap-3 py-4 hover:text-[var(--flascam-blue)]"
                    >
                      <Mail size={17} className="shrink-0 text-[var(--flascam-blue)]" />
                      {association.email}
                    </a>
                  )}

                  {website && (
                    <a
                      href={website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex gap-3 py-4 hover:text-[var(--flascam-blue)]"
                    >
                      <Globe size={17} className="shrink-0 text-[var(--flascam-blue)]" />
                      {association.websiteUrl}
                    </a>
                  )}
                </div>

                {socialLinks.length > 0 && (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {socialLinks.map((item) => (
                      <a
                        key={item.label}
                        href={item.href || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-full border border-[var(--flascam-border)] px-3 py-2 text-xs font-bold text-[var(--flascam-slate)] hover:border-[var(--flascam-blue)] hover:text-[var(--flascam-blue)]"
                      >
                        {item.label}
                        <ExternalLink size={13} />
                      </a>
                    ))}
                  </div>
                )}
              </section>

              <section className="rounded-[1.5rem] border border-[var(--flascam-border)] bg-white p-6 shadow-sm">
                <h2 className="text-lg font-extrabold text-[var(--flascam-black)]">
                  Agenda & événements
                </h2>

                {events.length === 0 ? (
                  <p className="mt-4 text-sm leading-6 text-[var(--flascam-slate)]">
                    Aucun événement à venir publié pour le moment.
                  </p>
                ) : (
                  <div className="mt-5 space-y-4">
                    {events.map((event) => {
                      const date =
                        dayMonth(event.eventStartAt);

                      return (
                        <article
                          key={event.id}
                          className="grid grid-cols-[4rem_1fr] gap-4 rounded-2xl border border-[var(--flascam-border)] p-4"
                        >
                          <div className="text-center">
                            <p className="text-2xl font-black text-[var(--flascam-black)]">
                              {date.day}
                            </p>

                            <p className="text-xs font-extrabold uppercase text-[var(--flascam-blue)]">
                              {date.month}
                            </p>
                          </div>

                          <div>
                            <h3 className="font-extrabold leading-snug text-[var(--flascam-black)]">
                              {event.title}
                            </h3>

                            {event.eventLocation && (
                              <p className="mt-2 text-sm text-[var(--flascam-slate)]">
                                {event.eventLocation}
                              </p>
                            )}
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </section>

              <Link
                href="/associations"
                className="inline-flex items-center gap-2 text-sm font-bold text-[var(--flascam-blue)] hover:text-[var(--flascam-blue-dark)]"
              >
                <ArrowLeft size={16} />
                Retour aux associations
              </Link>
            </aside>
          </div>
        </section>
      </main>

      <PublicFooter />
    </>
  );
}