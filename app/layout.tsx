import { Siderbar } from "@/components/base_components/sidebar";
import { GoogleAnalytics } from "@/components/google-analytics";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { SITE } from "@/core/seo/site";
import type { Metadata, Viewport } from "next";
import 'react-image-crop/dist/ReactCrop.css';
import 'tldraw/tldraw.css';
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: "MultiTools: Free Online Developer Tools", template: `%s | ${SITE.name}` },
  description: SITE.description,
  applicationName: SITE.name,
  authors: [{ name: "Nguyen Van Duc", url: "https://dducnv.github.io" }],
  creator: SITE.name,
  publisher: SITE.name,
  formatDetection: { telephone: false, email: false, address: false },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
  openGraph: {
    type: "website",
    locale: SITE.locale,
    siteName: SITE.name,
    url: SITE.url,
    images: [{ url: "/og/home", width: 1200, height: 630, alt: "MultiTools: free online tools that run in your browser" }],
  },
  twitter: { card: "summary_large_image", images: ["/og/home"] },
  appleWebApp: { title: SITE.name, capable: true, statusBarStyle: "default" },
  category: "technology",
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <SpeedInsights />
        <Analytics />
        <GoogleAnalytics />
      </head>
      <body className="h-screen overflow-hidden">
        <div className="flex h-full">
          <Siderbar />
          <div className="bg-primary lg:border-l border-black w-full overflow-auto">
            <div className="min-h-full">
              {children}
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
