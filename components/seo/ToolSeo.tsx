import { toolGraph } from "@/core/seo/metadata";
import { getPage, relatedPages } from "@/core/seo/pages";
import Link from "next/link";
import JsonLd from "./JsonLd";

/**
 * Structured data plus a server-rendered "About" section for a tool page:
 * what the tool does, how to use it, FAQ and links to related tools.
 * Rendered below the tool so search engines see real text, not just an app shell.
 */
export function ToolSeo({ path }: { path: string }) {
  const page = getPage(path);
  const related = relatedPages(page);
  const showContent = !page.ownContent && (page.intro?.length || page.steps?.length || page.faqs?.length);

  return (
    <>
      <JsonLd data={toolGraph(page)} />
      {showContent ? (
        <section aria-labelledby="tool-about" className="mx-auto max-w-4xl px-4 pb-16 pt-12 text-gray-900">
          <div className="border border-black bg-white p-6 md:p-8">
            <h2 id="tool-about" className="text-2xl font-bold text-mono">
              About {page.name}
            </h2>
            {page.intro?.map((p) => (
              <p key={p} className="mt-3 leading-relaxed text-gray-800">
                {p}
              </p>
            ))}

            {page.steps?.length ? (
              <>
                <h3 className="mt-8 text-lg font-semibold">How to use {page.name}</h3>
                <ol className="mt-3 list-decimal space-y-1.5 pl-5 leading-relaxed text-gray-800">
                  {page.steps.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ol>
              </>
            ) : null}

            {page.features?.length ? (
              <>
                <h3 className="mt-8 text-lg font-semibold">Features</h3>
                <ul className="mt-3 list-disc space-y-1.5 pl-5 leading-relaxed text-gray-800">
                  {page.features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </>
            ) : null}

            {page.faqs?.length ? (
              <>
                <h3 className="mt-8 text-lg font-semibold">Frequently asked questions</h3>
                <dl className="mt-3 space-y-4">
                  {page.faqs.map((f) => (
                    <div key={f.q}>
                      <dt className="font-medium">{f.q}</dt>
                      <dd className="mt-1 leading-relaxed text-gray-700">{f.a}</dd>
                    </div>
                  ))}
                </dl>
              </>
            ) : null}

            {related.length ? (
              <nav aria-label="Related tools" className="mt-8 border-t border-gray-200 pt-6">
                <h3 className="text-sm font-semibold text-gray-800">More free tools</h3>
                <ul className="mt-3 flex flex-wrap gap-2 text-sm">
                  {related.map((r) => (
                    <li key={r.path}>
                      <Link href={r.path} className="inline-block border border-black px-3 py-1 transition-colors hover:bg-black hover:text-white">
                        {r.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ) : null}
          </div>
        </section>
      ) : null}
    </>
  );
}

export default ToolSeo;
