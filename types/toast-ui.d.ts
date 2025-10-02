declare module '@toast-ui/react-image-editor' {
  import { Component } from 'react';

  interface ImageEditorProps {
    ref?: React.Ref<any>;
    includeUI?: {
      loadImage?: {
        path?: string;
        name?: string;
      };
      theme?: Record<string, string>;
      menu?: string[];
      initMenu?: string;
      uiSize?: {
        width?: string;
        height?: string;
      };
      menuBarPosition?: string;
    };
    cssMaxWidth?: number;
    cssMaxHeight?: number;
    selectionStyle?: {
      cornerSize?: number;
      rotatingPointOffset?: number;
    };
    usageStatistics?: boolean;
  }

  export default class ImageEditor extends Component<ImageEditorProps> {
    getInstance(): {
      loadImageFromURL(url: string, name: string): void;
      d
      toDataURL(): string;
      destroy(): void;
    };
  }
}
