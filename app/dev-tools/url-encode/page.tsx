import ToolSeo from "@/components/seo/ToolSeo";
import { buildMetadata } from "@/core/seo/metadata";
import UrlEncodeTool from "@/components/dev_tools/url_encode_tool";

const PATH = "/dev-tools/url-encode";

export const metadata = buildMetadata(PATH);

export default function Page() {
  return (
    <>
      <UrlEncodeTool />
      <ToolSeo path={PATH} />
    </>
  );
}
