import ToolSeo from "@/components/seo/ToolSeo";
import { buildMetadata } from "@/core/seo/metadata";
import QrGenerator from "@/components/qr_generator/qr_generator";

const PATH = "/create-qr";

export const metadata = buildMetadata(PATH);

export default function Page() {
  return (
    <>
      <QrGenerator />
      <ToolSeo path={PATH} />
    </>
  );
}
