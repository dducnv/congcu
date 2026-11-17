import HomeBody from "@/components/home/home_body";
import JsonLd from "@/components/seo/JsonLd";
import { buildMetadata, organizationSchema, websiteSchema } from "@/core/seo/metadata";

export const metadata = buildMetadata("/");

const homeSchema = {
  "@context": "https://schema.org",
  "@graph": [websiteSchema(), organizationSchema()],
};

export default function Page() {
  return (
    <>
      <JsonLd data={homeSchema} />
      <HomeBody />
    </>
  );
}