import ToolSeo from "@/components/seo/ToolSeo";
import { buildMetadata } from "@/core/seo/metadata";
import dynamic from "next/dynamic";

const ImageEditorComponent = dynamic(
  () => import("@/components/page_components/image_editor").then((mod) => ({ default: mod.ImageEditorComponent })),
  { ssr: false },
);

const PATH = "/quick-image-editor";

export const metadata = buildMetadata(PATH);

export default function Page() {
  return (
    <>
      <h1 className="sr-only">Quick Image Editor</h1>
      <div className="h-screen flex flex-col overflow-hidden">
        <div className="flex-1 flex overflow-hidden">
          <ImageEditorComponent />
        </div>
      </div>
      <ToolSeo path={PATH} />
    </>
  );
}
