import { Metadata } from 'next';
import dynamic from "next/dynamic";

export const metadata: Metadata = {
  title: 'Online Drawing Tool - Draw & Sketch Online | MultiTools',
  description: 'Free online drawing and sketching tool. Create digital art, sketches, and drawings directly in your browser. No registration required.',
  keywords: [
    'drawing tool',
    'sketch tool',
    'draw online',
    'sketch online',
    'digital art',
    'drawing app',
    'sketch app',
    'art tool',
    'drawing utility',
    'sketch utility',
    'online drawing',
    'digital drawing',
    'art creation',
    'drawing canvas',
    'sketch canvas',
    'art tool online',
    'drawing tool online',
    'creative tool',
    'art utility',
    'drawing helper'
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
    url: 'https://tools4u.vercel.app/draw',
    title: 'Online Drawing Tool - Draw & Sketch Online',
    description: 'Free online drawing and sketching tool. Create digital art, sketches, and drawings directly in your browser. No registration required.',
    siteName: 'MultiTools',
    images: [
      {
        url: '/og-drawing-tool.png',
        width: 1200,
        height: 630,
        alt: 'Online Drawing Tool - Draw & Sketch Online',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Online Drawing Tool - Draw & Sketch Online',
    description: 'Free online drawing and sketching tool. Create digital art, sketches, and drawings directly in your browser. No registration required.',
    images: ['/og-drawing-tool.png'],
  },
  alternates: {
    canonical: 'https://tools4u.vercel.app/draw',
  },
  category: 'technology',
  classification: 'Developer Tools',
  other: {
    'application-name': 'Drawing Tool',
    'apple-mobile-web-app-title': 'Drawing Tool',
    'msapplication-TileColor': '#000000',
    'theme-color': '#000000',
  },
};

const DrawComponent = dynamic(async () => import("@/components/page_components/draw_component"), {
  ssr: false,
});

const page = () => {

  return (
    <div>
      <div className=" max-h-screen h-screen relative pl-1 overflow-hidden bg-white">
        <DrawComponent />
      </div>
    </div>
  );
};

export default page;
