import type {
  MarketplaceOfferStatus,
} from '@/types/marketplace';

import {
  MARKETPLACE_OFFER_STATUS_LABELS,
} from '@/types/marketplace';

type MarketplaceOfferStatusBadgeProps = {
  status:
    MarketplaceOfferStatus;
};

function getClasses(
  status:
    MarketplaceOfferStatus,
) {
  switch (status) {
    case 'ACCEPTED':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700';

    case 'REJECTED':
      return 'border-red-200 bg-red-50 text-red-700';

    case 'CANCELLED':
      return 'border-slate-200 bg-slate-100 text-slate-600';

    case 'PENDING':
    default:
      return 'border-amber-200 bg-amber-50 text-amber-700';
  }
}

export function MarketplaceOfferStatusBadge({
  status,
}: MarketplaceOfferStatusBadgeProps) {
  return (
    <span
      className={`
        inline-flex
        rounded-full
        border
        px-3
        py-1.5
        text-xs
        font-black
        ${getClasses(
          status,
        )}
      `}
    >
      {
        MARKETPLACE_OFFER_STATUS_LABELS[
          status
        ]
      }
    </span>
  );
}