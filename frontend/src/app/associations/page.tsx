import type {
  Metadata,
} from 'next';

import {
  PlaceholderPage,
} from '@/components/site/placeholder-page';

export const metadata: Metadata = {
  title: 'Associations',
  description:
    'Associations affiliées à FLASCAM.',
  alternates: {
    canonical: '/associations',
  },
};

export default function AssociationsPage() {
  return (
    <PlaceholderPage
      title="Associations"
      description="Cette rubrique présentera les associations affiliées à la fédération."
    />
  );
}