import ToolSeo from "@/components/seo/ToolSeo";
import { buildMetadata } from "@/core/seo/metadata";
import CsvView from "@/components/csv_view/csv_view";

const PATH = "/dev-tools/csv-viewer";

export const metadata = buildMetadata(PATH);

export default function Page() {
  return (
    <>
      <CsvView />
      <ToolSeo path={PATH} />
    </>
  );
}
