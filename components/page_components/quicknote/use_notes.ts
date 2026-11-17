"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { uid } from "uid";
import type { NoteTab, Prefs } from "./types";

// Same key as the previous version, so existing notes load unchanged.
const STORAGE_KEY = "textNotesList";
const ACTIVE_KEY = "quicknote:active";
const PREFS_KEY = "quicknote:prefs";

const DEFAULT_PREFS: Prefs = { view: "split", theme: "light", fontSize: "normal", showToc: false };

function read(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

export function newTab(partial: Partial<NoteTab> = {}): NoteTab {
  return {
    id: uid(),
    file_name: "Untitled",
    notes: "",
    date: new Date().toISOString(),
    ...partial,
  };
}

/** Accepts anything that looks like a list of notes; fixes missing fields and duplicate ids. */
export function normalizeTabs(input: unknown, taken: Set<string> = new Set()): NoteTab[] {
  if (!Array.isArray(input)) return [];
  const out: NoteTab[] = [];
  for (const raw of input) {
    if (!raw || typeof raw !== "object") continue;
    const r = raw as Record<string, unknown>;
    let id = typeof r.id === "string" && r.id ? r.id : uid();
    while (taken.has(id)) id = uid();
    taken.add(id);
    out.push({
      id,
      file_name: typeof r.file_name === "string" && r.file_name.trim() ? r.file_name : "Untitled",
      notes: typeof r.notes === "string" ? r.notes : "",
      date: typeof r.date === "string" ? r.date : new Date().toISOString(),
      ext: r.ext === "txt" ? "txt" : r.ext === "md" ? "md" : undefined,
    });
  }
  return out;
}

export function useNotes() {
  const [tabs, setTabs] = useState<NoteTab[]>([]);
  const [activeId, setActiveId] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [pending, setPending] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [saveFailed, setSaveFailed] = useState(false);
  const [prefs, setPrefsState] = useState<Prefs>(DEFAULT_PREFS);

  const tabsRef = useRef(tabs);
  tabsRef.current = tabs;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ----- load -----
  useEffect(() => {
    let list: NoteTab[] = [];
    try {
      list = normalizeTabs(JSON.parse(read(STORAGE_KEY) ?? "[]"));
    } catch {
      list = [];
    }
    if (!list.length) list = [newTab({ file_name: "New Tab" })];
    const savedActive = read(ACTIVE_KEY);
    setTabs(list);
    setActiveId(list.some((t) => t.id === savedActive) ? (savedActive as string) : list[0].id);
    try {
      const p = JSON.parse(read(PREFS_KEY) ?? "{}");
      setPrefsState({ ...DEFAULT_PREFS, ...p });
    } catch {
      /* keep defaults */
    }
    setLoaded(true);
  }, []);

  // ----- save (debounced, flushed when the page is hidden) -----
  const flush = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    const ok = write(STORAGE_KEY, JSON.stringify(tabsRef.current));
    setSaveFailed(!ok);
    if (ok) setSavedAt(new Date());
    setPending(false);
    return ok;
  }, []);

  useEffect(() => {
    if (!loaded) return;
    setPending(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(flush, 400);
  }, [tabs, loaded, flush]);

  useEffect(() => {
    const onHide = () => {
      if (timer.current) flush();
    };
    const onVis = () => {
      if (document.visibilityState === "hidden") onHide();
    };
    window.addEventListener("pagehide", onHide);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.removeEventListener("pagehide", onHide);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [flush]);

  useEffect(() => {
    if (loaded && activeId) write(ACTIVE_KEY, activeId);
  }, [activeId, loaded]);

  const setPrefs = useCallback((patch: Partial<Prefs>) => {
    setPrefsState((p) => {
      const next = { ...p, ...patch };
      write(PREFS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  // ----- derived -----
  const active = useMemo(() => tabs.find((t) => t.id === activeId) ?? tabs[0], [tabs, activeId]);

  // ----- actions -----
  const updateNotes = useCallback((id: string, notes: string) => {
    setTabs((list) =>
      list.map((t) => (t.id === id && t.notes !== notes ? { ...t, notes, date: new Date().toISOString() } : t)),
    );
  }, []);

  const addTab = useCallback((partial: Partial<NoteTab> = {}) => {
    const tab = newTab(partial);
    setTabs((list) => [...list, tab]);
    setActiveId(tab.id);
    return tab;
  }, []);

  /** Open several files. The first one fills the active tab when it is empty. */
  const openTabs = useCallback(
    (items: Array<Pick<NoteTab, "file_name" | "notes" | "ext">>) => {
      if (!items.length) return;
      const next = [...tabsRef.current];
      let queue = items;
      let focusId = "";
      const idx = next.findIndex((t) => t.id === (active?.id ?? ""));
      if (idx !== -1 && !next[idx].notes.trim()) {
        const [first, ...rest] = queue;
        next[idx] = { ...next[idx], ...first, date: new Date().toISOString() };
        focusId = next[idx].id;
        queue = rest;
      }
      for (const item of queue) {
        const tab = newTab(item);
        next.push(tab);
        focusId = tab.id;
      }
      setTabs(next);
      setActiveId(focusId);
    },
    [active?.id],
  );

  /** Close a tab. Returns what is needed to undo it. Closing the last tab leaves a fresh empty one. */
  const closeTab = useCallback(
    (id: string) => {
      const list = tabsRef.current;
      const index = list.findIndex((t) => t.id === id);
      if (index === -1) return null;
      const tab = list[index];
      let next = list.filter((t) => t.id !== id);
      if (!next.length) next = [newTab()];
      setTabs(next);
      if (id === activeId) setActiveId(next[Math.max(0, index - 1)]?.id ?? next[0].id);
      return { tab, index };
    },
    [activeId],
  );

  const restoreTab = useCallback((tab: NoteTab, index: number) => {
    setTabs((list) => {
      const cleaned = list.length === 1 && !list[0].notes && list[0].id !== tab.id ? [] : list;
      if (cleaned.some((t) => t.id === tab.id)) return list;
      const next = [...cleaned];
      next.splice(Math.min(index, next.length), 0, tab);
      return next;
    });
    setActiveId(tab.id);
  }, []);

  const renameTab = useCallback((id: string, name: string) => {
    const clean = name.trim();
    if (!clean) return;
    setTabs((list) => list.map((t) => (t.id === id ? { ...t, file_name: clean } : t)));
  }, []);

  /** Append tabs from a backup. Ids that already exist get new ids. */
  const importTabs = useCallback((data: unknown) => {
    const taken = new Set(tabsRef.current.map((t) => t.id));
    const incoming = normalizeTabs(data, taken);
    if (!incoming.length) return 0;
    setTabs((list) => [...list, ...incoming]);
    setActiveId(incoming[0].id);
    return incoming.length;
  }, []);

  return {
    tabs,
    active,
    activeId: active?.id ?? "",
    setActiveId,
    loaded,
    pending,
    savedAt,
    saveFailed,
    prefs,
    setPrefs,
    flush,
    updateNotes,
    addTab,
    openTabs,
    closeTab,
    restoreTab,
    renameTab,
    importTabs,
  };
}
