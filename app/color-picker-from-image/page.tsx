import { ColorPickerFromImage } from "@/components";
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Color Picker from Image - Extract Colors from Photos | MultiTools',
  description: 'Free color picker tool to extract colors from images. Get hex, RGB, HSL color codes from any image. Perfect for designers and developers.',
  keywords: [
    'color picker',
    'color extractor',
    'image color picker',
    'color from image',
    'extract colors',
    'color palette',
    'hex color',
    'RGB color',
    'HSL color',
    'color tool',
    'design tool',
    'color scheme',
    'color palette generator',
    'image colors',
    'photo colors',
    'color analysis',
    'color detection',
    'color finder',
    'color selector',
    'color utility'
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
    url: 'https://tools4u.vercel.app/color-picker-from-image',
    title: 'Color Picker from Image - Extract Colors from Photos',
    description: 'Free color picker tool to extract colors from images. Get hex, RGB, HSL color codes from any image. Perfect for designers and developers.',
    siteName: 'MultiTools',
    images: [
      {
        url: '/og-color-picker.png',
        width: 1200,
        height: 630,
        alt: 'Color Picker from Image - Extract Colors from Photos',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Color Picker from Image - Extract Colors from Photos',
    description: 'Free color picker tool to extract colors from images. Get hex, RGB, HSL color codes from any image. Perfect for designers and developers.',
    images: ['/og-color-picker.png'],
  },
  alternates: {
    canonical: 'https://tools4u.vercel.app/color-picker-from-image',
  },
  category: 'technology',
  classification: 'Developer Tools',
  other: {
    'application-name': 'Color Picker from Image',
    'apple-mobile-web-app-title': 'Color Picker from Image',
    'msapplication-TileColor': '#000000',
    'theme-color': '#000000',
  },
};

const page = () => {
  return (
    <>
      <div className="h-8"></div>
      <div className=" px-14">
        <ColorPickerFromImage />
      </div>
      <canvas className="hidden" id="cs"></canvas>
      <div className="h-16"></div>
    </>
  );
};

export default page;
