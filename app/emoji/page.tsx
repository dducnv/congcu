import EmojiPage from '@/components/emoji/emoji';
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
    'emoji tool',
    'emoji online',
    'emoji generator',
    'smiley emoji',
    'emoji symbols',
    'unicode emoji',
    'emoji search',
    'emoji finder',
    'emoji selector',
    'free emoji',
    'emoji library',
    'emoji collection',
    'emoji database',
    'emoji reference'
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
    url: 'https://congcu4u.vercel.app/emoji',
    title: 'Emoji Picker - Copy & Paste Emojis Online',
    description: 'Free emoji picker tool. Copy and paste emojis easily. Find the perfect emoji for your messages, social media posts, and documents.',
    siteName: 'MultiTools',
    images: [
      {
        url: '/og-emoji-picker.png',
        width: 1200,
        height: 630,
        alt: 'Emoji Picker - Copy & Paste Emojis Online',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Emoji Picker - Copy & Paste Emojis Online',
    description: 'Free emoji picker tool. Copy and paste emojis easily. Find the perfect emoji for your messages, social media posts, and documents.',
    images: ['/og-emoji-picker.png'],
  },
  alternates: {
    canonical: 'https://congcu4u.vercel.app/emoji',
  },
  category: 'technology',
  classification: 'Developer Tools',
  other: {
    'application-name': 'Emoji Picker',
    'apple-mobile-web-app-title': 'Emoji Picker',
    'msapplication-TileColor': '#000000',
    'theme-color': '#000000',
  },
};

const page = () => {
  return <EmojiPage />
}

export default page