"use client";

import { decryptData, encryptData } from "@/core/utils";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { uid } from "uid";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import hljs from "highlight.js/lib/core";
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import python from "highlight.js/lib/languages/python";
import css from "highlight.js/lib/languages/css";
import xml from "highlight.js/lib/languages/xml";
import json from "highlight.js/lib/languages/json";
import bash from "highlight.js/lib/languages/bash";
import sql from "highlight.js/lib/languages/sql";
import java from "highlight.js/lib/languages/java";
import go from "highlight.js/lib/languages/go";
import rust from "highlight.js/lib/languages/rust";
import cpp from "highlight.js/lib/languages/cpp";
import markdown from "highlight.js/lib/languages/markdown";

hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("js", javascript);
hljs.registerLanguage("typescript", typescript);
hljs.registerLanguage("ts", typescript);
hljs.registerLanguage("python", python);
hljs.registerLanguage("py", python);
hljs.registerLanguage("css", css);
hljs.registerLanguage("html", xml);
hljs.registerLanguage("xml", xml);
hljs.registerLanguage("json", json);
hljs.registerLanguage("bash", bash);
hljs.registerLanguage("sh", bash);
hljs.registerLanguage("sql", sql);
hljs.registerLanguage("java", java);
hljs.registerLanguage("go", go);
hljs.registerLanguage("rust", rust);
hljs.registerLanguage("cpp", cpp);
hljs.registerLanguage("c", cpp);
hljs.registerLanguage("markdown", markdown);
hljs.registerLanguage("md", markdown);

type TextareaQuicknoteItem = {
  date: string;
  notes: string;
  file_name: string;
  id: string;
};

type ViewMode = "split" | "editor" | "preview";
type ThemeMode = "light" | "dark" | "deepdark" | "sepia" | "lightgray";

type TocItem = {
  level: number;
  text: string;
  id: string;
};

