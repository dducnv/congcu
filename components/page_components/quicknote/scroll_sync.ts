"use client";

import type React from "react";
import { useCallback, useEffect, useRef } from "react";

/**
 * Line-anchored scroll sync between the editor and the preview.
 *
 * The editor side maps scrollTop to a (fractional) source line using the
 * line-number gutter, whose rows have the measured height of every wrapped
 * line. The preview side uses the `data-line` attribute that every rendered
 * block carries, interpolating between neighbouring blocks. This keeps both
 * panes on the same content even when code blocks, tables or images make
 * the two sides very different in height.
 */

type Anchor = { line: number; top: number };

const EDITOR_PAD = 12; // .qn-textarea padding-top
const PREVIEW_PAD = 16; // .qn-preview padding-top

function rows(gutter: HTMLElement | null) {
  return (gutter?.children ?? []) as HTMLCollectionOf<HTMLElement>;
}

/** Source line (1-based, fractional) at the top of the editor viewport. */
function editorLineAt(ta: HTMLTextAreaElement, gutter: HTMLElement | null) {
  const r = rows(gutter);
  const n = r.length;
  if (!n) return 1;
  const y = ta.scrollTop + EDITOR_PAD;
  let lo = 0;
  let hi = n - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (r[mid].offsetTop <= y) lo = mid;
    else hi = mid - 1;
  }
  const row = r[lo];
  const frac = row.offsetHeight ? Math.min(1, Math.max(0, (y - row.offsetTop) / row.offsetHeight)) : 0;
  return lo + 1 + frac;
}

function editorTopFor(line: number, gutter: HTMLElement | null) {
  const r = rows(gutter);
  if (!r.length) return 0;
  const i = Math.min(r.length - 1, Math.max(0, Math.floor(line) - 1));
  const row = r[i];
  return row.offsetTop + (line - (i + 1)) * row.offsetHeight - EDITOR_PAD;
}

function collectAnchors(preview: HTMLElement): Anchor[] {
  const base = preview.getBoundingClientRect().top - preview.scrollTop;
  const out: Anchor[] = [];
  let lastLine = 0;
  let lastTop = -Infinity;
  preview.querySelectorAll<HTMLElement>("[data-line]").forEach((el) => {
    const line = Number(el.dataset.line);
    if (!line || line <= lastLine) return;
    const top = el.getBoundingClientRect().top - base;
    if (top < lastTop) return;
    out.push({ line, top });
    lastLine = line;
    lastTop = top;
  });
  return out;
}

function contentEnd(preview: HTMLElement) {
  return preview.scrollHeight - parseFloat(getComputedStyle(preview).paddingBottom || "0");
}

function previewTopFor(line: number, anchors: Anchor[], preview: HTMLElement, totalLines: number) {
  if (!anchors.length) return null;
  let lo = -1;
  for (let i = 0; i < anchors.length && anchors[i].line <= line; i++) lo = i;
  if (lo === -1) {
    const first = anchors[0];
    return PREVIEW_PAD + ((line - 1) / Math.max(1, first.line - 1)) * (first.top - PREVIEW_PAD);
  }
  const a = anchors[lo];
  const b = anchors[lo + 1] ?? { line: totalLines + 1, top: contentEnd(preview) };
  if (b.line <= a.line) return a.top;
  return a.top + ((line - a.line) / (b.line - a.line)) * (b.top - a.top);
}

function previewLineAt(preview: HTMLElement, anchors: Anchor[], totalLines: number) {
  if (!anchors.length) return null;
  const y = preview.scrollTop + PREVIEW_PAD;
  let lo = -1;
  for (let i = 0; i < anchors.length && anchors[i].top <= y; i++) lo = i;
  if (lo === -1) return 1;
  const a = anchors[lo];
  const b = anchors[lo + 1] ?? { line: totalLines + 1, top: contentEnd(preview) };
  if (b.top <= a.top) return a.line;
  return a.line + Math.min(1, (y - a.top) / (b.top - a.top)) * (b.line - a.line);
}

const maxScroll = (el: HTMLElement) => Math.max(0, el.scrollHeight - el.clientHeight);

