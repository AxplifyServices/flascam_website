import type {
  Metadata,
} from 'next';

import {
  PlaceholderPage,
} from '@/components/site/placeholder-page';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Contacter FLASCAM.',
  alternates: {
    canonical: '/contact',
  },
};

export default function ContactPage() {
  return (
    <PlaceholderPage
      title="Contact"
      description="Cette rubrique accueillera le formulaire de contact public."
    />
  );
}