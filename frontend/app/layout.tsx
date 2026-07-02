import type {
  Metadata,
} from 'next';

import './globals.css';

export const metadata:
  Metadata = {
    title: {
      default: 'FLASCAM',
      template:
        '%s | FLASCAM',
    },
    description:
      'Fédération des loueurs automobiles sans chauffeur au Maroc.',
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
      </body>
    </html>
  );
}