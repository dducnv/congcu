"use client";

import { decryptData, encryptData } from "@/core/utils";
import { useCallback, useDeferredValue, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { applyEdit, applyToString, downloadBlob, pickFiles, safeFileName } from "./dom_edit";
import { LineGutter } from "./line_gutter";
import { MarkdownPreview } from "./markdown_preview";
import "./quicknote.css";
import { SearchPanel, findMatches, type Match } from "./search_panel";
import { matchEditorShortcut, matchGlobalShortcut, type CommandId } from "./shortcuts";
import { ShortcutHelp, StatusBar } from "./status_bar";
import { TabBar } from "./tab_bar";
import * as T from "./text_commands";
import { CommandBar, MarkdownBar, TextBar } from "./toolbars";
import type { Edit, Sel, ViewMode } from "./types";
import { TooltipView, ToastView, useToast, useTooltip } from "./ui";
import { useNotes } from "./use_notes";

type Fn = (text: string, sel: Sel) => Edit | null;

const COMMANDS: Record<CommandId, Fn> = {
  bold: (t, s) => T.toggleWrap(t, s, "**", "**", "bold text"),
  italic: (t, s) => T.toggleWrap(t, s, "*", "*", "italic text"),
  strike: (t, s) => T.toggleWrap(t, s, "~~", "~~", "text"),
  highlight: (t, s) => T.toggleWrap(t, s, "<mark>", "</mark>", "highlight"),
  inlineCode: T.inlineCode,
  h1: (t, s) => T.setHeading(t, s, 1),
  h2: (t, s) => T.setHeading(t, s, 2),
  h3: (t, s) => T.setHeading(t, s, 3),
  paragraph: (t, s) => T.setHeading(t, s, 0),
  ul: (t, s) => T.toggleList(t, s, "ul"),
  ol: (t, s) => T.toggleList(t, s, "ol"),
  task: (t, s) => T.toggleList(t, s, "task"),
  quote: (t, s) => T.toggleList(t, s, "quote"),
  link: (t, s) => T.link(t, s),
  image: T.image,
  table: T.table,
  codeBlock: T.codeBlock,
  hr: T.horizontalRule,
  indent: (t, s) => T.indentLines(t, s, 1),
  outdent: (t, s) => T.indentLines(t, s, -1),
  upper: (t, s) => T.mapSelectionOrAll(t, s, T.toUpper),
  lower: (t, s) => T.mapSelectionOrAll(t, s, T.toLower),
  title: (t, s) => T.mapSelectionOrAll(t, s, T.toTitle),
  sentence: (t, s) => T.mapSelectionOrAll(t, s, T.toSentence),
  capLines: (t, s) => T.mapSelectionOrAll(t, s, T.capitalizeLines),
  pfxBullet: (t, s) => T.setLinePrefix(t, s, " • "),
  pfxDash: (t, s) => T.setLinePrefix(t, s, " - "),
  pfxPlus: (t, s) => T.setLinePrefix(t, s, " + "),
  pfxStar: (t, s) => T.setLinePrefix(t, s, " * "),
  pfxNumber: (t, s) => T.setLinePrefix(t, s, "number"),
  pfxSpace: (t, s) => T.setLinePrefix(t, s, " "),
  pfxTab: (t, s) => T.setLinePrefix(t, s, "\t"),
  pfxRemove: (t, s) => T.setLinePrefix(t, s, null),
  cleanSpaces: (t, s) => T.mapSelectionOrAll(t, s, T.cleanSpaces),
  joinLines: (t, s) => T.mapSelectionOrAll(t, s, T.joinLines),
  removeBlank: (t, s) => T.mapSelectionOrAll(t, s, T.removeBlankLines),
  sort: (t, s) => T.mapSelectionOrAll(t, s, T.sortLines),
  dedupe: (t, s) => T.mapSelectionOrAll(t, s, T.dedupeLines),
  stripMd: (t, s) => T.mapSelectionOrAll(t, s, T.stripMarkdown),
  time: (t, s) => T.insertText(t, s, T.timestamp() + " "),
};

/** Commands that act on the whole tab when nothing is selected. */
const WHOLE_TAB = new Set<CommandId>(["upper", "lower", "title", "sentence", "capLines", "cleanSpaces", "joinLines", "removeBlank", "sort", "dedupe", "stripMd"]);

const COMMAND_LABEL: Partial<Record<CommandId, string>> = {
  upper: "UPPERCASE", lower: "lowercase", title: "Title Case", sentence: "Sentence case", capLines: "Cap lines",
  cleanSpaces: "Clean spaces", joinLines: "Join lines", removeBlank: "Remove blank", sort: "Sort", dedupe: "Dedupe", stripMd: "Strip MD",
};

const VIEWS: ViewMode[] = ["write", "split", "read"];
const TEXT_FILE = /\.(md|markdown|mdx|txt|text)$/i;
const BACKUP_PREFIX = "U2FsdGVkX1";

function tryDecryptBackup(content: string): unknown[] | null {
  const data = content.trim();
  if (!data.startsWith(BACKUP_PREFIX)) return null;
  try {
    const d = decryptData(data, process.env.PRIVATE_KEY as string);
    if (d == null) return null;
    const v = typeof d === "string" ? JSON.parse(d) : d;
    return Array.isArray(v) ? v : null;
  } catch {
    return null;
  }
}

function stamp(d = new Date()) {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}`;
}

const EXPORT_CSS = `body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:800px;margin:40px auto;padding:0 20px;line-height:1.7;color:#1a1a1a}
h1{border-bottom:1px solid #e5e7eb;padding-bottom:.3rem}h2{border-bottom:1px solid #f3f4f6;padding-bottom:.2rem}
code{font-family:'SF Mono',Consolas,monospace;font-size:.85em;background:#f3f4f6;padding:.15rem .35rem;border-radius:3px;border:1px solid #e5e7eb}
pre{background:#0d1117;color:#e6edf3;padding:1rem;border-radius:6px;overflow-x:auto}pre code{background:none;border:none;padding:0;color:inherit}
.hljs-keyword,.hljs-built_in,.hljs-type{color:#ff7b72}.hljs-string,.hljs-attr{color:#a5d6ff}.hljs-number,.hljs-literal{color:#79c0ff}.hljs-comment{color:#8b949e}.hljs-title{color:#d2a8ff}
blockquote{border-left:3px solid #d1d5db;padding-left:1rem;color:#6b7280;margin:.75rem 0}
table{width:100%;border-collapse:collapse;margin:.75rem 0}th{background:#f9fafb;text-align:left;padding:.5rem .75rem;border:1px solid #d1d5db}
td{padding:.5rem .75rem;border:1px solid #e5e7eb}a{color:#2563eb}hr{border:none;border-top:1px solid #d1d5db;margin:1.25rem 0}
img{max-width:100%}li:has(>input[type=checkbox]){list-style:none}input[type=checkbox]{margin-right:.4rem}del{color:#9ca3af}mark{background:#fff1a8}`;

function escapeHtml(s: string) {
  return s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c] as string);
}

/** True when the element is not rendered (e.g. the editor in Read view). */
function isHidden(el: HTMLElement) {
  return el.getClientRects().length === 0;
}

export const TextareaQuicknote = () => {
  const notes = useNotes();
  const { prefs, setPrefs, active, activeId, updateNotes, importTabs, openTabs, restoreTab, setActiveId, flush, addTab: addNoteTab, closeTab: closeNoteTab } = notes;
  const view = prefs.view;
  const tabsRef = useRef(notes.tabs);
  tabsRef.current = notes.tabs;

  const rootRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement | null>(null);
  const [ta, setTa] = useState<HTMLTextAreaElement | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const syncing = useRef(false);
  const focusNext = useRef(false);
  const dragDepth = useRef(0);
  const viewState = useRef<Record<string, { start: number; end: number; top: number }>>({});

  const tip = useTooltip(rootRef);
  const { toast, show, dismiss } = useToast();
  const [searchOpen, setSearchOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [cursor, setCursor] = useState({ line: 1, col: 1, selWords: 0, selChars: 0 });

  const text = active?.notes ?? "";
  const deferredText = useDeferredValue(text);
  const toc = useMemo(() => T.extractToc(deferredText), [deferredText]);
  const stats = useMemo(() => {
    const words = T.countWords(deferredText);
    return { words, chars: deferredText.length, minutes: words ? Math.ceil(words / 200) : 0 };
  }, [deferredText]);

  const setTextarea = useCallback((el: HTMLTextAreaElement | null) => {
    taRef.current = el;
    setTa(el);
  }, []);

  // ----- cursor & per-tab view state -----
  const updateCursor = useCallback(() => {
    const el = taRef.current;
    if (!el) return;
    const s = el.selectionStart;
    const e = el.selectionEnd;
    const before = el.value.slice(0, s);
    const line = before.split("\n").length;
    const col = s - (before.lastIndexOf("\n") + 1) + 1;
    const selected = el.value.slice(s, e);
    setCursor({ line, col, selWords: T.countWords(selected), selChars: selected.length });
    if (activeId) viewState.current[activeId] = { start: s, end: e, top: el.scrollTop };
  }, [activeId]);

  useLayoutEffect(() => {
    const el = taRef.current;
    if (!el || !activeId) return;
    const v = viewState.current[activeId];
    if (v) {
      const len = el.value.length;
      el.setSelectionRange(Math.min(v.start, len), Math.min(v.end, len));
      el.scrollTop = v.top;
    }
    if (focusNext.current) {
      focusNext.current = false;
      el.focus();
    }
    updateCursor();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId, ta]);

  // ----- editing -----
  const apply = useCallback(
    (fn: Fn) => {
      const el = taRef.current;
      if (!el || !activeId) return false;
      const sel = { start: el.selectionStart, end: el.selectionEnd };
      const edit = fn(el.value, sel);
      if (!edit) return false;
      if (isHidden(el)) {
        // Editor hidden (Read view): change the text directly.
        updateNotes(activeId, applyToString(el.value, edit));
      } else {
        applyEdit(el, edit);
        updateCursor();
      }
      return true;
    },
    [activeId, updateNotes, updateCursor],
  );

  const history = useCallback((kind: "undo" | "redo") => {
    const el = taRef.current;
    if (!el || isHidden(el)) return;
    el.focus();
    document.execCommand(kind);
  }, []);

  const run = useCallback(
    (id: CommandId) => {
      const el = taRef.current;
      const wasEmptySel = !!el && el.selectionStart === el.selectionEnd;
      const changed = apply(COMMANDS[id]);
      if (changed && WHOLE_TAB.has(id) && wasEmptySel) {
        show(`${COMMAND_LABEL[id]} applied to the whole tab`, { action: { label: "Undo", run: () => history("undo") } });
      }
    },
    [apply, history, show],
  );

  const insert = useCallback((s: string) => apply((t, sel) => T.insertText(t, sel, s)), [apply]);
  const insertTemplate = useCallback(
    (s: string) => apply((t, sel) => (t.trim() ? T.insertBlock(t, sel, s.trimEnd()) : { from: 0, to: t.length, insert: s, select: { start: s.length, end: s.length } })),
    [apply],
  );

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.nativeEvent.isComposing || e.keyCode === 229) return;
    const el = e.currentTarget;
    const sel = { start: el.selectionStart, end: el.selectionEnd };
    const mod = e.metaKey || e.ctrlKey;

    const cmd = matchEditorShortcut(e);
    if (cmd) {
      e.preventDefault();
      run(cmd);
      return;
    }
    if (e.key === "Tab" && !mod && !e.altKey) {
      e.preventDefault();
      if (e.shiftKey) apply((t, s) => T.indentLines(t, s, -1));
      else if ((sel.start !== sel.end && el.value.slice(sel.start, sel.end).includes("\n")) || T.isListLine(el.value, sel.start)) {
        apply((t, s) => T.indentLines(t, s, 1));
      } else apply((t, s) => T.insertText(t, s, "\t"));
      return;
    }
    if (e.key === "Enter" && !e.shiftKey && !mod && !e.altKey) {
      const edit = T.continueList(el.value, sel);
      if (edit) {
        e.preventDefault();
        applyEdit(el, edit);
        updateCursor();
      }
      return;
    }
    if (e.key === "Backspace" && !mod && !e.altKey) {
      const edit = T.deletePair(el.value, sel);
      if (edit) {
        e.preventDefault();
        applyEdit(el, edit);
      }
      return;
    }
    if (!mod && !e.altKey && e.key.length === 1) {
      const edit = T.autoPair(el.value, sel, e.key);
      if (edit) {
        e.preventDefault();
        applyEdit(el, edit);
        updateCursor();
      }
    }
  };

  const onPaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const el = e.currentTarget;
    if (el.selectionStart === el.selectionEnd) return;
    const pasted = e.clipboardData.getData("text/plain").trim();
    if (!/^https?:\/\/\S+$/.test(pasted)) return;
    e.preventDefault();
    apply((t, s) => T.link(t, s, pasted));
  };

  // ----- files -----
  const saveFile = useCallback(
    (asTxt: boolean) => {
      if (!active) return;
      if (!active.notes) return show("This tab is empty, nothing to save");
      const base = active.ext ?? "md";
      const ext = asTxt ? (base === "txt" ? "md" : "txt") : base;
      const name = `${safeFileName(active.file_name)}.${ext}`;
      downloadBlob(name, new Blob([active.notes], { type: "text/plain;charset=utf-8" }));
      show(`Downloaded ${name}`);
    },
    [active, show],
  );

  const restoreFrom = useCallback(
    (data: unknown[]) => {
      const n = importTabs(data);
      show(n ? `Restored ${n} ${n === 1 ? "tab" : "tabs"}` : "The backup has no notes", n ? {} : { tone: "error" });
    },
    [importTabs, show],
  );

  const importFiles = useCallback(
    async (files: File[]) => {
      const opened: Array<{ file_name: string; notes: string; ext: "md" | "txt" }> = [];
      const skipped: string[] = [];
      let backup: unknown[] | null = null;
      for (const f of files) {
        if (!(TEXT_FILE.test(f.name) || f.type.startsWith("text/")) || f.size > 5 * 1024 * 1024) {
          skipped.push(f.name);
          continue;
        }
        let content = "";
        try {
          content = await f.text();
        } catch {
          skipped.push(f.name);
          continue;
        }
        if (/\.txt$/i.test(f.name)) {
          const b = tryDecryptBackup(content);
          if (b) {
            backup = b;
            continue;
          }
        }
        opened.push({
          file_name: f.name.replace(/\.[^.]+$/, "") || f.name,
          notes: content.replace(/\r\n?/g, "\n"),
          ext: /\.(txt|text)$/i.test(f.name) ? "txt" : "md",
        });
      }
      if (opened.length) {
        focusNext.current = true;
        openTabs(opened);
      }
      const found = backup;
      if (found) {
        show(`Found a Quick Note backup with ${found.length} tabs`, { action: { label: "Restore", run: () => restoreFrom(found) } });
        return;
      }
      const parts: string[] = [];
      if (opened.length) parts.push(`Opened ${opened.length} ${opened.length === 1 ? "file" : "files"}`);
      if (skipped.length) parts.push(`Skipped ${skipped.join(", ")}: only .md and .txt files can be opened`);
      if (parts.length) show(parts.join(" · "), !opened.length ? { tone: "error" } : {});
    },
    [openTabs, restoreFrom, show],
  );

  const openFiles = useCallback(async () => {
    const files = await pickFiles(".md,.markdown,.mdx,.txt,text/plain,text/markdown", true);
    if (files.length) importFiles(files);
  }, [importFiles]);

  const backup = () => {
    try {
      const data = encryptData(JSON.stringify(notes.tabs), process.env.PRIVATE_KEY as string);
      downloadBlob(`quicknote-backup-${stamp()}.txt`, new Blob([data], { type: "text/plain" }));
      show(`Backed up ${notes.tabs.length} ${notes.tabs.length === 1 ? "tab" : "tabs"}`);
    } catch {
      show("Backup failed. Try again after reloading the page.", { tone: "error" });
    }
  };

  const restore = async () => {
    const [file] = await pickFiles(".txt", false);
    if (!file) return;
    const data = tryDecryptBackup(await file.text());
    if (!data) return show("This file is not a Quick Note backup, or it was made by another site.", { tone: "error" });
    restoreFrom(data);
  };

  const cleanPreviewHtml = () => {
    const node = previewRef.current;
    if (!node) return "";
    const clone = node.cloneNode(true) as HTMLElement;
    clone.querySelectorAll('[data-export="skip"]').forEach((n) => n.remove());
    clone.querySelectorAll("input[type=checkbox]").forEach((n) => n.setAttribute("disabled", ""));
    return clone.innerHTML;
  };

  const exportHtml = () => {
    if (!active?.notes.trim()) return show("This tab is empty, nothing to export");
    const title = escapeHtml(active.file_name);
    const html = `<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n<title>${title}</title>\n<style>${EXPORT_CSS}</style>\n</head>\n<body>\n${cleanPreviewHtml()}\n</body>\n</html>`;
    downloadBlob(`${safeFileName(active.file_name)}.html`, new Blob([html], { type: "text/html;charset=utf-8" }));
    show(`Downloaded ${safeFileName(active.file_name)}.html`);
  };

  const copy = async (kind: "md" | "text" | "rich") => {
    if (!text.trim()) return show("This tab is empty, nothing to copy");
    const plain = T.stripMarkdown(text);
    try {
      if (kind === "md") await navigator.clipboard.writeText(text);
      else if (kind === "text") await navigator.clipboard.writeText(plain);
      else {
        try {
          await navigator.clipboard.write([
            new ClipboardItem({
              "text/html": new Blob([cleanPreviewHtml()], { type: "text/html" }),
              "text/plain": new Blob([plain], { type: "text/plain" }),
            }),
          ]);
        } catch {
          await navigator.clipboard.writeText(plain);
          return show("Copied as plain text. This browser does not allow rich text copy.");
        }
      }
      show(kind === "md" ? "Copied markdown" : kind === "text" ? "Copied plain text" : "Copied rich text");
    } catch {
      show("The browser blocked clipboard access", { tone: "error" });
    }
  };

  // ----- tabs -----
  const addTab = useCallback(() => {
    focusNext.current = true;
    addNoteTab();
  }, [addNoteTab]);

  const closeTab = useCallback(
    (id: string) => {
      const res = closeNoteTab(id);
      if (res && res.tab.notes.trim()) {
        show(`Closed "${res.tab.file_name}"`, { action: { label: "Undo", run: () => restoreTab(res.tab, res.index) } });
      }
    },
    [closeNoteTab, restoreTab, show],
  );

  const openTabByName = useCallback(
    (name: string) => {
      const hit = tabsRef.current.find((t) => t.file_name.toLowerCase() === name.toLowerCase());
      if (hit) setActiveId(hit.id);
      else show(`No tab named "${name}"`, { action: { label: "Create it", run: () => addNoteTab({ file_name: name }) } });
    },
    [addNoteTab, setActiveId, show],
  );

  // ----- preview interactions -----
  const toggleTask = useCallback((line: number) => apply((t) => T.toggleTaskAtLine(t, line)), [apply]);

  const jumpToLine = useCallback(
    (line: number) => {
      if (view !== "write") {
        previewRef.current?.querySelector(`[data-line="${line}"]`)?.scrollIntoView({ block: "start", behavior: "smooth" });
      }
      const el = taRef.current;
      if (!el || isHidden(el)) return;
      let pos = 0;
      for (let i = 1; i < line; i++) pos = el.value.indexOf("\n", pos) + 1;
      el.focus({ preventScroll: true });
      el.setSelectionRange(pos, pos);
      const row = rootRef.current?.querySelector(".qn-gutter-inner")?.children[line - 1] as HTMLElement | undefined;
      if (row) el.scrollTop = Math.max(0, row.offsetTop - 12);
      updateCursor();
    },
    [view, updateCursor],
  );

  // ----- scroll sync (split view) -----
  const syncScroll = (from: HTMLElement | null, to: HTMLElement | null) => {
    if (view !== "split" || syncing.current || !from || !to) return;
    syncing.current = true;
    const ratio = from.scrollTop / Math.max(1, from.scrollHeight - from.clientHeight);
    to.scrollTop = ratio * (to.scrollHeight - to.clientHeight);
    requestAnimationFrame(() => {
      syncing.current = false;
    });
  };

  // ----- search -----
  const selectMatch = useCallback((m: Match) => {
    const el = taRef.current;
    if (!el || isHidden(el)) return;
    el.focus({ preventScroll: true });
    el.setSelectionRange(m.index, m.index + m.length);
    const line = el.value.slice(0, m.index).split("\n").length;
    const row = rootRef.current?.querySelector(".qn-gutter-inner")?.children[line - 1] as HTMLElement | undefined;
    if (row) el.scrollTop = Math.max(0, row.offsetTop - el.clientHeight / 3);
    document.getElementById("qn-search-term")?.focus({ preventScroll: true });
  }, []);

  const replaceMatch = useCallback(
    (m: Match, rep: string) => apply(() => ({ from: m.index, to: m.index + m.length, insert: rep, select: { start: m.index + rep.length, end: m.index + rep.length } })),
    [apply],
  );

  const replaceAll = useCallback(
    (term: string, rep: string) => {
      const matches = findMatches(text, term);
      if (!matches.length) return 0;
      let out = "";
      let last = 0;
      for (const m of matches) {
        out += text.slice(last, m.index) + rep;
        last = m.index + m.length;
      }
      out += text.slice(last);
      apply(() => ({ from: 0, to: text.length, insert: out, select: { start: 0, end: 0 } }));
      show(`Replaced ${matches.length} ${matches.length === 1 ? "match" : "matches"}`);
      return matches.length;
    },
    [apply, show, text],
  );

  // ----- global shortcuts -----
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (helpOpen) setHelpOpen(false);
        return;
      }
      const id = matchGlobalShortcut(e);
      if (!id) return;
      e.preventDefault();
      switch (id) {
        case "save":
          flush();
          show("Saved in this browser", { action: { label: `Download .${active?.ext ?? "md"}`, run: () => saveFile(false) } });
          break;
        case "open":
          openFiles();
          break;
        case "search":
          if (searchOpen) {
            const input = document.getElementById("qn-search-term") as HTMLInputElement | null;
            input?.focus();
            input?.select();
          } else setSearchOpen(true);
          break;
        case "cycleView":
          setPrefs({ view: VIEWS[(VIEWS.indexOf(view) + 1) % VIEWS.length] });
          break;
        case "help":
          setHelpOpen((v) => !v);
          break;
        case "fullscreen":
          setFullscreen((v) => !v);
          break;
        case "newTab":
          addTab();
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active?.ext, addTab, flush, helpOpen, openFiles, saveFile, searchOpen, setPrefs, show, view]);

  // ----- drag & drop -----
  const hasFiles = (e: React.DragEvent) => Array.from(e.dataTransfer.types).includes("Files");
  const dragHandlers = {
    onDragEnter: (e: React.DragEvent) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      dragDepth.current += 1;
      setDragging(true);
    },
    onDragOver: (e: React.DragEvent) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = "copy";
    },
    onDragLeave: (e: React.DragEvent) => {
      if (!hasFiles(e)) return;
      dragDepth.current = Math.max(0, dragDepth.current - 1);
      if (!dragDepth.current) setDragging(false);
    },
    onDrop: (e: React.DragEvent) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      dragDepth.current = 0;
      setDragging(false);
      importFiles(Array.from(e.dataTransfer.files));
    },
  };

  const showEditor = view !== "read";
  const showPreview = view !== "write";

  return (
    <div
      ref={rootRef}
      className={`qn-root${fullscreen ? " is-fullscreen" : ""}`}
      data-qn-theme={prefs.theme}
      data-qn-font={prefs.fontSize}
      {...dragHandlers}
    >
      {!notes.loaded || !active ? (
        <div className="qn-loading">Loading notes…</div>
      ) : (
        <>
          <CommandBar
            view={view}
            setView={(v) => setPrefs({ view: v })}
            showToc={prefs.showToc}
            toggleToc={() => setPrefs({ showToc: !prefs.showToc })}
            searchOpen={searchOpen}
            toggleSearch={() => setSearchOpen((v) => !v)}
            fullscreen={fullscreen}
            toggleFullscreen={() => setFullscreen((v) => !v)}
            onOpen={openFiles}
            onSave={saveFile}
            onExportHtml={exportHtml}
            onBackup={backup}
            onRestore={restore}
            onCopy={copy}
            saveExt={active.ext ?? "md"}
          />
          <TabBar
            tabs={notes.tabs}
            activeId={activeId}
            pending={notes.pending}
            onSelect={notes.setActiveId}
            onClose={closeTab}
            onRename={notes.renameTab}
            onAdd={addTab}
          />
          <MarkdownBar run={run} history={history} />
          <TextBar run={run} insert={insert} insertTemplate={insertTemplate} />
          {searchOpen && (
            <SearchPanel
              text={text}
              onSelectMatch={selectMatch}
              onReplace={replaceMatch}
              onReplaceAll={replaceAll}
              onClose={() => {
                setSearchOpen(false);
                taRef.current?.focus();
              }}
            />
          )}

          <div className="qn-work">
            {prefs.showToc && (
              <nav className="qn-toc" aria-label="Table of contents">
                <div className="qn-toc-title">Contents</div>
                {toc.length ? (
                  toc.map((item) => (
                    <button
                      key={`${item.line}-${item.text}`}
                      type="button"
                      className="qn-toc-item"
                      style={{ paddingLeft: 8 + (item.level - 1) * 12 }}
                      onClick={() => jumpToLine(item.line)}
                      title={item.text}
                    >
                      {item.text}
                    </button>
                  ))
                ) : (
                  <p className="qn-muted qn-toc-empty">Headings (# Title) show up here.</p>
                )}
              </nav>
            )}

            <div className="qn-panes" data-view={view}>
              <div className="qn-pane qn-editor-pane" hidden={!showEditor}>
                <div className="qn-editor-wrap">
                  <LineGutter text={text} textarea={ta} activeLine={cursor.line} fontKey={prefs.fontSize} />
                  <textarea
                    key={activeId}
                    ref={setTextarea}
                    className="qn-textarea qn-editor-font"
                    value={text}
                    onChange={(e) => updateNotes(activeId, e.target.value)}
                    onKeyDown={onKeyDown}
                    onPaste={onPaste}
                    onSelect={updateCursor}
                    onScroll={(e) => {
                      if (activeId) viewState.current[activeId] = { start: e.currentTarget.selectionStart, end: e.currentTarget.selectionEnd, top: e.currentTarget.scrollTop };
                      syncScroll(e.currentTarget, previewRef.current);
                    }}
                    spellCheck
                    aria-label={`Note: ${active.file_name}`}
                    placeholder={"Start writing. Markdown works here: # Heading, **bold**, - list, - [ ] task.\nDrop .md or .txt files anywhere to open them."}
                  />
                </div>
              </div>
              <div className="qn-pane qn-preview-pane" hidden={!showPreview}>
                <MarkdownPreview
                  ref={previewRef}
                  markdown={deferredText}
                  className="qn-preview prose-quicknote"
                  onToggleTask={toggleTask}
                  onOpenTab={openTabByName}
                  onScroll={(e) => syncScroll(e.currentTarget, taRef.current)}
                />
              </div>
            </div>
          </div>

          <StatusBar
            line={cursor.line}
            col={cursor.col}
            selWords={cursor.selWords}
            selChars={cursor.selChars}
            stats={stats}
            pending={notes.pending}
            savedAt={notes.savedAt}
            saveFailed={notes.saveFailed}
            theme={prefs.theme}
            fontSize={prefs.fontSize}
            setTheme={(t) => setPrefs({ theme: t })}
            setFontSize={(f) => setPrefs({ fontSize: f })}
            onHelp={() => setHelpOpen(true)}
          />
        </>
      )}

      {dragging && (
        <div className="qn-drop" aria-hidden>
          <div className="qn-drop-inner">
            <div className="qn-drop-arrow">↓</div>
            <div className="qn-drop-title">Drop files to open</div>
            <div className="qn-muted">Each file opens in its own tab. Several files at once work too.</div>
            <div className="qn-drop-types">
              <span>.md</span>
              <span>.markdown</span>
              <span>.txt</span>
              <span>backup</span>
            </div>
          </div>
        </div>
      )}
      {helpOpen && <ShortcutHelp onClose={() => setHelpOpen(false)} />}
      <ToastView toast={toast} onDismiss={dismiss} />
      <TooltipView tip={tip} />
    </div>
  );
};
