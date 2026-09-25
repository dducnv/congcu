import CsvView from '@/components/csv_view/csv_view';
import JsonLd from '@/components/seo/JsonLd';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Data & SQL Viewer - View, Query & Analyze CSV, Excel, SQL, SQLite .db | MultiTools',
  description: 'Free in-browser data viewer and SQL query engine. Open CSV, Excel, JSON, SQL script dumps, and SQLite (.db) files. Run real SQL queries, inspect tables, and generate charts without uploading data to servers.',
  keywords: [
    'SQL viewer online',
    'SQLite viewer online',
    'read sql db file online',
    'CSV viewer',
    'CSV analyzer',
    'SQL query tool online',
    'open sqlite db online',
    'view sql dump file',
    'client side sql query',
    'data analysis',
    'CSV data viewer',
    'data visualization',
    'data table',
    'CSV charts',
    'pivot table',
    'in-browser sqlite',
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
    url: 'https://tools4u.vercel.app/dev-tools/csv-viewer',
    title: 'Data & SQL Viewer - View, Query & Analyze CSV, Excel, SQL, SQLite .db',
    description: 'Free in-browser data viewer and SQL query engine. Open CSV, Excel, JSON, SQL scripts, and SQLite .db files with zero server uploads.',
    siteName: 'MultiTools',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Data & SQL Viewer - View, Query & Analyze CSV, Excel, SQL, SQLite .db',
    description: 'Free in-browser data viewer and SQL query engine. Open CSV, Excel, JSON, SQL scripts, and SQLite .db files.',
  },
  alternates: {
    canonical: 'https://tools4u.vercel.app/dev-tools/csv-viewer',
  },
  category: 'technology',
  classification: 'Developer Tools',
  other: {
    'application-name': 'Data & SQL Viewer',
    'apple-mobile-web-app-title': 'Data & SQL Viewer',
    'msapplication-TileColor': '#000000',
    'theme-color': '#000000',
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "MultiTools Data & SQL Query Engine",
  "url": "https://tools4u.vercel.app/dev-tools/csv-viewer",
  "description": "Free in-browser data viewer and SQL query engine. Open CSV, Excel, JSON, SQL script dumps, and SQLite (.db) files with zero server uploads.",
  "applicationCategory": "DeveloperApplication",
  "operatingSystem": "All",
  "browserRequirements": "Requires JavaScript. Requires WebAssembly.",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD",
  },
  "featureList": [
    "Read SQLite database files (.db, .sqlite, .sqlite3)",
    "Parse and execute SQL script dumps (.sql)",
    "View and query CSV, TSV, Excel, and JSON files",
    "Interactive SQL Query Editor with syntax templates",
    "Real-time execution via client-side SQLite WebAssembly engine",
    "Charts, Pivot Tables, Statistics, and Data Quality analysis",
    "Export query results to CSV, Excel, JSON, and SQLite .db",
  ],
};

const page = () => {
  return (
    <>
      <JsonLd data={structuredData} />
      <CsvView />
    </>
  );
};

export default page;