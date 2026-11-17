"use client";

import emojiData from "@/core/data_local/emoji.json";
import { useMemo, useRef, useState } from "react";
import type { CommandId } from "./shortcuts";
import { tipFor } from "./shortcuts";
import { TEMPLATES } from "./templates";
import type { EditorMode, ViewMode } from "./types";
import { Btn, Popover, PrefixIcon, RowLabel, Sep } from "./ui";

// ---------- A: command bar ----------

export function CommandBar(props: {
  mode: EditorMode;
  setMode: (m: EditorMode) => void;
  view: ViewMode;
  setView: (v: ViewMode) => void;
  showToc: boolean;
  toggleToc: () => void;
  searchOpen: boolean;
  toggleSearch: () => void;
  fullscreen: boolean;
  toggleFullscreen: () => void;
  onOpen: () => void;
  onSave: (asTxt: boolean) => void;
  onExportHtml: () => void;
  onBackup: () => void;
  onRestore: () => void;
  onCopy: (kind: "md" | "text" | "rich") => void;
  saveExt: string;
}) {
  const md = props.mode === "md";
  const views: Array<[ViewMode, string]> = [
    ["write", "Write"],
    ["split", "Split"],
    ["read", "Read"],
  ];
  return (
    <div className="qn-bar qn-bar-cmd">
      <div className="qn-group">
        <Btn tip={tipFor("Open .md / .txt files", "open")} onClick={props.onOpen}>
          Open
        </Btn>
        <Btn tip={`Download as .${props.saveExt}  ·  Shift+click for .${props.saveExt === "txt" ? "md" : "txt"}`} onClick={(e) => props.onSave(e.shiftKey)}>
          Save
        </Btn>
        {md && (
          <Btn tip="Download as a styled HTML page" onClick={props.onExportHtml}>
            Export HTML
          </Btn>
        )}
        <Sep />
        <Btn tip="Download an encrypted backup of every tab" onClick={props.onBackup}>
          Backup
        </Btn>
        <Btn tip="Add tabs from a backup file" onClick={props.onRestore}>
          Restore
        </Btn>
        <Sep />
        {md ? (
          <>
            <Btn variant="outline" tip="Copy the markdown source" onClick={() => props.onCopy("md")}>
              Copy MD
            </Btn>
            <Btn variant="outline" tip="Copy as plain text without markdown symbols" onClick={() => props.onCopy("text")}>
              Copy text
            </Btn>
            <Btn variant="outline" tip="Copy formatted text for Docs, Mail, Slack" onClick={() => props.onCopy("rich")}>
              Copy rich
            </Btn>
          </>
        ) : (
          <Btn variant="outline" tip="Copy the whole note" onClick={() => props.onCopy("md")}>
            Copy
          </Btn>
        )}
      </div>
      <div className="qn-group">
        {md && (
          <Btn tip="Table of contents" active={props.showToc} onClick={props.toggleToc}>
            TOC
          </Btn>
        )}
        <Btn tip={tipFor("Search & replace", "search")} active={props.searchOpen} onClick={props.toggleSearch}>
          Search
        </Btn>
        {md && (
          <>
            <Sep />
            <div className="qn-seg" role="group" aria-label="View" data-tip={tipFor("Switch view", "cycleView")}>
              {views.map(([v, label]) => (
                <button
                  key={v}
                  type="button"
                  aria-pressed={props.view === v}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => props.setView(v)}
                >
                  {label}
                </button>
              ))}
            </div>
            <Btn tip={tipFor(props.fullscreen ? "Exit full screen" : "Full screen", "fullscreen")} active={props.fullscreen} onClick={props.toggleFullscreen}>
              {props.fullscreen ? "Exit full screen" : "Full screen"}
            </Btn>
          </>
        )}
        <Sep />
        <button
          type="button"
          role="switch"
          aria-checked={md}
          className={`qn-mode${md ? " is-on" : ""}`}
          data-tip={md ? "Back to the plain note" : "Markdown editor with preview"}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => props.setMode(md ? "note" : "md")}
        >
          <span>MD</span>
          <span className="qn-mode-track" aria-hidden>
            <span className="qn-mode-thumb" />
          </span>
        </button>
      </div>
    </div>
  );
}

// ---------- C: markdown formatting row ----------

