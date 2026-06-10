import TimestampTool from "@/components/dev_tools/timestamp_tool";
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Timestamp Converter - Unix Epoch to Date | MultiTools',
  description: 'Free online Unix timestamp converter. Convert between Unix epoch timestamps and human-readable dates. Live clock, quick references, supports seconds and milliseconds.',
  keywords: [
    'unix timestamp', 'timestamp converter', 'epoch converter',
    'unix time', 'epoch to date', 'date to timestamp',
    'unix timestamp online', 'timestamp tool',
  ],
  authors: [{ name: 'MultiTools' }],
  creator: 'MultiTools',
  publisher: 'MultiTools',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://tools4u.vercel.app/dev-tools/timestamp',
    title: 'Timestamp Converter - Unix Epoch to Date',
    description: 'Free online Unix timestamp converter. Convert between timestamps and dates instantly.',
    siteName: 'MultiTools',
  },
  alternates: { canonical: 'https://tools4u.vercel.app/dev-tools/timestamp' },
};

const page = () => <TimestampTool />;
export default page;
