export type NoteTab = {
  id: string;
  file_name: string;
  notes: string;
  /** Last modified. Older notes store a locale string, newer ones ISO. */
  date: string;
  /** Extension used when saving. Missing means "md". */
  ext?: "md" | "txt";
};

export type ViewMode = "write" | "split" | "read";
export type ThemeMode = "light" | "sepia" | "lightgray" | "dark" | "deepdark";
export type FontSizeMode = "small" | "normal" | "large" | "xlarge";
export type ReadingFont = "sans" | "serif";

export type Prefs = {
  view: ViewMode;
  theme: ThemeMode;
  fontSize: FontSizeMode;
  readingFont: ReadingFont;
  showToc: boolean;
};

export type Sel = { start: number; end: number };

/** Replace text[from, to) with `insert`, then select `select` (coordinates in the new text). */
export type Edit = { from: number; to: number; insert: string; select: Sel };

export type TocItem = { level: number; text: string; line: number };
