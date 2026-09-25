import { TitlePage, Container } from "@/components";
import JsonLd from "@/components/seo/JsonLd";
import { Metadata } from "next";
import Link from "next/link";
import React from "react";

export const metadata: Metadata = {
  title: "About MultiTools - Privacy-First In-Browser Developer Utilities",
  description:
    "Learn about MultiTools: our mission to provide fast, 100% private, client-side developer and productivity utilities with zero data collection and zero server uploads.",
  alternates: {
    canonical: "https://tools4u.vercel.app/about",
  },
  openGraph: {
    title: "About MultiTools - Privacy-First In-Browser Utilities",
    description: "Fast, 100% private, client-side developer and productivity utilities.",
    url: "https://tools4u.vercel.app/about",
    siteName: "MultiTools",
  },
};

const aboutSchema = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  "name": "About MultiTools",
  "url": "https://tools4u.vercel.app/about",
  "description":
    "MultiTools provides fast, open-source, client-side web utilities for developers, designers, and everyday users.",
  "publisher": {
    "@type": "Organization",
    "name": "MultiTools",
    "url": "https://tools4u.vercel.app",
  },
};

const page = () => {
  return (
    <>
      <JsonLd data={aboutSchema} />
      <div className="h-16"></div>
      <Container width="max-w-3xl" className="p-6 text-black">
        <TitlePage>About MultiTools</TitlePage>

        <div className="space-y-6 text-sm leading-relaxed text-gray-800 mt-6">
          <section>
            <h2 className="text-lg font-bold mb-2">Our Mission: Privacy & Performance</h2>
            <p>
              MultiTools was built with a simple conviction: common developer utilities and productivity tools should run <strong>directly in your browser</strong> without forcing you to upload your confidential code, passwords, or data to third-party servers.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">Key Principles</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>100% Client-Side Processing:</strong> We utilize modern browser capabilities including WebAssembly, Web Crypto API, and HTML5 Canvas so your data never leaves your device.
              </li>
              <li>
                <strong>No Registration or Signups:</strong> Instant access to every tool without intrusive accounts or subscription walls.
              </li>
              <li>
                <strong>Zero Tracking:</strong> No tracking cookies, no surveillance, no data harvesting.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">Popular Tools</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <Link
                href="/create-qr"
                className="border border-black p-3 hover:bg-gray-50 transition-colors"
              >
                <div className="font-semibold text-black">QR Code Generator</div>
                <div className="text-xs text-gray-600 mt-1">Real-time client-side QR creator</div>
              </Link>
              <Link
                href="/dev-tools/csv-viewer"
                className="border border-black p-3 hover:bg-gray-50 transition-colors"
              >
                <div className="font-semibold text-black">Data & SQL Viewer</div>
                <div className="text-xs text-gray-600 mt-1">SQLite .db, SQL, CSV & Excel query engine</div>
              </Link>
              <Link
                href="/dev-tools/read-json"
                className="border border-black p-3 hover:bg-gray-50 transition-colors"
              >
                <div className="font-semibold text-black">JSON Formatter</div>
                <div className="text-xs text-gray-600 mt-1">Fix, validate, and compare JSON files</div>
              </Link>
              <Link
                href="/dev-tools/generate-secret-key"
                className="border border-black p-3 hover:bg-gray-50 transition-colors"
              >
                <div className="font-semibold text-black">Secret Key Generator</div>
                <div className="text-xs text-gray-600 mt-1">Cryptographic hashes & token generation</div>
              </Link>
            </div>
          </section>
        </div>
      </Container>
    </>
  );
};

export default page;
