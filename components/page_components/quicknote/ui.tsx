"use client";

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

// ---------- button ----------

type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  tip?: string;
  active?: boolean;
  variant?: "ghost" | "outline" | "solid";
  icon?: boolean;
};

/**
 * Toolbar button. mousedown is prevented so clicking a button never steals
 * focus (and the selection) from the editor.
 */
export const Btn = React.forwardRef<HTMLButtonElement, BtnProps>(function Btn(
  { tip, active, variant = "ghost", icon, className = "", children, onMouseDown, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      data-tip={tip}
      aria-label={rest["aria-label"] ?? tip?.split("  ")[0]}
      aria-pressed={active === undefined ? undefined : active}
      onMouseDown={(e) => {
        e.preventDefault();
        onMouseDown?.(e);
      }}
      className={`qn-btn qn-btn-${variant}${icon ? " qn-btn-icon" : ""}${active ? " is-active" : ""} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
});

export const Sep = () => <span className="qn-sep" aria-hidden />;

export const RowLabel = ({ children }: { children: React.ReactNode }) => <span className="qn-row-label">{children}</span>;

/** Icon for line-prefix buttons: a marker followed by two text lines. */
export function PrefixIcon({ mark, kind }: { mark?: string; kind?: "box" | "quote" }) {
  return (
    <span className="qn-pfx" aria-hidden>
      {kind === "box" ? <span className="qn-pfx-box" /> : kind === "quote" ? <span className="qn-pfx-quote" /> : <span className="qn-pfx-mark">{mark}</span>}
      <span className="qn-pfx-lines" />
    </span>
  );
}

// ---------- tooltip (one floating element for the whole tool, so toolbars can scroll) ----------

export function useTooltip(root: React.RefObject<HTMLElement>) {
  const [tip, setTip] = useState<{ text: string; x: number; y: number } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const show = (target: HTMLElement) => {
      const text = target.getAttribute("data-tip");
      if (!text) return;
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        const r = target.getBoundingClientRect();
        setTip({ text, x: r.left + r.width / 2, y: r.bottom + 6 });
      }, 350);
    };
    const hide = () => {
      if (timer.current) clearTimeout(timer.current);
      setTip(null);
    };
    const over = (e: Event) => {
      const t = (e.target as HTMLElement).closest?.("[data-tip]") as HTMLElement | null;
      if (t && el.contains(t)) show(t);
      else hide();
    };
    el.addEventListener("mouseover", over);
    el.addEventListener("focusin", over);
    el.addEventListener("mouseleave", hide);
    el.addEventListener("focusout", hide);
    el.addEventListener("mousedown", hide);
    return () => {
      el.removeEventListener("mouseover", over);
      el.removeEventListener("focusin", over);
      el.removeEventListener("mouseleave", hide);
      el.removeEventListener("focusout", hide);
      el.removeEventListener("mousedown", hide);
    };
  }, [root]);

  return tip;
}

export function TooltipView({ tip }: { tip: { text: string; x: number; y: number } | null }) {
  const ref = useRef<HTMLDivElement>(null);
  const [left, setLeft] = useState(0);
  useLayoutEffect(() => {
    if (!tip || !ref.current) return;
    const w = ref.current.offsetWidth;
    setLeft(Math.max(8, Math.min(window.innerWidth - w - 8, tip.x - w / 2)));
  }, [tip]);
  if (!tip) return null;
  return (
    <div ref={ref} className="qn-tooltip" role="tooltip" style={{ left, top: tip.y }}>
      {tip.text}
    </div>
  );
}

// ---------- popover anchored to a button (fixed position so it is never clipped) ----------

export function Popover({
  anchor,
  onClose,
  width = 280,
  children,
}: {
  anchor: HTMLElement | null;
  onClose: () => void;
  width?: number;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);

  useLayoutEffect(() => {
    if (!anchor) return;
    const r = anchor.getBoundingClientRect();
    setPos({ left: Math.max(8, Math.min(window.innerWidth - width - 8, r.left)), top: r.bottom + 6 });
  }, [anchor, width]);

  useEffect(() => {
    const down = (e: MouseEvent) => {
      if (ref.current?.contains(e.target as Node) || anchor?.contains(e.target as Node)) return;
      onClose();
    };
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", down);
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("mousedown", down);
      document.removeEventListener("keydown", key);
    };
  }, [anchor, onClose]);

  if (!pos) return null;
  return (
    <div ref={ref} className="qn-popover" style={{ left: pos.left, top: pos.top, width }}>
      {children}
    </div>
  );
}

// ---------- toast ----------

export type ToastAction = { label: string; run: () => void };
export type ToastState = { id: number; text: string; action?: ToastAction; tone?: "error" };

export function useToast() {
  const [toast, setToast] = useState<ToastState | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const seq = useRef(0);

  const show = useCallback((text: string, opts: { action?: ToastAction; tone?: "error" } = {}) => {
    if (timer.current) clearTimeout(timer.current);
    seq.current += 1;
    setToast({ id: seq.current, text, ...opts });
    timer.current = setTimeout(() => setToast(null), opts.action ? 6000 : opts.tone ? 4000 : 2200);
  }, []);

  const dismiss = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    setToast(null);
  }, []);

  return { toast, show, dismiss };
}

export function ToastView({ toast, onDismiss }: { toast: ToastState | null; onDismiss: () => void }) {
  return (
    <div className="qn-toast-region" aria-live="polite">
      {toast && (
        <div key={toast.id} className={`qn-toast${toast.tone === "error" ? " is-error" : ""}`}>
          <span>{toast.text}</span>
          {toast.action && (
            <button
              type="button"
              onClick={() => {
                toast.action?.run();
                onDismiss();
              }}
            >
              {toast.action.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
