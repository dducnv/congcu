import { Container, TextareaQuicknote, TitlePage } from "@/components";
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Quick Note - Online Notepad & Text Editor | MultiTools',
  description: 'Free online notepad and text editor. Take quick notes, write text, and save your thoughts instantly. No registration required. Works in your browser.',
  keywords: [
    'quick note',
    'online notepad',
    'text editor',
    'note taking',
    'quick notes',
    'text editor online',
    'notepad online',
    'write text',
    'save notes',
    'text tool',
    'writing tool',
    'note app',
    'text app',
    'online editor',
    'text processor',
    'note pad',
    'writing pad',
    'text area',
    'note tool',
    'text utility'
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
    url: 'https://congcu4u.vercel.app/quicknote',
    title: 'Quick Note - Online Notepad & Text Editor',
    description: 'Free online notepad and text editor. Take quick notes, write text, and save your thoughts instantly. No registration required.',
    siteName: 'MultiTools',
    images: [
      {
        url: '/og-quicknote.png',
        width: 1200,
        height: 630,
        alt: 'Quick Note - Online Notepad & Text Editor',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Quick Note - Online Notepad & Text Editor',
    description: 'Free online notepad and text editor. Take quick notes, write text, and save your thoughts instantly. No registration required.',
  },
  alternates: {
    canonical: 'https://congcu4u.vercel.app/quicknote',
  },
  category: 'technology',
  classification: 'Developer Tools',
  other: {
    'application-name': 'Quick Note',
    'apple-mobile-web-app-title': 'Quick Note',
    'msapplication-TileColor': '#000000',
    'theme-color': '#000000',
  },
};

const page = () => {
  return (
    <>
      <div className="h-20"></div>
      <TitlePage>Notes</TitlePage>
      <Container width="max-w-6xl" className="p-3">
        <TextareaQuicknote />
      </Container>
      <div className="h-20"></div>
    </>
  );
};

export default page;
