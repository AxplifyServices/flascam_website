import type {
  Metadata,
} from 'next';

import {
  AgentationProvider,
} from '@/components/dev/agentation-provider';

import './globals.css';

export const metadata:
  Metadata = {
    title: {
      default:
        'FLASCAM - Fédération des loueurs automobiles sans chauffeur au Maroc',
      template:
        '%s | FLASCAM',
    },
    description:
      'FLASCAM représente les loueurs automobiles sans chauffeur au Maroc et accompagne la structuration de la profession.',
    icons: {
      icon: '/logo-flascam.png',
      apple: '/logo-flascam.png',
    },
    openGraph: {
      title:
        'FLASCAM - Fédération des loueurs automobiles sans chauffeur au Maroc',
      description:
        'Fédération des loueurs automobiles sans chauffeur au Maroc.',
      type: 'website',
      locale: 'fr_MA',
      images: [
        {
          url: '/logo-flascam.png',
          width: 512,
          height: 512,
          alt: 'Logo FLASCAM',
        },
      ],
    },
    robots: {
      index: true,
      follow: true,
    },
  };

export default function RootLayout({
  children,
}: Readonly<{
  children:
    React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className="h-full"
    >
<body
  className="
    min-h-full
    antialiased
  "
>
  {children}

  <AgentationProvider />
</body>
    </html>
  );
}