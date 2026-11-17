import ToolSeo from "@/components/seo/ToolSeo";
import { buildMetadata } from "@/core/seo/metadata";
import GenerateSecretKeyPage from "@/components/generate_secret_key/generate_secret_key";

const PATH = "/dev-tools/generate-secret-key";

export const metadata = buildMetadata(PATH);

export default function Page() {
  return (
    <>
      <GenerateSecretKeyPage />
      <ToolSeo path={PATH} />
    </>
  );
}
