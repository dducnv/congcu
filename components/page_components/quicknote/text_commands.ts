// Pure text transforms. Every command takes the full text and the current
// selection and returns an Edit (or null when it does not apply). Nothing here
// touches the DOM, so the logic stays easy to reason about and test.
import type { Edit, Sel, TocItem } from "./types";

const NL = "\n";

// ---------- helpers ----------

function lineStartOf(text: string, pos: number) {
  return pos <= 0 ? 0 : text.lastIndexOf(NL, pos - 1) + 1;
}

function lineEndOf(text: string, pos: number) {
  const i = text.indexOf(NL, pos);
  return i === -1 ? text.length : i;
}

/** Range covering every line touched by the selection. */
export function lineBlock(text: string, sel: Sel) {
  const from = lineStartOf(text, sel.start);
  // A selection ending right after a newline should not pull in the next line.
  const endPos = sel.end > sel.start && text[sel.end - 1] === NL ? sel.end - 1 : sel.end;
  const to = lineEndOf(text, Math.max(endPos, from));
  return { from, to };
}

/** Apply `fn` to the lines touched by the selection. */
export function mapLines(text: string, sel: Sel, fn: (lines: string[]) => string[]): Edit {
  const { from, to } = lineBlock(text, sel);
  const block = text.slice(from, to);
  const out = fn(block.split(NL)).join(NL);
  if (sel.start === sel.end) {
    const caret = Math.max(from, Math.min(from + out.length, sel.start + (out.length - block.length)));
    return { from, to, insert: out, select: { start: caret, end: caret } };
  }
  return { from, to, insert: out, select: { start: from, end: from + out.length } };
}

/** Transform the selection, or the whole text when nothing is selected. */
export function mapSelectionOrAll(text: string, sel: Sel, fn: (s: string) => string): Edit {
  if (sel.start !== sel.end) {
    const out = fn(text.slice(sel.start, sel.end));
    return { from: sel.start, to: sel.end, insert: out, select: { start: sel.start, end: sel.start + out.length } };
  }
  const out = fn(text);
  const caret = Math.min(sel.start, out.length);
  return { from: 0, to: text.length, insert: out, select: { start: caret, end: caret } };
}

export function insertText(text: string, sel: Sel, s: string): Edit {
  const end = sel.start + s.length;
  return { from: sel.start, to: sel.end, insert: s, select: { start: end, end } };
}

/** Insert a block on its own line(s), separated from surrounding text by a blank line. */
export function insertBlock(text: string, sel: Sel, block: string, selectInBlock?: Sel): Edit {
  const before = text.slice(0, sel.start);
  const after = text.slice(sel.end);
  let lead = "";
  if (before.length && !before.endsWith(NL + NL)) lead = before.endsWith(NL) ? NL : NL + NL;
  let trail = "";
  if (after.length && !after.startsWith(NL + NL)) trail = after.startsWith(NL) ? NL : NL + NL;
  else if (!after.length) trail = NL;
  const insert = lead + block + trail;
  const base = sel.start + lead.length;
  const select = selectInBlock
    ? { start: base + selectInBlock.start, end: base + selectInBlock.end }
    : { start: base + block.length, end: base + block.length };
  return { from: sel.start, to: sel.end, insert, select };
}

// ---------- inline formatting ----------

function surroundedBy(text: string, start: number, end: number, open: string, close: string) {
  if (text.slice(start - open.length, start) !== open) return false;
  if (text.slice(end, end + close.length) !== close) return false;
  // A single "*" next to "**" belongs to bold, not italic.
  if (open === "*" && text[start - 2] === "*" && text[start - 3] !== "*") return false;
  return true;
}

/** Wrap the selection with open/close, or unwrap it when already wrapped. */
export function toggleWrap(text: string, sel: Sel, open: string, close: string, placeholder: string): Edit {
  const { start, end } = sel;
  const selected = text.slice(start, end);

  if (selected.length >= open.length + close.length && selected.startsWith(open) && selected.endsWith(close)) {
    const inner = selected.slice(open.length, selected.length - close.length);
    return { from: start, to: end, insert: inner, select: { start, end: start + inner.length } };
  }
  if (surroundedBy(text, start, end, open, close)) {
    const from = start - open.length;
    return {
      from,
      to: end + close.length,
      insert: selected,
      select: { start: from, end: from + selected.length },
    };
  }
  if (!selected.trim()) {
    const insert = selected + open + placeholder + close;
    const s = start + selected.length + open.length;
    return { from: start, to: end, insert, select: { start: s, end: s + placeholder.length } };
  }
  if (selected.includes(NL)) {
    // Markdown emphasis cannot span lines, so wrap each non-empty line.
    const out = selected
      .split(NL)
      .map((l) => {
        if (!l.trim()) return l;
        const lead = l.match(/^\s*/)![0];
        return lead + open + l.trim() + close;
      })
      .join(NL);
    return { from: start, to: end, insert: out, select: { start, end: start + out.length } };
  }
  const lead = selected.match(/^\s*/)![0];
  const trail = selected.match(/\s*$/)![0];
  const core = selected.slice(lead.length, selected.length - trail.length);
  const insert = lead + open + core + close + trail;
  const s = start + lead.length + open.length;
  return { from: start, to: end, insert, select: { start: s, end: s + core.length } };
}

