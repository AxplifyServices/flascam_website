import type {
  Metadata,
} from 'next';

import {
  PlaceholderPage,
} from '@/components/site/placeholder-page';

export const metadata: Metadata = {
  title: 'Marketplace',
  description:
    'Marketplace FLASCAM dédiée aux véhicules des loueurs affiliés.',
  alternates: {
    canonical: '/marketplace',
  },
};

export default function MarketplacePage() {
  return (
    <PlaceholderPage
      title="Marketplace"
      description="Cette rubrique présentera les véhicules proposés par les loueurs affiliés."
    />
  );
}