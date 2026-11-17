import ToolSeo from "@/components/seo/ToolSeo";
import { buildMetadata } from "@/core/seo/metadata";
import RegexTester from "@/components/dev_tools/regex_tester";

const PATH = "/dev-tools/regex";

export const metadata = buildMetadata(PATH);

export default function Page() {
  return (
    <>
      <RegexTester />
      <ToolSeo path={PATH} />
    </>
  );
}