export function MarkdownBar({ run, history }: { run: (id: CommandId) => void; history: (kind: "undo" | "redo") => void }) {
  return (
    <div className="qn-bar qn-bar-fmt" role="toolbar" aria-label="Markdown formatting">
      <RowLabel>Markdown</RowLabel>
      <Btn icon tip="Undo  ⌘Z / Ctrl+Z" onClick={() => history("undo")}>
        <svg className="qn-svg" viewBox="0 0 16 16" aria-hidden>
          <path d="M5.5 3.5 2.5 6.5l3 3M2.5 6.5H10a3.5 3.5 0 0 1 0 7H7" />
        </svg>
      </Btn>
      <Btn icon tip="Redo  ⇧⌘Z / Ctrl+Y" onClick={() => history("redo")}>
        <svg className="qn-svg" viewBox="0 0 16 16" aria-hidden>
          <path d="M10.5 3.5l3 3-3 3M13.5 6.5H6a3.5 3.5 0 0 0 0 7h3" />
        </svg>
      </Btn>
      <Sep />
      <Btn icon tip={tipFor("Heading 1", "h1")} onClick={() => run("h1")}>H1</Btn>
      <Btn icon tip={tipFor("Heading 2", "h2")} onClick={() => run("h2")}>H2</Btn>
      <Btn icon tip={tipFor("Heading 3", "h3")} onClick={() => run("h3")}>H3</Btn>
      <Btn icon tip={tipFor("Normal text", "paragraph")} onClick={() => run("paragraph")}>¶</Btn>
      <Sep />
      <Btn icon tip={tipFor("Bold", "bold")} onClick={() => run("bold")}><b>B</b></Btn>
      <Btn icon tip={tipFor("Italic", "italic")} onClick={() => run("italic")}><i className="font-serif">I</i></Btn>
      <Btn icon tip={tipFor("Strikethrough", "strike")} onClick={() => run("strike")}><s>S</s></Btn>
      <Btn icon tip={tipFor("Inline code", "inlineCode")} onClick={() => run("inlineCode")}>{"</>"}</Btn>
      <Btn icon tip={tipFor("Highlight", "highlight")} onClick={() => run("highlight")}><span className="qn-mark-icon">H</span></Btn>
      <Sep />
      <Btn icon tip={tipFor("Bullet list (- )", "ul")} onClick={() => run("ul")}><PrefixIcon mark="•" /></Btn>
      <Btn icon tip={tipFor("Numbered list (1. )", "ol")} onClick={() => run("ol")}><PrefixIcon mark="1." /></Btn>
      <Btn icon tip={tipFor("Checklist (- [ ] )", "task")} onClick={() => run("task")}><PrefixIcon kind="box" /></Btn>
      <Btn icon tip={tipFor("Quote (> )", "quote")} onClick={() => run("quote")}><PrefixIcon kind="quote" /></Btn>
      <Sep />
      <Btn tip={tipFor("Link", "link")} onClick={() => run("link")}>Link</Btn>
      <Btn tip="Image" onClick={() => run("image")}>Image</Btn>
      <Btn tip="Table" onClick={() => run("table")}>Table</Btn>
      <Btn tip={tipFor("Code block", "codeBlock")} onClick={() => run("codeBlock")}>Code block</Btn>
      <Btn tip="Horizontal rule" onClick={() => run("hr")}>— HR</Btn>
      <Sep />
      <Btn icon tip="Indent lines  Tab" onClick={() => run("indent")}>⇥</Btn>
      <Btn icon tip="Outdent lines  Shift+Tab" onClick={() => run("outdent")}>⇤</Btn>
    </div>
  );
}

// ---------- D: text tools row ----------

const EMOJI_GROUPS: Array<[string, string]> = [
  ["smileys-emotion", "😀"],
  ["people-body", "👋"],
  ["animals-nature", "🐶"],
  ["food-drink", "🍎"],
  ["travel-places", "🚗"],
  ["activities", "⚽"],
  ["objects", "💡"],
  ["symbols", "❤️"],
  ["flags", "🏁"],
];

type Emoji = { slug: string; character: string; unicodeName: string; group: string };

function EmojiPicker({ onPick }: { onPick: (c: string) => void }) {
  const [q, setQ] = useState("");
  const [group, setGroup] = useState("smileys-emotion");
  const list = useMemo(() => {
    const all = emojiData as Emoji[];
    const s = q.trim().toLowerCase();
    if (s) return all.filter((e) => e.unicodeName.toLowerCase().includes(s) || e.slug.includes(s)).slice(0, 120);
    return all.filter((e) => e.group === group).slice(0, 160);
  }, [q, group]);
  return (
    <div className="qn-emoji">
      <input id="qn-emoji-search" autoFocus placeholder="Search emoji…" value={q} onChange={(e) => setQ(e.target.value)} className="qn-input" />
      {!q && (
        <div className="qn-emoji-groups">
          {EMOJI_GROUPS.map(([g, icon]) => (
            <button key={g} type="button" aria-pressed={g === group} title={g.replace("-", " & ")} onClick={() => setGroup(g)}>
              {icon}
            </button>
          ))}
        </div>
      )}
      <div className="qn-emoji-grid">
        {list.map((e) => (
          <button key={e.slug} type="button" title={e.unicodeName} onMouseDown={(ev) => ev.preventDefault()} onClick={() => onPick(e.character)}>
            {e.character}
          </button>
        ))}
        {!list.length && <p className="qn-muted">No emoji found</p>}
      </div>
    </div>
  );
}

