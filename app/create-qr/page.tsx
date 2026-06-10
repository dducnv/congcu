import QrGenerator from "@/components/qr_generator/qr_generator";
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'QR Code Generator - Create QR Codes Online | MultiTools',
  description: 'Free online QR code generator. Create QR codes from text or URLs instantly. Customize size and error correction level. Download as PNG. No registration required.',
  keywords: [
    'qr code generator',
    'create qr code',
    'qr code maker',
    'qr code online',
    'text to qr',
    'url to qr',
    'qr code free',
    'generate qr code',
    'qr code creator',
    'qr code tool',
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
    title: 'QR Code Generator - Create QR Codes Online',
    description: 'Free online QR code generator. Create QR codes from text or URLs instantly. Download as PNG.',
    siteName: 'MultiTools',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'QR Code Generator - Create QR Codes Online',
    description: 'Free online QR code generator. Create QR codes from text or URLs instantly. Download as PNG.',
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

const page = () => {
  return <QrGenerator />;
};

export default page;
