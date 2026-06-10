"use client";

import { useState } from "react";
import { Container } from "@/components/container";
import { TitlePage } from "@/components/title_page";

export default function UrlEncodeTool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleConvert = (text: string, m: "encode" | "decode") => {
    setInput(text);
    setMode(m);
    setError("");
    if (!text.trim()) { setOutput(""); return; }
    try {
      setOutput(m === "encode" ? encodeURIComponent(text) : decodeURIComponent(text));
    } catch {
      setError(m === "decode" ? "Invalid encoded URL string" : "Encoding failed");
      setOutput("");
    }
  };

  const copy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  };

  const swap = () => {
    const newMode = mode === "encode" ? "decode" : "encode";
    handleConvert(output, newMode);
  };

  return (
    <>
      <div className="h-16" />
      <Container width="max-w-4xl" className="p-6">
        <TitlePage>URL Encode / Decode</TitlePage>

        <div className="flex gap-2 mb-4">
          {(["encode", "decode"] as const).map(m => (
            <button
              key={m}
              onClick={() => handleConvert(input, m)}
              className={`px-4 py-2 text-sm font-medium border border-black transition-colors ${mode === m ? "bg-black text-white" : "bg-white text-black hover:bg-gray-100"}`}
            >
              {m === "encode" ? "Encode" : "Decode"}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              {mode === "encode" ? "Text / URL" : "Encoded string"}
            </label>
            <textarea
              className="w-full h-64 border border-black p-3 text-sm font-mono resize-none focus:outline-none"
              placeholder={mode === "encode" ? "Enter text or URL to encode..." : "Enter encoded string to decode..."}
              value={input}
              onChange={e => handleConvert(e.target.value, mode)}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium">
                {mode === "encode" ? "Encoded" : "Decoded"}
              </label>
              <div className="flex gap-2">
                <button
                  onClick={swap}
                  disabled={!output}
                  className="text-xs border border-black px-2 py-1 hover:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  Swap
                </button>
                <button
                  onClick={copy}
                  disabled={!output}
                  className="text-xs border border-black px-2 py-1 hover:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </div>
            <textarea
              className="w-full h-64 border border-black p-3 text-sm font-mono resize-none focus:outline-none bg-gray-50"
              value={output}
              readOnly
              placeholder="Result..."
            />
          </div>
        </div>

        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </Container>
    </>
  );
}