export function inlineCode(text: string, sel: Sel): Edit {
  if (text.slice(sel.start, sel.end).includes(NL)) return codeBlock(text, sel);
  return toggleWrap(text, sel, "`", "`", "code");
}

export function codeBlock(text: string, sel: Sel): Edit {
  const selected = text.slice(sel.start, sel.end);
  if (selected) {
    const block = "```\n" + selected.replace(/\n$/, "") + "\n```";
    return insertBlock(text, sel, block, { start: 3, end: 3 });
  }
  return insertBlock(text, sel, "```\n\n```", { start: 4, end: 4 });
}

export function link(text: string, sel: Sel, url?: string): Edit {
  const { start, end } = sel;
  const selected = text.slice(start, end);
  if (url) {
    const label = selected || url;
    const insert = `[${label}](${url})`;
    return { from: start, to: end, insert, select: { start: start + insert.length, end: start + insert.length } };
  }
  if (/^https?:\/\/\S+$/.test(selected.trim())) {
    const insert = `[](${selected.trim()})`;
    return { from: start, to: end, insert, select: { start: start + 1, end: start + 1 } };
  }
  if (!selected) {
    const insert = "[link text](url)";
    return { from: start, to: end, insert, select: { start: start + 1, end: start + 10 } };
  }
  const insert = `[${selected}](url)`;
  const u = start + selected.length + 3;
  return { from: start, to: end, insert, select: { start: u, end: u + 3 } };
}

export function image(text: string, sel: Sel): Edit {
  const { start, end } = sel;
  const alt = text.slice(start, end) || "alt text";
  const insert = `![${alt}](url)`;
  const u = start + alt.length + 4;
  return { from: start, to: end, insert, select: { start: u, end: u + 3 } };
}

export function table(text: string, sel: Sel): Edit {
  const block = "| Column 1 | Column 2 | Column 3 |\n| --- | --- | --- |\n| Cell | Cell | Cell |\n| Cell | Cell | Cell |";
  return insertBlock(text, sel, block, { start: 2, end: 10 });
}

export function horizontalRule(text: string, sel: Sel): Edit {
  return insertBlock(text, sel, "---");
}

// ---------- line formatting ----------

/** Existing list / quote markers, after indentation has been removed. */
const MD_PREFIX = /^(?:[-*+•→]\s+\[[ xX]\]\s+|[-*+•→]\s+|\d+[.)]\s+|>\s?)/;

export function setHeading(text: string, sel: Sel, level: number): Edit {
  return mapLines(text, sel, (lines) => {
    const nonEmpty = lines.filter((l) => l.trim());
    const same = new RegExp(`^#{${level}}\\s`);
    const all = level > 0 && nonEmpty.length > 0 && nonEmpty.every((l) => same.test(l));
    return lines.map((l) => {
      if (!l.trim() && lines.length > 1) return l;
      const body = l.replace(/^#{1,6}\s+/, "");
      if (all || level === 0) return body;
      return "#".repeat(level) + " " + body;
    });
  });
}

export type ListKind = "ul" | "ol" | "task" | "quote";

const LIST_TEST: Record<ListKind, RegExp> = {
  ul: /^\s*[-*+]\s+(?!\[[ xX]\])/,
  ol: /^\s*\d+[.)]\s+/,
  task: /^\s*[-*+]\s+\[[ xX]\]\s+/,
  quote: /^\s*>/,
};

/** Markdown list / quote toggle. Converts between kinds and renumbers ordered lists. */
export function toggleList(text: string, sel: Sel, kind: ListKind): Edit {
  return mapLines(text, sel, (lines) => {
    const nonEmpty = lines.filter((l) => l.trim());
    const all = nonEmpty.length > 0 && nonEmpty.every((l) => LIST_TEST[kind].test(l));
    let n = 0;
    return lines.map((l) => {
      if (!l.trim() && lines.length > 1) return kind === "quote" && !all ? ">" : l;
      const indent = l.match(/^\s*/)![0];
      const body = l.slice(indent.length).replace(MD_PREFIX, "");
      if (all) return indent + body;
      n += 1;
      const p = kind === "ul" ? "- " : kind === "ol" ? `${n}. ` : kind === "task" ? "- [ ] " : "> ";
      return indent + p + body;
    });
  });
}

