import type { Metadata } from "next";
import { Siderbar } from "@/components";

import "./globals.css";
import 'react-image-crop/dist/ReactCrop.css';

export const metadata: Metadata = {
  title: "Công cụ nhanh",
  description: "Công cụ nhanh",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="max-h-screen h-screen ove">
        <div className="flex">
          <Siderbar />
          <div className="bg-primary lg:border-l border-black w-full">
            <div className=" min-h-screen  mx-auto py-10  w-11/12">
              {children}
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