export function useScrollSync(opts: {
  enabled: boolean;
  editorRef: React.MutableRefObject<HTMLTextAreaElement | null>;
  previewRef: React.RefObject<HTMLDivElement>;
  gutter: () => HTMLElement | null;
  totalLines: number;
  /** Changes whenever the rendered preview changes (text, font, theme…). */
  contentKey: unknown;
}) {
  const { enabled, editorRef, previewRef, gutter, totalLines, contentKey } = opts;
  const anchors = useRef<Anchor[] | null>(null);
  const expected = useRef<{ editor: number | null; preview: number | null }>({ editor: null, preview: null });
  const frame = useRef(0);
  const live = useRef({ enabled, totalLines, gutter });
  live.current = { enabled, totalLines, gutter };

  const getAnchors = useCallback(() => {
    const p = previewRef.current;
    if (!p) return [];
    if (!anchors.current) anchors.current = collectAnchors(p);
    return anchors.current;
  }, [previewRef]);

  const setScroll = (el: HTMLElement, which: "editor" | "preview", top: number) => {
    const v = Math.max(0, Math.min(maxScroll(el), Math.round(top)));
    if (Math.abs(el.scrollTop - v) < 1) return;
    expected.current[which] = v;
    el.scrollTop = v;
  };

  const fromEditor = useCallback(() => {
    const ta = editorRef.current;
    const p = previewRef.current;
    if (!live.current.enabled || !ta || !p) return;
    if (ta.scrollTop <= 0) return setScroll(p, "preview", 0);
    if (ta.scrollTop >= maxScroll(ta) - 1) return setScroll(p, "preview", maxScroll(p));
    const line = editorLineAt(ta, live.current.gutter());
    const top = previewTopFor(line, getAnchors(), p, live.current.totalLines);
    if (top === null) {
      setScroll(p, "preview", (ta.scrollTop / Math.max(1, maxScroll(ta))) * maxScroll(p));
    } else {
      setScroll(p, "preview", top - PREVIEW_PAD);
    }
  }, [editorRef, previewRef, getAnchors]);

  const fromPreview = useCallback(() => {
    const ta = editorRef.current;
    const p = previewRef.current;
    if (!live.current.enabled || !ta || !p) return;
    if (p.scrollTop <= 0) return setScroll(ta, "editor", 0);
    if (p.scrollTop >= maxScroll(p) - 1) return setScroll(ta, "editor", maxScroll(ta));
    const line = previewLineAt(p, getAnchors(), live.current.totalLines);
    if (line === null) {
      setScroll(ta, "editor", (p.scrollTop / Math.max(1, maxScroll(p))) * maxScroll(ta));
    } else {
      setScroll(ta, "editor", editorTopFor(line, live.current.gutter()));
    }
  }, [editorRef, previewRef, getAnchors]);

  const schedule = (fn: () => void) => {
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(fn);
  };

  const onEditorScroll = useCallback(() => {
    const ta = editorRef.current;
    if (!ta || !live.current.enabled) return;
    const exp = expected.current.editor;
    expected.current.editor = null;
    if (exp !== null && Math.abs(ta.scrollTop - exp) <= 1) return;
    schedule(fromEditor);
  }, [editorRef, fromEditor]);

  const onPreviewScroll = useCallback(() => {
    const p = previewRef.current;
    if (!p || !live.current.enabled) return;
    const exp = expected.current.preview;
    expected.current.preview = null;
    if (exp !== null && Math.abs(p.scrollTop - exp) <= 1) return;
    schedule(fromPreview);
  }, [previewRef, fromPreview]);

  // Rendered content changed: re-measure, then keep the preview on the editor's position.
  useEffect(() => {
    anchors.current = null;
    if (enabled) schedule(fromEditor);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentKey, enabled]);

  // Size changes (window, view switch), images loading and diagrams rendering
  // late all move blocks, so the cached positions are dropped.
  useEffect(() => {
    const p = previewRef.current;
    if (!p || !enabled) return;
    const reset = () => {
      anchors.current = null;
    };
    const ro = new ResizeObserver(reset);
    ro.observe(p);
    const mo = new MutationObserver(reset);
    mo.observe(p, { childList: true, subtree: true });
    p.addEventListener("load", reset, true);
    return () => {
      ro.disconnect();
      mo.disconnect();
      p.removeEventListener("load", reset, true);
    };
  }, [previewRef, enabled]);

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  return { onEditorScroll, onPreviewScroll, syncFromEditor: fromEditor };
}
