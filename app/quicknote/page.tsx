import { Container, TextareaQuicknote } from "@/components";
import JsonLd from "@/components/seo/JsonLd";
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Quick Note - Online Notepad & Text Editor | MultiTools',
  description: 'Free online notepad and text editor with advanced features. Take quick notes, write text, format documents, search & replace, word statistics, and auto-save. No registration required. Works in your browser.',
  keywords: [
    'quick note',
    'online notepad',
    'text editor',
    'note taking',
    'quick notes',
    'text editor online',
    'notepad online',
    'save notes',
    'text formatting',
    'word statistics',
    'auto-save notepad',
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
    url: 'https://tools4u.vercel.app/quicknote',
    title: 'Quick Note - Online Notepad & Text Editor',
    description: 'Free online notepad and text editor with auto-save and word statistics.',
    siteName: 'MultiTools',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Quick Note - Online Notepad & Text Editor',
    description: 'Free online notepad and text editor with auto-save and word statistics.',
  },
  alternates: {
    canonical: 'https://tools4u.vercel.app/quicknote',
  },
  category: 'productivity',
  classification: 'Productivity Tools',
};

const noteSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "MultiTools Quick Note Editor",
  "url": "https://tools4u.vercel.app/quicknote",
  "description": "Browser-based notepad with multi-tab support, Markdown formatting, word statistics, and local storage auto-save.",
  "applicationCategory": "ProductivityApplication",
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
      <JsonLd data={noteSchema} />
      <div className="h-16"></div>
      <Container width="max-w-6xl" className="p-3">
        <TextareaQuicknote />
      </Container>
    </>
  );
};

export default page;
