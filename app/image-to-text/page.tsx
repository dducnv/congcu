import ToolSeo from "@/components/seo/ToolSeo";
import { buildMetadata } from "@/core/seo/metadata";
import { TitlePage } from "@/components/title_page";
import dynamic from "next/dynamic";

// Loaded on the client only: tesseract.js needs browser APIs.
const ImageToTextPage = dynamic(() => import("@/components/image_to_text/image_to_text"), { ssr: false });

const PATH = "/image-to-text";

export const metadata = buildMetadata(PATH);

export default function Page() {
  return (
    <>
      <div className="mx-auto max-w-4xl px-4 pt-4 text-center">
        <TitlePage>Image to Text Converter (OCR)</TitlePage>
      </div>
      <ImageToTextPage />
      <ToolSeo path={PATH} />
    </>
  );
}
