import type { Metadata } from "next";
import { Siderbar } from "@/components";

import "./globals.css";

// import "tui-image-editor/dist/tui-image-editor.css";

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
      <body className="max-h-screen h-screen overflow-hidden">
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
