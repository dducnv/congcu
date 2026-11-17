"use client";

import hljs from "highlight.js/lib/core";
import bash from "highlight.js/lib/languages/bash";
import cpp from "highlight.js/lib/languages/cpp";
import css from "highlight.js/lib/languages/css";
import go from "highlight.js/lib/languages/go";
import java from "highlight.js/lib/languages/java";
import javascript from "highlight.js/lib/languages/javascript";
import json from "highlight.js/lib/languages/json";
import markdown from "highlight.js/lib/languages/markdown";
import python from "highlight.js/lib/languages/python";
import rust from "highlight.js/lib/languages/rust";
import sql from "highlight.js/lib/languages/sql";
import typescript from "highlight.js/lib/languages/typescript";
import xml from "highlight.js/lib/languages/xml";
import yaml from "highlight.js/lib/languages/yaml";
import React, { forwardRef, memo, useEffect, useMemo, useState } from "react";
import ReactMarkdown, { defaultUrlTransform, type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

const LANGS: Record<string, any> = {
  javascript, js: javascript, jsx: javascript,
  typescript, ts: typescript, tsx: typescript,
  python, py: python,
  css,
  html: xml, xml,
  json,
  bash, sh: bash, shell: bash, zsh: bash,
  sql, java, go, rust,
  cpp, c: cpp,
  markdown, md: markdown,
  yaml, yml: yaml,
};
for (const [name, lang] of Object.entries(LANGS)) {
  if (!hljs.getLanguage(name)) hljs.registerLanguage(name, lang);
}

export const TAB_LINK = "#qn-tab:";

/** [[Tab name]] becomes a link that switches tabs. */
export function preprocessMarkdown(md: string) {
  return md.replace(/\[\[([^\]\n]+?)\]\]/g, (_, name: string) => `[${name}](${TAB_LINK}${encodeURIComponent(name.trim())})`);
}

function nodeText(node: React.ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(nodeText).join("");
  if (React.isValidElement(node)) return nodeText((node.props as { children?: React.ReactNode }).children);
  return "";
}

// ---------- code blocks ----------

const CodeBlock = memo(function CodeBlock({ code, lang, line }: { code: string; lang?: string; line?: number }) {
  const [copied, setCopied] = useState(false);
  const html = useMemo(() => {
    if (!lang || !hljs.getLanguage(lang)) return null;
    try {
      return hljs.highlight(code, { language: lang, ignoreIllegals: true }).value;
    } catch {
      return null;
    }
  }, [code, lang]);

  const copy = () => {
    navigator.clipboard
      ?.writeText(code)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      })
      .catch(() => undefined);
  };

  return (
    <div className="qn-code" data-line={line}>
      <div className="qn-code-head" data-export="skip">
        <span>{lang ?? ""}</span>
        <button type="button" onClick={copy}>
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre>
        {html ? (
          <code className={`hljs language-${lang}`} dangerouslySetInnerHTML={{ __html: html }} />
        ) : (
          <code className="hljs">{code}</code>
        )}
      </pre>
    </div>
  );
});

// ---------- mermaid ----------

let mermaidLoader: Promise<any> | null = null;
let mermaidSeq = 0;

function loadMermaid() {
  if (!mermaidLoader) {
    mermaidLoader = new Promise((resolve, reject) => {
      const w = window as any;
      const init = () => {
        w.mermaid.initialize({ startOnLoad: false, securityLevel: "strict", theme: "neutral" });
        resolve(w.mermaid);
      };
      if (w.mermaid) return init();
      const s = document.createElement("script");
      s.src = "https://cdn.jsdelivr.net/npm/mermaid@10.9.1/dist/mermaid.min.js";
      s.async = true;
      s.onload = init;
      s.onerror = () => {
        mermaidLoader = null;
        reject(new Error("Could not load Mermaid"));
      };
      document.head.appendChild(s);
    });
  }
  return mermaidLoader;
}

const MermaidBlock = memo(function MermaidBlock({ code, line }: { code: string; line?: number }) {
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    const t = setTimeout(() => {
      const id = `qn-mermaid-${++mermaidSeq}`;
      loadMermaid()
        .then((m) => m.render(id, code))
        .then((r: { svg: string }) => {
          if (!alive) return;
          setSvg(r.svg);
          setError(null);
        })
        .catch((e: unknown) => {
          document.getElementById(`d${id}`)?.remove();
          if (alive) setError(e instanceof Error ? e.message : String(e));
        });
    }, 250);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [code]);

  if (svg) return <div className="qn-mermaid" data-line={line} dangerouslySetInnerHTML={{ __html: svg }} />;
  return (
    <div className="qn-code" data-line={line}>
      {error && <div className="qn-mermaid-error">Mermaid: {error}</div>}
      <pre>
        <code className="hljs">{code}</code>
      </pre>
    </div>
  );
});

