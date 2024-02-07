/* eslint-disable @next/next/no-img-element */
"use client";

import { ChangeEvent, useState } from "react";
import { Container } from "../container";
import { classNames } from "@/core/utils";

export const RmBg = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [image, setImage] = useState("");
  const [result, setResult] = useState("");

  function handleChooseImage(e: ChangeEvent<HTMLInputElement>) {
    setResult("");
    setImage("");
    const fileInput = e.target as HTMLInputElement;
    const file: File | null = fileInput.files?.[0] || null;
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  function handleRemoveBg() {
    setIsLoading(true);

    fetch("/api/remove-bg", {
      method: "POST",
      body: JSON.stringify({ file: image }),
    }).then(async (res) => {
      setIsLoading(false);
      var blobRes = await res.blob();
      setResult(URL.createObjectURL(blobRes));
    });
  }
  return (
    <>
      <Container width="max-w-2xl">
        <div className="flex flex-col items-center justify-center">
          <input
            type="file"
            accept="image/*"
            onChange={handleChooseImage}
            className="w-full"
          />
          {image && (
            <img
              src={image}
              alt="preview"
              className="w-full h-auto mt-4 "
            />
          )}

          {result && (
            <img
              src={result}
              alt="result"
              
              className="w-full h-auto mt-4 bg-[url('/pngkey.com-checkered-pattern-png-8506557.png')]"
            />
          )}
        </div>
        {image && (
          <div className="flex justify-center mt-2 space-x-2">
            <button
              disabled={isLoading}
              className={classNames(
                "text-mono py-2 mt-2 border border-black bg-black hover:bg-white hover:text-black text-white hover:shadow-blog-l hover:translate-y-blog-4m hover:translate-x-blog-4p  ease-in duration-200",
                result ? "w-1/3" : "w-full"
              )}
              onClick={handleRemoveBg}
            >
              {isLoading ? "Đang xử lý..." : result ? "Làm lại" : "Xóa nền"}
            </button>

            {result && (
              <button 
              onClick={() => {
                const a = document.createElement("a");
                a.href = result;
                a.download = "result.png";
                a.click();
              }}
              className="w-2/3  mr-2 text-mono py-2 mt-2 border border-black bg-white hover:bg-indigo-500 hover:text-white text-black">
                Tải xuống
              </button>
            )}
          </div>
        )}
      </Container>
    </>
  );
};