/**
 * Plain-text line prefixes (the old "Format" tools). Existing markers are
 * replaced. `null` removes the marker, "number" numbers non-empty lines.
 */
export function setLinePrefix(text: string, sel: Sel, prefix: string | "number" | null): Edit {
  return mapLines(text, sel, (lines) => {
    let n = 0;
    return lines.map((l) => {
      if (!l.trim()) return l;
      const indent = l.match(/^[ \t]*/)![0];
      const body = l.trim().replace(MD_PREFIX, "");
      if (prefix === null) return indent + body;
      if (prefix === "number") {
        n += 1;
        return ` ${n}. ${body}`;
      }
      return prefix + body;
    });
  });
}

export function indentLines(text: string, sel: Sel, dir: 1 | -1): Edit {
  return mapLines(text, sel, (lines) =>
    lines.map((l) => {
      if (dir > 0) return l.trim() || lines.length === 1 ? "\t" + l : l;
      return l.replace(/^(\t| {1,4})/, "");
    }),
  );
}

export function isListLine(text: string, pos: number) {
  const line = text.slice(lineStartOf(text, pos), lineEndOf(text, pos));
  return /^\s*(?:[-*+•]\s|\d+[.)]\s|>)/.test(line);
}

// ---------- typing helpers ----------

const LIST_CONT = /^(\s*)([-*+•→]\s+\[[ xX]\]\s+|[-*+•→]\s+|(\d+)([.)])\s+|>\s?)/;

/** Enter inside a list item: continue the list, or leave it on an empty item. */
export function continueList(text: string, sel: Sel): Edit | null {
  if (sel.start !== sel.end) return null;
  const ls = lineStartOf(text, sel.start);
  const le = lineEndOf(text, sel.start);
  const m = text.slice(ls, sel.start).match(LIST_CONT);
  if (!m) return null;
  if (inCodeFence(text, ls)) return null;
  const rest = text.slice(ls + m[0].length, le);
  if (!rest.trim()) {
    return { from: ls, to: le, insert: "", select: { start: ls, end: ls } };
  }
  let marker = m[2];
  if (m[3]) marker = `${parseInt(m[3], 10) + 1}${m[4]} `;
  else if (/\[[ xX]\]/.test(marker)) marker = marker.replace(/\[[ xX]\]/, "[ ]");
  const insert = NL + m[1] + marker;
  const caret = sel.start + insert.length;
  return { from: sel.start, to: sel.start, insert, select: { start: caret, end: caret } };
}

