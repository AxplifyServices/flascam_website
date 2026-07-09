import type {
  Metadata,
} from 'next';

import {
  PlaceholderPage,
} from '@/components/site/placeholder-page';

export const metadata: Metadata = {
  title: 'Actualités',
  description:
    'Actualités de FLASCAM et du secteur de la location automobile sans chauffeur au Maroc.',
  alternates: {
    canonical: '/actualites',
  },
};

export default function ActualitesPage() {
  return (
    <PlaceholderPage
      title="Actualités"
      description="Cette rubrique accueillera les actualités officielles de la fédération et du secteur."
    />
  );
}