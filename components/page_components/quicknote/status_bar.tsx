"use client";

import { HELP_SECTIONS, shortcutFor, type CommandId, type GlobalId } from "./shortcuts";
import type { FontSizeMode, ReadingFont, ThemeMode } from "./types";

export const THEMES: Array<[ThemeMode, string, string]> = [
  ["light", "Light", "#ffffff"],
  ["sepia", "Sepia", "#f4ecd8"],
  ["lightgray", "Light gray", "#e8e8e8"],
  ["dark", "Dark", "#1e1e1e"],
  ["deepdark", "Deep dark", "#000000"],
];

const FONTS: Array<[FontSizeMode, string, string]> = [
  ["small", "A-", "Small text"],
  ["normal", "A", "Normal text"],
  ["large", "A+", "Large text"],
  ["xlarge", "A++", "Extra large text"],
];

const READING: Array<[ReadingFont, string, string]> = [
  ["sans", "Sans", "Be Vietnam Pro"],
  ["serif", "Serif", "Literata"],
];

export type Stats = { words: number; chars: number; minutes: number };

export function StatusBar(props: {
  line: number;
  col: number;
  selWords: number;
  selChars: number;
  stats: Stats;
  pending: boolean;
  savedAt: Date | null;
  saveFailed: boolean;
  theme: ThemeMode;
  fontSize: FontSizeMode;
  readingFont: ReadingFont;
  setTheme: (t: ThemeMode) => void;
  setFontSize: (f: FontSizeMode) => void;
  setReadingFont: (f: ReadingFont) => void;
  onHelp: () => void;
}) {
  const saved = props.saveFailed
    ? "Not saved: browser storage is full or blocked"
    : props.pending
      ? "Saving…"
      : props.savedAt
        ? `Saved ${props.savedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
        : "Saved";
  return (
    <div className="qn-status">
      <div className="qn-status-group">
        <span>
          Ln {props.line}, Col {props.col}
        </span>
        {props.selChars > 0 && (
          <span>
            Selected {props.selWords} {props.selWords === 1 ? "word" : "words"} · {props.selChars} chars
          </span>
        )}
        <span>
          {props.stats.words.toLocaleString()} words · {props.stats.chars.toLocaleString()} chars
          {props.stats.minutes > 0 ? ` · ~${props.stats.minutes} min read` : ""}
        </span>
        <span className={props.saveFailed ? "qn-error" : props.pending ? "" : "qn-ok"}>● {saved}</span>
      </div>
      <div className="qn-status-group">
        <span className="qn-hide-sm">Theme</span>
        <div className="qn-swatches" role="radiogroup" aria-label="Theme">
          {THEMES.map(([id, label, color]) => (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={props.theme === id}
              aria-label={label}
              title={label}
              className="qn-swatch"
              style={{ background: color }}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => props.setTheme(id)}
            />
          ))}
        </div>
        <div className="qn-sizes" role="radiogroup" aria-label="Preview font">
          {READING.map(([id, label, name]) => (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={props.readingFont === id}
              title={`Preview font: ${name}`}
              className={`qn-font-${id}`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => props.setReadingFont(id)}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="qn-sizes" role="radiogroup" aria-label="Font size">
          {FONTS.map(([id, label, name]) => (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={props.fontSize === id}
              title={name}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => props.setFontSize(id)}
            >
              {label}
            </button>
          ))}
        </div>
        <button type="button" className="qn-btn qn-btn-ghost qn-btn-xs" onClick={props.onHelp} title={`Keyboard shortcuts  ${shortcutFor("help")}`}>
          ? Shortcuts
        </button>
      </div>
    </div>
  );
}

export function ShortcutHelp({ onClose }: { onClose: () => void }) {
  return (
    <div className="qn-modal-backdrop" onMouseDown={onClose}>
      <div
        className="qn-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Keyboard shortcuts"
        onMouseDown={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
      >
        <div className="qn-modal-head">
          <h2>Keyboard shortcuts</h2>
          <button type="button" className="qn-btn qn-btn-ghost" onClick={onClose} autoFocus>
            Close
          </button>
        </div>
        <div className="qn-help-grid">
          {HELP_SECTIONS.map((s) => (
            <section key={s.title}>
              <h3>{s.title}</h3>
              <table>
                <tbody>
                  {s.items.map(([label, id]) => (
                    <tr key={label}>
                      <td>{label}</td>
                      <td>
                        <kbd>{id.startsWith("=") ? id.slice(1) : shortcutFor(id as CommandId | GlobalId)}</kbd>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
