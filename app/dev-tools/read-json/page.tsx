import ToolSeo from "@/components/seo/ToolSeo";
import { buildMetadata } from "@/core/seo/metadata";
import JsonViewerPage from "@/components/json_editor/json_editor_body_component";

const PATH = "/dev-tools/read-json";

export const metadata = buildMetadata(PATH);

export default function Page() {
  return (
    <>
      <JsonViewerPage />
      <ToolSeo path={PATH} />
    </>
  );
}
