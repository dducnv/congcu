"use client";

import { useEffect, useRef, useState } from "react";
import { tipFor } from "./shortcuts";
import type { NoteTab } from "./types";
import { Btn } from "./ui";

function formatDate(s: string) {
  const d = new Date(s);
  return isNaN(d.getTime()) ? s : d.toLocaleString();
}

export function TabBar({
  tabs,
  activeId,
  pending,
  onSelect,
  onClose,
  onRename,
  onAdd,
}: {
  tabs: NoteTab[];
  activeId: string;
  pending: boolean;
  onSelect: (id: string) => void;
  onClose: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onAdd: () => void;
}) {
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  // Keep the active tab in view.
  useEffect(() => {
    scroller.current?.querySelector<HTMLElement>(`[data-tab-id="${activeId}"]`)?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [activeId, tabs.length]);

  const commit = () => {
    if (editing) onRename(editing, draft);
    setEditing(null);
  };

  return (
    <div className="qn-bar qn-tabs">
      <div ref={scroller} className="qn-tabs-scroll" role="tablist" aria-label="Notes">
        {tabs.map((t) => {
          const active = t.id === activeId;
          return (
            <div
              key={t.id}
              data-tab-id={t.id}
              role="tab"
              aria-selected={active}
              tabIndex={active ? 0 : -1}
              className={`qn-tab${active ? " is-active" : ""}`}
              title={`${t.file_name}\nEdited ${formatDate(t.date)}\nDouble-click to rename`}
              onClick={() => onSelect(t.id)}
              onDoubleClick={() => {
                setDraft(t.file_name);
                setEditing(t.id);
              }}
              onKeyDown={(e) => {
                if (e.key === "F2" || e.key === "Enter") {
                  setDraft(t.file_name);
                  setEditing(t.id);
                }
              }}
              onAuxClick={(e) => {
                if (e.button === 1) onClose(t.id);
              }}
            >
              <span className={`qn-dot${active && pending ? " is-pending" : ""}`} aria-hidden />
              {editing === t.id ? (
                <input
                  ref={inputRef}
                  id={`qn-rename-${t.id}`}
                  className="qn-tab-input"
                  value={draft}
                  aria-label="Tab name"
                  onChange={(e) => setDraft(e.target.value)}
                  onBlur={commit}
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => {
                    e.stopPropagation();
                    if (e.key === "Enter") commit();
                    if (e.key === "Escape") setEditing(null);
                  }}
                />
              ) : (
                <span className="qn-tab-name">{t.file_name}</span>
              )}
              <button
                type="button"
                className="qn-tab-close"
                aria-label={`Close ${t.file_name}`}
                onMouseDown={(e) => e.preventDefault()}
                onClick={(e) => {
                  e.stopPropagation();
                  onClose(t.id);
                }}
              >
                ×
              </button>
            </div>
          );
        })}
      </div>
      <Btn icon tip={tipFor("New tab", "newTab")} onClick={onAdd} className="qn-tab-add">
        +
      </Btn>
    </div>
  );
}
