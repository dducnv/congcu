import ToolSeo from "@/components/seo/ToolSeo";
import { buildMetadata } from "@/core/seo/metadata";
import Base64Tool from "@/components/dev_tools/base64_tool";

const PATH = "/dev-tools/base64";

export const metadata = buildMetadata(PATH);

export default function Page() {
  return (
    <>
      <Base64Tool />
      <ToolSeo path={PATH} />
    </>
  );
}
