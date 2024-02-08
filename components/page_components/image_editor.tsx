/* eslint-disable @next/next/no-img-element */
"use client";

import Image from "next/image";
import React, {
  useState,
  useEffect,
  useRef,
  DependencyList,
  SyntheticEvent,
  ChangeEvent,
} from "react";
import ReactCrop, {
  PixelCrop,
  type Crop,
  centerCrop,
  makeAspectCrop,
  convertToPixelCrop,
} from "react-image-crop";
import { canvasPreview } from "./canvas_preview";
import { useDebounceEffect } from "./use_debounce_effect";

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: "%",
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

export const ImageEditor = () => {
  const [imgSrc, setImgSrc] = useState("");
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const hiddenAnchorRef = useRef<HTMLAnchorElement>(null);
  const blobUrlRef = useRef("");
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);
  const [aspect, setAspect] = useState<number | undefined>(16 / 9);
  function onSelectFile(e: ChangeEvent<HTMLInputElement>): void {
    if (e.target.files && e.target.files.length > 0) {
      setCrop(undefined);
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setImgSrc(reader.result?.toString() || "");
      });
      reader.readAsDataURL(e.target.files[0]);
    }
  }

  function onImageLoad(e: SyntheticEvent<HTMLImageElement>): void {
    if (aspect) {
      const { width, height } = e.currentTarget;
      setCrop(centerAspectCrop(width, height, aspect));
    }
  }

  async function onDownloadCropClick(): Promise<void> {
    try {
      const image = imgRef.current;
      const previewCanvas = previewCanvasRef.current;
      if (!image || !previewCanvas || !completedCrop) {
        throw new Error("Crop canvas does not exist");
      }

      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      const offscreen = new OffscreenCanvas(
        completedCrop.width * scaleX,
        completedCrop.height * scaleY
      );

      const ctx = offscreen.getContext("2d");
      if (!ctx) {
        throw new Error("No 2d context");
      }

      ctx.drawImage(
        previewCanvas,
        0,
        0,
        previewCanvas.width,
        previewCanvas.height,
        0,
        0,
        offscreen.width,
        offscreen.height
      );

      const blob = await offscreen.convertToBlob({ type: "image/png" });

      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
      }

      blobUrlRef.current = URL.createObjectURL(blob);

      if (hiddenAnchorRef.current) {
        hiddenAnchorRef.current.href = blobUrlRef.current;
        hiddenAnchorRef.current.click();
      }
    } catch (error) {
      console.error("Error during download:", error);
    }
  }

  useDebounceEffect(
    async () => {
      if (
        completedCrop?.width &&
        completedCrop?.height &&
        imgRef.current &&
        previewCanvasRef.current
      ) {
        // We use canvasPreview as it's much faster than imgPreview.
        canvasPreview(
          imgRef.current,
          previewCanvasRef.current,
          completedCrop,
          scale,
          rotate
        );
      }
    },
    100,
    [completedCrop, scale, rotate]
  );

  function handleToggleAspectClick() {
    if (aspect) {
      setAspect(undefined);
    } else {
      setAspect(16 / 9);

      if (imgRef.current) {
        const { width, height } = imgRef.current;
        const newCrop = centerAspectCrop(width, height, 16 / 9);
        setCrop(newCrop);
        // Updates the preview
        setCompletedCrop(convertToPixelCrop(newCrop, width, height));
      }
    }
  }

  function reset() {
    setScale(1);
    setRotate(0);
  }
  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={onSelectFile}
        className="w-full"
      />

      {imgSrc && (
        <div>
          <hr className="my-2" />
          <div className="flex space-x-4  items-center mb-2">
            <button
              onClick={handleToggleAspectClick}
              className=" hover:underline"
            >
              {aspect ? "Tắt" : "Bật"} chỉnh lề
            </button>

            <div className="flex items-center space-x-2">
              <label htmlFor="scale">Tỉ lệ:</label>
              <input
                type="range"
                min="1"
                max="3"
                step="0.1"
                value={scale}
                onChange={(e) => setScale(parseFloat(e.target.value))}
              />
            </div>

            <div className="flex items-center  space-x-2">
              <label htmlFor="rotate">Xoay:</label>
              <input
                type="range"
                min="0"
                max="360"
                step="1"
                value={rotate}
                onChange={(e) => setRotate(parseFloat(e.target.value))}
              />
            </div>

            <button onClick={reset} className="hover:underline text-red-500">
              Khôi phục
            </button>
          </div>
        </div>
      )}
      <div className="flex w-full space-x-2">
        <div className="w-1/2">
          {!!imgSrc && (
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={aspect}
            >
              <img
                ref={imgRef}
                src={imgSrc}
                alt="Preview"
                onLoad={onImageLoad}
                className="w-full h-auto"
              />
            </ReactCrop>
          )}
        </div>
        <div className="w-1/2 relative">
          {!!completedCrop && (
            <>
              <div>
                <canvas
                  ref={previewCanvasRef}
                  style={{
                    border: "1px solid black",
                    objectFit: "contain",
                    width: completedCrop?.width,
                    height: completedCrop?.height,
                  }}
                />
              </div>
              <div className=" absolute  bottom-0 w-full">
                <button
                  className="w-full mr-2 text-mono py-2 mt-2 border border-black bg-black hover:bg-white hover:text-black text-white hover:shadow-blog-l hover:translate-y-blog-4m hover:translate-x-blog-4p  ease-in duration-200"
                  onClick={onDownloadCropClick}
                >
                  Tải xuống
                </button>

                <a
                  href="#hidden"
                  ref={hiddenAnchorRef}
                  download
                  style={{
                    position: "absolute",
                    top: "-200vh",
                    visibility: "hidden",
                  }}
                >
                  Hidden download
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
