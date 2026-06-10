import Base64Tool from "@/components/dev_tools/base64_tool";
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Base64 Encode / Decode - Online Tool | MultiTools',
  description: 'Free online Base64 encoder and decoder. Convert text to Base64 and Base64 to text instantly. Supports UTF-8. No registration required.',
  keywords: [
    'base64 encode', 'base64 decode', 'base64 converter',
    'base64 online', 'text to base64', 'base64 to text',
    'base64 tool', 'encode decode online',
  ],
  authors: [{ name: 'MultiTools' }],
  creator: 'MultiTools',
  publisher: 'MultiTools',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://tools4u.vercel.app/dev-tools/base64',
    title: 'Base64 Encode / Decode Online',
    description: 'Free online Base64 encoder and decoder. Convert text to Base64 and back instantly.',
    siteName: 'MultiTools',
  },
  alternates: { canonical: 'https://tools4u.vercel.app/dev-tools/base64' },
};

const page = () => <Base64Tool />;
export default page;
