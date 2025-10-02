import CsvView from '@/components/csv_view/csv_view';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CSV Viewer & Analyzer - View, Analyze & Visualize CSV Data | MultiTools',
  description: 'Free CSV viewer and data analyzer. Upload CSV files, view data in tables, generate statistics, create charts, and perform data analysis. Perfect for data scientists and analysts.',
  keywords: [
    'CSV viewer',
    'CSV analyzer',
    'data analysis',
    'CSV data viewer',
    'data visualization',
    'CSV statistics',
    'data table',
    'CSV charts',
    'data profiling',
    'correlation analysis',
    'pivot table',
    'data explorer',
    'CSV tool',
    'data science',
    'analytics tool',
    'data processing',
    'statistical analysis',
    'data insights',
    'CSV reader',
    'data dashboard'
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
    url: 'https://congcu4u.vercel.app/dev-tools/csv-viewer',
    title: 'CSV Viewer & Analyzer - View, Analyze & Visualize CSV Data',
    description: 'Free CSV viewer and data analyzer. Upload CSV files, view data in tables, generate statistics, create charts, and perform data analysis.',
    siteName: 'MultiTools',
    images: [
      {
        url: '/og-csv-viewer.png',
        width: 1200,
        height: 630,
        alt: 'CSV Viewer & Analyzer - View, Analyze & Visualize CSV Data',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CSV Viewer & Analyzer - View, Analyze & Visualize CSV Data',
    description: 'Free CSV viewer and data analyzer. Upload CSV files, view data in tables, generate statistics, create charts, and perform data analysis.',
    images: ['/og-csv-viewer.png'],
  },
  alternates: {
    canonical: 'https://congcu4u.vercel.app/dev-tools/csv-viewer',
  },
  category: 'technology',
  classification: 'Developer Tools',
  other: {
    'application-name': 'CSV Viewer & Analyzer',
    'apple-mobile-web-app-title': 'CSV Viewer & Analyzer',
    'msapplication-TileColor': '#000000',
    'theme-color': '#000000',
  },
};

const page = () => {
  return <CsvView />
}

export default page