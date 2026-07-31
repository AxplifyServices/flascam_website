import Link from 'next/link';

import {
  CalendarDays,
  CarFront,
  Clock3,
  Fuel,
  Gauge,
  Images,
  Settings2,
} from 'lucide-react';

import type {
  PublicMarketplaceListingCard,
} from '@/types/marketplace';

import {
  MARKETPLACE_FUEL_LABELS,
  MARKETPLACE_TRANSMISSION_LABELS,
} from '@/types/marketplace';

type MarketplaceListingCardProps = {
  listing:
    PublicMarketplaceListingCard;
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

function formatMileage(
  value: number,
) {
  return new Intl.NumberFormat(
    'fr-FR',
  ).format(
    value,
  );
}

export function MarketplaceListingCard({
  listing,
}: MarketplaceListingCardProps) {
  return (
    <article
      className="
        group
        flex
        h-full
        flex-col
        overflow-hidden
        rounded-[28px]
        border
        border-slate-200
        bg-white
        shadow-[0_18px_55px_rgba(7,53,93,0.07)]
        transition
        duration-300
        hover:-translate-y-1
        hover:shadow-[0_24px_70px_rgba(7,53,93,0.13)]
      "
    >
      <Link
        href={`/marketplace/${listing.slug}`}
        className="
          relative
          block
          aspect-[16/11]
          overflow-hidden
          bg-slate-100
        "
      >
        {listing.coverMedia ? (
          <img
            src={
              listing.coverMedia.url
            }
            alt={
              listing.coverMedia.altText ||
              listing.title
            }
            className="
              h-full
              w-full
              object-cover
              transition
              duration-500
              group-hover:scale-[1.035]
            "
          />
        ) : (
          <div
            className="
              grid
              h-full
              place-items-center
              bg-gradient-to-br
              from-slate-100
              to-slate-200
              text-slate-400
            "
          >
            <CarFront
              size={48}
            />
          </div>
        )}

        <div
          className="
            absolute
            inset-x-0
            bottom-0
            h-24
            bg-gradient-to-t
            from-slate-950/55
            to-transparent
          "
        />

        <span
          className="
            absolute
            bottom-4
            right-4
            inline-flex
            items-center
            gap-1.5
            rounded-full
            bg-slate-950/70
            px-3
            py-1.5
            text-xs
            font-bold
            !text-white
            backdrop-blur
          "
        >
          <Images
            size={14}
          />

          {
            listing.mediaCount
          }
        </span>
      </Link>

      <div
        className="
          flex
          flex-1
          flex-col
          p-5
          sm:p-6
        "
      >
        <div
          className="
            flex
            items-start
            justify-between
            gap-4
          "
        >
          <div
            className="
              min-w-0
            "
          >
            <p
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
            </p>

            <Link
              href={`/marketplace/${listing.slug}`}
              className="
                mt-1
                block
                line-clamp-2
                text-xl
                font-black
                leading-tight
                text-slate-950
                transition
                group-hover:text-[var(--flascam-blue)]
              "
            >
              {
                listing.title
              }
            </Link>
          </div>
        </div>

        <p
          className="
            mt-4
            text-2xl
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
            mt-5
            grid
            grid-cols-2
            gap-3
            text-sm
            text-slate-600
          "
        >
          <span
            className="
              inline-flex
              items-center
              gap-2
            "
          >
            <CalendarDays
              size={17}
              className="
                shrink-0
                text-slate-400
              "
            />

            {
              listing.registrationYear
            }
          </span>

          <span
            className="
              inline-flex
              items-center
              gap-2
            "
          >
            <Gauge
              size={17}
              className="
                shrink-0
                text-slate-400
              "
            />

            {formatMileage(
              listing.mileageKm,
            )}
            {' '}
            km
          </span>

          <span
            className="
              inline-flex
              items-center
              gap-2
            "
          >
            <Fuel
              size={17}
              className="
                shrink-0
                text-slate-400
              "
            />

            {
              MARKETPLACE_FUEL_LABELS[
                listing.fuelType
              ]
            }
          </span>

          <span
            className="
              inline-flex
              items-center
              gap-2
            "
          >
            <Settings2
              size={17}
              className="
                shrink-0
                text-slate-400
              "
            />

            {
              MARKETPLACE_TRANSMISSION_LABELS[
                listing.transmission
              ]
            }
          </span>
        </div>

        <div
          className="
            mt-5
            flex
            flex-wrap
            gap-2
          "
        >
          {listing.bodyType && (
            <span
              className="
                rounded-full
                bg-slate-100
                px-3
                py-1.5
                text-xs
                font-bold
                text-slate-600
              "
            >
              {
                listing.bodyType
              }
            </span>
          )}

          <span
            className="
              inline-flex
              items-center
              gap-1.5
              rounded-full
              bg-emerald-50
              px-3
              py-1.5
              text-xs
              font-bold
              text-emerald-700
            "
          >
            <Clock3
              size={14}
            />

            {
              listing.remainingDays
            }
            {' '}
            jour
            {listing.remainingDays >
            1
              ? 's'
              : ''}
          </span>
        </div>

        <Link
          href={`/marketplace/${listing.slug}`}
          className="
            mt-6
            inline-flex
            min-h-11
            w-full
            items-center
            justify-center
            rounded-2xl
            bg-[var(--flascam-blue)]
            px-5
            text-sm
            font-black
            !text-white
            transition
            hover:brightness-95
          "
        >
          Découvrir le véhicule
        </Link>
      </div>
    </article>
  );
}