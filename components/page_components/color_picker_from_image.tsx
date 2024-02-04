"use client";

import React, { useEffect, useState } from "react";
import rgbHex from "rgb-hex";
import hexRgb from "hex-rgb";
interface CanvasConvertArgs {
  el: HTMLCanvasElement;
  image: HTMLImageElement;
  callback: () => void;
}

interface GetCordsResult {
  x: number;
  y: number;
}

interface GenerateImageArgs {
  inputFile: HTMLInputElement;
  displayFile: HTMLImageElement;
}

function canvasConvert(args: CanvasConvertArgs) {
  const { el, image, callback } = args;

  el.width = image.width; // img width
  el.height = image.height; // img height

  // draw image in canvas tag
  el.getContext("2d")!.drawImage(image, 0, 0, image.width, image.height);

  callback();
}

// generate image on file select
function generateImage(args: GenerateImageArgs) {
  const { inputFile, displayFile } = args;

  let imgInput = inputFile;
  const db = window.localStorage;

  // check if exists image-base64
  if (!db.getItem("image-base64")) {
    setTimeout(() => {
      db.setItem("image-base64", displayFile.getAttribute("src")!);
    }, 100);
  }

  // Restore image src from local storage
  const updateUi = () => {
    setTimeout(() => {
      displayFile.src = db.getItem("image-base64")!;
    }, 200);
  };

  // on select file render image preview
  const bindUi = () => {
    imgInput.addEventListener("change", (event) => {
      const selectedFile = event.target as HTMLInputElement;
      if (selectedFile.files && selectedFile.files.length > 0) {
        const reader = new FileReader();
        reader.onload = (e) => {
          db.setItem("image-base64", e?.target?.result as string);
          updateUi();
        };
        // generate image data uri
        reader.readAsDataURL(selectedFile.files[0]);
      }
    });
  };

  // update first
  updateUi();
  // select file
  bindUi();
}
const sampleImg =
  "https://res.cloudinary.com/dduc7th-dec/image/upload/v1707067620/slqklbwghhjrgf6dy65k.jpg";
export const ColorPickerFromImage = () => {
  const [hex, setHex] = useState<string>("#ffffff");
  const [colors, setColors] = useState<string[]>([]);
  const [colorSelect, setColorSelect] = useState<string>("#ffffff");

  const getCords = (cords: MouseEvent): GetCordsResult => {
    let x = 0,
      y = 0;
    // chrome
    if (cords.offsetX) {
      x = cords.offsetX;
      y = cords.offsetY;
    } else if (cords.target) {
      const target = cords.target as HTMLImageElement;
      const rect = target.getBoundingClientRect();
      x = cords.clientX - rect.left;
      y = cords.clientY - rect.top;
    } else {
      x = cords.clientX;
      y = cords.clientY;
    }

    return { x, y };
  };

  const getColorParams = (
    event: MouseEvent,
    element: HTMLElement | null,
    bol: boolean
  ) => {
    const cords = getCords(event);
    const canvas = document.querySelector("#cs") as HTMLCanvasElement;
    const thumb = document.querySelector("img") as HTMLImageElement;

    canvasConvert({
      el: canvas,
      image: thumb,
      callback: () => {
        const params: CanvasRenderingContext2D = canvas.getContext("2d")!;
        const imageData: ImageData = params.getImageData(cords.x, cords.y, 1, 1);
        const pixelData: Uint8ClampedArray = imageData.data;
        
        // Get color
        const bg: string = "#" + rgbHex(pixelData[0], pixelData[1], pixelData[2]);
        
        // Set color
        setHex(bg);
        
        // If click, push new color
        if (bol) {
          setColors((colors) =>
            !colors.includes(bg) ? [...colors, bg] : [...colors]
          );
          setColorSelect(bg);
        }
        
        // Add background to body
        if (element) {
          element.style.background = bg;
        }
      },
    });
  };

  useEffect(() => {
    const inputFile = document.querySelector(
      "#image-input"
    ) as HTMLInputElement;
    const displayFile = document.querySelector("img") as HTMLImageElement;
    const preview = document.querySelector(".preview-color") as HTMLElement;
    // getnerate image on select file
    generateImage({
      inputFile,
      displayFile,
    });
    // click function
    displayFile.addEventListener("click", (event) => {
      getColorParams(event, null, true);
    });
    // preview function mousemove
    displayFile.addEventListener("mousemove", (event) => {
      getColorParams(event, preview, false);
    });
  }, []);
  return (
    <div className="w-full">
      <div className="flex">
        <div className="w-2/3 mr-2 bg-white border border-black ">
          <div className="border-b border-black p-2 bg-white">
            <input type="file" id="image-input" />
          </div>
          <img
            src={sampleImg}
            className="w-full h-auto object-contain cursor-crosshair"
            id="image-display"
            alt=""
          />
        </div>
        <div className="w-1/3">
          <div
            className=" h-32 w-full mb-3 p-3 border border-black"
            style={{ background: hex }}
          >
            <h3 className=" font-bold">Click chuột để chọn màu:</h3>
            <span className="text-sm bg-black text-white">hex: {hex}</span>
            <br />
            <span className="text-sm bg-black text-white">
              rgb:{" "}
              {`${hexRgb(hex).red}, ${hexRgb(hex).green}, ${
                hexRgb(hex).blue
              }, ${hexRgb(hex).alpha}`}
            </span>
          </div>
          <div className="w-full p-2  bg-white min-h-[50px] border border-black">
            <h3 className="text-sm font-bold">Màu đã chọn:</h3>
            <div className="flex mb-2">
              <div
                className=" w-20 h-20 mr-2 top-3 right-3 border border-black"
                style={{ background: colorSelect }}
              />
              <div>
                <span className="text-sm bg-black text-white">
                  hex: {colorSelect}
                </span>
                <br />
                <span className="text-sm bg-black text-white">
                  rgb:{" "}
                  {`${hexRgb(colorSelect).red}, ${hexRgb(colorSelect).green}, ${
                    hexRgb(colorSelect).blue
                  }, ${hexRgb(colorSelect).alpha}`}
                </span>
              </div>
            </div>
            <div className="p-2">
              <h3 className="mb-1 font-bold">Lịch sử chọn màu:</h3>
              <div className="grid gap-y-2 gap-x-2  grid-cols-4 ">
                {colors?.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => setColorSelect(item)}
                    style={{ background: item }}
                    className={`h-14 mr-1 border rounded-md ${
                      item + index == colorSelect + index &&
                      " border-4 border-indigo-400"
                    }`}
                  ></button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
