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
  CarFront,
  CheckCircle2,
  Clock3,
  Fuel,
  Gauge,
  LockKeyhole,
  MapPin,
  Settings2,
  ShieldCheck,
  Users,
} from 'lucide-react';

import {
  MarketplaceMediaGallery,
} from '@/components/site/marketplace-media-gallery';

import {
  PublicFooter,
} from '@/components/site/public-footer';

import {
  PublicHeader,
} from '@/components/site/public-header';

import {
  getPublicMarketplaceListingBySlug,
} from '@/lib/marketplace-api';

import {
  MARKETPLACE_FUEL_LABELS,
  MARKETPLACE_TRANSMISSION_LABELS,
  MARKETPLACE_VEHICLE_TYPE_LABELS,
} from '@/types/marketplace';

import {
  MarketplaceOfferPanel,
} from '@/components/site/marketplace-offer-panel';

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function formatPrice(
  value: number,
) {
  return new Intl.NumberFormat(
    'fr-MA',
    {
      style:
        'currency',

      currency:
        'MAD',

      maximumFractionDigits:
        0,
    },
  ).format(
    value,
  );
}

function formatNumber(
  value?: number | null,
) {
  if (
    value === null ||
    value === undefined
  ) {
    return '—';
  }

  return new Intl.NumberFormat(
    'fr-FR',
  ).format(
    value,
  );
}

function formatDate(
  value?: string | null,
) {
  if (!value) {
    return '—';
  }

  const date =
    new Date(
      value,
    );

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return '—';
  }

  return new Intl.DateTimeFormat(
    'fr-MA',
    {
      day:
        '2-digit',

      month:
        'long',

      year:
        'numeric',
    },
  ).format(
    date,
  );
}

type DetailItemProps = {
  label: string;
  value: string;
};

function DetailItem({
  label,
  value,
}: DetailItemProps) {
  return (
    <div
      className="
        rounded-2xl
        border
        border-slate-100
        bg-slate-50
        p-4
      "
    >
      <p
        className="
          text-xs
          font-bold
          uppercase
          tracking-[0.08em]
          text-slate-400
        "
      >
        {label}
      </p>

      <p
        className="
          mt-1
          text-sm
          font-black
          text-slate-800
        "
      >
        {value}
      </p>
    </div>
  );
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const {
    slug,
  } =
    await params;

  const listing =
    await getPublicMarketplaceListingBySlug(
      slug,
    );

  if (!listing) {
    return {
      title:
        'Véhicule introuvable',
    };
  }

  const title =
    listing.seo.title ||
    listing.title;

  const description =
    listing.seo.description ||
    listing.description ||
    `${listing.brand} ${listing.model} de ${listing.registrationYear}, disponible dans la marketplace FLASCAM.`;

  const cover =
    listing.media.find(
      (
        item,
      ) =>
        item.mediaKind ===
        'IMAGE',
    );

  return {
    title,
    description,

    alternates: {
      canonical:
        `/marketplace/${listing.slug}`,
    },

    openGraph: {
      title,
      description,

      type:
        'website',

      locale:
        'fr_MA',

      url:
        `/marketplace/${listing.slug}`,

      images:
        cover
          ? [
              {
                url:
                  cover.url,

                alt:
                  cover.altText ||
                  listing.title,
              },
            ]
          : undefined,
    },

    twitter: {
      card:
        cover
          ? 'summary_large_image'
          : 'summary',

      title,
      description,

      images:
        cover
          ? [
              cover.url,
            ]
          : undefined,
    },
  };
}

