import { ColorPickerFromImage, TitlePage } from '@/components'
import rgbHex from "rgb-hex";
import hexRgb from "hex-rgb";
import React from 'react'



const page = () => {
  return (
    <>
    
    <TitlePage>
        Chọn màu từ ảnh
    </TitlePage>
    <ColorPickerFromImage/>
    <canvas className="hidden" id="cs"></canvas>
    </>
  )
}

export default page