import type {
  Metadata,
} from 'next';

import Link from 'next/link';

import {
  notFound,
} from 'next/navigation';

import {
  ArrowLeft,
  ArrowRight,
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
        className="h-full w-full object-contain"
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
images:
  association.coverImageUrl || association.logoUrl
    ? [
        {
          url:
            association.coverImageUrl ||
            association.logoUrl ||
            '',
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
<section
  className="relative min-h-[280px] overflow-hidden bg-gradient-to-br from-[#07355d] via-[#0a487b] to-[#0f5f9f] sm:min-h-[360px] lg:min-h-[430px]"
  style={
    association.coverImageUrl
      ? {
          backgroundImage: `url("${association.coverImageUrl}")`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
        }
      : undefined
  }
>
  {!association.coverImageUrl && (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
          backgroundSize: '22px 22px',
        }}
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-36 -top-48 h-[32rem] w-[32rem] rounded-full border border-white/10"
      />
    </>
  )}
</section>

<section className="border-b border-[#dbe5ef] bg-white">
  <div className="site-container py-8 sm:py-10">
    <nav className="flex flex-wrap items-center gap-2 text-sm font-medium text-[#536273]">
      <Link
        href="/"
        className="transition hover:text-[#0f5f9f]"
      >
        Accueil
      </Link>

      <span>/</span>

      <Link
        href="/associations"
        className="transition hover:text-[#0f5f9f]"
      >
        Associations
      </Link>

      <span>/</span>

      <span className="font-semibold text-[#07355d]">
        {association.name}
      </span>
    </nav>

    <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
        <div
          className={`
            grid
            h-28
            w-28
            shrink-0
            place-items-center
            overflow-hidden
            rounded-xl
            border
            border-[#dbe5ef]
            p-3
            shadow-[0_14px_35px_rgba(7,53,93,0.12)]
            sm:h-32
            sm:w-32
            ${
              association.logoUrl
                ? 'bg-white'
                : 'bg-[#07355d]'
            }
          `}
        >
          <AssociationLogo
            name={association.name}
            logoText={association.logoText}
            logoUrl={association.logoUrl}
          />
        </div>

        <div>
          <p className="flex items-center gap-3 text-xs font-extrabold uppercase tracking-[0.18em] text-[#c96f4a]">
            <span className="h-[3px] w-8 bg-[#c96f4a]" />
            Association régionale
          </p>

          <h1 className="mt-4 max-w-4xl text-4xl font-extrabold leading-[1.08] tracking-[-0.045em] text-[#101820] sm:text-5xl">
            {association.name}
          </h1>

          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-[#536273]">
            <span className="inline-flex items-center gap-2">
              <MapPin
                size={17}
                className="text-[#c96f4a]"
                aria-hidden="true"
              />

              {association.city
                ? `${association.city} · ${association.region}`
                : association.region}
            </span>

            {association.memberCount !== null &&
              association.memberCount !== undefined && (
                <span className="inline-flex items-center gap-2">
                  <UsersRound
                    size={17}
                    className="text-[#0f5f9f]"
                    aria-hidden="true"
                  />

                  {association.memberCount} loueurs membres
                </span>
              )}

            {association.affiliatedSinceYear && (
              <span className="inline-flex items-center gap-2">
                <CalendarDays
                  size={17}
                  className="text-[#0f5f9f]"
                  aria-hidden="true"
                />

                Affiliée depuis {association.affiliatedSinceYear}
              </span>
            )}
          </div>
        </div>
      </div>

      {association.email && (
        <a
          href={`mailto:${association.email}`}
          className="inline-flex min-h-12 items-center justify-center gap-3 rounded-md bg-[#c96f4a] px-6 text-sm font-extrabold text-white transition hover:bg-[#a95235] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#c96f4a]/25"
        >
          Contacter l’association

          <ArrowRight
            size={17}
            aria-hidden="true"
          />
        </a>
      )}
    </div>
  </div>
</section>

        <section className="relative overflow-hidden bg-[#f5f9fc] py-12 sm:py-16 lg:py-20">
          <div
            aria-hidden="true"
            className="absolute -left-40 top-20 h-80 w-80 rounded-full bg-[#0f5f9f]/[0.05] blur-3xl"
          />

          <div className="site-container relative grid gap-10 lg:grid-cols-[1fr_23rem] xl:grid-cols-[1fr_25rem]">
            <div className="space-y-14">
              <section>
                <div className="flex items-center gap-3">
                  <span className="h-[3px] w-10 bg-[#c96f4a]" />

                  <h2 className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#0f5f9f]">
                    Présentation
                  </h2>
                </div>

                <div className="mt-6 border-l-4 border-[#0f5f9f] bg-white p-6 sm:p-8">
                  <div className="space-y-5 text-base leading-8 text-[#536273]">
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
                </div>
              </section>

              <section>
                <div className="flex items-center justify-between gap-5 border-b border-[#dbe5ef] pb-5">
                  <div className="flex items-center gap-3">
                    <span className="h-[3px] w-10 bg-[#c96f4a]" />

                    <h2 className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#0f5f9f]">
                      Actualités de l’association
                    </h2>
                  </div>
                </div>

                {actualities.length === 0 ? (
                  <div className="mt-6 border border-dashed border-[#b9c9d8] bg-white p-6 text-sm leading-7 text-[#536273]">
                    Aucune actualité publiée pour le moment.
                  </div>
                ) : (
                  <div className="mt-6 grid gap-6 md:grid-cols-2">
                    {actualities.map((post) => (
                      <article
                        key={post.id}
                        className="group overflow-hidden border border-[#dbe5ef] bg-white transition duration-300 hover:-translate-y-1 hover:border-[#c96f4a]/50 hover:shadow-[0_22px_55px_rgba(7,53,93,0.1)]"
                      >
                        <div className="relative h-48 overflow-hidden bg-[#eaf5ff]">
                          {post.coverUrl ? (
                            <img
                              src={post.coverUrl}
                              alt={post.title}
                              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="grid h-full place-items-center text-sm font-bold text-[#0f5f9f]">
                              Actualité FLASCAM
                            </div>
                          )}

                          <div className="absolute bottom-0 left-0 h-1 w-20 bg-[#c96f4a] transition-all duration-300 group-hover:w-full" />
                        </div>

                        <div className="p-6">
                          <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#c96f4a]">
                            {formatDate(post.publishedAt || post.createdAt)}
                          </p>

                          <h3 className="mt-3 text-xl font-extrabold leading-tight text-[#07355d]">
                            {post.title}
                          </h3>

                          {post.excerpt && (
                            <p className="mt-3 text-sm leading-7 text-[#536273]">
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
                <div className="flex items-center gap-3 border-b border-[#dbe5ef] pb-5">
                  <span className="h-[3px] w-10 bg-[#c96f4a]" />

                  <h2 className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#0f5f9f]">
                    Galerie
                  </h2>
                </div>

                {photos.length === 0 ? (
                  <div className="mt-6 border border-dashed border-[#b9c9d8] bg-white p-6 text-sm leading-7 text-[#536273]">
                    Aucune photo publiée pour le moment.
                  </div>
                ) : (
                  <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
                    {photos.map((photo) => (
                      <figure
                        key={photo.id}
                        className="group relative overflow-hidden bg-[#eaf5ff]"
                      >
                        {photo.url && (
                          <img
                            src={photo.url}
                            alt={photo.title || 'Photo association'}
                            className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-105"
                          />
                        )}

                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#07355d]/55 via-transparent to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />

                        {photo.title && (
                          <figcaption className="absolute inset-x-0 bottom-0 translate-y-full p-4 text-sm font-bold text-white transition duration-300 group-hover:translate-y-0">
                            {photo.title}
                          </figcaption>
                        )}
                      </figure>
                    ))}
                  </div>
                )}
              </section>

              <section>
                <div className="flex items-center gap-3 border-b border-[#dbe5ef] pb-5">
                  <span className="h-[3px] w-10 bg-[#c96f4a]" />

                  <h2 className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#0f5f9f]">
                    Vidéos
                  </h2>
                </div>

                {videos.length === 0 ? (
                  <div className="mt-6 border border-dashed border-[#b9c9d8] bg-white p-6 text-sm leading-7 text-[#536273]">
                    Aucune vidéo publiée pour le moment.
                  </div>
                ) : (
                  <div className="mt-6 grid gap-6 md:grid-cols-2">
                    {videos.map((video) => (
                      <article
                        key={video.id}
                        className="overflow-hidden border border-[#dbe5ef] bg-white"
                      >
                        {video.url && (
                          <video
                            controls
                            className="aspect-video w-full bg-[#07355d]"
                            src={video.url}
                          />
                        )}

                        {(video.title || video.caption) && (
                          <div className="p-5">
                            {video.title && (
                              <h3 className="font-extrabold text-[#07355d]">
                                {video.title}
                              </h3>
                            )}

                            {video.caption && (
                              <p className="mt-2 text-sm leading-7 text-[#536273]">
                                {video.caption}
                              </p>
                            )}
                          </div>
                        )}
                      </article>
                    ))}
                  </div>
                )}
              </section>
            </div>

            <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
              <section className="border-t-4 border-[#c96f4a] bg-[#07355d] p-6 text-white sm:p-7">
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#f0a27f]">
                  Coordonnées
                </p>

                <div className="mt-5 divide-y divide-white/15 text-sm text-white/75">
                  {association.address && (
                    <p className="flex gap-3 py-4">
                      <MapPin
                        size={17}
                        className="shrink-0 text-[#f0a27f]"
                        aria-hidden="true"
                      />

                      {association.address}
                    </p>
                  )}

                  {association.phone && (
                    <a
                      href={`tel:${association.phone}`}
                      className="flex gap-3 py-4 transition hover:text-white"
                    >
                      <Phone
                        size={17}
                        className="shrink-0 text-[#f0a27f]"
                        aria-hidden="true"
                      />

                      {association.phone}
                    </a>
                  )}

                  {association.email && (
                    <a
                      href={`mailto:${association.email}`}
                      className="flex gap-3 py-4 transition hover:text-white"
                    >
                      <Mail
                        size={17}
                        className="shrink-0 text-[#f0a27f]"
                        aria-hidden="true"
                      />

                      {association.email}
                    </a>
                  )}

                  {website && (
                    <a
                      href={website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex gap-3 py-4 transition hover:text-white"
                    >
                      <Globe
                        size={17}
                        className="shrink-0 text-[#f0a27f]"
                        aria-hidden="true"
                      />

                      {association.websiteUrl}
                    </a>
                  )}
                </div>

                {socialLinks.length > 0 && (
                  <div className="mt-6 flex flex-wrap gap-2 border-t border-white/15 pt-5">
                    {socialLinks.map((item) => (
                      <a
                        key={item.label}
                        href={item.href || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 border border-white/20 px-3 py-2 text-xs font-bold text-white/75 transition hover:border-[#c96f4a] hover:bg-[#c96f4a] hover:text-white"
                      >
                        {item.label}

                        <ExternalLink
                          size={13}
                          aria-hidden="true"
                        />
                      </a>
                    ))}
                  </div>
                )}
              </section>

              <section className="border border-[#dbe5ef] bg-white p-6 sm:p-7">
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#0f5f9f]">
                  Agenda & événements
                </p>

                {events.length === 0 ? (
                  <p className="mt-5 text-sm leading-7 text-[#536273]">
                    Aucun événement à venir publié pour le moment.
                  </p>
                ) : (
                  <div className="mt-5 divide-y divide-[#dbe5ef]">
                    {events.map((event) => {
                      const date =
                        dayMonth(event.eventStartAt);

                      return (
                        <article
                          key={event.id}
                          className="grid grid-cols-[3.5rem_1fr] gap-4 py-5 first:pt-0 last:pb-0"
                        >
                          <div className="border-r border-[#dbe5ef] pr-4 text-center">
                            <p className="text-2xl font-black text-[#07355d]">
                              {date.day}
                            </p>

                            <p className="text-xs font-extrabold uppercase text-[#c96f4a]">
                              {date.month}
                            </p>
                          </div>

                          <div>
                            <h3 className="font-extrabold leading-snug text-[#07355d]">
                              {event.title}
                            </h3>

                            {event.eventLocation && (
                              <p className="mt-2 text-sm text-[#536273]">
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
                className="inline-flex items-center gap-2 text-sm font-extrabold text-[#0f5f9f] transition hover:text-[#07355d]"
              >
                <ArrowLeft
                  size={16}
                  aria-hidden="true"
                />

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