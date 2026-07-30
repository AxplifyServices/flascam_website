import type {
  Metadata,
} from 'next';

import Link from 'next/link';

import {
  CarFront,
  Filter,
  Search,
  ShieldCheck,
} from 'lucide-react';

import {
  MarketplaceListingCard,
} from '@/components/site/marketplace-listing-card';

import {
  PublicFooter,
} from '@/components/site/public-footer';

import {
  PublicHeader,
} from '@/components/site/public-header';

import {
  getPublicMarketplaceListings,
} from '@/lib/marketplace-api';

import type {
  MarketplaceFuelType,
  MarketplaceTransmission,
  MarketplaceVehicleType,
  PublicMarketplaceSort,
} from '@/types/marketplace';

import {
  MARKETPLACE_FUEL_LABELS,
  MARKETPLACE_TRANSMISSION_LABELS,
  MARKETPLACE_VEHICLE_TYPE_LABELS,
} from '@/types/marketplace';

export const metadata: Metadata = {
  title:
    'Marketplace automobile',

  description:
    'Découvrez une sélection de véhicules proposés par l’écosystème FLASCAM. Consultez les caractéristiques, comparez les prix et déposez une offre en toute confidentialité.',

  alternates: {
    canonical:
      '/marketplace',
  },

  openGraph: {
    title:
      'Marketplace automobile FLASCAM',

    description:
      'Des véhicules sélectionnés, des annonces validées et des négociations confidentielles.',

    type:
      'website',

    locale:
      'fr_MA',

    url:
      '/marketplace',
  },
};

type PageProps = {
  searchParams: Promise<{
    page?: string;
    search?: string;

    vehicleType?: string;

    brand?: string;
    model?: string;

    fuelType?: string;
    transmission?: string;

    minimumYear?: string;
    maximumYear?: string;

    minimumPrice?: string;
    maximumPrice?: string;

    maximumMileageKm?: string;

    sort?: string;
  }>;
};

const SORT_OPTIONS: Array<{
  value:
    PublicMarketplaceSort;

  label: string;
}> = [
  {
    value:
      'RECENT',

    label:
      'Plus récentes',
  },
  {
    value:
      'PRICE_ASC',

    label:
      'Prix croissant',
  },
  {
    value:
      'PRICE_DESC',

    label:
      'Prix décroissant',
  },
  {
    value:
      'YEAR_DESC',

    label:
      'Année la plus récente',
  },
  {
    value:
      'MILEAGE_ASC',

    label:
      'Kilométrage le plus faible',
  },
];

function readPositiveInteger(
  value?: string,
) {
  if (!value) {
    return undefined;
  }

  const number =
    Number(
      value,
    );

  if (
    !Number.isInteger(
      number,
    ) ||
    number <
      0
  ) {
    return undefined;
  }

  return number;
}

function readPage(
  value?: string,
) {
  const page =
    readPositiveInteger(
      value,
    );

  return page &&
    page >
      0
    ? page
    : 1;
}

function readVehicleType(
  value?: string,
): MarketplaceVehicleType | '' {
  if (
    value ===
      'CAR' ||
    value ===
      'UTILITY' ||
    value ===
      'TRUCK' ||
    value ===
      'MINIBUS' ||
    value ===
      'OTHER'
  ) {
    return value;
  }

  return '';
}

function readFuelType(
  value?: string,
): MarketplaceFuelType | '' {
  if (
    value ===
      'DIESEL' ||
    value ===
      'PETROL' ||
    value ===
      'HYBRID' ||
    value ===
      'PLUG_IN_HYBRID' ||
    value ===
      'ELECTRIC' ||
    value ===
      'LPG' ||
    value ===
      'OTHER'
  ) {
    return value;
  }

  return '';
}

function readTransmission(
  value?: string,
): MarketplaceTransmission | '' {
  if (
    value ===
      'MANUAL' ||
    value ===
      'AUTOMATIC' ||
    value ===
      'SEMI_AUTOMATIC'
  ) {
    return value;
  }

  return '';
}

function readSort(
  value?: string,
): PublicMarketplaceSort {
  if (
    value ===
      'PRICE_ASC' ||
    value ===
      'PRICE_DESC' ||
    value ===
      'YEAR_DESC' ||
    value ===
      'MILEAGE_ASC'
  ) {
    return value;
  }

  return 'RECENT';
}

