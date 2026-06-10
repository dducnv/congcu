"use client";

import { useState, useMemo } from "react";
import { Container } from "@/components/container";
import { TitlePage } from "@/components/title_page";

interface MatchInfo {
  full: string;
  index: number;
  groups: string[];
}

export default function RegexTester() {
  const [pattern, setPattern] = useState("");
  const [flags, setFlags] = useState("g");
  const [testStr, setTestStr] = useState("");
  const [copied, setCopied] = useState(false);

  const flagOptions = [
    { flag: "g", label: "Global" },
    { flag: "i", label: "Case insensitive" },
    { flag: "m", label: "Multiline" },
    { flag: "s", label: "Dotall" },
  ];

  const toggleFlag = (f: string) => {
    setFlags(prev => prev.includes(f) ? prev.replace(f, "") : prev + f);
  };

  const { regex, error } = useMemo(() => {
    if (!pattern) return { regex: null, error: "" };
    try {
      return { regex: new RegExp(pattern, flags), error: "" };
    } catch (e: any) {
      return { regex: null, error: e.message };
    }
  }, [pattern, flags]);

  const matches: MatchInfo[] = useMemo(() => {
    if (!regex || !testStr) return [];
    const result: MatchInfo[] = [];
    if (flags.includes("g")) {
      let m;
      const re = new RegExp(pattern, flags);
      while ((m = re.exec(testStr)) !== null) {
        result.push({ full: m[0], index: m.index, groups: m.slice(1) });
        if (m[0].length === 0) re.lastIndex++;
      }
    } else {
      const m = regex.exec(testStr);
      if (m) result.push({ full: m[0], index: m.index, groups: m.slice(1) });
    }
    return result;
  }, [regex, testStr, pattern, flags]);

  const highlightedHtml = useMemo(() => {
    if (!regex || !testStr || matches.length === 0) return null;
    const parts: { text: string; highlight: boolean }[] = [];
    let lastIdx = 0;

    const re = new RegExp(pattern, flags.includes("g") ? flags : flags + "g");
    let m;
    while ((m = re.exec(testStr)) !== null) {
      if (m.index > lastIdx) {
        parts.push({ text: testStr.slice(lastIdx, m.index), highlight: false });
      }
      parts.push({ text: m[0], highlight: true });
      lastIdx = m.index + m[0].length;
      if (m[0].length === 0) { re.lastIndex++; lastIdx = re.lastIndex; }
      if (!flags.includes("g")) break;
    }
    if (lastIdx < testStr.length) {
      parts.push({ text: testStr.slice(lastIdx), highlight: false });
    }
    return parts;
  }, [regex, testStr, matches.length, pattern, flags]);

  const copy = () => {
    const text = `/${pattern}/${flags}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  };

  const presets = [
    { label: "Email", pattern: "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}" },
    { label: "URL", pattern: "https?:\\/\\/[\\w\\-._~:/?#\\[\\]@!$&'()*+,;=%]+" },
    { label: "Phone", pattern: "\\+?\\d[\\d\\s\\-()]{7,}" },
    { label: "IPv4", pattern: "\\b\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\b" },
    { label: "Hex color", pattern: "#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})\\b" },
  ];

  return (
    <>
      <div className="h-16" />
      <Container width="max-w-4xl" className="p-6">
        <TitlePage>Regex Tester</TitlePage>

        {/* Pattern input */}
        <div className="border border-black bg-white p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg font-mono text-gray-400">/</span>
            <input
              type="text"
              value={pattern}
              onChange={e => setPattern(e.target.value)}
              className="flex-1 border border-black px-3 py-2 text-sm font-mono focus:outline-none"
              placeholder="Enter regex pattern..."
            />
            <span className="text-lg font-mono text-gray-400">/</span>
            <span className="font-mono text-sm w-10">{flags}</span>
            <button
              onClick={copy}
              className="text-xs border border-black px-2 py-1 hover:bg-gray-100"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>

          {/* Flags */}
          <div className="flex flex-wrap gap-2">
            {flagOptions.map(f => (
              <button
                key={f.flag}
                onClick={() => toggleFlag(f.flag)}
                className={`text-xs px-3 py-1 border transition-colors ${flags.includes(f.flag) ? "border-black bg-black text-white" : "border-gray-300 hover:bg-gray-100"}`}
              >
                {f.flag} - {f.label}
              </button>
            ))}
          </div>

          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>

        {/* Presets */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="text-xs text-gray-500 leading-6">Presets:</span>
          {presets.map(p => (
            <button
              key={p.label}
              onClick={() => setPattern(p.pattern)}
              className="text-xs border border-gray-300 px-2 py-1 hover:bg-gray-100"
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Test string */}
        <div className="border border-black bg-white p-4 mb-4">
          <label className="block text-sm font-medium mb-2">Test String</label>
          <textarea
            className="w-full h-40 border border-black p-3 text-sm font-mono resize-none focus:outline-none"
            value={testStr}
            onChange={e => setTestStr(e.target.value)}
            placeholder="Enter test string..."
          />
        </div>

        {/* Highlighted result */}
        {highlightedHtml && highlightedHtml.length > 0 && (
          <div className="border border-black bg-white p-4 mb-4">
            <h3 className="text-sm font-medium mb-2">Highlighted Matches</h3>
            <div className="p-3 bg-gray-50 border border-gray-200 font-mono text-sm whitespace-pre-wrap break-all">
              {highlightedHtml.map((part, i) =>
                part.highlight ? (
                  <mark key={i} className="bg-yellow-200 px-0.5 rounded">{part.text}</mark>
                ) : (
                  <span key={i}>{part.text}</span>
                )
              )}
            </div>
          </div>
        )}

        {/* Match details */}
        <div className="border border-black bg-white p-4">
          <h3 className="text-sm font-medium mb-2">
            Matches ({matches.length})
          </h3>
          {matches.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-4">
              {!pattern ? "Enter a regex pattern" : !testStr ? "Enter a test string" : "No matches found"}
            </p>
          ) : (
            <div className="space-y-1 max-h-60 overflow-auto">
              {matches.map((m, i) => (
                <div key={i} className="flex items-start gap-3 p-2 bg-gray-50 border border-gray-200 text-sm">
                  <span className="text-xs text-gray-400 w-6 shrink-0">#{i + 1}</span>
                  <code className="font-mono text-black flex-1 break-all">{m.full}</code>
                  <span className="text-xs text-gray-500 shrink-0">idx: {m.index}</span>
                  {m.groups.length > 0 && (
                    <span className="text-xs text-blue-600 shrink-0">
                      groups: {m.groups.map((g, j) => `$${j + 1}="${g}"`).join(", ")}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </Container>
    </>
  );
}
