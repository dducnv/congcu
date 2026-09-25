import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import JsonLd from "@/components/seo/JsonLd";

// Dynamically import the component to avoid SSR issues with tesseract.js
const ImageToTextPage = dynamic(() => import("@/components/image_to_text/image_to_text"), {
  ssr: false,
});

export const metadata: Metadata = {
  title: 'Image to Text Converter - Extract Text from Images Online | MultiTools',
  description: 'Free OCR tool to extract text from images. Convert JPG, PNG, PDF images to text online. No registration required. Works with any language and handwriting.',
  keywords: [
    'image to text',
    'OCR online',
    'text extractor',
    'image OCR',
    'extract text from image',
    'photo to text',
    'scan text',
    'image text recognition',
    'OCR converter',
    'text scanner',
    'image text extractor',
    'free OCR',
    'online OCR',
    'text recognition',
    'image text reader',
    'photo text extractor',
    'handwriting recognition',
    'document scanner',
    'text from image',
    'image text converter'
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
    url: 'https://tools4u.vercel.app/image-to-text',
    title: 'Image to Text Converter - Extract Text from Images Online',
    description: 'Free OCR tool to extract text from images. Convert JPG, PNG, PDF images to text online. No registration required.',
    siteName: 'MultiTools',
    images: [
      {
        url: '/og-image-to-text.png',
        width: 1200,
        height: 630,
        alt: 'Image to Text Converter - Extract Text from Images Online',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Image to Text Converter - Extract Text from Images Online',
    description: 'Free OCR tool to extract text from images. Convert JPG, PNG, PDF images to text online. No registration required.',
    images: ['/og-image-to-text.png'],
  },
  alternates: {
    canonical: 'https://tools4u.vercel.app/image-to-text',
  },
  category: 'technology',
  classification: 'Developer Tools',
  other: {
    'application-name': 'Image to Text Converter',
    'apple-mobile-web-app-title': 'Image to Text Converter',
    'msapplication-TileColor': '#000000',
    'theme-color': '#000000',
  },
};

const ocrSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": "https://tools4u.vercel.app/image-to-text/#webapp",
      "name": "MultiTools Image to Text OCR Converter",
      "url": "https://tools4u.vercel.app/image-to-text",
      "applicationCategory": "UtilitiesApplication",
      "operatingSystem": "All",
      "browserRequirements": "Requires JavaScript. Requires WebAssembly.",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
      },
      "featureList": [
        "In-browser optical character recognition via Tesseract.js",
        "Extract text from JPG, PNG, WebP, and screenshots",
        "Zero server upload - all processing is local",
        "One-click copy to clipboard",
      ],
    },
    {
      "@type": "FAQPage",
      "@id": "https://tools4u.vercel.app/image-to-text/#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Are my uploaded images sent to any remote server?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "No. The OCR engine (Tesseract.js) runs entirely within your browser using WebAssembly. Your images never leave your computer or phone.",
          },
        },
      ],
    },
  ],
};

const page = () => {
  return (
    <>
      <JsonLd data={ocrSchema} />
      <ImageToTextPage />
    </>
  );
};

export default page;