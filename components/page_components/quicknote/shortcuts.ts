// Keyboard shortcuts. Matching uses `event.code` so they work the same on
// every keyboard layout and with Option/Alt held on macOS.
import type React from "react";

export type CommandId =
  | "bold" | "italic" | "strike" | "inlineCode" | "highlight"
  | "h1" | "h2" | "h3" | "paragraph"
  | "ul" | "ol" | "task" | "quote"
  | "link" | "image" | "table" | "codeBlock" | "hr"
  | "indent" | "outdent"
  | "upper" | "lower" | "title" | "sentence" | "capLines"
  | "pfxBullet" | "pfxDash" | "pfxPlus" | "pfxStar" | "pfxNumber" | "pfxSpace" | "pfxTab" | "pfxRemove"
  | "cleanSpaces" | "joinLines" | "removeBlank" | "sort" | "dedupe" | "stripMd"
  | "time";

export type GlobalId = "save" | "open" | "search" | "cycleView" | "help" | "fullscreen" | "newTab";

type Combo = { mod?: boolean; ctrl?: boolean; shift?: boolean; alt?: boolean; code: string };

const isMac = () => typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);

const EDITOR: Array<[CommandId, Combo]> = [
  ["bold", { mod: true, code: "KeyB" }],
  ["italic", { mod: true, code: "KeyI" }],
  ["inlineCode", { mod: true, code: "KeyE" }],
  ["link", { mod: true, code: "KeyK" }],
  ["joinLines", { mod: true, code: "KeyJ" }],
  ["strike", { mod: true, shift: true, code: "KeyX" }],
  ["highlight", { mod: true, shift: true, code: "KeyH" }],
  ["codeBlock", { mod: true, shift: true, code: "KeyE" }],
  ["ul", { mod: true, shift: true, code: "Digit8" }],
  ["ol", { mod: true, shift: true, code: "Digit7" }],
  ["task", { mod: true, shift: true, code: "Digit9" }],
  ["quote", { mod: true, shift: true, code: "Period" }],
  ["upper", { mod: true, shift: true, code: "KeyU" }],
  ["lower", { mod: true, shift: true, code: "KeyL" }],
  ["time", { mod: true, shift: true, code: "Semicolon" }],
  ["h1", { mod: true, alt: true, code: "Digit1" }],
  ["h2", { mod: true, alt: true, code: "Digit2" }],
  ["h3", { mod: true, alt: true, code: "Digit3" }],
  ["paragraph", { mod: true, alt: true, code: "Digit0" }],
  // Line prefixes from the previous version (Ctrl+Shift on every platform).
  ["pfxBullet", { ctrl: true, shift: true, code: "KeyB" }],
  ["pfxDash", { ctrl: true, shift: true, code: "KeyD" }],
  ["pfxPlus", { ctrl: true, shift: true, code: "KeyP" }],
  ["pfxStar", { ctrl: true, shift: true, code: "KeyA" }],
  ["pfxNumber", { ctrl: true, shift: true, code: "KeyN" }],
  ["pfxSpace", { ctrl: true, shift: true, code: "KeyS" }],
  ["pfxTab", { ctrl: true, shift: true, code: "KeyT" }],
];

const GLOBAL: Array<[GlobalId, Combo]> = [
  ["save", { mod: true, code: "KeyS" }],
  ["open", { mod: true, code: "KeyO" }],
  ["search", { mod: true, code: "KeyF" }],
  ["cycleView", { mod: true, code: "Backslash" }],
  ["help", { mod: true, code: "Slash" }],
  ["fullscreen", { mod: true, shift: true, code: "KeyF" }],
  ["newTab", { mod: true, alt: true, code: "KeyN" }],
];

function matches(e: KeyboardEvent | React.KeyboardEvent, c: Combo) {
  if (e.code !== c.code) return false;
  if (!!e.shiftKey !== !!c.shift || !!e.altKey !== !!c.alt) return false;
  if (c.ctrl) return e.ctrlKey && !e.metaKey;
  if (c.mod) return isMac() ? e.metaKey && !e.ctrlKey : e.ctrlKey && !e.metaKey;
  return !e.ctrlKey && !e.metaKey;
}

export function matchEditorShortcut(e: KeyboardEvent | React.KeyboardEvent): CommandId | null {
  // On Windows Ctrl+Shift is both "mod+shift" and the legacy prefix combo;
  // the lists do not overlap on letters, so first match wins safely.
  for (const [id, c] of EDITOR) if (matches(e, c)) return id;
  return null;
}

export function matchGlobalShortcut(e: KeyboardEvent): GlobalId | null {
  for (const [id, c] of GLOBAL) if (matches(e, c)) return id;
  return null;
}

const KEY_LABEL: Record<string, string> = {
  Digit0: "0", Digit1: "1", Digit2: "2", Digit3: "3", Digit7: "7", Digit8: "8", Digit9: "9",
  Period: ".", Semicolon: ";", Backslash: "\\", Slash: "/",
};

export function comboLabel(c: Combo) {
  const mac = isMac();
  const key = KEY_LABEL[c.code] ?? c.code.replace(/^Key/, "");
  const parts: string[] = [];
  if (c.ctrl) parts.push(mac ? "⌃" : "Ctrl+");
  if (c.mod) parts.push(mac ? "⌘" : "Ctrl+");
  if (c.alt) parts.push(mac ? "⌥" : "Alt+");
  if (c.shift) parts.push(mac ? "⇧" : "Shift+");
  return parts.join("") + key;
}

export function shortcutFor(id: CommandId | GlobalId): string {
  const hit = [...EDITOR, ...GLOBAL].find(([k]) => k === id);
  return hit ? comboLabel(hit[1]) : "";
}

/** "Bold  ⌘B" style label for tooltips. */
export function tipFor(label: string, id?: CommandId | GlobalId) {
  const k = id ? shortcutFor(id) : "";
  return k ? `${label}  ${k}` : label;
}

export const HELP_SECTIONS: Array<{ title: string; items: Array<[string, CommandId | GlobalId | string]> }> = [
  {
    title: "Formatting",
    items: [
      ["Bold", "bold"], ["Italic", "italic"], ["Strikethrough", "strike"], ["Inline code", "inlineCode"],
      ["Highlight", "highlight"], ["Link", "link"], ["Code block", "codeBlock"],
      ["Heading 1 / 2 / 3", "h1"], ["Normal text", "paragraph"],
    ],
  },
  {
    title: "Lists",
    items: [
      ["Bullet list", "ul"], ["Numbered list", "ol"], ["Checklist", "task"], ["Quote", "quote"],
      ["Continue list", "=Enter"], ["Exit list", "=Enter on an empty item"], ["New line without bullet", "=Shift+Enter"],
      ["Indent / outdent lines", "=Tab / Shift+Tab"],
    ],
  },
  {
    title: "Text",
    items: [
      ["UPPERCASE", "upper"], ["lowercase", "lower"], ["Join lines", "joinLines"], ["Insert date & time", "time"],
      ["Prefix • - + * 1. space tab", "=Ctrl+Shift+B D P A N S T"],
    ],
  },
  {
    title: "App",
    items: [
      ["Saved to browser", "save"], ["Open files", "open"], ["Search & replace", "search"],
      ["Write / Split / Read", "cycleView"], ["Full screen", "fullscreen"], ["New tab", "newTab"], ["This list", "help"],
    ],
  },
];
