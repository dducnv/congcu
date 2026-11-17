"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export type Match = { index: number; length: number };

function escapeRe(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function findMatches(text: string, term: string): Match[] {
  if (!term) return [];
  const out: Match[] = [];
  const re = new RegExp(escapeRe(term), "gi");
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) && out.length < 10000) {
    out.push({ index: m.index, length: m[0].length });
    if (m[0].length === 0) re.lastIndex++;
  }
  return out;
}

export function SearchPanel({
  text,
  onSelectMatch,
  onReplace,
  onReplaceAll,
  onClose,
}: {
  text: string;
  onSelectMatch: (m: Match) => void;
  onReplace: (m: Match, replacement: string) => void;
  onReplaceAll: (term: string, replacement: string) => number;
  onClose: () => void;
}) {
  const [term, setTerm] = useState("");
  const [replacement, setReplacement] = useState("");
  const [current, setCurrent] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const matches = useMemo(() => findMatches(text, term), [text, term]);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  useEffect(() => {
    setCurrent((c) => (matches.length ? Math.min(c, matches.length - 1) : 0));
  }, [matches.length]);

  const go = (dir: 1 | -1) => {
    if (!matches.length) return;
    const next = (current + dir + matches.length) % matches.length;
    setCurrent(next);
    onSelectMatch(matches[next]);
  };

  const keys = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") onClose();
    if (e.key === "Enter") {
      e.preventDefault();
      go(e.shiftKey ? -1 : 1);
    }
  };

  return (
    <div className="qn-bar qn-search" role="search">
      <input
        ref={inputRef}
        id="qn-search-term"
        className="qn-input"
        placeholder="Find"
        value={term}
        onChange={(e) => {
          setTerm(e.target.value);
          setCurrent(0);
        }}
        onKeyDown={keys}
        aria-label="Find"
      />
      <span className="qn-count">{matches.length ? `${current + 1}/${matches.length}` : term ? "No results" : "0/0"}</span>
      <button type="button" className="qn-btn qn-btn-outline" disabled={!matches.length} onClick={() => go(-1)} aria-label="Previous match">
        ↑
      </button>
      <button type="button" className="qn-btn qn-btn-outline" disabled={!matches.length} onClick={() => go(1)} aria-label="Next match">
        ↓
      </button>
      <input
        id="qn-search-replace"
        className="qn-input"
        placeholder="Replace with"
        value={replacement}
        onChange={(e) => setReplacement(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape") onClose();
          if (e.key === "Enter" && matches[current]) {
            e.preventDefault();
            onReplace(matches[current], replacement);
          }
        }}
        aria-label="Replace with"
      />
      <button type="button" className="qn-btn qn-btn-outline" disabled={!matches.length} onClick={() => matches[current] && onReplace(matches[current], replacement)}>
        Replace
      </button>
      <button type="button" className="qn-btn qn-btn-outline" disabled={!matches.length} onClick={() => onReplaceAll(term, replacement)}>
        Replace all
      </button>
      <button type="button" className="qn-btn qn-btn-ghost" onClick={onClose} aria-label="Close search">
        Close
      </button>
    </div>
  );
}
