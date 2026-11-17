import ToolSeo from "@/components/seo/ToolSeo";
import { buildMetadata } from "@/core/seo/metadata";
import ColorTools from "@/components/color_tools/color_tools";

const PATH = "/color-tools";

export const metadata = buildMetadata(PATH);

export default function Page() {
  return (
    <>
      <ColorTools />
      <ToolSeo path={PATH} />
    </>
  );
}
