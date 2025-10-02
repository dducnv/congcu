import { GoogleAnalytics, Siderbar } from "@/components";
import type { Metadata } from "next";

import 'react-image-crop/dist/ReactCrop.css';
import 'tldraw/tldraw.css';
import "./globals.css";

export const metadata: Metadata = {
  title: 'MultiTools - Free Online Developer Tools & Utilities | tools4u.vercel.app',
  description: 'Free online developer tools and utilities. JSON formatter, image to text converter, color picker, emoji picker, file converter, and more. All tools are free and work in your browser.',
  keywords: [
    'online tools',
    'developer tools',
    'free tools',
    'JSON formatter',
    'image to text',
    'color picker',
    'emoji picker',
    'file converter',
    'text extractor',
    'image editor',
    'drawing tool',
    'percentage calculator',
    'web utilities',
    'online converter',
    'browser tools',
    'productivity tools',
    'coding tools',
    'design tools',
    'text tools',
    'image tools'
  ],
  authors: [{ name: 'MultiTools' }],
  creator: 'MultiTools',
  publisher: 'MultiTools',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://tools4u.vercel.app',
    title: 'MultiTools - Free Online Developer Tools & Utilities',
    description: 'Free online developer tools and utilities. JSON formatter, image to text converter, color picker, emoji picker, file converter, and more.',
    siteName: 'MultiTools',
    images: [
      {
        url: '/og-multitools.png',
        width: 1200,
        height: 630,
        alt: 'MultiTools - Free Online Developer Tools & Utilities',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MultiTools - Free Online Developer Tools & Utilities',
    description: 'Free online developer tools and utilities. JSON formatter, image to text converter, color picker, emoji picker, file converter, and more.',
    images: ['/og-multitools.png'],
  },
  alternates: {
    canonical: 'https://tools4u.vercel.app',
  },
  category: 'technology',
  classification: 'Developer Tools',
  other: {
    'application-name': 'MultiTools',
    'apple-mobile-web-app-title': 'MultiTools',
    'msapplication-TileColor': '#000000',
    'theme-color': '#000000',
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <GoogleAnalytics />
      </head>
      <body className="h-screen overflow-hidden">
        <div className="flex h-full">
          <Siderbar />
          <div className="bg-primary lg:border-l border-black w-full overflow-auto">
            <div className="min-h-full">
              {children}
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
