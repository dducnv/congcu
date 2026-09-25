import React from "react";
import Link from "next/link";

export default function QrInfoSection() {
  return (
    <article className="mt-12 border-t border-gray-300 pt-8 text-black">
      {/* 3-Step Guide */}
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-4 tracking-tight">
          How to Generate a QR Code Instantly
        </h2>
        <ol className="list-decimal pl-5 space-y-2 text-sm leading-relaxed text-gray-700">
          <li>
            <strong>Enter your text or URL:</strong> Type or paste any link, text snippet, contact detail, or WiFi credentials into the input box above.
          </li>
          <li>
            <strong>Real-time rendering:</strong> The QR code is generated automatically as you type or paste—no need to click any buttons.
          </li>
          <li>
            <strong>Customize & Download:</strong> Adjust the resolution (200px - 500px) or Error Correction level, then click <em>Download PNG</em> to save your image.
          </li>
        </ol>
      </section>

      {/* Feature & Privacy Assurance */}
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-4 tracking-tight">
          100% Client-Side Privacy & Security
        </h2>
        <p className="text-sm leading-relaxed text-gray-700 mb-3">
          Unlike most online QR generators that send your sensitive URLs or passwords to a remote tracking server or insert redirect links, MultiTools encodes data directly inside your browser using the HTML5 Canvas API.
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-sm text-gray-700">
          <li><strong>Zero Server Logging:</strong> Your data never leaves your device.</li>
          <li><strong>No Expiration:</strong> All generated QR codes are permanent static codes with unlimited lifetime scans.</li>
          <li><strong>High Compatibility:</strong> Fully scannable by native iOS Camera, Android Camera, Google Lens, and all barcode scanners.</li>
        </ul>
      </section>

      {/* Error Correction Levels */}
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-4 tracking-tight">
          Understanding Error Correction Levels
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="border border-black p-3 bg-white">
            <h3 className="font-semibold text-black">Low (L - 7%)</h3>
            <p className="text-gray-600 mt-1 text-xs leading-relaxed">
              Best for clean digital screens where the QR code will not be obscured. Produces the simplest pattern.
            </p>
          </div>
          <div className="border border-black p-3 bg-white">
            <h3 className="font-semibold text-black">Medium (M - 15%) - Recommended</h3>
            <p className="text-gray-600 mt-1 text-xs leading-relaxed">
              The standard choice for most documents, menus, flyers, and everyday sharing.
            </p>
          </div>
          <div className="border border-black p-3 bg-white">
            <h3 className="font-semibold text-black">Quartile (Q - 25%)</h3>
            <p className="text-gray-600 mt-1 text-xs leading-relaxed">
              Suitable for environments with moderate risk of smudges, low lighting, or partial obstructions.
            </p>
          </div>
          <div className="border border-black p-3 bg-white">
            <h3 className="font-semibold text-black">High (H - 30%)</h3>
            <p className="text-gray-600 mt-1 text-xs leading-relaxed">
              Maximum redundancy. Ideal for printed stickers, outdoor posters, or when overlaying custom logos.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-4 tracking-tight">
          Frequently Asked Questions (FAQ)
        </h2>
        <div className="space-y-3">
          <details className="border border-black p-3.5 bg-white group cursor-pointer">
            <summary className="font-medium text-sm list-none flex justify-between items-center select-none">
              <span>Do these QR codes have an expiration date?</span>
              <span className="text-xs transition-transform group-open:rotate-180">▼</span>
            </summary>
            <p className="mt-2 text-xs text-gray-600 leading-relaxed">
              No. MultiTools creates direct static QR codes. The encoded text or URL is permanently embedded into the matrix pattern and will work forever without relying on our server.
            </p>
          </details>

          <details className="border border-black p-3.5 bg-white group cursor-pointer">
            <summary className="font-medium text-sm list-none flex justify-between items-center select-none">
              <span>Can I use generated QR codes for commercial projects?</span>
              <span className="text-xs transition-transform group-open:rotate-180">▼</span>
            </summary>
            <p className="mt-2 text-xs text-gray-600 leading-relaxed">
              Yes, 100% free with no copyright restrictions or licensing fees. You can print them on packaging, business cards, merchandise, and digital advertising materials.
            </p>
          </details>

          <details className="border border-black p-3.5 bg-white group cursor-pointer">
            <summary className="font-medium text-sm list-none flex justify-between items-center select-none">
              <span>Is there any scan limit?</span>
              <span className="text-xs transition-transform group-open:rotate-180">▼</span>
            </summary>
            <p className="mt-2 text-xs text-gray-600 leading-relaxed">
              No scan limits whatsoever. Because the QR code is static and directly read by the scanning device, it can be scanned millions of times without restriction.
            </p>
          </details>
        </div>
      </section>

      {/* Internal Links for SEO Topic Clustering */}
      <section className="border-t border-gray-200 pt-6">
        <h3 className="text-sm font-semibold mb-3 text-gray-800">
          Explore Other Free Developer Tools
        </h3>
        <div className="flex flex-wrap gap-2 text-xs">
          <Link
            href="/dev-tools/read-json"
            className="border border-black px-3 py-1 hover:bg-black hover:text-white transition-colors"
          >
            JSON Formatter & Validator
          </Link>
          <Link
            href="/dev-tools/generate-secret-key"
            className="border border-black px-3 py-1 hover:bg-black hover:text-white transition-colors"
          >
            Secret Key & Hash Generator
          </Link>
          <Link
            href="/dev-tools/color-converter"
            className="border border-black px-3 py-1 hover:bg-black hover:text-white transition-colors"
          >
            Color Code Converter
          </Link>
          <Link
            href="/image-to-text"
            className="border border-black px-3 py-1 hover:bg-black hover:text-white transition-colors"
          >
            Image to Text (OCR)
          </Link>
          <Link
            href="/dev-tools/base64"
            className="border border-black px-3 py-1 hover:bg-black hover:text-white transition-colors"
          >
            Base64 Encoder/Decoder
          </Link>
        </div>
      </section>
    </article>
  );
}
