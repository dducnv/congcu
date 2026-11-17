import ToolSeo from "@/components/seo/ToolSeo";
import { buildMetadata } from "@/core/seo/metadata";
import { TextareaQuicknote } from "@/components/page_components/quicknote/quicknote";

const PATH = "/quicknote";

export const metadata = buildMetadata(PATH);

export default function Page() {
  return (
    <>
      <h1 className="sr-only">Quick Note: online notepad and Markdown editor</h1>
      <TextareaQuicknote />
      <ToolSeo path={PATH} />
    </>
  );
}
