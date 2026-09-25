import { Metadata } from 'next';
import dynamic from "next/dynamic";
import JsonLd from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: 'Online Drawing Tool - Draw, Sketch & Whiteboard Online | MultiTools',
  description: 'Free online drawing, diagramming and infinite whiteboard tool powered by tldraw. Create digital art, architecture diagrams, mind maps, and sketches directly in your browser.',
  keywords: [
    'drawing tool',
    'sketch tool',
    'draw online',
    'online whiteboard',
    'tldraw online',
    'infinite canvas',
    'diagram tool',
    'digital sketch',
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
    description: 'Free online drawing and sketching tool. Create digital art and architecture diagrams in your browser.',
    siteName: 'MultiTools',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Online Drawing Tool - Draw & Sketch Online',
    description: 'Free online drawing and sketching tool.',
  },
  alternates: {
    canonical: 'https://tools4u.vercel.app/draw',
  },
  category: 'design',
  classification: 'Design Tools',
};

const drawSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "MultiTools Online Drawing & Whiteboard Canvas",
  "url": "https://tools4u.vercel.app/draw",
  "description": "Infinite canvas online drawing and diagramming tool for sketches, flowcharts, and mind maps.",
  "applicationCategory": "DesignApplication",
  "operatingSystem": "All",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD",
  },
};

const DrawComponent = dynamic(async () => import("@/components/page_components/draw_component"), {
  ssr: false,
});

const page = () => {
  return (
    <>
      <JsonLd data={drawSchema} />
      <div className="max-h-screen h-screen relative pl-1 overflow-hidden bg-white">
        <DrawComponent />
      </div>
    </>
  );
};

export default page;