export default async function MarketplaceListingPage({
  params,
}: PageProps) {
  const {
    slug,
  } =
    await params;

  const listing =
    await getPublicMarketplaceListingBySlug(
      slug,
    );

  if (!listing) {
    notFound();
  }

  const structuredData = {
    '@context':
      'https://schema.org',

    '@type':
      'Vehicle',

    name:
      listing.title,

    description:
      listing.description ||
      listing.seo.description ||
      listing.title,

    url:
      `/marketplace/${listing.slug}`,

    image:
      listing.media
        .filter(
          (
            item,
          ) =>
            item.mediaKind ===
            'IMAGE',
        )
        .map(
          (
            item,
          ) =>
            item.url,
        ),

    brand: {
      '@type':
        'Brand',

      name:
        listing.brand,
    },

    model:
      listing.model,

    vehicleModelDate:
      String(
        listing.registrationYear,
      ),

    mileageFromOdometer: {
      '@type':
        'QuantitativeValue',

      value:
        listing.mileageKm,

      unitCode:
        'KMT',
    },

    fuelType:
      MARKETPLACE_FUEL_LABELS[
        listing.fuelType
      ],

    vehicleTransmission:
      MARKETPLACE_TRANSMISSION_LABELS[
        listing.transmission
      ],

    offers: {
      '@type':
        'Offer',

      price:
        listing.requestedPrice,

      priceCurrency:
        listing.currencyCode,

      availability:
        'https://schema.org/InStock',

      url:
        `/marketplace/${listing.slug}`,

      validThrough:
        listing.expiresAt,
    },
  };

  return (
    <>
      <PublicHeader />

      <main
        className="
          min-h-screen
          bg-slate-50
        "
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html:
              JSON.stringify(
                structuredData,
              ),
          }}
        />

        <section
          className="
            border-b
            border-slate-200
            bg-white
          "
        >
          <div
            className="
              site-container
              py-5
            "
          >
            <Link
              href="/marketplace"
              className="
                inline-flex
                items-center
                gap-2
                text-sm
                font-bold
                text-[var(--flascam-blue)]
                transition
                hover:opacity-70
              "
            >
              <ArrowLeft
                size={18}
              />

              Retour à la marketplace
            </Link>
          </div>
        </section>

        <section
          className="
            site-container
            py-8
            sm:py-12
          "
        >
          <div
            className="
              grid
              gap-8
              xl:grid-cols-[minmax(0,1fr)_390px]
            "
          >
            <div
              className="
                min-w-0
                space-y-7
              "
            >
              <MarketplaceMediaGallery
                title={
                  listing.title
                }
                media={
                  listing.media
                }
              />

              <section
                className="
                  rounded-[30px]
                  border
                  border-slate-200
                  bg-white
                  p-5
                  shadow-[0_18px_55px_rgba(7,53,93,0.06)]
                  sm:p-7
                "
              >
                <div
                  className="
                    flex
                    flex-wrap
                    items-center
                    gap-3
                  "
                >
                  <span
                    className="
                      rounded-full
                      bg-blue-50
                      px-3
                      py-1.5
                      text-xs
                      font-black
                      text-[var(--flascam-blue)]
                    "
                  >
                    {
                      MARKETPLACE_VEHICLE_TYPE_LABELS[
                        listing.vehicleType
                      ]
                    }
                  </span>

                  <span
                    className="
                      text-xs
                      font-bold
                      uppercase
                      tracking-[0.12em]
                      text-slate-400
                    "
                  >
                    {
                      listing.reference
                    }
                  </span>
                </div>

                <h1
                  className="
                    mt-4
                    text-3xl
                    font-black
                    leading-tight
                    tracking-tight
                    text-slate-950
                    sm:text-4xl
                  "
                >
                  {
                    listing.title
                  }
                </h1>

                <p
                  className="
                    mt-4
                    text-3xl
                    font-black
                    text-[var(--flascam-terracotta)]
                  "
                >
                  {formatPrice(
                    listing.requestedPrice,
                  )}
                </p>

                <div
                  className="
                    mt-6
                    grid
                    gap-3
                    sm:grid-cols-2
                    lg:grid-cols-4
                  "
                >
                  <DetailItem
                    label="Année"
                    value={
                      String(
                        listing.registrationYear,
                      )
                    }
                  />

                  <DetailItem
                    label="Kilométrage"
                    value={`${formatNumber(
                      listing.mileageKm,
                    )} km`}
                  />

                  <DetailItem
                    label="Énergie"
                    value={
                      MARKETPLACE_FUEL_LABELS[
                        listing.fuelType
                      ]
                    }
                  />

                  <DetailItem
                    label="Transmission"
                    value={
                      MARKETPLACE_TRANSMISSION_LABELS[
                        listing.transmission
                      ]
                    }
                  />
                </div>

                <div
                  className="
                    mt-7
                    border-t
                    border-slate-100
                    pt-7
                  "
                >
                  <h2
                    className="
                      text-xl
                      font-black
                      text-slate-950
                    "
                  >
                    L’histoire de ce véhicule
                  </h2>

                  <p
                    className="
                      mt-3
                      whitespace-pre-line
                      text-sm
                      leading-7
                      text-slate-700
                      sm:text-base
                    "
                  >
                    {listing.description ||
                      'Le vendeur n’a pas ajouté de description complémentaire.'}
                  </p>
                </div>
              </section>

              <section
                className="
                  rounded-[30px]
                  border
                  border-slate-200
                  bg-white
                  p-5
                  shadow-[0_18px_55px_rgba(7,53,93,0.06)]
                  sm:p-7
                "
              >
                <h2
                  className="
                    text-xl
                    font-black
                    text-slate-950
                  "
                >
                  Caractéristiques détaillées
                </h2>

                <div
                  className="
                    mt-6
                    grid
                    gap-3
                    sm:grid-cols-2
                    lg:grid-cols-3
                  "
                >
                  <DetailItem
                    label="Marque"
                    value={
                      listing.brand
                    }
                  />

                  <DetailItem
                    label="Modèle"
                    value={
                      listing.model
                    }
                  />

                  <DetailItem
                    label="Version"
                    value={
                      listing.version ||
                      '—'
                    }
                  />

                  <DetailItem
                    label="Première circulation"
                    value={
                      formatDate(
                        listing.firstRegistrationDate,
                      )
                    }
                  />

                  <DetailItem
                    label="Carrosserie"
                    value={
                      listing.bodyType ||
                      '—'
                    }
                  />

                  <DetailItem
                    label="Puissance fiscale"
                    value={
                      listing.fiscalPower
                        ? `${listing.fiscalPower} CV`
                        : '—'
                    }
                  />

                  <DetailItem
                    label="Puissance moteur"
                    value={
                      listing.enginePowerHp
                        ? `${listing.enginePowerHp} ch`
                        : '—'
                    }
                  />

                  <DetailItem
                    label="Cylindrée"
                    value={
                      listing.engineCapacityCc
                        ? `${formatNumber(
                            listing.engineCapacityCc,
                          )} cm³`
                        : '—'
                    }
                  />

                  <DetailItem
                    label="Couleur extérieure"
                    value={
                      listing.exteriorColor ||
                      '—'
                    }
                  />

                  <DetailItem
                    label="Couleur intérieure"
                    value={
                      listing.interiorColor ||
                      '—'
                    }
                  />

                  <DetailItem
                    label="Portes"
                    value={
                      formatNumber(
                        listing.doorsCount,
                      )
                    }
                  />

                  <DetailItem
                    label="Places"
                    value={
                      formatNumber(
                        listing.seatsCount,
                      )
                    }
                  />
                </div>
              </section>
            </div>

            <aside
              className="
                space-y-5
                xl:sticky
                xl:top-6
                xl:self-start
              "
            >
