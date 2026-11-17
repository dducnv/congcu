import { SEO_PAGES, getPageBySlug } from "@/core/seo/pages";
import { SITE } from "@/core/seo/site";
import { ImageResponse } from "next/og";

// One 1200×630 social preview image per page, generated at build time.
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return SEO_PAGES.map((p) => ({ slug: p.slug }));
}

export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  const page = getPageBySlug(params.slug);
  if (!page) return new Response("Not found", { status: 404 });
  const isHome = page.path === "/";

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#FFF0E5", padding: 56 }}>
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            background: "#ffffff",
            border: "4px solid #111111",
            boxShadow: "-16px 16px 0 #111111",
            padding: "56px 64px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div
              style={{
                width: 64,
                height: 64,
                background: "#111111",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 30,
                fontWeight: 700,
                borderRadius: 12,
              }}
            >
              MT
            </div>
            <div style={{ fontSize: 34, fontWeight: 700, color: "#111111" }}>{SITE.name}</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ fontSize: isHome ? 64 : 78, fontWeight: 700, color: "#111111", lineHeight: 1.08, letterSpacing: -1.5 }}>
              {isHome ? "Free online tools that run in your browser" : page.name}
            </div>
            <div style={{ fontSize: 34, color: "#3f3f3a", lineHeight: 1.3 }}>{isHome ? "JSON · SQL & CSV · QR codes · OCR · Regex · Notes" : page.tagline}</div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 26, color: "#5f5f58" }}>
            <span>tools4u.vercel.app</span>
            <span>Free · No signup · Private</span>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
