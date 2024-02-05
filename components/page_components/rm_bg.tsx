"use client";

import { ChangeEvent, useState } from "react";
import { Container } from "../container";

export const RmBg = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [image, setImage] = useState("");

  function handleChooseImage(e: ChangeEvent<HTMLInputElement>) {
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
      body: JSON.stringify({ file: image}),
    }).then(async (res) => {
      setIsLoading(false);
      var blobRes = await res.blob();
      setImage(
        URL.createObjectURL(blobRes)
      )
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
              className="w-full h-auto mt-4 rounded-lg"
            />
          )}
        </div>

        <button
          onClick={handleRemoveBg}
          className="w-full py-2 mt-4 bg-blue-500 text-white rounded-lg"
          disabled={isLoading}
        >
            {isLoading ? "Loading..." : "Remove Background"}
        </button>
      </Container>
    </>
  );
};
