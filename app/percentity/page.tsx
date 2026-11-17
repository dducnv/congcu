import ToolSeo from "@/components/seo/ToolSeo";
import { buildMetadata } from "@/core/seo/metadata";
import { TitlePage } from "@/components/title_page";
import { PercentBlocks } from "@/components/percentity/percentity";

const PATH = "/percentity";

export const metadata = buildMetadata(PATH);

export default function Page() {
  return (
    <>
      <div className="min-h-screen py-8 px-2">
        <TitlePage>Percentage Calculator</TitlePage>
        <PercentBlocks />
      </div>
      <ToolSeo path={PATH} />
    </>
  );
}
