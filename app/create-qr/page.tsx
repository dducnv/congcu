import QrGenerator from "@/components/qr_generator/qr_generator";
import JsonLd from "@/components/seo/JsonLd";
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Instant QR Code Generator - Free, Private & Real-time | MultiTools',
  description: 'Free online QR code generator. Generate static QR codes from text or URLs instantly on paste. 100% private & client-side. Customize size and error correction. Download high-res PNG.',
  keywords: [
    'qr code generator',
    'instant qr code maker',
    'create qr code online',
    'free qr code generator',
    'client side qr generator',
    'text to qr',
    'url to qr',
    'qr code png download',
    'static qr code',
    'no signup qr generator',
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
    url: 'https://tools4u.vercel.app/create-qr',
    title: 'Instant QR Code Generator - Free & Private | MultiTools',
    description: 'Free online QR code generator. Generate static QR codes from text or URLs instantly. 100% private & client-side.',
    siteName: 'MultiTools',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Instant QR Code Generator - Free & Private | MultiTools',
    description: 'Free online QR code generator. Generate static QR codes instantly. 100% private in-browser tool.',
  },
  alternates: {
    canonical: 'https://tools4u.vercel.app/create-qr',
  },
  category: 'technology',
  classification: 'Developer Tools',
  other: {
    'application-name': 'QR Code Generator',
    'apple-mobile-web-app-title': 'QR Code Generator',
    'msapplication-TileColor': '#000000',
    'theme-color': '#000000',
  },
};

const qrStructuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": "https://tools4u.vercel.app/create-qr/#webapp",
      "name": "MultiTools Instant QR Code Generator",
      "url": "https://tools4u.vercel.app/create-qr",
      "applicationCategory": "UtilitiesApplication",
      "operatingSystem": "All",
      "browserRequirements": "Requires JavaScript. Requires HTML5 Canvas.",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
      },
      "featureList": [
        "Real-time QR generation on paste or typing",
        "Configurable Error Correction Levels (L, M, Q, H)",
        "Instant PNG download",
        "100% client-side processing without server data transmission",
        "Permanent static QR codes without expiration",
      ],
      "creator": {
        "@type": "Organization",
        "name": "MultiTools",
        "url": "https://tools4u.vercel.app",
      },
    },
    {
      "@type": "FAQPage",
      "@id": "https://tools4u.vercel.app/create-qr/#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Do these QR codes have an expiration date?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "No. MultiTools creates direct static QR codes. The encoded text or URL is permanently embedded into the matrix pattern and will work forever without relying on any server.",
          },
        },
        {
          "@type": "Question",
          "name": "Are my QR code inputs uploaded to any server?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "No. MultiTools operates entirely in your local browser using client-side JavaScript. Your text and URLs are never sent to external servers.",
          },
        },
        {
          "@type": "Question",
          "name": "Which error correction level should I choose?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Medium (15%) is recommended for most uses. Use High (30%) if the code will be printed on outdoor materials or subject to wear.",
          },
        },
      ],
    },
  ],
};

const page = () => {
  return (
    <>
      <JsonLd data={qrStructuredData} />
      <QrGenerator />
    </>
  );
};

export default page;
