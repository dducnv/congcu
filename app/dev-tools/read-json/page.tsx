import JsonViewerPage from "@/components/json_editor/json_editor_body_component"
import JsonToolStructuredData from "@/components/JsonToolStructuredData"
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'JSON Tool - Fix, Format, Validate & Compare JSON Online | MultiTools',
  description: 'Free JSON tool - Fix JSON errors, format, validate, search and compare JSON. Supports malformed JSON like {key: value}. Best online JSON tool for developers.',
  keywords: [
    'JSON tool',
    'JSON formatter',
    'JSON validator',
    'JSON fixer',
    'JSON compare',
    'JSON search',
    'JSON online',
    'JSON editor',
    'fix JSON',
    'format JSON',
    'validate JSON',
    'JSON beautifier',
    'JSON minifier',
    'JSON diff',
    'JSON viewer',
    'JSON parser',
    'JSON converter',
    'JSON tool online',
    'JSON utility',
    'developer tools',
    'web tools',
    'JSON helper',
    'JSON repair',
    'JSON lint',
    'JSON check'
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
    url: 'https://tools4u.vercel.app/dev-tools/read-json',
    title: 'JSON Tool - Fix, Format, Validate & Compare JSON Online',
    description: 'Free JSON tool - Fix JSON errors, format, validate, search and compare JSON. Supports malformed JSON like {key: value}. Best online JSON tool for developers.',
    siteName: 'MultiTools',
    images: [
      {
        url: '/og-json-tool.png',
        width: 1200,
        height: 630,
        alt: 'JSON Tool - Fix, Format, Validate & Compare JSON Online',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'JSON Tool - Fix, Format, Validate & Compare JSON Online',
    description: 'Free JSON tool - Fix JSON errors, format, validate, search and compare JSON. Supports malformed JSON like {key: value}.',
    images: ['/og-json-tool.png'],
  },
  alternates: {
    canonical: 'https://tools4u.vercel.app/dev-tools/read-json',
  },
  category: 'technology',
  classification: 'Developer Tools',
  other: {
    'application-name': 'JSON Tool',
    'apple-mobile-web-app-title': 'JSON Tool',
    'msapplication-TileColor': '#000000',
    'theme-color': '#000000',
  },
}

const page = () => {
  return (
    <>
      <JsonToolStructuredData />
      <JsonViewerPage />
    </>
  )
}

export default page