function inCodeFence(text: string, pos: number) {
  const before = text.slice(0, pos);
  const fences = before.match(/^\s*(```|~~~)/gm);
  return !!fences && fences.length % 2 === 1;
}

const PAIRS: Record<string, string> = { "`": "`", "*": "*", _: "_", "~": "~", "[": "]", "(": ")", '"': '"' };
const AUTO_CLOSE = new Set(["`", "[", "("]);
const CLOSERS = new Set(["`", "]", ")"]);

/** Typing a pair character: wrap a selection, auto-close, or step over a closer. */
export function autoPair(text: string, sel: Sel, key: string): Edit | null {
  const { start, end } = sel;
  if (start !== end && PAIRS[key]) {
    const selected = text.slice(start, end);
    const insert = key + selected + PAIRS[key];
    return { from: start, to: end, insert, select: { start: start + 1, end: start + 1 + selected.length } };
  }
  if (start !== end) return null;
  if (CLOSERS.has(key) && text[start] === key) {
    return { from: start, to: start, insert: "", select: { start: start + 1, end: start + 1 } };
  }
  if (AUTO_CLOSE.has(key)) {
    const next = text[start];
    if (next === undefined || /[\s)\]}.,;:!?]/.test(next)) {
      return { from: start, to: start, insert: key + PAIRS[key], select: { start: start + 1, end: start + 1 } };
    }
  }
  return null;
}

/** Backspace between an empty auto-closed pair removes both characters. */
export function deletePair(text: string, sel: Sel): Edit | null {
  const { start, end } = sel;
  if (start !== end || start === 0) return null;
  const open = text[start - 1];
  if (AUTO_CLOSE.has(open) && text[start] === PAIRS[open]) {
    return { from: start - 1, to: start + 1, insert: "", select: { start: start - 1, end: start - 1 } };
  }
  return null;
}

// ---------- case & cleanup ----------

export const toUpper = (s: string) => s.toUpperCase();
export const toLower = (s: string) => s.toLowerCase();
// Built with RegExp() because the project's TS target (ES5) rejects the `u` flag in literals.
const TITLE_RE = new RegExp("(^|[\\s\\-–—([\"'])(\\p{L})", "gu");
const SENTENCE_RE = new RegExp("(^\\s*\\p{L}|[.!?]\\s+\\p{L}|\\n\\s*(?:[-*+•]\\s+|\\d+[.)]\\s+|#+\\s+)?\\p{L})", "gu");

export const toTitle = (s: string) => s.toLowerCase().replace(TITLE_RE, (_, a: string, b: string) => a + b.toUpperCase());
export const toSentence = (s: string) => s.toLowerCase().replace(SENTENCE_RE, (c) => c.toUpperCase());
export const capitalizeLines = (s: string) =>
  s
    .split(NL)
    .map((line) => {
      const m = line.match(/^(\s*(?:[-*+•]\s+|\d+[.)]\s+|#+\s+|>\s*)?)(.*)$/)!;
      const t = m[2];
      return t ? m[1] + t.charAt(0).toUpperCase() + t.slice(1).toLowerCase() : line;
    })
    .join(NL);

export const cleanSpaces = (s: string) =>
  s
    .split(NL)
    .map((l) => {
      const indent = l.match(/^[ \t]*/)![0];
      return indent + l.slice(indent.length).replace(/[ \t]+/g, " ").trimEnd();
    })
    .join(NL)
    .replace(/\n{3,}/g, "\n\n");

export const joinLines = (s: string) =>
  s
    .split(NL)
    .map((l) => l.trim())
    .filter(Boolean)
    .join(" ");

export const removeBlankLines = (s: string) =>
  s
    .split(NL)
    .filter((l) => l.trim())
    .join(NL);

export const sortLines = (s: string) =>
  s
    .split(NL)
    .slice()
    .sort((a, b) => a.trim().localeCompare(b.trim(), undefined, { numeric: true, sensitivity: "base" }))
    .join(NL);

export const dedupeLines = (s: string) => {
  const seen = new Set<string>();
  return s
    .split(NL)
    .filter((l) => {
      const k = l.trim();
      if (!k) return true;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    })
    .join(NL);
};

/** Remove markdown syntax, keeping readable plain text. */
export function stripMarkdown(s: string) {
  return s
    .replace(/^\s*(```|~~~).*$/gm, "")
    .replace(/^ {0,3}#{1,6}\s+/gm, "")
    .replace(/^ {0,3}(?:-{3,}|\*{3,}|_{3,})\s*$/gm, "")
    .replace(/^(\s*)>\s?/gm, "$1")
    .replace(/^(\s*[-*+]\s+)\[ \]\s+/gm, "$1☐ ")
    .replace(/^(\s*[-*+]\s+)\[[xX]\]\s+/gm, "$1☑ ")
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\((?:#qn-tab:)?[^)]*\)/g, "$1")
    .replace(/\[\[([^\]]+)\]\]/g, "$1")
    .replace(/(\*\*|__)(?=\S)([\s\S]*?\S)\1/g, "$2")
    .replace(/(^|[^*\w])([*_])(?=\S)([^*_\n]*?\S)\2(?![*\w])/g, "$1$3")
    .replace(/~~(?=\S)([\s\S]*?\S)~~/g, "$1")
    .replace(/`([^`\n]+)`/g, "$1")
    .replace(/<\/?mark>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// ---------- misc ----------

export function timestamp(d = new Date()) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Headings outside code fences, with 1-based source line numbers. */
export function extractToc(text: string): TocItem[] {
  const items: TocItem[] = [];
  let fence = false;
  text.split(NL).forEach((line, i) => {
    if (/^\s*(```|~~~)/.test(line)) {
      fence = !fence;
      return;
    }
    if (fence) return;
    const m = line.match(/^ {0,3}(#{1,6})\s+(.+?)\s*#*\s*$/);
    if (m) {
      items.push({
        level: m[1].length,
        text: m[2].replace(/[*_`~]|<\/?mark>/g, "").replace(/\[([^\]]+)\]\([^)]*\)/g, "$1"),
        line: i + 1,
      });
    }
  });
  return items;
}

/** Toggle "[ ]" / "[x]" on a 1-based source line. Returns the new text, or null. */
export function toggleTaskAtLine(text: string, line: number): Edit | null {
  let from = 0;
  for (let i = 1; i < line; i++) {
    const nl = text.indexOf(NL, from);
    if (nl === -1) return null;
    from = nl + 1;
  }
  const to = lineEndOf(text, from);
  const src = text.slice(from, to);
  const m = src.match(/^(\s*(?:>\s*)*(?:[-*+]|\d+[.)])\s+)\[( |x|X)\]/);
  if (!m) return null;
  const pos = from + m[1].length + 1;
  const next = m[2] === " " ? "x" : " ";
  return { from: pos, to: pos + 1, insert: next, select: { start: pos + 1, end: pos + 1 } };
}

export function countWords(s: string) {
  const t = s.trim();
  return t ? t.split(/\s+/).length : 0;
}
