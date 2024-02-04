import { Container, TitlePage } from "@/components";
import { TextareaQuicknote } from "@/components/page_components/textarea_quicknote";
import React from "react";

//seo 

export const metadata = {
  title: "Ghi chú nhanh",
  description: "Ghi chú nhanh",
};

const page = () => {
  return (
    <>
      <TitlePage>Ghi chú nhanh</TitlePage>
      <Container width="max-w-6xl">
        <TextareaQuicknote />
      </Container>
    </>
  );
};

export default page;
