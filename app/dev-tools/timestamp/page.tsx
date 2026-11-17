import ToolSeo from "@/components/seo/ToolSeo";
import { buildMetadata } from "@/core/seo/metadata";
import TimestampTool from "@/components/dev_tools/timestamp_tool";

const PATH = "/dev-tools/timestamp";

export const metadata = buildMetadata(PATH);

export default function Page() {
  return (
    <>
      <TimestampTool />
      <ToolSeo path={PATH} />
    </>
  );
}
