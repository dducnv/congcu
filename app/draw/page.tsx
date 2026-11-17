import ToolSeo from "@/components/seo/ToolSeo";
import { buildMetadata } from "@/core/seo/metadata";
import dynamic from "next/dynamic";

const DrawComponent = dynamic(async () => import("@/components/page_components/draw_component"), { ssr: false });

const PATH = "/draw";

export const metadata = buildMetadata(PATH);

export default function Page() {
  return (
    <>
      <h1 className="sr-only">Online Whiteboard &amp; Drawing Tool</h1>
      <div className="max-h-screen h-screen relative pl-1 overflow-hidden bg-white">
        <DrawComponent />
      </div>
      <ToolSeo path={PATH} />
    </>
  );
}