function buildPageUrl(
  values: {
    search: string;

    vehicleType:
      MarketplaceVehicleType | '';

    brand: string;
    model: string;

    fuelType:
      MarketplaceFuelType | '';

    transmission:
      MarketplaceTransmission | '';

    minimumYear?: number;
    maximumYear?: number;

    minimumPrice?: number;
    maximumPrice?: number;

    maximumMileageKm?: number;

    sort:
      PublicMarketplaceSort;
  },

  page: number,
) {
  const params =
    new URLSearchParams();

  if (
    values.search
  ) {
    params.set(
      'search',
      values.search,
    );
  }

  if (
    values.vehicleType
  ) {
    params.set(
      'vehicleType',
      values.vehicleType,
    );
  }

  if (
    values.brand
  ) {
    params.set(
      'brand',
      values.brand,
    );
  }

  if (
    values.model
  ) {
    params.set(
      'model',
      values.model,
    );
  }

  if (
    values.fuelType
  ) {
    params.set(
      'fuelType',
      values.fuelType,
    );
  }

  if (
    values.transmission
  ) {
    params.set(
      'transmission',
      values.transmission,
    );
  }

  if (
    values.minimumYear !==
    undefined
  ) {
    params.set(
      'minimumYear',
      String(
        values.minimumYear,
      ),
    );
  }

  if (
    values.maximumYear !==
    undefined
  ) {
    params.set(
      'maximumYear',
      String(
        values.maximumYear,
      ),
    );
  }

  if (
    values.minimumPrice !==
    undefined
  ) {
    params.set(
      'minimumPrice',
      String(
        values.minimumPrice,
      ),
    );
  }

  if (
    values.maximumPrice !==
    undefined
  ) {
    params.set(
      'maximumPrice',
      String(
        values.maximumPrice,
      ),
    );
  }

  if (
    values.maximumMileageKm !==
    undefined
  ) {
    params.set(
      'maximumMileageKm',
      String(
        values.maximumMileageKm,
      ),
    );
  }

  if (
    values.sort !==
    'RECENT'
  ) {
    params.set(
      'sort',
      values.sort,
    );
  }

  if (
    page >
    1
  ) {
    params.set(
      'page',
      String(
        page,
      ),
    );
  }

  const query =
    params.toString();

  return query
    ? `/marketplace?${query}`
    : '/marketplace';
}

