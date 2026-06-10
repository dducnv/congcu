"use client";

import { useState, useEffect } from "react";
import { Container } from "@/components/container";
import { TitlePage } from "@/components/title_page";

export default function TimestampTool() {
  const [timestamp, setTimestamp] = useState("");
  const [dateStr, setDateStr] = useState("");
  const [now, setNow] = useState(Date.now());
  const [copied, setCopied] = useState("");
  const [unit, setUnit] = useState<"s" | "ms">("s");

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const fromTimestamp = (val: string) => {
    setTimestamp(val);
    const num = parseInt(val);
    if (isNaN(num)) { setDateStr(""); return; }
    const ms = unit === "s" ? num * 1000 : num;
    const d = new Date(ms);
    if (isNaN(d.getTime())) { setDateStr("Invalid"); return; }
    setDateStr(d.toISOString().replace("T", " ").replace("Z", " UTC"));
  };

  const fromDate = (val: string) => {
    setDateStr(val);
    const d = new Date(val);
    if (isNaN(d.getTime())) { setTimestamp(""); return; }
    setTimestamp(unit === "s" ? Math.floor(d.getTime() / 1000).toString() : d.getTime().toString());
  };

  const setNowTimestamp = () => {
    const val = unit === "s" ? Math.floor(Date.now() / 1000).toString() : Date.now().toString();
    setTimestamp(val);
    fromTimestamp(val);
  };

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(""), 1000);
  };

  const nowSec = Math.floor(now / 1000);
  const nowDate = new Date(now);

  const formats = [
    { label: "Unix (seconds)", value: nowSec.toString() },
    { label: "Unix (milliseconds)", value: now.toString() },
    { label: "ISO 8601", value: nowDate.toISOString() },
    { label: "UTC", value: nowDate.toUTCString() },
    { label: "Local", value: nowDate.toLocaleString() },
  ];

  return (
    <>
      <div className="h-16" />
      <Container width="max-w-4xl" className="p-6">
        <TitlePage>Timestamp Converter</TitlePage>

        {/* Current time */}
        <div className="border border-black bg-white p-4 mb-6">
          <h3 className="font-semibold text-sm mb-3">Current Time</h3>
          <div className="space-y-2">
            {formats.map(f => (
              <div key={f.label} className="flex items-center justify-between p-2 bg-gray-50 border border-gray-200">
                <span className="text-sm font-medium w-36">{f.label}</span>
                <code className="text-sm font-mono flex-1 ml-2">{f.value}</code>
                <button
                  onClick={() => copy(f.value, f.label)}
                  className="text-xs border border-black px-2 py-1 hover:bg-gray-100 ml-2"
                >
                  {copied === f.label ? "Copied" : "Copy"}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Converter */}
        <div className="border border-black bg-white p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm">Convert</h3>
            <div className="flex gap-2 items-center">
              <span className="text-xs">Unit:</span>
              {(["s", "ms"] as const).map(u => (
                <button
                  key={u}
                  onClick={() => { setUnit(u); setTimestamp(""); setDateStr(""); }}
                  className={`px-3 py-1 text-xs border border-black transition-colors ${unit === u ? "bg-black text-white" : "bg-white hover:bg-gray-100"}`}
                >
                  {u === "s" ? "Seconds" : "Milliseconds"}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-medium">Timestamp ({unit})</label>
                <button onClick={setNowTimestamp} className="text-xs border border-black px-2 py-1 hover:bg-gray-100">
                  Now
                </button>
              </div>
              <input
                type="text"
                value={timestamp}
                onChange={e => fromTimestamp(e.target.value)}
                className="w-full border border-black p-3 text-sm font-mono focus:outline-none"
                placeholder={unit === "s" ? "e.g. 1700000000" : "e.g. 1700000000000"}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Date / Time</label>
              <input
                type="text"
                value={dateStr}
                onChange={e => fromDate(e.target.value)}
                className="w-full border border-black p-3 text-sm font-mono focus:outline-none"
                placeholder="e.g. 2024-01-15 12:00:00"
              />
            </div>
          </div>

          {/* Quick reference */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="text-xs font-medium text-gray-500 mb-2">Quick reference</h4>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "1 hour ago", offset: -3600 },
                { label: "1 day ago", offset: -86400 },
                { label: "1 week ago", offset: -604800 },
                { label: "+1 hour", offset: 3600 },
                { label: "+1 day", offset: 86400 },
                { label: "+1 week", offset: 604800 },
              ].map(item => (
                <button
                  key={item.label}
                  onClick={() => {
                    const ts = (Math.floor(Date.now() / 1000) + item.offset).toString();
                    setUnit("s");
                    setTimestamp(ts);
                    const d = new Date(parseInt(ts) * 1000);
                    setDateStr(d.toISOString().replace("T", " ").replace("Z", " UTC"));
                  }}
                  className="text-xs border border-gray-300 px-2 py-1 hover:bg-gray-100"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </>
  );
}
