/* eslint-disable @next/next/no-img-element */
"use client";

import ImageEditor from '@toast-ui/react-image-editor';
import { useEffect, useRef } from 'react';
import 'tui-color-picker/dist/tui-color-picker.css';
import 'tui-image-editor/dist/tui-image-editor.css';

export const ImageEditorComponent = () => {
  const editorRef = useRef<any>(null);

  useEffect(() => {
    if (editorRef.current) {
      const editor = editorRef.current.getInstance();

      // Override download behavior
      const originalDownload = editor.download;
      editor.download = function () {
        const dataURL = this.toDataURL();
        const link = document.createElement('a');
        link.download = `edited-image-${Date.now()}.png`;
        link.href = dataURL;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      };
    }
  }, []);

  return (
    <div className="w-full h-full">
      <ImageEditor
        ref={editorRef}
        includeUI={{
          loadImage: {
            path: '',
            name: 'SampleImage',
          },
          theme: {
            'common.bi.image': 'https://uicdn.toast.com/toastui/img/tui-image-editor-bi.png',
            'common.backgroundColor': '#fff',
            'common.border': '0px',
            'header.backgroundColor': 'transparent',
            'header.border': '0px',
            'loadButton.backgroundColor': '#fff',
            'loadButton.border': '1px solid #ddd',
            'loadButton.color': '#222',
            'downloadButton.backgroundColor': '#fdba3b',
            'downloadButton.border': '1px solid #fdba3b',
            'downloadButton.color': '#fff',
          },
          menu: [
            'crop',
            'flip',
            'rotate',
            'draw',
            'shape',
            'icon',
            'text',
            'mask',
            'filter',
          ],
          initMenu: 'filter',
          uiSize: {
            width: '100%',
            height: '100%',
          },
          menuBarPosition: 'bottom',
        }}
        cssMaxWidth={700}
        cssMaxHeight={500}
        selectionStyle={{
          cornerSize: 20,
          rotatingPointOffset: 70,
        }}
        usageStatistics={false}
      />
    </div>
  );
};