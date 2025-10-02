"use client";

import { imageColorPickerExBase64 } from "@/core/constant";
import hexRgb from "hex-rgb";
import { useCallback, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import rgbHex from "rgb-hex";

interface ColorInfo {
  hex: string;
  rgb: { r: number; g: number; b: number; a: number };
  hsl: { h: number; s: number; l: number };
  cmyk: { c: number; m: number; y: number; k: number };
}

interface ColorPalette {
  id: string;
  name: string;
  colors: string[];
  createdAt: Date;
}

// Utility functions
const rgbToHsl = (r: number, g: number, b: number) => {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
};

const rgbToCmyk = (r: number, g: number, b: number) => {
  r /= 255;
  g /= 255;
  b /= 255;
  const k = 1 - Math.max(r, g, b);
  const c = (1 - r - k) / (1 - k) || 0;
  const m = (1 - g - k) / (1 - k) || 0;
  const y = (1 - b - k) / (1 - k) || 0;
  return { c: c * 100, m: m * 100, y: y * 100, k: k * 100 };
};

const getContrastRatio = (color1: string, color2: string) => {
  const getLuminance = (hex: string) => {
    const rgb = hexRgb(hex);
    const [r, g, b] = [rgb.red, rgb.green, rgb.blue].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
};

export const ColorPickerFromImage = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const [currentImage, setCurrentImage] = useState<string>(imageColorPickerExBase64);
  const [currentColor, setCurrentColor] = useState<ColorInfo>({
    hex: "#ffffff",
    rgb: { r: 255, g: 255, b: 255, a: 1 },
    hsl: { h: 0, s: 0, l: 100 },
    cmyk: { c: 0, m: 0, y: 0, k: 0 }
  });
  const [selectedColor, setSelectedColor] = useState<ColorInfo>({
    hex: "#ffffff",
    rgb: { r: 255, g: 255, b: 255, a: 1 },
    hsl: { h: 0, s: 0, l: 100 },
    cmyk: { c: 0, m: 0, y: 0, k: 0 }
  });
  const [colorHistory, setColorHistory] = useState<ColorInfo[]>([]);
  const [palettes, setPalettes] = useState<ColorPalette[]>([]);
  const [activeTab, setActiveTab] = useState<'picker' | 'palettes' | 'history'>('picker');
  const [showContrast, setShowContrast] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setCurrentImage(result);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    multiple: false
  });

  const getColorFromImage = useCallback((event: React.MouseEvent<HTMLImageElement>) => {
    if (!canvasRef.current || !imageRef.current) return;

    const canvas = canvasRef.current;
    const image = imageRef.current;
    const rect = image.getBoundingClientRect();

    const x = (event.clientX - rect.left) * (image.naturalWidth / rect.width);
    const y = (event.clientY - rect.top) * (image.naturalHeight / rect.height);

    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(image, 0, 0);
    const imageData = ctx.getImageData(x, y, 1, 1);
    const r = imageData.data[0];
    const g = imageData.data[1];
    const b = imageData.data[2];
    const a = imageData.data[3];

    const hex = `#${rgbHex(r, g, b)}`;
    const rgb = { r, g, b, a: a / 255 };
    const hsl = rgbToHsl(r, g, b);
    const cmyk = rgbToCmyk(r, g, b);

    const colorInfo: ColorInfo = { hex, rgb, hsl, cmyk };
    setCurrentColor(colorInfo);
  }, []);

  const selectColor = useCallback(() => {
    setSelectedColor(currentColor);
    setColorHistory(prev => {
      const exists = prev.some(c => c.hex === currentColor.hex);
      if (!exists) {
        return [currentColor, ...prev.slice(0, 19)]; // Keep last 20 colors
      }
      return prev;
    });
  }, [currentColor]);

  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
  }, []);

  const generatePalette = useCallback(() => {
    if (colorHistory.length < 2) return;

    const newPalette: ColorPalette = {
      id: Date.now().toString(),
      name: `Palette ${palettes.length + 1}`,
      colors: colorHistory.slice(0, 8).map(c => c.hex),
      createdAt: new Date()
    };

    setPalettes(prev => [newPalette, ...prev]);
  }, [colorHistory, palettes.length]);

  const exportPalette = useCallback((palette: ColorPalette, format: 'css' | 'json' | 'scss') => {
    let content = '';

    switch (format) {
      case 'css':
        content = `:root {\n${palette.colors.map((color, i) => `  --color-${i + 1}: ${color};`).join('\n')}\n}`;
        break;
      case 'scss':
        content = palette.colors.map((color, i) => `$color-${i + 1}: ${color};`).join('\n');
        break;
      case 'json':
        content = JSON.stringify({ name: palette.name, colors: palette.colors }, null, 2);
        break;
    }

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${palette.name.toLowerCase().replace(/\s+/g, '-')}.${format === 'json' ? 'json' : format}`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);
  return (
    <div className="w-full h-full flex flex-col bg-white border border-black">

      <div className="flex-1 flex overflow-hidden">
        {/* Image Area */}
        <div className="flex-1 p-4">
          <div className="relative w-full h-full bg-white border border-black rounded overflow-hidden">
            <img
              ref={imageRef}
              src={currentImage}
              alt="Color picker image"
              className="w-full h-full object-contain cursor-crosshair"
              onMouseMove={getColorFromImage}
              onClick={selectColor}
            />
            <canvas ref={canvasRef} className="hidden" />
          </div>
        </div>

        {/* Color Info Panel */}
        <div className="w-96 bg-white border-l border-black flex flex-col">
          {/* File Upload Area */}
          <div className="flex-shrink-0 p-4 border-b border-black">
            <div
              {...getRootProps()}
              className={`relative w-full h-20 border-2 border-dashed border-black transition-colors cursor-pointer flex items-center justify-center ${isDragActive ? 'bg-gray-100' : 'hover:bg-gray-50'
                }`}
            >
              <input {...getInputProps()} />
              <div className="text-center">
                {isDragActive ? (
                  <p className="text-sm text-black font-medium">Drop image here...</p>
                ) : (
                  <div>
                    <p className="text-sm text-black">Drop image or click to browse</p>
                    <p className="text-xs text-gray-600">PNG, JPG, GIF, WebP</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex-shrink-0 border-b border-black">
            <nav className="flex">
              {[
                { id: 'picker', label: 'Color Picker' },
                { id: 'palettes', label: 'Palettes' },
                { id: 'history', label: 'History' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-600 hover:text-black'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-auto p-4">
            {activeTab === 'picker' && (
              <div className="space-y-6">
                {/* Current Color Preview */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Current Color</h3>
                  <div
                    className="w-full h-24 rounded-lg border-2 border-gray-200 flex items-center justify-center"
                    style={{ backgroundColor: currentColor.hex }}
                  >
                    <span className="text-white font-bold text-lg drop-shadow-lg">
                      {currentColor.hex}
                    </span>
                  </div>

                  <button
                    onClick={selectColor}
                    className="w-full py-2 px-4 bg-black text-white rounded border border-black hover:bg-gray-800 transition-colors"
                  >
                    Select This Color
                  </button>
                </div>

                {/* Color Formats */}
                <div className="space-y-3">
                  <h4 className="font-medium text-black">Color Values</h4>
                  <div className="space-y-2">
                    {[
                      { label: 'HEX', value: currentColor.hex },
                      { label: 'RGB', value: `rgb(${Math.round(currentColor.rgb.r)}, ${Math.round(currentColor.rgb.g)}, ${Math.round(currentColor.rgb.b)})` },
                      { label: 'HSL', value: `hsl(${Math.round(currentColor.hsl.h)}, ${Math.round(currentColor.hsl.s)}%, ${Math.round(currentColor.hsl.l)}%)` },
                      { label: 'CMYK', value: `cmyk(${Math.round(currentColor.cmyk.c)}%, ${Math.round(currentColor.cmyk.m)}%, ${Math.round(currentColor.cmyk.y)}%, ${Math.round(currentColor.cmyk.k)}%)` }
                    ].map((format) => (
                      <div key={format.label} className="flex items-center justify-between p-2 bg-gray-50 border border-gray-200 rounded">
                        <span className="text-sm font-medium text-black">{format.label}:</span>
                        <div className="flex items-center space-x-2">
                          <code className="text-sm font-mono text-black">{format.value}</code>
                          <button
                            onClick={() => copyToClipboard(format.value)}
                            className="text-black hover:text-gray-600 text-sm border border-black px-2 py-1 rounded hover:bg-gray-100"
                          >
                            Copy
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Selected Color */}
                {selectedColor.hex !== "#ffffff" && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-black">Selected Color</h4>
                    <div
                      className="w-full h-16 rounded border border-black flex items-center justify-center"
                      style={{ backgroundColor: selectedColor.hex }}
                    >
                      <span className="text-white font-bold drop-shadow-lg">
                        {selectedColor.hex}
                      </span>
                    </div>
                  </div>
                )}

                {/* Contrast Check */}
                {showContrast && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-black">Contrast Check</h4>
                    <div className="space-y-2">
                      {['#ffffff', '#000000', '#333333', '#666666'].map((bgColor) => {
                        const ratio = getContrastRatio(selectedColor.hex, bgColor);
                        const rating = ratio >= 7 ? 'AAA' : ratio >= 4.5 ? 'AA' : ratio >= 3 ? 'A' : 'Fail';
                        return (
                          <div key={bgColor} className="flex items-center justify-between p-2 bg-gray-50 border border-gray-200 rounded">
                            <div className="flex items-center space-x-2">
                              <div
                                className="w-6 h-6 rounded border border-black"
                                style={{ backgroundColor: bgColor }}
                              />
                              <span className="text-sm text-black">{bgColor}</span>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium text-black">{ratio.toFixed(2)}:1</div>
                              <div className={`text-xs ${rating === 'AAA' ? 'text-green-600' :
                                rating === 'AA' ? 'text-blue-600' :
                                  rating === 'A' ? 'text-yellow-600' : 'text-red-600'
                                }`}>
                                {rating}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'palettes' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-black">Color Palettes</h3>
                  <button
                    onClick={generatePalette}
                    disabled={colorHistory.length < 2}
                    className="px-3 py-1 bg-black text-white rounded border border-black text-sm hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Generate Palette
                  </button>
                </div>

                {palettes.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No palettes yet. Select some colors first!</p>
                ) : (
                  <div className="space-y-4">
                    {palettes.map((palette) => (
                      <div key={palette.id} className="border border-black rounded p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-black">{palette.name}</h4>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => exportPalette(palette, 'css')}
                              className="text-xs px-2 py-1 bg-white text-black border border-black rounded hover:bg-gray-100"
                            >
                              CSS
                            </button>
                            <button
                              onClick={() => exportPalette(palette, 'scss')}
                              className="text-xs px-2 py-1 bg-white text-black border border-black rounded hover:bg-gray-100"
                            >
                              SCSS
                            </button>
                            <button
                              onClick={() => exportPalette(palette, 'json')}
                              className="text-xs px-2 py-1 bg-white text-black border border-black rounded hover:bg-gray-100"
                            >
                              JSON
                            </button>
                          </div>
                        </div>
                        <div className="flex space-x-1">
                          {palette.colors.map((color, index) => (
                            <div
                              key={index}
                              className="flex-1 h-12 rounded border border-black"
                              style={{ backgroundColor: color }}
                              title={color}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-black">Color History</h3>
                {colorHistory.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No colors selected yet!</p>
                ) : (
                  <div className="grid grid-cols-4 gap-2">
                    {colorHistory.map((color, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedColor(color)}
                        className="aspect-square rounded border-2 border-black hover:border-gray-400 transition-colors"
                        style={{ backgroundColor: color.hex }}
                        title={color.hex}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
