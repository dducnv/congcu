"use client";

import { imageColorPickerExBase64 } from "@/core/constant";
import hexRgb from "hex-rgb";
import { useCallback, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import rgbHex from "rgb-hex";

// ─── Types ───
interface ColorInfo {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  cmyk: { c: number; m: number; y: number; k: number };
}

interface ColorPalette {
  id: string;
  name: string;
  colors: string[];
}

// ─── Conversion utils ───
function rgbToHsl(r: number, g: number, b: number) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
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
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToRgb(h: number, s: number, l: number) {
  h /= 360; s /= 100; l /= 100;
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return {
    r: Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
    g: Math.round(hue2rgb(p, q, h) * 255),
    b: Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
  };
}

function rgbToCmyk(r: number, g: number, b: number) {
  r /= 255; g /= 255; b /= 255;
  const k = 1 - Math.max(r, g, b);
  if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };
  return {
    c: Math.round(((1 - r - k) / (1 - k)) * 100),
    m: Math.round(((1 - g - k) / (1 - k)) * 100),
    y: Math.round(((1 - b - k) / (1 - k)) * 100),
    k: Math.round(k * 100),
  };
}

function rgbToHex(r: number, g: number, b: number) {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return m ? { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) } : null;
}

function makeColorInfo(r: number, g: number, b: number): ColorInfo {
  return {
    hex: rgbToHex(r, g, b),
    rgb: { r, g, b },
    hsl: rgbToHsl(r, g, b),
    cmyk: rgbToCmyk(r, g, b),
  };
}

