"use client";

import { useState, useRef, useCallback } from "react";
import QRCode from "qrcode";
import { TitlePage } from "@/components/title_page";
import { Container } from "@/components/container";

export default function QrGenerator() {
  const [text, setText] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [size, setSize] = useState(300);
  const [errorLevel, setErrorLevel] = useState<"L" | "M" | "Q" | "H">("M");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateQR = useCallback(async () => {
    if (!text.trim()) return;
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;
      await QRCode.toCanvas(canvas, text, {
        width: size,
        margin: 2,
        errorCorrectionLevel: errorLevel,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      });
      setQrDataUrl(canvas.toDataURL("image/png"));
    } catch (err) {
      console.error(err);
    }
  }, [text, size, errorLevel]);

  const downloadQR = () => {
    if (!qrDataUrl) return;
    const link = document.createElement("a");
    link.download = "qrcode.png";
    link.href = qrDataUrl;
    link.click();
  };

  return (
    <>
      <div className="h-16"></div>
      <Container width="max-w-2xl" className="p-6">
        <TitlePage>QR Code Generator</TitlePage>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Text or URL
            </label>
            <textarea
              className="w-full border border-black p-3 text-sm font-mono resize-none focus:outline-none"
              rows={3}
              placeholder="Enter text or URL..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>

          <div className="flex gap-4 flex-wrap">
            <div>
              <label className="block text-sm font-medium mb-1">Size</label>
              <select
                className="border border-black p-2 text-sm focus:outline-none"
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
              >
                <option value={200}>200px</option>
                <option value={300}>300px</option>
                <option value={400}>400px</option>
                <option value={500}>500px</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Error Correction
              </label>
              <select
                className="border border-black p-2 text-sm focus:outline-none"
                value={errorLevel}
                onChange={(e) =>
                  setErrorLevel(e.target.value as "L" | "M" | "Q" | "H")
                }
              >
                <option value="L">Low (7%)</option>
                <option value="M">Medium (15%)</option>
                <option value="Q">Quartile (25%)</option>
                <option value="H">High (30%)</option>
              </select>
            </div>
          </div>

          <button
            onClick={generateQR}
            disabled={!text.trim()}
            className="bg-black text-white px-6 py-2 text-sm font-medium hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Generate QR Code
          </button>

          <div className="flex flex-col items-center gap-4 pt-4">
            <canvas ref={canvasRef} className={qrDataUrl ? "" : "hidden"} />
            {qrDataUrl && (
              <button
                onClick={downloadQR}
                className="border border-black px-6 py-2 text-sm font-medium hover:bg-black hover:text-white transition-colors"
              >
                Download PNG
              </button>
            )}
          </div>
        </div>
      </Container>
    </>
  );
}
