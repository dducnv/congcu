import GenerateSecretKeyPage from "@/components/generate_secret_key/generate_secret_key";
import JsonLd from "@/components/seo/JsonLd";
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Secret Key & Hash Generator - SHA256, HMAC, Base64 Online | MultiTools',
  description: 'Cryptographically secure random secret key and hash generator. Generate 256-bit API keys, .env secrets, SHA-256 / SHA-512 hashes, and HMAC signatures using browser Web Crypto API. 100% private.',
  keywords: [
    'secret key generator',
    'API key generator',
    'password generator',
    'sha256 online',
    'hmac sha256 generator',
    'random base64 generator',
    'random hex generator',
    'jwt secret generator',
    'env secret key',
    'web crypto api generator',
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
    url: 'https://tools4u.vercel.app/dev-tools/generate-secret-key',
    title: 'Secret Key & Hash Generator - SHA256, HMAC, Base64 | MultiTools',
    description: 'Cryptographically secure random secret key and hash generator using Web Crypto API.',
    siteName: 'MultiTools',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Secret Key & Hash Generator - SHA256, HMAC, Base64 | MultiTools',
    description: 'Cryptographically secure random secret key and hash generator using Web Crypto API.',
  },
  alternates: {
    canonical: 'https://tools4u.vercel.app/dev-tools/generate-secret-key',
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

const secretKeySchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": "https://tools4u.vercel.app/dev-tools/generate-secret-key/#webapp",
      "name": "MultiTools Cryptographic Secret Key & Hash Generator",
      "url": "https://tools4u.vercel.app/dev-tools/generate-secret-key",
      "applicationCategory": "SecurityApplication",
      "operatingSystem": "All",
      "browserRequirements": "Requires Web Crypto API. Requires JavaScript.",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
      },
      "featureList": [
        "Cryptographically secure randomness via window.crypto.getRandomValues",
        "SHA-256 and SHA-512 hashing",
        "HMAC-SHA256 signature calculation",
        "Configurable Base64 and Hex key lengths",
        "Estimated entropy calculation in bits",
      ],
    },
    {
      "@type": "FAQPage",
      "@id": "https://tools4u.vercel.app/dev-tools/generate-secret-key/#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Is it safe to generate production API keys here?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. Keys are generated exclusively within your local browser memory using the standard Web Crypto API. No keys or inputs are ever transmitted over the network.",
          },
        },
        {
          "@type": "Question",
          "name": "How is entropy calculated?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Entropy is computed using Shannon entropy principles based on the character pool size and key length (log2(pool^length)).",
          },
        },
      ],
    },
  ],
};

const page = () => {
  return (
    <>
      <JsonLd data={secretKeySchema} />
      <GenerateSecretKeyPage />
    </>
  );
};

export default page;