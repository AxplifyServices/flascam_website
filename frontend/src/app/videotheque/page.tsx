import type {
  Metadata,
} from 'next';

import {
  PlaceholderPage,
} from '@/components/site/placeholder-page';

export const metadata: Metadata = {
  title: 'Vidéothèque',
  description:
    'Vidéothèque FLASCAM.',
  alternates: {
    canonical: '/videotheque',
  },
};

export default function VideothequePage() {
  return (
    <PlaceholderPage
      title="Vidéothèque"
      description="Cette rubrique accueillera les contenus vidéo de la fédération."
    />
  );
}