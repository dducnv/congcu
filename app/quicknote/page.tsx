import { Container, TextareaQuicknote, TitlePage } from "@/components";
import React from "react";

//seo

export const metadata = {
  title: "Ghi chú nhanh",
  description: "Ghi chú nhanh",
};

const page = () => {
  return (
    <>
     <div className="h-20"></div>
      <TitlePage>Ghi chú nhanh</TitlePage>
      <Container width="max-w-6xl" className="p-3">
        <TextareaQuicknote />
      </Container>
    </>
  );
};

export default page;
