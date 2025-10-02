import GenerateSecretKeyPage from "@/components/generate_secret_key/generate_secret_key";
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Secret Key Generator - Generate Secure Keys Online | MultiTools',
  description: 'Free secure key generator. Generate random secret keys, API keys, passwords, and tokens. Perfect for developers and security purposes.',
  keywords: [
    'secret key generator',
    'API key generator',
    'password generator',
    'secure key',
    'random key',
    'token generator',
    'key generator',
    'security tool',
    'cryptographic key',
    'encryption key',
    'secure token',
    'random generator',
    'key utility',
    'security utility',
    'crypto tool',
    'encryption tool',
    'key helper',
    'security helper',
    'random key generator',
    'secure key generator'
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
    url: 'https://congcu4u.vercel.app/dev-tools/generate-secret-key',
    title: 'Secret Key Generator - Generate Secure Keys Online',
    description: 'Free secure key generator. Generate random secret keys, API keys, passwords, and tokens. Perfect for developers and security purposes.',
    siteName: 'MultiTools',
    images: [
      {
        url: '/og-secret-key-generator.png',
        width: 1200,
        height: 630,
        alt: 'Secret Key Generator - Generate Secure Keys Online',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Secret Key Generator - Generate Secure Keys Online',
    description: 'Free secure key generator. Generate random secret keys, API keys, passwords, and tokens. Perfect for developers and security purposes.',
    images: ['/og-secret-key-generator.png'],
  },
  alternates: {
    canonical: 'https://congcu4u.vercel.app/dev-tools/generate-secret-key',
  },
  category: 'technology',
  classification: 'Developer Tools',
  other: {
    'application-name': 'Secret Key Generator',
    'apple-mobile-web-app-title': 'Secret Key Generator',
    'msapplication-TileColor': '#000000',
    'theme-color': '#000000',
  },
};

const page = () => {
  return <GenerateSecretKeyPage />
}

export default page