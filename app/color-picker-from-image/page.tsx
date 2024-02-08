import { ColorPickerFromImage, TitlePage } from "@/components";
import rgbHex from "rgb-hex";
import hexRgb from "hex-rgb";
import React from "react";

const page = () => {
  return (
    <>
      <div className="h-20"></div>

      <TitlePage>Chọn màu từ ảnh</TitlePage>
      <div className=" px-14">
        <ColorPickerFromImage />
      </div>
      <canvas className="hidden" id="cs"></canvas>
    </>
  );
};

export default page;
