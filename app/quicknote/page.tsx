import { Container } from "@/components";
import { TextareaQuicknote } from "@/components/page_components/textarea_quicknote";
import React from "react";

const page = () => {
  return (
    <>
      <Container width="max-w-6xl">
        <TextareaQuicknote/>
      </Container>
    </>
  );
};

export default page;