export function TextBar({
  run,
  insert,
  insertTemplate,
  markdown,
}: {
  run: (id: CommandId) => void;
  insert: (s: string) => void;
  insertTemplate: (s: string) => void;
  /** Templates are Markdown, so they only show in the MD editor. */
  markdown: boolean;
}) {
  const emojiBtn = useRef<HTMLButtonElement>(null);
  const tplBtn = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState<"emoji" | "tpl" | null>(null);
  const close = () => setOpen(null);
  const scope = "  ·  selection, or the whole tab";

  return (
    <div className="qn-bar qn-bar-fmt" role="toolbar" aria-label="Text tools">
      <RowLabel>Text</RowLabel>
      <Btn tip={tipFor("UPPERCASE", "upper") + scope} onClick={() => run("upper")}>UPPER</Btn>
      <Btn tip={tipFor("lowercase", "lower") + scope} onClick={() => run("lower")}>lower</Btn>
      <Btn tip={"Title Case" + scope} onClick={() => run("title")}>Title</Btn>
      <Btn tip={"Sentence case" + scope} onClick={() => run("sentence")}>Sentence</Btn>
      <Btn tip={"Capitalize each line" + scope} onClick={() => run("capLines")}>Cap lines</Btn>
      <Sep />
      <RowLabel>Prefix</RowLabel>
      <Btn icon tip={tipFor("Start lines with •", "pfxBullet")} onClick={() => run("pfxBullet")}><PrefixIcon mark="•" /></Btn>
      <Btn icon tip={tipFor("Start lines with -", "pfxDash")} onClick={() => run("pfxDash")}><PrefixIcon mark="-" /></Btn>
      <Btn icon tip={tipFor("Start lines with +", "pfxPlus")} onClick={() => run("pfxPlus")}><PrefixIcon mark="+" /></Btn>
      <Btn icon tip={tipFor("Start lines with *", "pfxStar")} onClick={() => run("pfxStar")}><PrefixIcon mark="*" /></Btn>
      <Btn icon tip={tipFor("Number lines 1. 2. 3.", "pfxNumber")} onClick={() => run("pfxNumber")}><PrefixIcon mark="1." /></Btn>
      <Btn icon tip={tipFor("Start lines with a space", "pfxSpace")} onClick={() => run("pfxSpace")}><PrefixIcon mark="␣" /></Btn>
      <Btn icon tip={tipFor("Start lines with a tab", "pfxTab")} onClick={() => run("pfxTab")}><PrefixIcon mark="⇥" /></Btn>
      <Btn icon tip="Remove line markers" onClick={() => run("pfxRemove")}><PrefixIcon mark="✕" /></Btn>
      <Sep />
      <Btn tip={"Collapse extra spaces and blank lines" + scope} onClick={() => run("cleanSpaces")}>Clean spaces</Btn>
      <Btn tip={tipFor("Join lines into one paragraph", "joinLines") + scope} onClick={() => run("joinLines")}>Join lines</Btn>
      <Btn tip={"Remove empty lines" + scope} onClick={() => run("removeBlank")}>Remove blank</Btn>
      <Btn tip={"Sort lines A→Z" + scope} onClick={() => run("sort")}>Sort</Btn>
      <Btn tip={"Remove duplicate lines" + scope} onClick={() => run("dedupe")}>Dedupe</Btn>
      <Btn tip={"Remove markdown symbols" + scope} onClick={() => run("stripMd")}>Strip MD</Btn>
      <Sep />
      <Btn tip={tipFor("Insert date & time", "time")} onClick={() => run("time")}>Time</Btn>
      <Btn ref={emojiBtn} tip="Insert emoji" active={open === "emoji"} onClick={() => setOpen(open === "emoji" ? null : "emoji")}>
        Emoji
      </Btn>
      {markdown && (
        <Btn ref={tplBtn} tip="Insert a template" active={open === "tpl"} onClick={() => setOpen(open === "tpl" ? null : "tpl")}>
          Templates
        </Btn>
      )}

      {open === "emoji" && (
        <Popover anchor={emojiBtn.current} onClose={close} width={300}>
          <EmojiPicker
            onPick={(c) => {
              insert(c);
              close();
            }}
          />
        </Popover>
      )}
      {open === "tpl" && (
        <Popover anchor={tplBtn.current} onClose={close} width={220}>
          <div className="qn-menu">
            {TEMPLATES.map((t) => (
              <button
                key={t.name}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  insertTemplate(t.build());
                  close();
                }}
              >
                {t.name}
              </button>
            ))}
          </div>
        </Popover>
      )}
    </div>
  );
}