// ---------- element overrides (module level so they stay stable between renders) ----------

type WithNode = { node?: { position?: { start: { line: number } } } };

/** Source line of a markdown node; used for scroll sync, TOC jumps and checklists. */
const lineOf = (node: unknown) => (node as WithNode["node"])?.position?.start.line;

/** Renders `tag` with a data-line attribute pointing at its source line. */
function withLine(tag: string) {
  const C = ({ node, children, ...props }: React.HTMLAttributes<HTMLElement> & WithNode) =>
    React.createElement(tag, { ...props, "data-line": lineOf(node) }, children);
  C.displayName = `QnLine(${tag})`;
  return C;
}

const components: Components = {
  h1: withLine("h1"),
  h2: withLine("h2"),
  h3: withLine("h3"),
  h4: withLine("h4"),
  h5: withLine("h5"),
  h6: withLine("h6"),
  p: withLine("p"),
  blockquote: withLine("blockquote"),
  li: withLine("li"),
  hr({ node }) {
    return <hr data-line={lineOf(node)} />;
  },
  pre({ node, children }) {
    const child = React.Children.toArray(children)[0];
    const props = (React.isValidElement(child) ? child.props : {}) as { className?: string; children?: React.ReactNode };
    const lang = /language-([\w+#-]+)/.exec(props.className ?? "")?.[1]?.toLowerCase();
    const code = nodeText(props.children).replace(/\n$/, "");
    if (lang === "mermaid") return <MermaidBlock code={code} line={lineOf(node)} />;
    return <CodeBlock code={code} lang={lang} line={lineOf(node)} />;
  },
  input({ node, type, checked, ...props }) {
    if (type !== "checkbox") return <input type={type} {...props} />;
    return <input type="checkbox" checked={!!checked} readOnly aria-label="Toggle task" className="qn-task" />;
  },
  a({ node, href, children, ...props }) {
    if (href?.startsWith(TAB_LINK)) {
      const name = decodeURIComponent(href.slice(TAB_LINK.length));
      return (
        <a href={href} data-tab-link={name} className="qn-tab-link" title={`Open tab: ${name}`}>
          {children}
        </a>
      );
    }
    return (
      <a href={href} {...props} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  },
  table({ node, ...props }) {
    return (
      <div className="qn-table-wrap" data-line={lineOf(node)}>
        <table {...props} />
      </div>
    );
  },
};

const plugins = [remarkGfm];

function urlTransform(url: string) {
  return url.startsWith(TAB_LINK) ? url : defaultUrlTransform(url);
}

type PreviewProps = {
  markdown: string;
  className?: string;
  hidden?: boolean;
  onToggleTask: (line: number) => void;
  onOpenTab: (name: string) => void;
  onScroll?: React.UIEventHandler<HTMLDivElement>;
};

export const MarkdownPreview = memo(
  forwardRef<HTMLDivElement, PreviewProps>(function MarkdownPreview(
    { markdown, className, hidden, onToggleTask, onOpenTab, onScroll },
    ref,
  ) {
    const source = useMemo(() => preprocessMarkdown(markdown), [markdown]);

    const onClick = (e: React.MouseEvent<HTMLDivElement>) => {
      const target = e.target as HTMLElement;
      if (target instanceof HTMLInputElement && target.type === "checkbox") {
        e.preventDefault();
        const line = Number(target.closest("li")?.getAttribute("data-line"));
        if (line) onToggleTask(line);
        return;
      }
      const tabLink = target.closest("[data-tab-link]");
      if (tabLink) {
        e.preventDefault();
        onOpenTab(tabLink.getAttribute("data-tab-link") ?? "");
      }
    };

    return (
      <div ref={ref} className={className} hidden={hidden} onClick={onClick} onScroll={onScroll}>
        {source.trim() ? (
          <ReactMarkdown remarkPlugins={plugins} components={components} urlTransform={urlTransform}>
            {source}
          </ReactMarkdown>
        ) : (
          <p className="qn-empty">Nothing to preview yet. Start typing in the editor.</p>
        )}
      </div>
    );
  }),
);
