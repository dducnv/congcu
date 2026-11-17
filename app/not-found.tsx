import { TitlePage } from "@/components/title_page";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

const page = () => {
  return (
    <div className="min-h-screen h-screen flex flex-col justify-center items-center w-full gap-4 px-4 text-center">
      <TitlePage>404 Not Found</TitlePage>
      <p className="text-gray-700">This page does not exist or has moved.</p>
      <Link href="/" className="border border-black bg-white px-4 py-2 hover:bg-black hover:text-white transition-colors">
        Browse all tools
      </Link>
    </div>
  );
};

export default page;