export default async function MarketplacePage({
  searchParams,
}: PageProps) {
  const params =
    await searchParams;

  const page =
    readPage(
      params.page,
    );

  const values = {
    search:
      params.search?.trim() ??
      '',

    vehicleType:
      readVehicleType(
        params.vehicleType,
      ),

    brand:
      params.brand?.trim() ??
      '',

    model:
      params.model?.trim() ??
      '',

    fuelType:
      readFuelType(
        params.fuelType,
      ),

    transmission:
      readTransmission(
        params.transmission,
      ),

    minimumYear:
      readPositiveInteger(
        params.minimumYear,
      ),

    maximumYear:
      readPositiveInteger(
        params.maximumYear,
      ),

    minimumPrice:
      readPositiveInteger(
        params.minimumPrice,
      ),

    maximumPrice:
      readPositiveInteger(
        params.maximumPrice,
      ),

    maximumMileageKm:
      readPositiveInteger(
        params.maximumMileageKm,
      ),

    sort:
      readSort(
        params.sort,
      ),
  };

  const response =
    await getPublicMarketplaceListings({
      page,

      limit:
        12,

      ...values,
    });

  return (
    <>
      <PublicHeader />

      <main
        className="
          min-h-screen
          bg-slate-50
        "
      >
        <section
          className="
            relative
            overflow-hidden
            bg-gradient-to-br
            from-[#07355d]
            via-[#0a487b]
            to-[#0f5f9f]
            py-14
            text-white
            sm:py-20
          "
        >
          <div
            className="
              pointer-events-none
              absolute
              -right-24
              -top-24
              size-80
              rounded-full
              bg-white/10
              blur-3xl
            "
          />

          <div
            className="
              site-container
              relative
            "
          >
            <div
              className="
                max-w-4xl
              "
            >
              <span
                className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  border
                  border-white/20
                  bg-white/10
                  px-4
                  py-2
                  text-xs
                  font-black
                  uppercase
                  tracking-[0.14em]
                  backdrop-blur
                "
              >
                <ShieldCheck
                  size={16}
                />

                Annonces validées par la FLASCAM
              </span>

              <h1
                className="
                  mt-6
                  text-4xl
                  font-black
                  leading-tight
                  tracking-tight
                  sm:text-5xl
                  lg:text-6xl
                "
              >
                Le bon véhicule peut ouvrir la voie à votre prochain
                projet.
              </h1>

              <p
                className="
                  mt-5
                  max-w-3xl
                  text-base
                  leading-7
                  text-white/80
                  sm:text-lg
                "
              >
                Explorez des véhicules proposés par l’écosystème
                FLASCAM. Comparez les caractéristiques, découvrez leur
                histoire et transmettez votre offre sans exposer
                l’identité du vendeur.
              </p>
            </div>
          </div>
        </section>

        <section
          className="
            site-container
            py-8
            sm:py-12
          "
        >
          <form
            method="get"
            className="
              rounded-[30px]
              border
              border-slate-200
              bg-white
              p-4
              shadow-[0_20px_65px_rgba(7,53,93,0.07)]
              sm:p-6
            "
          >
            <div
              className="
                flex
                items-center
                gap-3
              "
            >
              <Filter
                size={21}
                className="
                  text-[var(--flascam-blue)]
                "
              />

              <div>
                <h2
                  className="
                    font-black
                    text-slate-950
                  "
                >
                  Trouver un véhicule
                </h2>

                <p
                  className="
                    text-sm
                    text-slate-500
                  "
                >
                  Affinez la sélection selon vos besoins et votre
                  budget.
                </p>
              </div>
            </div>

            <div
              className="
                mt-5
                grid
                gap-3
                md:grid-cols-2
                xl:grid-cols-4
              "
            >
              <label
                className="
                  relative
                  md:col-span-2
                "
              >
                <span className="sr-only">
                  Rechercher
                </span>

                <Search
                  size={18}
                  className="
                    pointer-events-none
                    absolute
                    left-4
                    top-1/2
                    -translate-y-1/2
                    text-slate-400
                  "
                />

                <input
                  name="search"
                  defaultValue={
                    values.search
                  }
                  placeholder="Marque, modèle, carrosserie…"
                  className="
                    h-12
                    w-full
                    rounded-2xl
                    border
                    border-slate-200
                    bg-slate-50
                    pl-11
                    pr-4
                    text-sm
                    outline-none
                    transition
                    focus:border-[var(--flascam-blue)]
                    focus:bg-white
                    focus:ring-4
                    focus:ring-blue-100
                  "
                />
              </label>

              <select
                name="vehicleType"
                defaultValue={
                  values.vehicleType
                }
                className="
                  h-12
                  rounded-2xl
                  border
                  border-slate-200
                  bg-slate-50
                  px-4
                  text-sm
                  font-semibold
                  text-slate-700
                  outline-none
                "
              >
                <option value="">
                  Tous les véhicules
                </option>

                {(
                  Object.entries(
                    MARKETPLACE_VEHICLE_TYPE_LABELS,
                  ) as Array<
                    [
                      MarketplaceVehicleType,
                      string,
                    ]
                  >
                ).map(
                  (
                    [
                      value,
                      label,
                    ],
                  ) => (
                    <option
                      key={
                        value
                      }
                      value={
                        value
                      }
                    >
                      {
                        label
                      }
                    </option>
                  ),
                )}
              </select>

              <select
                name="sort"
                defaultValue={
                  values.sort
                }
                className="
                  h-12
                  rounded-2xl
                  border
                  border-slate-200
                  bg-slate-50
                  px-4
                  text-sm
                  font-semibold
                  text-slate-700
                  outline-none
                "
              >
                {SORT_OPTIONS.map(
                  (
                    option,
                  ) => (
                    <option
                      key={
                        option.value
                      }
                      value={
                        option.value
                      }
                    >
                      {
                        option.label
                      }
                    </option>
                  ),
                )}
              </select>

              <input
                name="brand"
                defaultValue={
                  values.brand
                }
                placeholder="Marque"
                className="
                  h-12
                  rounded-2xl
                  border
                  border-slate-200
                  bg-slate-50
                  px-4
                  text-sm
                  outline-none
                "
              />

              <input
                name="model"
                defaultValue={
                  values.model
                }
                placeholder="Modèle"
                className="
                  h-12
                  rounded-2xl
                  border
                  border-slate-200
                  bg-slate-50
                  px-4
                  text-sm
                  outline-none
                "
              />

              <select
                name="fuelType"
                defaultValue={
                  values.fuelType
                }
                className="
                  h-12
                  rounded-2xl
                  border
                  border-slate-200
                  bg-slate-50
                  px-4
                  text-sm
                  font-semibold
                  text-slate-700
                  outline-none
                "
              >
                <option value="">
                  Toutes les énergies
                </option>

                {(
                  Object.entries(
                    MARKETPLACE_FUEL_LABELS,
                  ) as Array<
                    [
                      MarketplaceFuelType,
                      string,
                    ]
                  >
                ).map(
                  (
                    [
                      value,
                      label,
                    ],
                  ) => (
                    <option
                      key={
                        value
                      }
                      value={
                        value
                      }
                    >
                      {
                        label
                      }
                    </option>
                  ),
                )}
              </select>

              <select
                name="transmission"
                defaultValue={
                  values.transmission
                }
                className="
                  h-12
                  rounded-2xl
                  border
                  border-slate-200
                  bg-slate-50
                  px-4
                  text-sm
                  font-semibold
                  text-slate-700
                  outline-none
                "
              >
                <option value="">
                  Toutes les transmissions
                </option>

                {(
                  Object.entries(
                    MARKETPLACE_TRANSMISSION_LABELS,
                  ) as Array<
                    [
                      MarketplaceTransmission,
                      string,
                    ]
                  >
                ).map(
                  (
                    [
                      value,
                      label,
                    ],
                  ) => (
                    <option
                      key={
                        value
                      }
                      value={
                        value
                      }
                    >
                      {
                        label
                      }
                    </option>
                  ),
                )}
              </select>

              <input
                type="number"
                name="minimumPrice"
                min="0"
                defaultValue={
                  values.minimumPrice
                }
                placeholder="Prix minimum"
                className="
                  h-12
                  rounded-2xl
                  border
                  border-slate-200
                  bg-slate-50
                  px-4
                  text-sm
                  outline-none
                "
              />

              <input
                type="number"
                name="maximumPrice"
                min="0"
                defaultValue={
                  values.maximumPrice
                }
                placeholder="Prix maximum"
                className="
                  h-12
                  rounded-2xl
                  border
                  border-slate-200
                  bg-slate-50
                  px-4
                  text-sm
                  outline-none
                "
              />

              <input
                type="number"
                name="minimumYear"
                min="1900"
                defaultValue={
                  values.minimumYear
                }
                placeholder="Année minimum"
                className="
                  h-12
                  rounded-2xl
                  border
                  border-slate-200
                  bg-slate-50
                  px-4
                  text-sm
                  outline-none
                "
              />

              <input
                type="number"
                name="maximumMileageKm"
                min="0"
                defaultValue={
                  values.maximumMileageKm
                }
                placeholder="Kilométrage maximum"
                className="
                  h-12
                  rounded-2xl
                  border
                  border-slate-200
                  bg-slate-50
                  px-4
                  text-sm
                  outline-none
                "
              />
            </div>

            <div
              className="
                mt-4
                flex
                flex-col
                gap-3
                sm:flex-row
                sm:justify-end
              "
            >
              <Link
                href="/marketplace"
                className="
                  inline-flex
                  min-h-11
                  items-center
                  justify-center
                  rounded-2xl
                  border
                  border-slate-200
                  bg-white
                  px-5
                  text-sm
                  font-bold
                  text-slate-700
                  transition
                  hover:bg-slate-50
                "
              >
                Réinitialiser
              </Link>

              <button
                type="submit"
                className="
                  inline-flex
                  min-h-11
                  items-center
                  justify-center
                  gap-2
                  rounded-2xl
                  bg-[var(--flascam-terracotta)]
                  px-6
                  text-sm
                  font-black
                  text-white
                  transition
                  hover:brightness-95
                "
              >
                <Search
                  size={18}
                />

                Afficher les véhicules
              </button>
            </div>
          </form>

          <div
            className="
              mt-8
              flex
              flex-col
              gap-3
              sm:flex-row
              sm:items-end
              sm:justify-between
            "
          >
            <div>
              <p
                className="
                  text-sm
                  font-bold
                  uppercase
                  tracking-[0.14em]
                  text-[var(--flascam-terracotta)]
                "
              >
                Véhicules disponibles
              </p>

              <h2
                className="
                  mt-1
                  text-2xl
                  font-black
                  text-slate-950
                  sm:text-3xl
                "
              >
                {response.pagination.total}
                {' '}
                annonce
                {response.pagination.total >
                1
                  ? 's'
                  : ''}
              </h2>
            </div>

            <p
              className="
                max-w-xl
                text-sm
                leading-6
                text-slate-500
              "
            >
              L’identité du vendeur reste confidentielle jusqu’à
              l’acceptation d’une offre.
            </p>
          </div>

          {response.items.length ===
          0 ? (
            <div
              className="
                mt-7
                rounded-[30px]
                border
                border-dashed
                border-slate-300
                bg-white
                px-6
                py-16
                text-center
              "
            >
              <CarFront
                size={50}
                className="
                  mx-auto
                  text-slate-300
                "
              />

              <h2
                className="
                  mt-5
                  text-xl
                  font-black
                  text-slate-900
                "
              >
                Aucun véhicule ne correspond à votre recherche
              </h2>

              <p
                className="
                  mx-auto
                  mt-2
                  max-w-xl
                  text-sm
                  leading-6
                  text-slate-500
                "
              >
                Essayez d’élargir votre budget, l’année ou le
                kilométrage maximum.
              </p>
            </div>
          ) : (
            <div
              className="
                mt-7
                grid
                gap-6
                md:grid-cols-2
                xl:grid-cols-3
              "
            >
              {response.items.map(
                (
                  listing,
                ) => (
                  <MarketplaceListingCard
                    key={
                      listing.id
                    }
                    listing={
                      listing
                    }
                  />
                ),
              )}
            </div>
          )}

          {response.pagination.totalPages >
            1 && (
            <nav
              className="
                mt-10
                flex
                items-center
                justify-center
                gap-3
              "
              aria-label="Pagination marketplace"
            >
              <Link
                href={
                  buildPageUrl(
                    values,
                    Math.max(
                      1,
                      page -
                        1,
                    ),
                  )
                }
                aria-disabled={
                  page <=
                  1
                }
                className={`
                  inline-flex
                  min-h-11
                  items-center
                  justify-center
                  rounded-2xl
                  border
                  border-slate-200
                  bg-white
                  px-5
                  text-sm
                  font-bold
                  text-slate-700
                  ${
                    page <=
                    1
                      ? 'pointer-events-none opacity-40'
                      : 'hover:bg-slate-50'
                  }
                `}
              >
                Précédent
              </Link>

              <span
                className="
                  text-sm
                  font-bold
                  text-slate-600
                "
              >
                Page
                {' '}
                {page}
                {' '}
                sur
                {' '}
                {
                  response.pagination.totalPages
                }
              </span>

              <Link
                href={
                  buildPageUrl(
                    values,
                    Math.min(
                      response.pagination.totalPages,
                      page +
                        1,
                    ),
                  )
                }
                aria-disabled={
                  page >=
                  response.pagination.totalPages
                }
                className={`
                  inline-flex
                  min-h-11
                  items-center
                  justify-center
                  rounded-2xl
                  border
                  border-slate-200
                  bg-white
                  px-5
                  text-sm
                  font-bold
                  text-slate-700
                  ${
                    page >=
                    response.pagination.totalPages
                      ? 'pointer-events-none opacity-40'
                      : 'hover:bg-slate-50'
                  }
                `}
              >
                Suivant
              </Link>
            </nav>
          )}
        </section>
      </main>

      <PublicFooter />
    </>
  );
}