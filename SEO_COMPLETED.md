# SEO

Toàn bộ SEO của site được sinh từ **một registry duy nhất**: `core/seo/pages.ts`.
Muốn thêm hoặc sửa một trang, chỉ cần sửa entry trong file đó.

## Mỗi entry sinh ra

| Thứ được sinh | Ở đâu |
|---|---|
| `<title>`, description, canonical, robots, Open Graph, Twitter card | `buildMetadata()` trong `core/seo/metadata.ts`, gọi từ `page.tsx` |
| Ảnh chia sẻ 1200×630 (sinh tĩnh lúc build) | `app/og/[slug]/route.tsx` → `/og/<slug>` |
| JSON-LD: `WebApplication`, `BreadcrumbList`, `FAQPage` | `components/seo/ToolSeo.tsx` |
| Phần "About / How to use / FAQ / More free tools" hiển thị dưới công cụ | `components/seo/ToolSeo.tsx` |
| `sitemap.xml` (bỏ qua trang `noindex`) | `app/sitemap.ts` |

## Quy ước

- `title` ≤ ~47 ký tự; layout tự thêm ` | MultiTools` (tổng ≤ 60).
- `description` 120–158 ký tự, viết cho người đọc, không nhồi từ khoá.
- Mỗi trang đúng **một `<h1>`**. Sidebar và trang chủ không dùng heading cho link điều hướng.
- FAQ trong JSON-LD phải trùng với FAQ hiển thị trên trang (Google yêu cầu).
- Trang chưa làm xong: đặt `noindex: true` (ra khỏi sitemap, gắn `noindex`).
- Đổi `SITE.updated` trong `core/seo/site.ts` khi nội dung thay đổi đáng kể (dùng cho `lastmod`).
- Import component trực tiếp (`@/components/title_page`), **không** import qua barrel `@/components` trong `app/`: barrel kéo cả site vào bundle (~700 kB).

## Thêm một trang công cụ mới

1. Thêm entry vào `SEO_PAGES` (`core/seo/pages.ts`).
2. Trong `app/<route>/page.tsx`:

```tsx
import ToolSeo from "@/components/seo/ToolSeo";
import { buildMetadata } from "@/core/seo/metadata";

const PATH = "/my-tool";
export const metadata = buildMetadata(PATH);

export default function Page() {
  return (
    <>
      <MyTool />        {/* phải có đúng một <h1> */}
      <ToolSeo path={PATH} />
    </>
  );
}
```

3. Thêm link vào `core/data_local/sidebar_data.ts`.