function getContrastRatio(hex1: string, hex2: string) {
  const lum = (hex: string) => {
    const c = hexRgb(hex);
    const [r, g, b] = [c.red, c.green, c.blue].map(v => {
      v = v / 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const l1 = lum(hex1), l2 = lum(hex2);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

// ─── Predefined palettes ───
const predefinedPalettes: Record<string, string[]> = {
  material: [
    '#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5',
    '#2196F3', '#03A9F4', '#00BCD4', '#009688', '#4CAF50',
    '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800', '#FF5722',
    '#795548', '#9E9E9E', '#607D8B',
  ],
  tailwind: [
    '#F87171', '#EF4444', '#DC2626', '#FBBF24', '#F59E0B',
    '#D97706', '#34D399', '#10B981', '#059669', '#3B82F6',
    '#2563EB', '#1D4ED8', '#6366F1', '#4F46E5', '#8B5CF6',
    '#7C3AED', '#EC4899', '#DB2777', '#06B6D4', '#14B8A6',
  ],
  web: [
    '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF',
    '#00FFFF', '#FF6600', '#FF3300', '#FF0066', '#6600FF',
    '#000000', '#333333', '#666666', '#999999', '#CCCCCC', '#FFFFFF',
  ],
};

// ─── Source tabs ───
type SourceTab = "image" | "input" | "picker" | "palettes";

// ─── Component ───
export default function ColorTools() {
  const [color, setColor] = useState<ColorInfo>(makeColorInfo(59, 130, 246));
  const [colorHistory, setColorHistory] = useState<ColorInfo[]>([]);
  const [savedPalettes, setSavedPalettes] = useState<ColorPalette[]>([]);
  const [sourceTab, setSourceTab] = useState<SourceTab>("image");
  const [copied, setCopied] = useState("");

  // Image picker state
  const [currentImage, setCurrentImage] = useState(imageColorPickerExBase64);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // ─── Shared actions ───
  const selectColor = useCallback((c: ColorInfo) => {
    setColor(c);
    setColorHistory(prev => {
      if (prev.some(p => p.hex === c.hex)) return prev;
      return [c, ...prev.slice(0, 29)];
    });
  }, []);

  const copy = useCallback((text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(""), 1000);
  }, []);

  // ─── Image picker ───
  const onDrop = useCallback((files: File[]) => {
    const file = files[0];
    if (file?.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => setCurrentImage(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"] },
    multiple: false,
  });

  const pickFromImage = useCallback((e: React.MouseEvent<HTMLImageElement>) => {
    if (!canvasRef.current || !imageRef.current) return;
    const canvas = canvasRef.current;
    const img = imageRef.current;
    const rect = img.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (img.naturalWidth / rect.width);
    const y = (e.clientY - rect.top) * (img.naturalHeight / rect.height);
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(img, 0, 0);
    const d = ctx.getImageData(x, y, 1, 1).data;
    const c = makeColorInfo(d[0], d[1], d[2]);
    setColor(c);
  }, []);

  // ─── Manual input handlers ───
  const updateFromHex = (hex: string) => {
    if (/^#[a-f\d]{6}$/i.test(hex)) {
      const rgb = hexToRgb(hex);
      if (rgb) selectColor(makeColorInfo(rgb.r, rgb.g, rgb.b));
    }
  };

  const updateFromRgb = (r: number, g: number, b: number) => {
    if ([r, g, b].every(v => v >= 0 && v <= 255)) {
      selectColor(makeColorInfo(r, g, b));
    }
  };

  const updateFromHsl = (h: number, s: number, l: number) => {
    if (h >= 0 && h <= 360 && s >= 0 && s <= 100 && l >= 0 && l <= 100) {
      const rgb = hslToRgb(h, s, l);
      selectColor(makeColorInfo(rgb.r, rgb.g, rgb.b));
    }
  };

  // ─── Palette actions ───
  const savePalette = () => {
    if (colorHistory.length < 2) return;
    setSavedPalettes(prev => [
      {
        id: Date.now().toString(),
        name: `Palette ${prev.length + 1}`,
        colors: colorHistory.slice(0, 8).map(c => c.hex),
      },
      ...prev,
    ]);
  };

  const exportPalette = (palette: ColorPalette, format: "css" | "scss" | "json") => {
    let content = "";
    if (format === "css") content = `:root {\n${palette.colors.map((c, i) => `  --color-${i + 1}: ${c};`).join("\n")}\n}`;
    else if (format === "scss") content = palette.colors.map((c, i) => `$color-${i + 1}: ${c};`).join("\n");
    else content = JSON.stringify({ name: palette.name, colors: palette.colors }, null, 2);
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${palette.name.toLowerCase().replace(/\s+/g, "-")}.${format === "json" ? "json" : format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const sourceTabs: { id: SourceTab; label: string }[] = [
    { id: "image", label: "Pick from Image" },
    { id: "input", label: "Manual Input" },
    { id: "picker", label: "Color Picker" },
    { id: "palettes", label: "Palettes" },
  ];

  const { r, g, b } = color.rgb;
  const { h, s, l } = color.hsl;
  const { c: cc, m: cm, y: cy, k: ck } = color.cmyk;

  return (
    <>
    <div className="h-16"></div>
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-center uppercase text-mono text-2xl md:text-3xl lg:text-4xl font-bold mb-6">
        Color Tools
      </h1>

      <div className="flex flex-col lg:flex-row gap-4">
        {/* ════════ LEFT: Color Source ════════ */}
        <div className="lg:w-1/2 border border-black bg-white">
          {/* Source tabs */}
          <div className="flex border-b border-black">
            {sourceTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setSourceTab(tab.id)}
                className={`flex-1 px-3 py-2 text-sm font-medium border-b-2 transition-colors ${sourceTab === tab.id ? "border-black text-black" : "border-transparent text-gray-500 hover:text-black"}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-4">
            {/* ── Image picker ── */}
            {sourceTab === "image" && (
              <div className="space-y-3">
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed border-black p-4 text-center cursor-pointer transition-colors ${isDragActive ? "bg-gray-100" : "hover:bg-gray-50"}`}
                >
                  <input {...getInputProps()} />
                  <p className="text-sm">{isDragActive ? "Drop image here..." : "Drop image or click to browse"}</p>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF, WebP</p>
                </div>
                <div className="relative border border-black overflow-hidden bg-gray-50" style={{ minHeight: 300 }}>
                  <img
                    ref={imageRef}
                    src={currentImage}
                    alt="Color picker source"
                    className="w-full h-full object-contain cursor-crosshair"
                    onMouseMove={pickFromImage}
                    onClick={() => selectColor(color)}
                    crossOrigin="anonymous"
                  />
                  <canvas ref={canvasRef} className="hidden" />
                </div>
                <p className="text-xs text-gray-500 text-center">Hover to preview, click to select color</p>
              </div>
            )}

            {/* ── Manual input ── */}
            {sourceTab === "input" && (
              <div className="space-y-4">
                {/* HEX */}
                <div className="border border-black p-4">
                  <label className="block mb-2 font-semibold text-sm">HEX</label>
                  <input
                    type="text"
                    value={color.hex}
                    onChange={e => updateFromHex(e.target.value)}
                    className="w-full border border-black px-3 py-2 font-mono text-sm"
                    placeholder="#3B82F6"
                  />
                </div>
                {/* RGB */}
                <div className="border border-black p-4">
                  <label className="block mb-2 font-semibold text-sm">RGB</label>
                  <div className="flex gap-2">
                    {(["r", "g", "b"] as const).map(ch => (
                      <div key={ch} className="flex-1 flex items-center gap-1">
                        <span className="text-xs uppercase w-4">{ch}:</span>
                        <input
                          type="number" min={0} max={255}
                          value={color.rgb[ch]}
                          onChange={e => {
                            const v = parseInt(e.target.value) || 0;
                            const newRgb = { ...color.rgb, [ch]: v };
                            updateFromRgb(newRgb.r, newRgb.g, newRgb.b);
                          }}
                          className="flex-1 border border-black px-2 py-1 text-sm w-full"
                        />
                      </div>
                    ))}
                  </div>
                </div>
                {/* HSL */}
                <div className="border border-black p-4">
                  <label className="block mb-2 font-semibold text-sm">HSL</label>
                  <div className="flex gap-2">
                    {([
                      { key: "h", max: 360, suffix: "\u00B0" },
                      { key: "s", max: 100, suffix: "%" },
                      { key: "l", max: 100, suffix: "%" },
                    ] as const).map(({ key, max, suffix }) => (
                      <div key={key} className="flex-1 flex items-center gap-1">
                        <span className="text-xs uppercase w-4">{key}:</span>
                        <input
                          type="number" min={0} max={max}
                          value={color.hsl[key]}
                          onChange={e => {
                            const v = parseInt(e.target.value) || 0;
                            const newHsl = { ...color.hsl, [key]: v };
                            updateFromHsl(newHsl.h, newHsl.s, newHsl.l);
                          }}
                          className="flex-1 border border-black px-2 py-1 text-sm w-full"
                        />
                        <span className="text-xs">{suffix}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── Native color picker ── */}
            {sourceTab === "picker" && (
              <div className="space-y-4">
                <div className="border border-black p-4 flex items-center gap-4">
                  <input
                    type="color"
                    value={color.hex}
                    onChange={e => updateFromHex(e.target.value)}
                    className="w-20 h-20 border border-black cursor-pointer"
                  />
                  <div>
                    <div className="font-mono text-lg">{color.hex}</div>
                    <div className="text-xs text-gray-500">RGB: {r}, {g}, {b}</div>
                    <div className="text-xs text-gray-500">HSL: {h}, {s}%, {l}%</div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    const hex = "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0");
                    updateFromHex(hex);
                  }}
                  className="w-full py-2 border border-black bg-white hover:bg-gray-100 text-sm font-medium"
                >
                  Random Color
                </button>
              </div>
            )}

            {/* ── Predefined palettes ── */}
            {sourceTab === "palettes" && (
              <div className="space-y-4">
                {Object.entries(predefinedPalettes).map(([name, colors]) => (
                  <div key={name} className="border border-black p-3">
                    <h3 className="font-semibold text-sm mb-2 capitalize">{name}</h3>
                    <div className="flex flex-wrap gap-1">
                      {colors.map((c, i) => (
                        <button
                          key={i}
                          className="w-8 h-8 border border-black hover:scale-110 transition-transform"
                          style={{ backgroundColor: c }}
                          onClick={() => updateFromHex(c)}
                          title={c}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ════════ RIGHT: Color Info & Output ════════ */}
        <div className="lg:w-1/2 space-y-4">
          {/* Color Preview */}
          <div className="border border-black bg-white p-4">
            <div
              className="w-full h-28 border border-black flex items-center justify-center"
              style={{ backgroundColor: color.hex }}
            >
              <span className="font-bold text-lg drop-shadow-lg" style={{ color: l > 50 ? "#000" : "#fff" }}>
                {color.hex}
              </span>
            </div>
          </div>

          {/* All Formats */}
          <div className="border border-black bg-white p-4 space-y-2">
            <h3 className="font-semibold text-sm mb-3">Color Values</h3>
            {[
              { label: "HEX", value: color.hex },
              { label: "RGB", value: `rgb(${r}, ${g}, ${b})` },
              { label: "HSL", value: `hsl(${h}, ${s}%, ${l}%)` },
              { label: "CMYK", value: `cmyk(${cc}%, ${cm}%, ${cy}%, ${ck}%)` },
            ].map(f => (
              <div key={f.label} className="flex items-center justify-between p-2 bg-gray-50 border border-gray-200">
                <span className="text-sm font-medium w-12">{f.label}</span>
                <code className="text-sm font-mono flex-1 ml-2">{f.value}</code>
                <button
                  onClick={() => copy(f.value, f.label)}
                  className="text-xs border border-black px-2 py-1 hover:bg-gray-100 ml-2"
                >
                  {copied === f.label ? "Copied" : "Copy"}
                </button>
              </div>
            ))}
          </div>

          {/* CSS Output */}
          <div className="border border-black bg-white p-4">
            <h3 className="font-semibold text-sm mb-3">CSS</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {[
                { label: "background-color", code: `background-color: ${color.hex};`, key: "css-bg" },
                { label: "color", code: `color: ${color.hex};`, key: "css-c" },
              ].map(item => (
                <div key={item.key} className="flex items-center gap-2">
                  <code className="flex-1 bg-gray-100 p-2 text-xs font-mono border border-gray-200">{item.code}</code>
                  <button onClick={() => copy(item.code, item.key)} className="text-xs border border-black px-2 py-1 hover:bg-gray-100">
                    {copied === item.key ? "Copied" : "Copy"}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Flutter Output */}
          <div className="border border-black bg-white p-4">
            <h3 className="font-semibold text-sm mb-3">Flutter / Dart</h3>
            <div className="space-y-2">
              {[
                { label: "Color(0xFF...)", code: `Color(0xFF${color.hex.slice(1).toUpperCase()})`, key: "fl-hex" },
                { label: "Color.fromRGBO", code: `Color.fromRGBO(${r}, ${g}, ${b}, 1.0)`, key: "fl-rgbo" },
                { label: "Color.fromARGB", code: `Color.fromARGB(255, ${r}, ${g}, ${b})`, key: "fl-argb" },
              ].map(item => (
                <div key={item.key} className="flex items-center gap-2">
                  <code className="flex-1 bg-gray-100 p-2 text-xs font-mono border border-gray-200">{item.code}</code>
                  <button onClick={() => copy(item.code, item.key)} className="text-xs border border-black px-2 py-1 hover:bg-gray-100">
                    {copied === item.key ? "Copied" : "Copy"}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Contrast Check */}
          <div className="border border-black bg-white p-4">
            <h3 className="font-semibold text-sm mb-3">Contrast Check (WCAG)</h3>
            <div className="grid grid-cols-2 gap-2">
              {["#ffffff", "#000000", "#333333", "#666666"].map(bg => {
                const ratio = getContrastRatio(color.hex, bg);
                const rating = ratio >= 7 ? "AAA" : ratio >= 4.5 ? "AA" : ratio >= 3 ? "A" : "Fail";
                const ratingColor = rating === "AAA" ? "text-green-600" : rating === "AA" ? "text-blue-600" : rating === "A" ? "text-yellow-600" : "text-red-600";
                return (
                  <div key={bg} className="flex items-center justify-between p-2 border border-gray-200">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 border border-black" style={{ backgroundColor: bg }} />
                      <span className="text-xs font-mono">{bg}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-medium">{ratio.toFixed(2)}:1</div>
                      <div className={`text-xs font-bold ${ratingColor}`}>{rating}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Color History */}
          <div className="border border-black bg-white p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm">History ({colorHistory.length})</h3>
              <button
                onClick={savePalette}
                disabled={colorHistory.length < 2}
                className="text-xs border border-black px-3 py-1 hover:bg-gray-100 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                Save as Palette
              </button>
            </div>
            {colorHistory.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">No colors selected yet</p>
            ) : (
              <div className="flex flex-wrap gap-1">
                {colorHistory.map((c, i) => (
                  <button
                    key={i}
                    onClick={() => setColor(c)}
                    className="w-8 h-8 border border-black hover:scale-110 transition-transform"
                    style={{ backgroundColor: c.hex }}
                    title={c.hex}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Saved Palettes */}
          {savedPalettes.length > 0 && (
            <div className="border border-black bg-white p-4">
              <h3 className="font-semibold text-sm mb-3">Saved Palettes</h3>
              <div className="space-y-3">
                {savedPalettes.map(palette => (
                  <div key={palette.id} className="border border-gray-200 p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{palette.name}</span>
                      <div className="flex gap-1">
                        {(["css", "scss", "json"] as const).map(fmt => (
                          <button
                            key={fmt}
                            onClick={() => exportPalette(palette, fmt)}
                            className="text-xs px-2 py-1 border border-black hover:bg-gray-100 uppercase"
                          >
                            {fmt}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {palette.colors.map((c, i) => (
                        <div
                          key={i}
                          className="flex-1 h-8 border border-black cursor-pointer"
                          style={{ backgroundColor: c }}
                          title={c}
                          onClick={() => updateFromHex(c)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
}
