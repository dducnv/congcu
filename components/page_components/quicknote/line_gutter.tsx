"use client";

import { memo, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

/**
 * Line numbers that stay aligned with a wrapping textarea. A hidden mirror
 * with the same font and width measures how tall each source line renders,
 * and the numbers follow the textarea's scroll position.
 */
export const LineGutter = memo(function LineGutter({
  text,
  textarea,
  activeLine,
  fontKey,
}: {
  text: string;
  textarea: HTMLTextAreaElement | null;
  activeLine: number;
  fontKey: string;
}) {
  const mirrorRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [heights, setHeights] = useState<number[]>([]);
  const lines = useMemo(() => text.split("\n"), [text]);

  useEffect(() => {
    if (!textarea) return;
    const measure = () => {
      const cs = getComputedStyle(textarea);
      setWidth(textarea.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(textarea);
    return () => ro.disconnect();
  }, [textarea, fontKey]);

  useLayoutEffect(() => {
    const m = mirrorRef.current;
    if (!m || width <= 0) return;
    const hs: number[] = [];
    for (let i = 0; i < m.children.length; i++) hs.push((m.children[i] as HTMLElement).offsetHeight);
    setHeights(hs);
  }, [lines, width, fontKey]);

  useEffect(() => {
    if (!textarea) return;
    const sync = () => {
      if (innerRef.current) innerRef.current.style.transform = `translateY(${-textarea.scrollTop}px)`;
    };
    sync();
    textarea.addEventListener("scroll", sync, { passive: true });
    return () => textarea.removeEventListener("scroll", sync);
  }, [textarea]);

  return (
    <div className="qn-gutter" aria-hidden>
      <div ref={innerRef} className="qn-gutter-inner">
        {lines.map((_, i) => (
          <div key={i} style={heights[i] ? { height: heights[i] } : undefined} className={i + 1 === activeLine ? "is-active" : undefined}>
            {i + 1}
          </div>
        ))}
      </div>
      <div ref={mirrorRef} className="qn-mirror qn-editor-font" style={{ width: width > 0 ? width : undefined }}>
        {lines.map((l, i) => (
          <div key={i}>{l || "​"}</div>
        ))}
      </div>
    </div>
  );
});
