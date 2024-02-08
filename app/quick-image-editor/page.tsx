
import React from "react";
import { Container, ImageEditor, TitlePage } from "@/components";

//seo

export const metadata = {
  title: "Chỉnh ảnh nhanh",
  description: "Chỉnh ảnh nhanh",
};


const page = () => {
  return (
    <div className="max-h-screen overflow-hidden h-screen scroll-m-0">
      <div className="h-20"></div>
      <TitlePage>Chỉnh ảnh nhanh</TitlePage>
      <Container width="max-w-6xl" className="p-3 flex">
        <ImageEditor/>
      </Container>
    </div>
  );
};

export default page;
