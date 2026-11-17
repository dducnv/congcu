import type { Edit } from "./types";

function isHigh(c: number) {
  return c >= 0xd800 && c <= 0xdbff;
}
function isLow(c: number) {
  return c >= 0xdc00 && c <= 0xdfff;
}

/**
 * Apply an Edit to the textarea through the browser's editing commands so that
 * Cmd/Ctrl+Z keeps working. Only the part that actually changed is replaced,
 * which keeps undo steps small and the scroll position stable.
 */
export function applyEdit(ta: HTMLTextAreaElement, e: Edit) {
  ta.focus();
  const value = ta.value;
  const cur = value.slice(e.from, e.to);

  if (cur !== e.insert) {
    let p = 0;
    const max = Math.min(cur.length, e.insert.length);
    while (p < max && cur.charCodeAt(p) === e.insert.charCodeAt(p)) p++;
    if (p > 0 && isHigh(cur.charCodeAt(p - 1))) p--;
    let s = 0;
    while (s < max - p && cur.charCodeAt(cur.length - 1 - s) === e.insert.charCodeAt(e.insert.length - 1 - s)) s++;
    if (s > 0 && isLow(cur.charCodeAt(cur.length - s))) s--;

    const from = e.from + p;
    const to = e.to - s;
    const insert = e.insert.slice(p, e.insert.length - s);

    let ok = false;
    if (document.activeElement === ta) {
      ta.setSelectionRange(from, to);
      try {
        ok = insert === "" ? document.execCommand("delete") : document.execCommand("insertText", false, insert);
      } catch {
        ok = false;
      }
    }
    if (!ok || ta.value === value) {
      // Fallback without native undo (hidden textarea, old browsers).
      ta.setRangeText(insert, from, to, "end");
      ta.dispatchEvent(new Event("input", { bubbles: true }));
    }
  }
  ta.setSelectionRange(e.select.start, e.select.end);
}

/** Apply an Edit to a string (used when the editor is not on screen). */
export function applyToString(text: string, e: Edit) {
  return text.slice(0, e.from) + e.insert + text.slice(e.to);
}

export function downloadBlob(name: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function pickFiles(accept: string, multiple: boolean): Promise<File[]> {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = accept;
    input.multiple = multiple;
    input.onchange = () => resolve(Array.from(input.files ?? []));
    input.click();
  });
}

/** Make a string safe to use as a file name. */
export function safeFileName(name: string) {
  return (name || "untitled").replace(/[\\/:*?"<>|]+/g, "-").trim() || "untitled";
}
