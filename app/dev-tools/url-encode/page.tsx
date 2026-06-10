import UrlEncodeTool from "@/components/dev_tools/url_encode_tool";
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'URL Encode / Decode - Online Tool | MultiTools',
  description: 'Free online URL encoder and decoder. Encode and decode URL components instantly. Perfect for developers working with query strings and APIs.',
  keywords: [
    'url encode', 'url decode', 'url encoder',
    'url decoder', 'percent encoding', 'encodeURIComponent',
    'query string encode', 'url tool online',
  ],
  authors: [{ name: 'MultiTools' }],
  creator: 'MultiTools',
  publisher: 'MultiTools',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://tools4u.vercel.app/dev-tools/url-encode',
    title: 'URL Encode / Decode Online',
    description: 'Free online URL encoder and decoder. Encode and decode URL components instantly.',
    siteName: 'MultiTools',
  },
  alternates: { canonical: 'https://tools4u.vercel.app/dev-tools/url-encode' },
};

const page = () => <UrlEncodeTool />;
export default page;
