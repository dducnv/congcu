"use client"

import React, { useState, useEffect, useRef } from "react";
import TuiImageEditor from "tui-image-editor";

import "tui-image-editor/dist/tui-image-editor.css";
import "tui-color-picker/dist/tui-color-picker.css";

interface ImageEditorProps {
  includeUI?: Partial<any>;
  cssMaxWidth?: number;
  cssMaxHeight?: number;
  selectionStyle?: Partial<any>;
}

export const ImageEditor: React.FC<ImageEditorProps> = ({
  includeUI,
  cssMaxWidth,
  cssMaxHeight,
  selectionStyle,
}) => {
  const rootEl:any = useRef<HTMLDivElement>(null);
  const [imageEditorInst, setImageEditorInst] = useState<TuiImageEditor | null>(
    null
  );

  useEffect(() => {
    const initImageEditor = () => {
      const instance = new TuiImageEditor(rootEl.current, {
        includeUI,
        cssMaxWidth,
        cssMaxHeight,
        selectionStyle,
      });
      setImageEditorInst(instance);
    };

    initImageEditor();

    return () => {
      if (imageEditorInst) {
        imageEditorInst.destroy();
        setImageEditorInst(null);
      }
    };
  }, [includeUI, cssMaxWidth, cssMaxHeight, selectionStyle]);

  return <div ref={rootEl} />;
};