// app/layout.tsx

import type { Metadata } from 'next';
import './globals.css';
import ClientLayout from './ClientLayout';

export const metadata: Metadata = {
  title: {
    default: 'DigiCol - Apprendre · Partager · Innover',
    template: '%s | DigiCol',
  },
  description: 'DigiCol est une communauté technologique pour apprendre, partager, construire des projets et développer les compétences nécessaires aux métiers du numérique.',
  keywords: [
    'DigiCol',
    'formation informatique',
    'communauté tech',
    'Django',
    'Python',
    'React',
    'Cybersécurité',
    'DevOps',
    'Douala',
    'Cameroun',
  ],
  authors: [{ name: 'DigiCol Team' }],
  creator: 'DigiCol',
  publisher: 'DigiCol',
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://digicol-frontend.vercel.app',
    siteName: 'DigiCol',
    title: 'DigiCol - Apprendre · Partager · Innover',
    description: 'Rejoignez la communauté technologique DigiCol',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'DigiCol',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DigiCol - Apprendre · Partager · Innover',
    description: 'Rejoignez la communauté technologique DigiCol',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}