
import { ImageEditorComponent } from "@/components/page_components/image_editor";
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Quick Image Editor - Edit Images Online | MultiTools',
  description: 'Free online image editor. Crop, resize, rotate, and edit images instantly. No registration required. Works with JPG, PNG, and other image formats.',
  keywords: [
    'image editor',
    'photo editor',
    'edit images',
    'crop image',
    'resize image',
    'rotate image',
    'image tool',
    'photo tool',
    'image processor',
    'photo processor',
    'image utility',
    'photo utility',
    'online editor',
    'image editing',
    'photo editing',
    'image manipulation',
    'photo manipulation',
    'image converter',
    'photo converter',
    'image tool online'
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
    url: 'https://congcu4u.vercel.app/quick-image-editor',
    title: 'Quick Image Editor - Edit Images Online',
    description: 'Free online image editor. Crop, resize, rotate, and edit images instantly. No registration required. Works with JPG, PNG, and other image formats.',
    siteName: 'MultiTools',
    images: [
      {
        url: '/og-image-editor.png',
        width: 1200,
        height: 630,
        alt: 'Quick Image Editor - Edit Images Online',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Quick Image Editor - Edit Images Online',
    description: 'Free online image editor. Crop, resize, rotate, and edit images instantly. No registration required. Works with JPG, PNG, and other image formats.',
    images: ['/og-image-editor.png'],
  },
  alternates: {
    canonical: 'https://congcu4u.vercel.app/quick-image-editor',
  },
  category: 'technology',
  classification: 'Developer Tools',
  other: {
    'application-name': 'Quick Image Editor',
    'apple-mobile-web-app-title': 'Quick Image Editor',
    'msapplication-TileColor': '#000000',
    'theme-color': '#000000',
  },
};


const page = () => {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <div className="flex-1 flex overflow-hidden">
        <ImageEditorComponent />
      </div>
    </div>
  );
};

export default page;
