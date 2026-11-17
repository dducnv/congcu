import ToolSeo from "@/components/seo/ToolSeo";
import { buildMetadata } from "@/core/seo/metadata";
import EmojiPage from "@/components/emoji/emoji";

const PATH = "/emoji";

export const metadata = buildMetadata(PATH);

export default function Page() {
  return (
    <>
      <EmojiPage />
      <ToolSeo path={PATH} />
    </>
  );
}