<MarketplaceOfferPanel
  listingId={
    listing.id
  }
  listingSlug={
    listing.slug
  }
  listingTitle={
    listing.title
  }
  requestedPrice={
    listing.requestedPrice
  }
  remainingDays={
    listing.remainingDays
  }
/>

              <section
                className="
                  rounded-[30px]
                  border
                  border-slate-200
                  bg-white
                  p-5
                "
              >
                <h2
                  className="
                    font-black
                    text-slate-950
                  "
                >
                  Une transaction confidentielle
                </h2>

                <div
                  className="
                    mt-5
                    space-y-4
                  "
                >
                  <div
                    className="
                      flex
                      items-start
                      gap-3
                    "
                  >
                    <ShieldCheck
                      size={20}
                      className="
                        mt-0.5
                        shrink-0
                        text-emerald-600
                      "
                    />

                    <p
                      className="
                        text-sm
                        leading-6
                        text-slate-600
                      "
                    >
                      L’annonce a été examinée avant sa publication par
                      la FLASCAM.
                    </p>
                  </div>

                  <div
                    className="
                      flex
                      items-start
                      gap-3
                    "
                  >
                    <Users
                      size={20}
                      className="
                        mt-0.5
                        shrink-0
                        text-[var(--flascam-blue)]
                      "
                    />

                    <p
                      className="
                        text-sm
                        leading-6
                        text-slate-600
                      "
                    >
                      L’identité du vendeur et celle de l’acheteur ne
                      sont révélées qu’après acceptation.
                    </p>
                  </div>
                </div>
              </section>

              {listing.registrationCity && (
                <section
                  className="
                    rounded-[30px]
                    border
                    border-slate-200
                    bg-white
                    p-5
                  "
                >
                  <div
                    className="
                      flex
                      items-start
                      gap-3
                    "
                  >
                    <MapPin
                      size={21}
                      className="
                        mt-0.5
                        shrink-0
                        text-[var(--flascam-terracotta)]
                      "
                    />

                    <div>
                      <p
                        className="
                          text-xs
                          font-bold
                          uppercase
                          tracking-wide
                          text-slate-400
                        "
                      >
                        Immatriculation
                      </p>

                      <p
                        className="
                          mt-1
                          font-black
                          text-slate-800
                        "
                      >
                        {
                          listing.registrationCity
                        }
                      </p>
                    </div>
                  </div>
                </section>
              )}
            </aside>
          </div>
        </section>
      </main>

      <PublicFooter />
    </>
  );
}