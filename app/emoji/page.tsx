import EmojiPage from '@/components/emoji/emoji';
import JsonLd from '@/components/seo/JsonLd';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Emoji Picker - Copy & Paste Emojis Online | MultiTools',
  description: 'Free emoji picker tool. Copy and paste emojis easily. Find the perfect emoji for your messages, social media posts, and documents. No registration required.',
  keywords: [
    'emoji picker',
    'emoji copy paste',
    'emoji keyboard',
    'emoji list',
    'copy emoji',
    'paste emoji',
    'emoji search',
    'unicode emoji',
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
    url: 'https://tools4u.vercel.app/emoji',
    title: 'Emoji Picker - Copy & Paste Emojis Online',
    description: 'Free emoji picker tool. Copy and paste emojis easily with one click.',
    siteName: 'MultiTools',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Emoji Picker - Copy & Paste Emojis Online',
    description: 'Free emoji picker tool. Copy and paste emojis easily with one click.',
  },
  alternates: {
    canonical: 'https://tools4u.vercel.app/emoji',
  },
  category: 'utilities',
  classification: 'Utility Tools',
};

const emojiSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "MultiTools Emoji Picker & Keyboard",
  "url": "https://tools4u.vercel.app/emoji",
  "description": "Search, browse, and copy emojis to clipboard instantly with categorized unicode support.",
  "applicationCategory": "UtilitiesApplication",
  "operatingSystem": "All",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD",
  },
};

const page = () => {
  return (
    <>
      <JsonLd data={emojiSchema} />
      <EmojiPage />
    </>
  );
};

export default page;