export const TextareaQuicknote = () => {
  const [deleteTabIndex, setDeleteTabIndex] = useState<number | null>(null);
  const [selectedTab, setSelectedTab] = useState<TextareaQuicknoteItem | null>({
    date: "",
    notes: "",
    file_name: "",
    id: "",
  });

  const [textNotesList, setTextNotesList] = useState<TextareaQuicknoteItem[]>(
    []
  );

  const [showSearchReplace, setShowSearchReplace] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [replaceTerm, setReplaceTerm] = useState("");
  const [searchResults, setSearchResults] = useState<number[]>([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(-1);
  const [showStats, setShowStats] = useState(false);
  const [markdownMode, setMarkdownMode] = useState(false);
  const [showFormatTools, setShowFormatTools] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("split");
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [showToc, setShowToc] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const isScrollSyncing = useRef(false);

  // Theme configurations
  const themes: Record<ThemeMode, { bg: string, text: string, border: string, secondaryBg: string, accent: string, prose: string }> = {
    light: { bg: "bg-white", text: "text-black", border: "border-black", secondaryBg: "bg-gray-100", accent: "bg-gray-50", prose: "" },
    dark: { bg: "bg-[#1e1e1e]", text: "text-[#d4d4d4]", border: "border-[#333]", secondaryBg: "bg-[#252526]", accent: "bg-[#2d2d2d]", prose: "prose-invert opacity-90" },
    deepdark: { bg: "bg-black", text: "text-white", border: "border-gray-800", secondaryBg: "bg-[#111]", accent: "bg-[#0a0a0a]", prose: "prose-invert" },
    sepia: { bg: "bg-[#f4ecd8]", text: "text-[#5b4636]", border: "border-[#d3c0a8]", secondaryBg: "bg-[#e8dec2]", accent: "bg-[#fcf5e5]", prose: "sepia-prose" },
    lightgray: { bg: "bg-[#f0f0f0]", text: "text-[#333]", border: "border-[#ccc]", secondaryBg: "bg-[#e0e0e0]", accent: "bg-[#f5f5f5]", prose: "" }
  };

  const currentTheme = themes[theme];

  // Popular emojis for quick access
  const quickEmojis = ["😀", "😂", "🥰", "👍", "🔥", "✨", "🚀", "💡", "✅", "❌", "📝", "📌", "📅", "🌈"];

  const dateTimeNow = new Date().toLocaleString();

  function insertTimestamp() {
    const now = new Date();
    const timestamp = `[${now.toLocaleDateString()} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}] `;
    replaceTextPreservingUndo(timestamp);
  }

  function clearFormatting() {
    if (!selectedTab?.notes) return;
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    if (start === end) return;

    const selectedText = selectedTab.notes.substring(start, end);
    // Regex to remove common markdown patterns
    const cleanedText = selectedText
      .replace(/(\*\*|__)(.*?)\1/g, '$2') // bold
      .replace(/(\*|_)(.*?)\1/g, '$2')    // italic
      .replace(/(~~)(.*?)\1/g, '$2')      // strikethrough
      .replace(/(`)(.*?)\1/g, '$2')       // inline code
      .replace(/^#{1,6}\s+/gm, '')        // headings
      .replace(/^>\s+/gm, '')             // blockquotes
      .replace(/\[(.*?)\]\(.*?\)/g, '$1') // links
      .replace(/<mark>(.*?)<\/mark>/g, '$1'); // highlights

    replaceTextPreservingUndo(cleanedText, { start, end });
  }

  function insertEmoji(emoji: string) {
    replaceTextPreservingUndo(emoji);
    setShowEmojiPicker(false);
  }

  useEffect(() => {
    if (typeof window !== "undefined") {
      const textNotesListData = localStorage.getItem("textNotesList");
      if (textNotesListData) {
        const textNotesListDataParsed: TextareaQuicknoteItem[] =
          JSON.parse(textNotesListData);
        setTextNotesList(textNotesListDataParsed);
        setSelectedTab(textNotesListDataParsed[0]);
      } else {
        const newTab = {
          date: dateTimeNow,
          notes: "",
          file_name: "New Tab",
          id: uid(),
        };

        localStorage.setItem("textNotesList", JSON.stringify([newTab]));
        setTextNotesList([newTab]);
        setSelectedTab(newTab);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ===== Scroll sync =====
  const handleEditorScroll = useCallback(() => {
    if (isScrollSyncing.current || !textareaRef.current || !previewRef.current) return;
    isScrollSyncing.current = true;
    const editor = textareaRef.current;
    const preview = previewRef.current;
    const ratio = editor.scrollTop / (editor.scrollHeight - editor.clientHeight || 1);
    preview.scrollTop = ratio * (preview.scrollHeight - preview.clientHeight);
    requestAnimationFrame(() => { isScrollSyncing.current = false; });
  }, []);

  const handlePreviewScroll = useCallback(() => {
    if (isScrollSyncing.current || !textareaRef.current || !previewRef.current) return;
    isScrollSyncing.current = true;
    const editor = textareaRef.current;
    const preview = previewRef.current;
    const ratio = preview.scrollTop / (preview.scrollHeight - preview.clientHeight || 1);
    editor.scrollTop = ratio * (editor.scrollHeight - editor.clientHeight);
    requestAnimationFrame(() => { isScrollSyncing.current = false; });
  }, []);

  // ===== Auto-close pairs & Tab handling =====
  const handleKeyDownTextarea = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // 1. Handle Tab key (Works in both modes)
    if (e.key === "Tab") {
      e.preventDefault();
      // Use execCommand to preserve Undo/Redo stack
      document.execCommand("insertText", false, "\t");
      return;
    }

    // 2. Auto-close pairs (Markdown mode only)
    if (!markdownMode) return;

    const pairs: Record<string, string> = {
      "`": "`",
      "*": "*",
      "_": "_",
      "~": "~",
      "[": "]",
      "(": ")",
    };

    const closingChars = new Set(Object.values(pairs));
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    // Skip over closing char if next char matches
    if (closingChars.has(e.key) && text[start] === e.key && start === end) {
      e.preventDefault();
      textarea.setSelectionRange(start + 1, start + 1);
      return;
    }

    if (pairs[e.key]) {
      e.preventDefault();
      const selected = text.substring(start, end);
      const insert = e.key + selected + pairs[e.key];

      // Use execCommand to preserve Undo/Redo stack
      document.execCommand("insertText", false, insert);

      // Place cursor inside pairs, or after selected text
      const cursorPos = selected ? start + 1 + selected.length : start + 1;
      textarea.setSelectionRange(cursorPos, cursorPos);
    }
  }, [markdownMode]);

  // ===== TOC generation =====
  const tocItems = useMemo((): TocItem[] => {
    if (!selectedTab?.notes) return [];
    const lines = selectedTab.notes.split('\n');
    const items: TocItem[] = [];
    let inCodeBlock = false;
    lines.forEach((line) => {
      if (line.trim().startsWith('```')) {
        inCodeBlock = !inCodeBlock;
        return;
      }
      if (inCodeBlock) return;
      const match = line.match(/^(#{1,6})\s+(.+)/);
      if (match) {
        const text = match[2].replace(/[#*_`\[\]]/g, '').trim();
        items.push({
          level: match[1].length,
          text,
          id: text.toLowerCase().replace(/[^\w]+/g, '-').replace(/^-|-$/g, ''),
        });
      }
    });
    return items;
  }, [selectedTab?.notes]);

  function scrollToHeading(id: string) {
    const el = previewRef.current?.querySelector(`#${CSS.escape(id)}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // ===== Export HTML =====
  function exportAsHtml() {
    if (!previewRef.current || !selectedTab?.notes) {
      alert("No content to export");
      return;
    }
    const fileName = prompt("Enter file name", selectedTab.file_name);
    if (!fileName) return;

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${fileName}</title>
<style>
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:800px;margin:40px auto;padding:0 20px;line-height:1.7;color:#1a1a1a}
h1{border-bottom:1px solid #e5e7eb;padding-bottom:0.3rem}h2{border-bottom:1px solid #f3f4f6;padding-bottom:0.2rem}
code{font-family:'SF Mono',Consolas,monospace;font-size:0.85em;background:#f3f4f6;padding:0.15rem 0.35rem;border-radius:3px;border:1px solid #e5e7eb}
pre{background:#1f2937;color:#e5e7eb;padding:1rem;border-radius:4px;overflow-x:auto}pre code{background:none;border:none;padding:0;color:inherit}
blockquote{border-left:3px solid #d1d5db;padding-left:1rem;color:#6b7280;font-style:italic;margin:0.75rem 0}
table{width:100%;border-collapse:collapse;margin:0.75rem 0}th{background:#f9fafb;font-weight:600;text-align:left;padding:0.5rem 0.75rem;border:1px solid #d1d5db}
td{padding:0.5rem 0.75rem;border:1px solid #e5e7eb}a{color:#2563eb}hr{border:none;border-top:1px solid #d1d5db;margin:1.25rem 0}
img{max-width:100%}input[type="checkbox"]{margin-right:0.4rem}del{color:#9ca3af}
</style>
</head>
<body>
${previewRef.current.innerHTML}
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileName}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ===== Copy as HTML (rich text) =====
  function copyAsHtml() {
    if (!previewRef.current || !selectedTab?.notes) {
      alert("No content to copy");
      return;
    }
    const html = previewRef.current.innerHTML;
    const text = previewRef.current.innerText;
    const blob = new Blob([html], { type: "text/html" });
    const textBlob = new Blob([text], { type: "text/plain" });
    navigator.clipboard.write([
      new ClipboardItem({
        "text/html": blob,
        "text/plain": textBlob,
      }),
    ]).then(() => {
      alert("Copied as rich text!");
    }).catch(() => {
      // Fallback
      navigator.clipboard.writeText(text);
      alert("Copied as plain text (rich text not supported)");
    });
  }

  function downloadFile(filename: string, text: string) {
    if (text === "") {
      alert("Cannot download empty file");
      return;
    }

    const filName = prompt("Enter file name", filename.replace(".txt", ""));
    if (filName === null) {
      return;
    }

    const element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/plain;charset=utf-8," + encodeURIComponent(text)
    );
    element.setAttribute("download", filName + (markdownMode ? ".md" : ".txt"));
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  function importFile(): void {
    const input: HTMLInputElement = document.createElement("input");
    input.type = "file";
    input.onchange = function (e: Event): void {
      const fileInput = e.target as HTMLInputElement;
      const file: File | null = fileInput.files?.[0] || null;

      if (file) {
        const reader: FileReader = new FileReader();
        reader.readAsText(file, "UTF-8");
        reader.onload = function (
          readerEvent: ProgressEvent<FileReader>
        ): void {
          const content: string | ArrayBuffer | null =
            readerEvent.target?.result || null;

          if (content) {
            const newTab: TextareaQuicknoteItem = {
              date: dateTimeNow,
              notes: content.toString(),
              file_name: file.name.split(".")[0].trim(),
              id: uid(),
            };

            setSelectedTab(newTab);
            setTextNotesList([...textNotesList, newTab]);
            localStorage.setItem(
              "textNotesList",
              JSON.stringify([...textNotesList, newTab])
            );
          }
        };
      }
    };
    input.click();
  }

  function addTabNotes() {
    var tabName = prompt("Enter tab name", "New Tab");
    const newTab = {
      date: dateTimeNow,
      notes: "",
      file_name: tabName ?? "New Tab",
      id: uid(),
    };

    setSelectedTab(newTab);
    setTextNotesList([...textNotesList, newTab]);
    localStorage.setItem(
      "textNotesList",
      JSON.stringify([...textNotesList, newTab])
    );
  }

  function selectTabNotes(tab: TextareaQuicknoteItem) {
    setSelectedTab(tab);
  }

  function deleteTabNotes(tab: TextareaQuicknoteItem) {
    if (textNotesList.length === 1) {
      alert("Cannot delete the last tab");
      return;
    }
    if (tab.notes !== "" && !confirm("Are you sure you want to delete this tab?")) {
      return;
    }
    const getIndexOfTab = textNotesList.findIndex((item) => item.id === tab.id);
    setDeleteTabIndex(getIndexOfTab);
    const newTabList = textNotesList.filter((item) => item.id !== tab.id);

    if (selectedTab && selectedTab.id !== tab.id) {
      setDeleteTabIndex(-1);
    }

    setTextNotesList(newTabList);
    localStorage.setItem("textNotesList", JSON.stringify(newTabList));
  }

  useEffect(() => {
    if (textNotesList.length > 0) {
      if (selectedTab === null || !textNotesList.includes(selectedTab)) {
        if (deleteTabIndex !== -1 && deleteTabIndex !== null) {
          setSelectedTab(textNotesList[deleteTabIndex - 1]);
        } else {
          setSelectedTab(textNotesList[0]);
        }
      }
    }
  }, [deleteTabIndex, selectedTab, textNotesList]);

  function editTextNotes(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const newTabList = textNotesList.map((item) => {
      if (item.id === selectedTab?.id) {
        return {
          ...item,
          notes: e.target.value,
        };
      }
      return item;
    });

    setTextNotesList(newTabList);
    setSelectedTab(
      newTabList.find(
        (item) => item.id === selectedTab?.id
      ) as TextareaQuicknoteItem
    );
    localStorage.setItem("textNotesList", JSON.stringify(newTabList));
  }

  function editFileName(tab: TextareaQuicknoteItem) {
    var tabName = prompt("Enter tab name", tab.file_name);

    if (tabName === null) {
      return;
    }

    const newTabList = textNotesList.map((item) => {
      if (item.id === tab.id) {
        return {
          ...item,
          file_name: tabName ?? "New Tab",
        };
      }
      return item;
    });

    setTextNotesList(newTabList);

    localStorage.setItem("textNotesList", JSON.stringify(newTabList));
    setSelectedTab(
      newTabList.find((item) => item.id === tab.id) as TextareaQuicknoteItem
    );
  }

  function backupData() {
    const data = JSON.stringify(textNotesList);
    var dataEncoded = encryptData(data, process.env.PRIVATE_KEY as string);
    const blob = new Blob([dataEncoded], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `quicknote-backup-${dateTimeNow}.txt`;
    a.click();
  }

  function importBackupData() {
    try {
      const input: HTMLInputElement = document.createElement("input");
      input.type = "file";
      input.onchange = function (e: Event): void {
        const fileInput = e.target as HTMLInputElement;
        const file: File | null = fileInput.files?.[0] || null;

        if (file) {
          if (file.name.split(".")[1] !== "txt") {
            alert("Invalid file");
            return;
          }
          const reader: FileReader = new FileReader();
          reader.readAsText(file, "UTF-8");
          reader.onload = function (
            readerEvent: ProgressEvent<FileReader>
          ): void {
            const content: string | ArrayBuffer | null =
              readerEvent.target?.result || null;

            if (content) {
              var dataDecoded = decryptData(
                content.toString(),
                process.env.PRIVATE_KEY as string
              );

              if (dataDecoded === null) {
                alert("Error decrypting file");
                return;
              }

              try {
                JSON.parse(dataDecoded.toString());
              } catch (e) {
                alert("Invalid file");
                return;
              }

              const newTabList: TextareaQuicknoteItem[] = JSON.parse(
                dataDecoded.toString()
              );

              setTextNotesList([...textNotesList, ...newTabList]);
              setSelectedTab(newTabList[0]);
              localStorage.setItem(
                "textNotesList",
                JSON.stringify([...textNotesList, ...newTabList])
              );
            }
          };
        }
      };
      input.click();
    } catch (error) {
      alert("Error importing file");
    }
  }

  const updateTextContent = useCallback((newText: string) => {
    const newTabList = textNotesList.map((item) => {
      if (item.id === selectedTab?.id) {
        return {
          ...item,
          notes: newText,
        };
      }
      return item;
    });

    setTextNotesList(newTabList);
    setSelectedTab(
      newTabList.find(
        (item) => item.id === selectedTab?.id
      ) as TextareaQuicknoteItem
    );
    localStorage.setItem("textNotesList", JSON.stringify(newTabList));
  }, [textNotesList, selectedTab?.id]);

  // Helper to update text while preserving Undo/Redo history
  const replaceTextPreservingUndo = useCallback((newText: string, range?: { start: number, end: number }) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.focus();
    
    if (range) {
      textarea.setSelectionRange(range.start, range.end);
    } else if (textarea.selectionStart === textarea.selectionEnd && newText === textarea.value) {
      // If we're replacing everything and nothing is selected
      textarea.select();
    }
    
    document.execCommand('insertText', false, newText);
  }, []);

  function formatToParagraph() {
    if (!selectedTab || !selectedTab.notes) { alert("No content to format"); return; }
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    if (start !== end) {
      const selectedText = selectedTab.notes.substring(start, end);
      const formattedText = selectedText.split('\n').map(line => line.trim()).filter(line => line.length > 0).join(' ');
      replaceTextPreservingUndo(formattedText, { start, end });
    } else {
      const formattedText = selectedTab.notes.split('\n').map(line => line.trim()).filter(line => line.length > 0).join(' ');
      replaceTextPreservingUndo(formattedText);
    }
  }

  function formatToUpperCase() {
    if (!selectedTab || !selectedTab.notes) { alert("No content to format"); return; }
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    if (start !== end) {
      replaceTextPreservingUndo(selectedTab.notes.substring(start, end).toUpperCase(), { start, end });
    } else {
      replaceTextPreservingUndo(selectedTab.notes.toUpperCase());
    }
  }

  function formatToLowerCase() {
    if (!selectedTab || !selectedTab.notes) { alert("No content to format"); return; }
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    if (start !== end) {
      replaceTextPreservingUndo(selectedTab.notes.substring(start, end).toLowerCase(), { start, end });
    } else {
      replaceTextPreservingUndo(selectedTab.notes.toLowerCase());
    }
  }

  function formatToTitleCase() {
    if (!selectedTab || !selectedTab.notes) { alert("No content to format"); return; }
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const titleCase = (s: string) => s.toLowerCase().split(' ').map(w => w.length === 0 ? w : w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    if (start !== end) {
      replaceTextPreservingUndo(titleCase(selectedTab.notes.substring(start, end)), { start, end });
    } else {
      replaceTextPreservingUndo(titleCase(selectedTab.notes));
    }
  }

  function formatToSentenceCase() {
    if (!selectedTab || !selectedTab.notes) { alert("No content to format"); return; }
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const sentenceCase = (s: string) => s.toLowerCase().replace(/(^\w|\.\s+\w)/g, c => c.toUpperCase());
    if (start !== end) {
      replaceTextPreservingUndo(sentenceCase(selectedTab.notes.substring(start, end)), { start, end });
    } else {
      replaceTextPreservingUndo(sentenceCase(selectedTab.notes));
    }
  }

  function formatCapitalizeLines() {
    if (!selectedTab || !selectedTab.notes) { alert("No content to format"); return; }
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const capLines = (s: string) => s.split('\n').map(line => { const t = line.trim(); return t.length === 0 ? line : t.charAt(0).toUpperCase() + t.slice(1).toLowerCase(); }).join('\n');
    if (start !== end) {
      replaceTextPreservingUndo(capLines(selectedTab.notes.substring(start, end)), { start, end });
    } else {
      replaceTextPreservingUndo(capLines(selectedTab.notes));
    }
  }

  function formatRemoveExtraSpaces() {
    if (!selectedTab || !selectedTab.notes) { alert("No content to format"); return; }
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const clean = (s: string) => s.replace(/[ \t]+/g, ' ').split('\n').map(l => l.trim()).join('\n').replace(/\n\s*\n\s*\n/g, '\n\n').trim();
    if (start !== end) {
      replaceTextPreservingUndo(clean(selectedTab.notes.substring(start, end)), { start, end });
    } else {
      replaceTextPreservingUndo(clean(selectedTab.notes));
    }
  }

  function formatRemoveSpacing() {
    if (!selectedTab || !selectedTab.notes) { alert("No content to format"); return; }
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const noSpace = (s: string) => s.replace(/\n\s*\n/g, '\n').split('\n').map(l => l.trim()).join('\n').trim();
    if (start !== end) {
      replaceTextPreservingUndo(noSpace(selectedTab.notes.substring(start, end)), { start, end });
    } else {
      replaceTextPreservingUndo(noSpace(selectedTab.notes));
    }
  }

  const formatSelectedText = useCallback((prefix: string) => {
    if (!selectedTab?.notes) { alert("No content to format"); return; }
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    if (start === end) { alert("Please select text before formatting"); return; }
    const selectedText = selectedTab.notes.substring(start, end);
    const removePattern = /^(\d+\.\s*|[a-z]\.\s*|[A-Z]\.\s*|•\s*|-\s*|\+\s*|\*\s*|→\s*|\t+|\s+)/;
    const formattedText = selectedText.split('\n').map(line => {
      if (line.trim() === '') return line;
      return prefix + line.trim().replace(removePattern, '');
    }).join('\n');
    replaceTextPreservingUndo(formattedText, { start, end });
  }, [selectedTab?.notes, replaceTextPreservingUndo]);

  const addTabToSelectedLines = useCallback(() => formatSelectedText('\t'), [formatSelectedText]);
  const addSpaceToSelectedLines = useCallback(() => formatSelectedText(' '), [formatSelectedText]);
  const addBulletToSelectedLines = useCallback(() => formatSelectedText(' • '), [formatSelectedText]);
  const addDashToSelectedLines = useCallback(() => formatSelectedText(' - '), [formatSelectedText]);
  const addPlusToSelectedLines = useCallback(() => formatSelectedText(' + '), [formatSelectedText]);
  const addAsteriskToSelectedLines = useCallback(() => formatSelectedText(' * '), [formatSelectedText]);

  const addNumberToSelectedLines = useCallback(() => {
    if (!selectedTab?.notes) { alert("No content to format"); return; }
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    if (start === end) { alert("Please select text before formatting"); return; }
    const removePattern = /^(\d+\.\s*|[a-z]\.\s*|[A-Z]\.\s*|•\s*|-\s*|\+\s*|\*\s*|→\s*|\t+|\s+)/;
    const formattedText = selectedTab.notes.substring(start, end).split('\n').map((line, i) => {
      if (line.trim() === '') return line;
      return ` ${i + 1}. ${line.trim().replace(removePattern, '')}`;
    }).join('\n');
    replaceTextPreservingUndo(formattedText, { start, end });
  }, [selectedTab?.notes, replaceTextPreservingUndo]);

  const searchInText = useCallback(() => {
    if (!searchTerm || !selectedTab?.notes) { setSearchResults([]); setCurrentSearchIndex(-1); return; }
    const text = selectedTab.notes.toLowerCase();
    const term = searchTerm.toLowerCase();
    const results: number[] = [];
    let index = text.indexOf(term);
    while (index !== -1) { results.push(index); index = text.indexOf(term, index + 1); }
    setSearchResults(results);
    setCurrentSearchIndex(results.length > 0 ? 0 : -1);
  }, [searchTerm, selectedTab?.notes]);

  function nextSearchResult() {
    if (searchResults.length === 0) return;
    const nextIndex = (currentSearchIndex + 1) % searchResults.length;
    setCurrentSearchIndex(nextIndex);
    scrollToSearchResult(nextIndex);
  }

  function prevSearchResult() {
    if (searchResults.length === 0) return;
    const prevIndex = currentSearchIndex <= 0 ? searchResults.length - 1 : currentSearchIndex - 1;
    setCurrentSearchIndex(prevIndex);
    scrollToSearchResult(prevIndex);
  }

  function scrollToSearchResult(index: number) {
    if (index < 0 || index >= searchResults.length) return;
    const textarea = textareaRef.current;
    if (textarea) {
      const position = searchResults[index];
      textarea.focus();
      textarea.setSelectionRange(position, position + searchTerm.length);
      textarea.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  function replaceOne() {
    if (!selectedTab?.notes || searchResults.length === 0 || currentSearchIndex < 0) return;
    const position = searchResults[currentSearchIndex];
    const newText = selectedTab.notes.substring(0, position) + replaceTerm + selectedTab.notes.substring(position + searchTerm.length);
    updateTextContent(newText);
    setTimeout(() => { searchInText(); }, 100);
  }

  function replaceAll() {
    if (!selectedTab?.notes || !searchTerm) return;
    const newText = selectedTab.notes.replace(
      new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'),
      replaceTerm
    );
    updateTextContent(newText);
    setSearchResults([]); setCurrentSearchIndex(-1); setSearchTerm(""); setReplaceTerm("");
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => { searchInText(); }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedTab?.notes, searchInText]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
        event.preventDefault();
        setShowSearchReplace(true);
        setTimeout(() => {
          const searchInput = document.querySelector('input[placeholder="Search..."]') as HTMLInputElement;
          if (searchInput) searchInput.focus();
        }, 100);
      }
      if (event.key === 'Escape') {
        if (showSearchReplace) setShowSearchReplace(false);
      }
      // Plain text mode shortcuts
      if (!markdownMode && event.ctrlKey && event.shiftKey) {
        const textarea = textareaRef.current;
        if (textarea && document.activeElement === textarea) {
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          if (start !== end) {
            const map: Record<string, () => void> = {
              'T': addTabToSelectedLines, 'S': addSpaceToSelectedLines, 'B': addBulletToSelectedLines,
              'D': addDashToSelectedLines, 'P': addPlusToSelectedLines, 'A': addAsteriskToSelectedLines, 'N': addNumberToSelectedLines,
            };
            if (map[event.key]) { event.preventDefault(); map[event.key](); }
          }
        }
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => { document.removeEventListener('keydown', handleKeyDown); };
  }, [showSearchReplace, markdownMode, addTabToSelectedLines, addSpaceToSelectedLines, addBulletToSelectedLines, addDashToSelectedLines, addPlusToSelectedLines, addAsteriskToSelectedLines, addNumberToSelectedLines]);

  function calculateTextStats() {
    if (!selectedTab?.notes) return { characters: 0, charactersNoSpaces: 0, words: 0, lines: 0, paragraphs: 0, readingTime: 0 };
    const text = selectedTab.notes;
    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, '').length;
    const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
    const lines = text === '' ? 0 : text.split('\n').length;
    const paragraphs = text.trim() === '' ? 0 : text.split('\n').filter(line => line.trim() !== '').length;
    const readingTime = Math.ceil(words / 200);
    return { characters, charactersNoSpaces, words, lines, paragraphs, readingTime };
  }

  const textStats = calculateTextStats();

  const markdownContent = useMemo(() => {
    if (!markdownMode || !selectedTab?.notes) return null;
    // Pre-process internal links: [[Tab Name]] -> [Tab Name](tab-link:Tab Name)
    return selectedTab.notes.replace(/\[\[(.*?)\]\]/g, (match, p1) => {
      return `[${p1}](tab-link:${p1})`;
    });
  }, [markdownMode, selectedTab?.notes]);

  function handleInternalLink(tabName: string) {
    const targetTab = textNotesList.find(t => t.file_name.toLowerCase() === tabName.toLowerCase());
    if (targetTab) {
      setSelectedTab(targetTab);
    } else {
      alert(`Tab "${tabName}" not found`);
    }
  }

  // ===== Mermaid support =====
  useEffect(() => {
    if (markdownMode && typeof window !== 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js';
      script.async = true;
      script.onload = () => {
        (window as any).mermaid?.initialize({ 
          startOnLoad: true,
          theme: 'default',
          securityLevel: 'loose',
        });
      };
      document.body.appendChild(script);
      return () => {
        const existingScript = document.querySelector(`script[src="${script.src}"]`);
        if (existingScript) document.body.removeChild(existingScript);
      };
    }
  }, [markdownMode]);

  const MermaidDiagram = ({ code }: { code: string }) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (containerRef.current && (window as any).mermaid) {
        containerRef.current.removeAttribute('data-processed');
        (window as any).mermaid.contentLoaded();
        // Force re-render mermaid
        const id = 'mermaid-' + Math.random().toString(36).substr(2, 9);
        try {
          (window as any).mermaid.render(id, code).then((res: any) => {
            if (containerRef.current) {
              containerRef.current.innerHTML = res.svg;
            }
          });
        } catch (e) {
          console.error("Mermaid render error", e);
        }
      }
    }, [code]);

    return <div ref={containerRef} className="mermaid flex justify-center my-4 overflow-x-auto">{code}</div>;
  };

  function HighlightedCode({ className, children, ...props }: React.HTMLAttributes<HTMLElement> & { children?: React.ReactNode }) {
    const codeRef = useRef<HTMLElement>(null);
    const match = /language-(\w+)/.exec(className || '');
    const code = String(children).replace(/\n$/, '');

    useEffect(() => {
      if (codeRef.current && match && match[1] !== 'mermaid') {
        codeRef.current.removeAttribute('data-highlighted');
        hljs.highlightElement(codeRef.current);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [code, match?.[1]]);

    if (match?.[1] === 'mermaid') {
      return <MermaidDiagram code={code} />;
    }

    const copyCode = () => {
      navigator.clipboard.writeText(code);
      alert("Code copied!");
    };

    if (match) {
      return (
        <div className="relative group/code">
          <button 
            onClick={copyCode}
            className="absolute top-2 right-2 p-1.5 bg-gray-700 text-white text-[10px] rounded opacity-0 group-hover/code:opacity-100 transition-opacity z-10 hover:bg-black"
          >
            COPY
          </button>
          <code ref={codeRef} className={className} {...props}>{children}</code>
        </div>
      );
    }
    return <code className={className} {...props}>{children}</code>;
  }

  const linkRenderer = useCallback(({ href, children, ...props }: any) => {
    if (href?.startsWith('tab-link:')) {
      const tabName = decodeURIComponent(href.replace('tab-link:', ''));
      return (
        <a
          href="#"
          onClick={(e) => { e.preventDefault(); handleInternalLink(tabName); }}
          className="text-blue-600 hover:underline font-medium border-b border-dashed border-blue-400 decoration-blue-400"
          title={`Go to tab: ${tabName}`}
        >
          {children}
        </a>
      );
    }
    return <a href={href} {...props} target="_blank" rel="noopener noreferrer">{children}</a>;
  }, [textNotesList]);

  // ===== Line numbers for editor =====
  const lineCount = useMemo(() => {
    return (selectedTab?.notes ?? "").split('\n').length;
  }, [selectedTab?.notes]);

  // ===== Markdown toolbar insert helpers =====
  const insertMarkdown = useCallback((type: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = selectedTab?.notes ?? "";
    const selected = text.substring(start, end);
    let before = "", after = "", insert = "";
    let cursorOffset = 0;

    switch (type) {
      case "bold":
      case "italic": {
        const marker = type === "bold" ? "**" : "*";
        if (selected) {
          const match = selected.match(/^(\s*)(.*?)(\s*)$/);
          if (match) {
            const leading = match[1];
            const content = match[2];
            const trailing = match[3];
            const textToInsert = leading + marker + (content || (type === "bold" ? "bold text" : "italic text")) + marker + trailing;
            replaceTextPreservingUndo(textToInsert, { start, end });
            const newCursorStart = start + leading.length + marker.length;
            const newCursorEnd = newCursorStart + (content.length || (type === "bold" ? 9 : 11));
            setTimeout(() => textarea.setSelectionRange(newCursorStart, newCursorEnd), 0);
            return;
          }
        }
        before = marker; after = marker; insert = selected || (type === "bold" ? "bold text" : "italic text"); break;
      }
      case "heading": {
        const lineStart = text.lastIndexOf('\n', start - 1) + 1;
        const lineText = text.substring(lineStart, end);
        const headingMatch = lineText.match(/^(#{1,6})\s/);
        if (headingMatch) {
          const level = headingMatch[1].length;
          if (level >= 6) {
            const newText = lineText.replace(/^#{1,6}\s/, '');
            replaceTextPreservingUndo(newText, { start: lineStart, end });
            setTimeout(() => textarea.setSelectionRange(lineStart, lineStart + newText.length), 0);
            return;
          }
          const newText = '#' + lineText;
          replaceTextPreservingUndo(newText, { start: lineStart, end });
          setTimeout(() => textarea.setSelectionRange(start + 1, end + 1), 0);
          return;
        }
        const prefix = "## ";
        replaceTextPreservingUndo(prefix, { start: lineStart, end: lineStart });
        setTimeout(() => textarea.setSelectionRange(start + prefix.length, end + prefix.length), 0);
        return;
      }
      case "ul": {
        if (selected) {
          const lines = selected.split('\n').map(l => l.trim() ? `- ${l.replace(/^[-*+]\s*/, '')}` : l).join('\n');
          replaceTextPreservingUndo(lines, { start, end });
          return;
        }
        before = "- "; insert = "list item"; break;
      }
      case "ol": {
        if (selected) {
          let num = 1;
          const lines = selected.split('\n').map(l => l.trim() ? `${num++}. ${l.replace(/^\d+\.\s*/, '')}` : l).join('\n');
          replaceTextPreservingUndo(lines, { start, end });
          return;
        }
        before = "1. "; insert = "list item"; break;
      }
      case "checklist": {
        if (selected) {
          const lines = selected.split('\n').map(l => l.trim() ? `- [ ] ${l.replace(/^[-*+]\s*(\[[ x]\]\s*)?/, '')}` : l).join('\n');
          replaceTextPreservingUndo(lines, { start, end });
          return;
        }
        before = "- [ ] "; insert = "task"; break;
      }
      case "blockquote": {
        if (selected) {
          const lines = selected.split('\n').map(l => `> ${l}`).join('\n');
          replaceTextPreservingUndo(lines, { start, end });
          return;
        }
        before = "> "; insert = "quote"; break;
      }
      case "code":
        if (selected && selected.includes('\n')) { before = "```\n"; after = "\n```"; insert = selected; }
        else { before = "`"; after = "`"; insert = selected || "code"; }
        break;
      case "table":
        insert = "| Column 1 | Column 2 | Column 3 |\n| --- | --- | --- |\n| Cell | Cell | Cell |";
        cursorOffset = 2; break;
      case "link": before = "["; after = "](url)"; insert = selected || "link text"; break;
      case "image": before = "!["; after = "](url)"; insert = selected || "alt text"; break;
      case "hr": insert = "\n---\n"; break;
      default: return;
    }

    const textToInsert = before + insert + after;
    replaceTextPreservingUndo(textToInsert, { start, end });
    
    const newCursorStart = start + before.length + (cursorOffset || 0);
    const newCursorEnd = newCursorStart + insert.length - (cursorOffset || 0);
    setTimeout(() => textarea.setSelectionRange(newCursorStart, newCursorEnd), 0);
  }, [selectedTab?.notes, replaceTextPreservingUndo]);

  // ===== Markdown keyboard shortcuts =====
  useEffect(() => {
    if (!markdownMode) return;
    function handleMdKeyDown(event: KeyboardEvent) {
      if (!event.metaKey || !event.shiftKey) return;
      const keyMap: Record<string, string> = {
        'b': 'bold', 'i': 'italic', 'u': 'ul', 'o': 'ol', 'c': 'checklist',
        'q': 'blockquote', 'k': 'code', 't': 'table', 'l': 'link', 'g': 'image',
      };
      const action = keyMap[event.key.toLowerCase()];
      if (action) { event.preventDefault(); insertMarkdown(action); }
    }
    document.addEventListener('keydown', handleMdKeyDown);
    return () => document.removeEventListener('keydown', handleMdKeyDown);
  }, [markdownMode, insertMarkdown]);

  // ===== Syntax highlighting for code blocks =====
  // (CodeBlock defined outside component below)

  // Generate heading IDs for TOC navigation
  const headingRenderer = useCallback((level: number) => {
    const HeadingComponent = ({ children }: { children?: React.ReactNode }) => {
      const text = String(children);
      const id = text.toLowerCase().replace(/[^\w]+/g, '-').replace(/^-|-$/g, '');
      const Tag = `h${level}` as keyof JSX.IntrinsicElements;
      return <Tag id={id}>{children}</Tag>;
    };
    HeadingComponent.displayName = `Heading${level}`;
    return HeadingComponent;
  }, []);

  // ===== Shared UI elements =====
  const mdToolbarBtnClass = "px-2 py-1 text-xs bg-white hover:bg-gray-100 border border-gray-300 rounded-sm transition-colors";

  const toolbarButtons = (
    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
      <div className="flex items-center gap-1 flex-wrap">
        <button onClick={() => downloadFile(selectedTab?.file_name ?? "file name", selectedTab?.notes ?? "")}
          className="px-2.5 py-1.5 text-sm hover:bg-gray-100 border border-gray-200 rounded transition-colors" title="Save file">
          Save
        </button>
        <button onClick={importFile} className="px-2.5 py-1.5 text-sm hover:bg-gray-100 border border-gray-200 rounded transition-colors" title="Import file">
          Import
        </button>
        <button onClick={backupData} className="px-2.5 py-1.5 text-sm hover:bg-gray-100 border border-gray-200 rounded transition-colors" title="Backup all tabs">
          Backup
        </button>
        <button onClick={importBackupData} className="px-2.5 py-1.5 text-sm hover:bg-gray-100 border border-gray-200 rounded transition-colors" title="Restore from backup">
          Restore
        </button>

        {markdownMode && (
          <>
            <div className="w-px h-5 bg-gray-300 mx-1" />
            <button onClick={exportAsHtml} className="px-2.5 py-1.5 text-sm hover:bg-gray-100 border border-gray-200 rounded transition-colors" title="Export as HTML file">
              HTML
            </button>
            <button onClick={copyAsHtml} className="px-2.5 py-1.5 text-sm hover:bg-gray-100 border border-gray-200 rounded transition-colors" title="Copy as rich text">
              Copy
            </button>
          </>
        )}

        <div className="w-px h-5 bg-gray-300 mx-1" />

        <button onClick={() => setShowSearchReplace(!showSearchReplace)}
          className={`px-2.5 py-1.5 text-sm border rounded transition-colors ${showSearchReplace ? 'bg-gray-900 text-white border-gray-900' : 'hover:bg-gray-100 border-gray-200'}`}
          title="Search & Replace (Ctrl+F)">
          Search
        </button>
        <button onClick={() => setShowStats(!showStats)}
          className={`px-2.5 py-1.5 text-sm border rounded transition-colors ${showStats ? 'bg-gray-900 text-white border-gray-900' : 'hover:bg-gray-100 border-gray-200'}`}
          title="Text statistics">
          Stats
        </button>
        {!markdownMode && (
          <button onClick={() => setShowFormatTools(!showFormatTools)}
            className={`px-2.5 py-1.5 text-sm border rounded transition-colors ${showFormatTools ? 'bg-gray-900 text-white border-gray-900' : 'hover:bg-gray-100 border-gray-200'}`}
            title="Text formatting tools">
            Format
          </button>
        )}
        {markdownMode && (
          <button onClick={() => setShowToc(!showToc)}
            className={`px-2.5 py-1.5 text-sm border rounded transition-colors ${showToc ? 'bg-gray-900 text-white border-gray-900' : 'hover:bg-gray-100 border-gray-200'}`}
            title="Table of Contents">
            TOC
          </button>
        )}
        
        {markdownMode && (
          <div className="flex items-center border border-gray-300 rounded overflow-hidden ml-1">
            {(Object.keys(themes) as ThemeMode[]).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`w-6 h-6 flex items-center justify-center text-[10px] transition-all ${theme === t ? 'ring-2 ring-blue-500 z-10' : ''}`}
                style={{ backgroundColor: themes[t].bg.replace('bg-', '').replace('[', '').replace(']', ''), color: themes[t].text.replace('text-', '').replace('[', '').replace(']', '') }}
                title={`Theme: ${t}`}
              >
                {t.charAt(0).toUpperCase()}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* View mode switcher - only in markdown mode */}
        {markdownMode && (
          <div className="flex border border-gray-300 rounded overflow-hidden">
            <button onClick={() => setViewMode("editor")}
              className={`px-2 py-1 text-xs transition-colors ${viewMode === 'editor' ? 'bg-gray-900 text-white' : 'bg-white hover:bg-gray-100'}`}
              title="Editor only">
              Editor
            </button>
            <button onClick={() => setViewMode("split")}
              className={`px-2 py-1 text-xs border-x border-gray-300 transition-colors ${viewMode === 'split' ? 'bg-gray-900 text-white' : 'bg-white hover:bg-gray-100'}`}
              title="Split view">
              Split
            </button>
            <button onClick={() => setViewMode("preview")}
              className={`px-2 py-1 text-xs transition-colors ${viewMode === 'preview' ? 'bg-gray-900 text-white' : 'bg-white hover:bg-gray-100'}`}
              title="Preview only">
              Preview
            </button>
          </div>
        )}

        <button onClick={() => setMarkdownMode(!markdownMode)}
          className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium border rounded transition-all ${markdownMode ? 'bg-black text-white border-black' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          title="Toggle Markdown preview">
          <span className="font-bold text-xs tracking-wide">MD</span>
          <div className={`relative w-8 h-4 rounded-full transition-colors ${markdownMode ? 'bg-gray-500' : 'bg-gray-300'}`}>
            <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${markdownMode ? 'translate-x-4' : 'translate-x-0.5'}`} />
          </div>
        </button>
      </div>
    </div>
  );

  const tabBar = (
    <div className="flex items-center mb-3 space-x-2">
      <div className="flex items-center space-x-1.5 overflow-x-auto w-full tab-scroll pb-1">
        {textNotesList.map((item) => (
          <div key={item.id}
            className={`min-w-28 max-w-44 flex-shrink-0 flex space-x-1 justify-center items-center border hover:cursor-pointer pl-2.5 pr-1 py-1 rounded-sm transition-colors ${item.id === selectedTab?.id ? "bg-gray-50 border-black" : "border-gray-300 text-gray-500 hover:border-gray-400"}`}>
            <span onDoubleClick={() => editFileName(item)} onClick={() => selectTabNotes(item)} className="truncate w-full text-sm">
              {item.file_name}
            </span>
            <button onClick={() => deleteTabNotes(item)} className="rounded-full hover:bg-gray-200 p-1.5 flex justify-center items-center flex-shrink-0">
              <XMarkIcon className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
      <button onClick={addTabNotes} className="rounded-full hover:bg-gray-200 p-2 flex justify-center items-center flex-shrink-0">
        <PlusIcon className="w-4 h-4" />
      </button>
    </div>
  );

  const searchReplacePanel = showSearchReplace && (
    <div className="mb-3 p-3 border border-black bg-gray-50 rounded-sm">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-3 py-1.5 text-sm border border-gray-300 focus:outline-none focus:border-black rounded-sm" />
          <button onClick={prevSearchResult} disabled={searchResults.length === 0}
            className="px-2.5 py-1.5 text-sm bg-gray-800 text-white rounded-sm hover:bg-black disabled:bg-gray-300 disabled:cursor-not-allowed">↑</button>
          <button onClick={nextSearchResult} disabled={searchResults.length === 0}
            className="px-2.5 py-1.5 text-sm bg-gray-800 text-white rounded-sm hover:bg-black disabled:bg-gray-300 disabled:cursor-not-allowed">↓</button>
          <span className="text-xs text-gray-500 min-w-14 text-center">
            {searchResults.length > 0 ? `${currentSearchIndex + 1}/${searchResults.length}` : '0/0'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <input type="text" placeholder="Replace with..." value={replaceTerm} onChange={(e) => setReplaceTerm(e.target.value)}
            className="flex-1 px-3 py-1.5 text-sm border border-gray-300 focus:outline-none focus:border-black rounded-sm" />
          <button onClick={replaceOne} disabled={searchResults.length === 0 || currentSearchIndex < 0}
            className="px-2.5 py-1.5 text-sm bg-gray-800 text-white rounded-sm hover:bg-black disabled:bg-gray-300 disabled:cursor-not-allowed">Replace</button>
          <button onClick={replaceAll} disabled={searchResults.length === 0}
            className="px-2.5 py-1.5 text-sm bg-gray-800 text-white rounded-sm hover:bg-black disabled:bg-gray-300 disabled:cursor-not-allowed">All</button>
          <button onClick={() => setShowSearchReplace(false)} className="px-2.5 py-1.5 text-sm text-gray-500 hover:text-black">Close</button>
        </div>
      </div>
    </div>
  );

  const statsPanel = showStats && (
    <div className="mb-3 p-3 border border-black bg-gray-50 rounded-sm">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-semibold text-gray-800">Text Statistics</h3>
        <button onClick={() => setShowStats(false)} className="text-xs text-gray-500 hover:text-black">Close</button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {[
          { v: textStats.words, l: "Words" }, { v: textStats.characters, l: "Characters" },
          { v: textStats.lines, l: "Lines" }, { v: textStats.paragraphs, l: "Paragraphs" },
          { v: textStats.charactersNoSpaces, l: "Chars (no space)" },
          { v: `${textStats.readingTime} ${textStats.readingTime === 1 ? 'min' : 'mins'}`, l: "Reading time" },
          { v: textStats.words > 0 ? (textStats.characters / textStats.words).toFixed(1) : '0', l: "Avg chars/word" },
          { v: textStats.lines > 0 ? (textStats.words / textStats.lines).toFixed(1) : '0', l: "Avg words/line" },
        ].map((s, i) => (
          <div key={i} className="bg-white p-2.5 border border-gray-200 rounded-sm">
            <div className="text-xl font-bold text-gray-900">{typeof s.v === 'number' ? s.v.toLocaleString() : s.v}</div>
            <div className="text-xs text-gray-500">{s.l}</div>
          </div>
        ))}
      </div>
    </div>
  );

  const markdownToolbar = (
    <div className="flex items-center gap-1 px-3 py-1.5 bg-gray-50 border-b border-black overflow-x-auto relative">
      <button onClick={() => insertMarkdown('bold')} className={mdToolbarBtnClass} title="Bold (Cmd+Shift+B)"><strong>B</strong></button>
      <button onClick={() => insertMarkdown('italic')} className={mdToolbarBtnClass} title="Italic (Cmd+Shift+I)"><em>I</em></button>
      <button onClick={() => insertMarkdown('heading')} className={mdToolbarBtnClass} title="Heading">H</button>
      <button onClick={() => {
        const selected = selectedTab?.notes.substring(textareaRef.current?.selectionStart || 0, textareaRef.current?.selectionEnd || 0);
        if (selected) {
          replaceTextPreservingUndo(`<mark>${selected}</mark>`, { start: textareaRef.current?.selectionStart || 0, end: textareaRef.current?.selectionEnd || 0 });
        } else {
          replaceTextPreservingUndo("<mark>highlight</mark>");
        }
      }} className={mdToolbarBtnClass} title="Highlight text">High</button>
      <div className="w-px h-4 bg-gray-300 mx-0.5" />
      <button onClick={() => insertMarkdown('ul')} className={mdToolbarBtnClass} title="Unordered list (Cmd+Shift+U)">UL</button>
      <button onClick={() => insertMarkdown('ol')} className={mdToolbarBtnClass} title="Ordered list (Cmd+Shift+O)">OL</button>
      <button onClick={() => insertMarkdown('checklist')} className={mdToolbarBtnClass} title="Check list (Cmd+Shift+C)">Check</button>
      <div className="w-px h-4 bg-gray-300 mx-0.5" />
      <button onClick={() => insertMarkdown('blockquote')} className={mdToolbarBtnClass} title="Blockquote (Cmd+Shift+Q)">Quote</button>
      <button onClick={() => insertMarkdown('code')} className={mdToolbarBtnClass} title="Code (Cmd+Shift+K)">Code</button>
      <button onClick={() => insertMarkdown('table')} className={mdToolbarBtnClass} title="Table (Cmd+Shift+T)">Table</button>
      <div className="w-px h-4 bg-gray-300 mx-0.5" />
      <button onClick={() => insertMarkdown('link')} className={mdToolbarBtnClass} title="Link (Cmd+Shift+L)">Link</button>
      <button onClick={() => insertMarkdown('image')} className={mdToolbarBtnClass} title="Image (Cmd+Shift+G)">Img</button>
      <button onClick={() => insertMarkdown('hr')} className={mdToolbarBtnClass} title="Horizontal rule">HR</button>
      <div className="w-px h-4 bg-gray-300 mx-0.5" />
      <button onClick={clearFormatting} className={mdToolbarBtnClass} title="Clear formatting">Clear</button>
      <button onClick={insertTimestamp} className={mdToolbarBtnClass} title="Insert Timestamp">Time</button>
      <div className="relative">
        <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className={mdToolbarBtnClass} title="Insert Emoji">😀</button>
        {showEmojiPicker && (
          <div className="absolute top-full left-0 mt-1 p-2 bg-white border border-black shadow-lg z-50 grid grid-cols-7 gap-1 min-w-[200px]">
            {quickEmojis.map(emoji => (
              <button key={emoji} onClick={() => insertEmoji(emoji)} className="p-1.5 hover:bg-gray-100 rounded text-lg">{emoji}</button>
            ))}
          </div>
        )}
      </div>
      <button onClick={() => setIsFocusMode(!isFocusMode)}
        className={`${mdToolbarBtnClass} ml-auto ${isFocusMode ? 'bg-black text-white' : ''}`}
        title="Toggle Focus Mode">
        Focus
      </button>
    </div>
  );

  const footerBar = (
    <div className="flex justify-between items-center mt-1.5">
      <span className="text-xs text-gray-400">
        {selectedTab?.date ? `Last modified: ${selectedTab.date}` : ''}
      </span>
      <div className="flex items-center gap-3 text-xs text-gray-500">
        {markdownMode && <span className="text-black font-medium">Markdown</span>}
        <span>{textStats.words} words</span>
        <span>{textStats.characters} chars</span>
        <span>{textStats.lines} lines</span>
        {textStats.readingTime > 0 && <span>~{textStats.readingTime} min read</span>}
      </div>
    </div>
  );

  const showEditor = viewMode === "split" || viewMode === "editor";
  const showPreview = viewMode === "split" || viewMode === "preview";

  const editorPanel = (
    <div className={`flex flex-col min-h-0 ${viewMode === 'split' ? `w-1/2 border-r ${currentTheme.border}` : 'w-full'} ${currentTheme.bg} ${currentTheme.text}`}>
      {!isFocusMode && (
        <div className={`px-3 py-1.5 ${currentTheme.secondaryBg} border-b ${currentTheme.border} text-xs opacity-60 font-medium flex-shrink-0`}>
          EDITOR
        </div>
      )}
      {markdownToolbar}
      <div className="flex flex-1 min-h-0">
        {/* Line numbers */}
        {!isFocusMode && (
          <div className={`flex-shrink-0 ${currentTheme.accent} border-r ${currentTheme.border} text-right select-none overflow-hidden`}>
            <div className="p-3 text-xs font-mono opacity-30 leading-[1.7]">
              {Array.from({ length: lineCount }, (_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>
          </div>
        )}
        <textarea
          ref={textareaRef}
          onChange={editTextNotes}
          onScroll={handleEditorScroll}
          onKeyDown={handleKeyDownTextarea}
          spellCheck="true"
          value={selectedTab?.notes ?? ""}
          placeholder={"Write markdown here...\n\n# Heading 1\n## Heading 2\n\n**Bold** *Italic* ~~Strikethrough~~\n\n- List item\n- [ ] Task\n\n```code block```"}
          className={`flex-1 w-full outline-none p-3 text-sm font-mono resize-none leading-[1.7] bg-transparent ${currentTheme.text} ${isFocusMode ? 'max-w-4xl mx-auto px-10' : ''}`}
        />
      </div>
    </div>
  );

  const previewPanel = (
    <div className={`flex flex-col min-h-0 ${viewMode === 'split' ? 'w-1/2' : 'w-full'} ${currentTheme.bg} ${currentTheme.text}`}>
      {!isFocusMode && (
        <div className={`px-3 py-1.5 ${currentTheme.secondaryBg} border-b ${currentTheme.border} text-xs opacity-60 font-medium flex-shrink-0`}>
          PREVIEW
        </div>
      )}
      <div ref={previewRef} onScroll={viewMode === 'split' ? handlePreviewScroll : undefined}
        className={`flex-1 p-4 overflow-auto prose-quicknote ${currentTheme.prose} ${isFocusMode ? 'max-w-4xl mx-auto px-10' : ''}`}>
        {markdownContent ? (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code: HighlightedCode,
              h1: headingRenderer(1),
              h2: headingRenderer(2),
              h3: headingRenderer(3),
              h4: headingRenderer(4),
              h5: headingRenderer(5),
              h6: headingRenderer(6),
              a: linkRenderer,
            }}
          >
            {markdownContent}
          </ReactMarkdown>
        ) : (
          <p className="text-gray-400 text-sm italic">Markdown preview will appear here...</p>
        )}
      </div>
    </div>
  );

  // ===== MARKDOWN FULL-SCREEN MODE =====
  if (markdownMode) {
    return (
      <div className={`fixed inset-0 z-50 ${currentTheme.bg} ${currentTheme.text} flex flex-col`}>
        {!isFocusMode && (
          <div className="px-4 pt-3 flex-shrink-0">
            {toolbarButtons}
            {tabBar}
            {searchReplacePanel}
            {statsPanel}
          </div>
        )}
        {isFocusMode && (
          <div className="h-4 flex-shrink-0" />
        )}

        {/* TOC sidebar + editor area */}
        <div className={`flex flex-1 ${!isFocusMode ? `border-t ${currentTheme.border}` : ''} min-h-0`}>
          {/* TOC sidebar */}
          {!isFocusMode && showToc && tocItems.length > 0 && (
            <div className={`w-56 flex-shrink-0 border-r ${currentTheme.border} ${currentTheme.accent} overflow-y-auto`}>
              <div className={`px-3 py-1.5 ${currentTheme.secondaryBg} border-b ${currentTheme.border} text-xs opacity-60 font-medium`}>
                TABLE OF CONTENTS
              </div>
              <nav className="p-2">
                {tocItems.map((item, i) => (
                  <button key={i} onClick={() => scrollToHeading(item.id)}
                    className={`block w-full text-left text-xs py-1 px-2 hover:${currentTheme.secondaryBg} rounded-sm truncate transition-colors`}
                    style={{ paddingLeft: `${(item.level - 1) * 12 + 8}px` }}>
                    {item.text}
                  </button>
                ))}
              </nav>
            </div>
          )}

          {/* Editor + Preview */}
          <div className="flex flex-1 min-h-0">
            {showEditor && editorPanel}
            {showPreview && previewPanel}
          </div>
        </div>

        {!isFocusMode && (
          <div className={`px-4 py-1.5 border-t ${currentTheme.border} opacity-50 flex-shrink-0`}>
            {footerBar}
          </div>
        )}
        {isFocusMode && (
          <div className="fixed bottom-4 right-4 z-50">
            <button onClick={() => setIsFocusMode(false)}
              className="bg-black text-white px-3 py-1.5 text-xs rounded-sm opacity-50 hover:opacity-100 transition-opacity">
              Exit Focus Mode
            </button>
          </div>
        )}
      </div>
    );
  }

  // ===== NORMAL (PLAIN TEXT) MODE =====
  return (
    <>
      {toolbarButtons}
      {tabBar}
      {searchReplacePanel}
      {statsPanel}

      {showFormatTools && (
        <div className="mb-3 p-3 border border-black bg-gray-50 rounded-sm">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-semibold text-gray-800">Text Formatting</h3>
            <button onClick={() => setShowFormatTools(false)} className="text-xs text-gray-500 hover:text-black">Close</button>
          </div>
          <div className="space-y-2">
            <div>
              <div className="text-xs text-gray-400 mb-1">Case</div>
              <div className="flex flex-wrap gap-1">
                <button onClick={formatToUpperCase} className="px-2.5 py-1 text-xs bg-white hover:bg-gray-100 border border-gray-300 rounded-sm" title="UPPERCASE">UPPER</button>
                <button onClick={formatToLowerCase} className="px-2.5 py-1 text-xs bg-white hover:bg-gray-100 border border-gray-300 rounded-sm" title="lowercase">lower</button>
                <button onClick={formatToTitleCase} className="px-2.5 py-1 text-xs bg-white hover:bg-gray-100 border border-gray-300 rounded-sm" title="Title Case">Title</button>
                <button onClick={formatToSentenceCase} className="px-2.5 py-1 text-xs bg-white hover:bg-gray-100 border border-gray-300 rounded-sm" title="Sentence case">Sentence</button>
                <button onClick={formatCapitalizeLines} className="px-2.5 py-1 text-xs bg-white hover:bg-gray-100 border border-gray-300 rounded-sm" title="Capitalize lines">Cap Lines</button>
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-400 mb-1">Cleanup</div>
              <div className="flex flex-wrap gap-1">
                <button onClick={formatToParagraph} className="px-2.5 py-1 text-xs bg-white hover:bg-gray-100 border border-gray-300 rounded-sm" title="Merge to paragraph">Paragraph</button>
                <button onClick={formatRemoveExtraSpaces} className="px-2.5 py-1 text-xs bg-white hover:bg-gray-100 border border-gray-300 rounded-sm" title="Remove extra spaces">Clean</button>
                <button onClick={formatRemoveSpacing} className="px-2.5 py-1 text-xs bg-white hover:bg-gray-100 border border-gray-300 rounded-sm" title="Remove spacing">No Spacing</button>
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-400 mb-1">Line prefix (select text first)</div>
              <div className="flex flex-wrap gap-1">
                <button onClick={addTabToSelectedLines} className="px-2.5 py-1 text-xs bg-white hover:bg-gray-100 border border-gray-300 rounded-sm" title="Ctrl+Shift+T">Tab</button>
                <button onClick={addSpaceToSelectedLines} className="px-2.5 py-1 text-xs bg-white hover:bg-gray-100 border border-gray-300 rounded-sm" title="Ctrl+Shift+S">Space</button>
                <button onClick={addBulletToSelectedLines} className="px-2.5 py-1 text-xs bg-white hover:bg-gray-100 border border-gray-300 rounded-sm" title="Ctrl+Shift+B">Bullet</button>
                <button onClick={addDashToSelectedLines} className="px-2.5 py-1 text-xs bg-white hover:bg-gray-100 border border-gray-300 rounded-sm" title="Ctrl+Shift+D">Dash</button>
                <button onClick={addPlusToSelectedLines} className="px-2.5 py-1 text-xs bg-white hover:bg-gray-100 border border-gray-300 rounded-sm" title="Ctrl+Shift+P">Plus</button>
                <button onClick={addAsteriskToSelectedLines} className="px-2.5 py-1 text-xs bg-white hover:bg-gray-100 border border-gray-300 rounded-sm" title="Ctrl+Shift+A">Star</button>
                <button onClick={addNumberToSelectedLines} className="px-2.5 py-1 text-xs bg-white hover:bg-gray-100 border border-gray-300 rounded-sm" title="Ctrl+Shift+N">1. 2. 3.</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <textarea
        ref={textareaRef}
        onChange={editTextNotes}
        onKeyDown={handleKeyDownTextarea}
        spellCheck="true"
        value={selectedTab?.notes ?? ""}
        placeholder="Enter content"
        rows={15}
        className="w-full outline-none border border-black p-3 min-h-[400px] text-sm font-mono resize-y"
      />

      {footerBar}
    </>
  );
};
