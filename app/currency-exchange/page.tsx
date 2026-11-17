import { TitlePage } from '@/components/title_page';
import { buildMetadata } from '@/core/seo/metadata';
import Link from 'next/link';

// Not built yet: kept out of search results and the sitemap until it works.
export const metadata = buildMetadata("/currency-exchange");

const page = () => {
  return (
    <>
      <div className="min-h-screen text-center px-4 pt-16">
        <TitlePage>Currency Converter: Coming Soon</TitlePage>
        <p className="text-gray-700">
          This tool is still being built. Try our <Link href="/percentity" className="underline">percentage calculator</Link> or{' '}
          <Link href="/" className="underline">browse all tools</Link>.
        </p>
      </div>
    </>
  );
};

export default page;