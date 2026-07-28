import type {
  Metadata,
} from 'next';

import {
  AgentationProvider,
} from '@/components/dev/agentation-provider';

import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(
    'https://flascam.axplitest.com',
  ),

  title: {
    default:
      'FLASCAM - Fédération des loueurs automobiles sans chauffeur au Maroc',
    template: '%s | FLASCAM',
  },

  description:
    'FLASCAM représente les loueurs automobiles sans chauffeur au Maroc et accompagne la structuration de la profession.',

  icons: {
    icon: [
      {
        url: '/Logo-flascam.png',
        type: 'image/png',
      },
    ],
    apple: [
      {
        url: '/Logo-flascam.png',
        type: 'image/png',
      },
    ],
  },

  openGraph: {
    title:
      'FLASCAM - Fédération des loueurs automobiles sans chauffeur au Maroc',

    description:
      'FLASCAM représente les loueurs automobiles sans chauffeur au Maroc et accompagne la structuration de la profession.',

    url:
      'https://flascam.axplitest.com',

    siteName:
      'FLASCAM',

    type:
      'website',

    locale:
      'fr_MA',

    images: [
      {
        url:
          '/og-flascam.jpg',

        width:
          1200,

        height:
          630,

        alt:
          'FLASCAM - Fédération des loueurs automobiles sans chauffeur au Maroc',
      },
    ],
  },

  twitter: {
    card:
      'summary_large_image',

    title:
      'FLASCAM - Fédération des loueurs automobiles sans chauffeur au Maroc',

    description:
      'FLASCAM représente les loueurs automobiles sans chauffeur au Maroc.',

    images: [
      '/og-flascam.jpg',
    ],
  },

  robots: {
    index:
      true,

    follow:
      true,
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