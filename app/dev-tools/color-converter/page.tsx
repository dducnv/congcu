"use client"
import React, { useState, useEffect } from 'react';

const ColorConverterPage = () => {
    const [hexColor, setHexColor] = useState('#3B82F6');
    const [rgbColor, setRgbColor] = useState({ r: 59, g: 130, b: 246 });
    const [hslColor, setHslColor] = useState({ h: 217, s: 91, l: 60 });
    const [copied, setCopied] = useState('');
    const [activeTab, setActiveTab] = useState('converter');

    // Color conversion functions
    function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    function rgbToHex(r: number, g: number, b: number): string {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
        r /= 255;
        g /= 255;
        b /= 255;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h = 0, s = 0, l = (max + min) / 2;

        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }

        return {
            h: Math.round(h * 360),
            s: Math.round(s * 100),
            l: Math.round(l * 100)
        };
    }

    function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
        h /= 360;
        s /= 100;
        l /= 100;
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
        const r = hue2rgb(p, q, h + 1 / 3);
        const g = hue2rgb(p, q, h);
        const b = hue2rgb(p, q, h - 1 / 3);

        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255)
        };
    }

    // Update all formats when one changes
    const updateFromHex = (hex: string) => {
        if (hex.length === 7 && hex.startsWith('#')) {
            const rgb = hexToRgb(hex);
            if (rgb) {
                setHexColor(hex);
                setRgbColor(rgb);
                setHslColor(rgbToHsl(rgb.r, rgb.g, rgb.b));
            }
        }
    };

    const updateFromRgb = (r: number, g: number, b: number) => {
        if (r >= 0 && r <= 255 && g >= 0 && g <= 255 && b >= 0 && b <= 255) {
            const rgb = { r, g, b };
            setRgbColor(rgb);
            setHexColor(rgbToHex(r, g, b));
            setHslColor(rgbToHsl(r, g, b));
        }
    };

    const updateFromHsl = (h: number, s: number, l: number) => {
        if (h >= 0 && h <= 360 && s >= 0 && s <= 100 && l >= 0 && l <= 100) {
            const hsl = { h, s, l };
            setHslColor(hsl);
            const rgb = hslToRgb(h, s, l);
            setRgbColor(rgb);
            setHexColor(rgbToHex(rgb.r, rgb.g, rgb.b));
        }
    };

    // Copy to clipboard
    const copyToClipboard = (text: string, format: string) => {
        navigator.clipboard.writeText(text);
        setCopied(format);
        setTimeout(() => setCopied(''), 1000);
    };

    // Predefined color palettes
    const colorPalettes = {
        material: [
            '#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5',
            '#2196F3', '#03A9F4', '#00BCD4', '#009688', '#4CAF50',
            '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800', '#FF5722',
            '#795548', '#9E9E9E', '#607D8B', '#D32F2F', '#C2185B', '#7B1FA2',
            '#512DA8', '#303F9F', '#0288D1', '#0097A7', '#00796B', '#388E3C',
            '#689F38', '#AFB42B', '#FBC02D', '#FFA000', '#F57C00', '#E64A19',
            '#5D4037', '#616161', '#455A64', '#B71C1C', '#1A237E', '#004D40'
        ],
        tailwind: [
            '#F87171', '#EF4444', '#DC2626', '#B91C1C', '#FBBF24',
            '#F59E0B', '#D97706', '#B45309', '#34D399', '#10B981',
            '#059669', '#047857', '#3B82F6', '#2563EB', '#1D4ED8', '#1E40AF',
            '#6366F1', '#4F46E5', '#4338CA', '#8B5CF6', '#7C3AED', '#6D28D9',
            '#EC4899', '#DB2777', '#BE185D', '#9D174D', '#06B6D4', '#0891B2',
            '#0E7490', '#155E75', '#14B8A6', '#0D9488', '#5EEAD4', '#2DD4BF'
        ],
        web: [
            '#FF0000', '#CC0000', '#990000', '#660000', '#330000',
            '#00FF00', '#00CC00', '#009900', '#006600', '#003300',
            '#0000FF', '#0000CC', '#000099', '#000066', '#000033',
            '#FFFF00', '#FFCC00', '#FF9900', '#FF6600', '#FF3300',
            '#FF00FF', '#CC00CC', '#990099', '#660066', '#330033',
            '#00FFFF', '#00CCCC', '#009999', '#006666', '#003333',
            '#808080', '#A9A9A9', '#C0C0C0', '#D3D3D3', '#DCDCDC', '#F5F5F5',
            '#333333', '#666666', '#999999', '#CCCCCC'
        ]
    };


    const tabs = [
        { id: 'converter', label: 'Color Converter' },
        { id: 'palettes', label: 'Color Palettes' },
        { id: 'picker', label: 'Color Picker' }
    ];

    return (
        <div className="max-w-4xl mx-auto p-6 text-mono">
            <h1 className="text-2xl font-bold mb-4">Color Converter</h1>

            {/* Tab Navigation */}
            <div className="flex flex-wrap gap-2 mb-6 border-b border-black">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        className={`px-4 py-2 text-sm border-b-2 transition-colors ${activeTab === tab.id
                            ? 'border-black bg-white'
                            : 'border-transparent hover:border-gray-300'
                            }`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {activeTab === 'converter' && (
                <div>
                    {/* Color Preview */}
                    <div className="mb-6">
                        <label className="block mb-2 font-semibold">Color Preview</label>
                        <div
                            className="w-full h-32 border border-black"
                            style={{ backgroundColor: hexColor }}
                        ></div>
                        <div className="mt-2 text-center text-sm text-gray-600">
                            Current Color: {hexColor}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* HEX Input */}
                        <div className="border border-black p-4 bg-white">
                            <div className='flex justify-between mb-2'>
                                <label className="block mb-2 font-semibold">HEX</label>
                                <button
                                    onClick={() => copyToClipboard(hexColor, 'hex')}
                                    className="px-3 py-2 border border-black bg-white hover:bg-gray-200 text-xs"
                                >
                                    {copied === 'hex' ? '✓' : 'Copy'}
                                </button>
                            </div>


                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={hexColor}
                                    onChange={(e) => updateFromHex(e.target.value)}
                                    className="flex-1 border border-black px-3 py-2 font-mono"
                                    placeholder="#3B82F6"
                                />

                            </div>
                            <div className="mt-2 text-xs text-gray-600">
                                Format: #RRGGBB
                            </div>
                        </div>

                        {/* RGB Input */}
                        <div className="border border-black p-4 bg-white">
                            <label className="block mb-2 font-semibold">RGB</label>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <span className="w-4 text-xs">R:</span>
                                    <input
                                        type="number"
                                        min="0"
                                        max="255"
                                        value={rgbColor.r}
                                        onChange={(e) => updateFromRgb(parseInt(e.target.value) || 0, rgbColor.g, rgbColor.b)}
                                        className="flex-1 border border-black px-2 py-1 text-sm"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-4 text-xs">G:</span>
                                    <input
                                        type="number"
                                        min="0"
                                        max="255"
                                        value={rgbColor.g}
                                        onChange={(e) => updateFromRgb(rgbColor.r, parseInt(e.target.value) || 0, rgbColor.b)}
                                        className="flex-1 border border-black px-2 py-1 text-sm"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-4 text-xs">B:</span>
                                    <input
                                        type="number"
                                        min="0"
                                        max="255"
                                        value={rgbColor.b}
                                        onChange={(e) => updateFromRgb(rgbColor.r, rgbColor.g, parseInt(e.target.value) || 0)}
                                        className="flex-1 border border-black px-2 py-1 text-sm"
                                    />
                                </div>
                            </div>
                            <button
                                onClick={() => copyToClipboard(`rgb(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b})`, 'rgb')}
                                className="mt-2 w-full px-3 py-2 border border-black bg-white hover:bg-gray-200 text-xs"
                            >
                                {copied === 'rgb' ? '✓ Copied' : 'Copy RGB'}
                            </button>
                        </div>

                        {/* HSL Input */}
                        <div className="border border-black p-4 bg-white">
                            <label className="block mb-2 font-semibold">HSL</label>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <span className="w-4 text-xs">H:</span>
                                    <input
                                        type="number"
                                        min="0"
                                        max="360"
                                        value={hslColor.h}
                                        onChange={(e) => updateFromHsl(parseInt(e.target.value) || 0, hslColor.s, hslColor.l)}
                                        className="flex-1 border border-black px-2 py-1 text-sm"
                                    />
                                    <span className="text-xs">°</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-4 text-xs">S:</span>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={hslColor.s}
                                        onChange={(e) => updateFromHsl(hslColor.h, parseInt(e.target.value) || 0, hslColor.l)}
                                        className="flex-1 border border-black px-2 py-1 text-sm"
                                    />
                                    <span className="text-xs">%</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-4 text-xs">L:</span>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={hslColor.l}
                                        onChange={(e) => updateFromHsl(hslColor.h, hslColor.s, parseInt(e.target.value) || 0)}
                                        className="flex-1 border border-black px-2 py-1 text-sm"
                                    />
                                    <span className="text-xs">%</span>
                                </div>
                            </div>
                            <button
                                onClick={() => copyToClipboard(`hsl(${hslColor.h}, ${hslColor.s}%, ${hslColor.l}%)`, 'hsl')}
                                className="mt-2 w-full px-3 py-2 border border-black bg-white hover:bg-gray-200 text-xs"
                            >
                                {copied === 'hsl' ? '✓ Copied' : 'Copy HSL'}
                            </button>
                        </div>
                    </div>

                    {/* CSS Output */}
                    <div className="mt-6 border border-black p-4 bg-white">
                        <label className="block mb-2 font-semibold">CSS Output</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <div className="text-xs text-gray-600 mb-1">Background Color:</div>
                                <div className="flex items-center gap-2">
                                    <code className="flex-1 bg-gray-100 p-2 text-sm font-mono border border-gray-300">
                                        background-color: {hexColor};
                                    </code>
                                    <button
                                        onClick={() => copyToClipboard(`background-color: ${hexColor};`, 'css-bg')}
                                        className="px-2 py-1 border border-black bg-white hover:bg-gray-200 text-xs"
                                    >
                                        {copied === 'css-bg' ? '✓' : 'Copy'}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <div className="text-xs text-gray-600 mb-1">Color:</div>
                                <div className="flex items-center gap-2">
                                    <code className="flex-1 bg-gray-100 p-2 text-sm font-mono border border-gray-300">
                                        color: {hexColor};
                                    </code>
                                    <button
                                        onClick={() => copyToClipboard(`color: ${hexColor};`, 'css-color')}
                                        className="px-2 py-1 border border-black bg-white hover:bg-gray-200 text-xs"
                                    >
                                        {copied === 'css-color' ? '✓' : 'Copy'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Flutter Output */}
                    <div className="mt-6 border border-black p-4 bg-white">
                        <label className="block mb-2 font-semibold">Flutter Output</label>
                        <div className="space-y-4">
                            <div>
                                <div className="text-xs text-gray-600 mb-1">Color.fromRGBO():</div>
                                <div className="flex items-center gap-2">
                                    <code className="flex-1 bg-gray-100 p-2 text-sm font-mono border border-gray-300">
                                        Color.fromRGBO({rgbColor.r}, {rgbColor.g}, {rgbColor.b}, 1.0)
                                    </code>
                                    <button
                                        onClick={() => copyToClipboard(`Color.fromRGBO(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}, 1.0)`, 'flutter-rgbo')}
                                        className="px-2 py-1 border border-black bg-white hover:bg-gray-200 text-xs"
                                    >
                                        {copied === 'flutter-rgbo' ? '✓' : 'Copy'}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <div className="text-xs text-gray-600 mb-1">Color(0xFF...):</div>
                                <div className="flex items-center gap-2">
                                    <code className="flex-1 bg-gray-100 p-2 text-sm font-mono border border-gray-300">
                                        Color(0xFF{hexColor.slice(1).toUpperCase()})
                                    </code>
                                    <button
                                        onClick={() => copyToClipboard(`Color(0xFF${hexColor.slice(1).toUpperCase()})`, 'flutter-hex')}
                                        className="px-2 py-1 border border-black bg-white hover:bg-gray-200 text-xs"
                                    >
                                        {copied === 'flutter-hex' ? '✓' : 'Copy'}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <div className="text-xs text-gray-600 mb-1">Color.fromARGB():</div>
                                <div className="flex items-center gap-2">
                                    <code className="flex-1 bg-gray-100 p-2 text-sm font-mono border border-gray-300">
                                        Color.fromARGB(255, {rgbColor.r}, {rgbColor.g}, {rgbColor.b})
                                    </code>
                                    <button
                                        onClick={() => copyToClipboard(`Color.fromARGB(255, ${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b})`, 'flutter-argb')}
                                        className="px-2 py-1 border border-black bg-white hover:bg-gray-200 text-xs"
                                    >
                                        {copied === 'flutter-argb' ? '✓' : 'Copy'}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <div className="text-xs text-gray-600 mb-1">HSLColor.fromAHSL():</div>
                                <div className="flex items-center gap-2">
                                    <code className="flex-1 bg-gray-100 p-2 text-sm font-mono border border-gray-300">
                                        HSLColor.fromAHSL(1.0, {hslColor.h}, {(hslColor.s / 100).toFixed(2)}, {(hslColor.l / 100).toFixed(2)}).toColor()
                                    </code>
                                    <button
                                        onClick={() => copyToClipboard(`HSLColor.fromAHSL(1.0, ${hslColor.h}, ${(hslColor.s / 100).toFixed(2)}, ${(hslColor.l / 100).toFixed(2)}).toColor()`, 'flutter-hsl')}
                                        className="px-2 py-1 border border-black bg-white hover:bg-gray-200 text-xs"
                                    >
                                        {copied === 'flutter-hsl' ? '✓' : 'Copy'}
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <div className="text-xs text-gray-600 mb-1">Container backgroundColor:</div>
                                    <div className="flex items-center gap-2">
                                        <code className="flex-1 bg-gray-100 p-2 text-sm font-mono border border-gray-300 text-xs">
                                            backgroundColor: Color(0xFF{hexColor.slice(1).toUpperCase()})
                                        </code>
                                        <button
                                            onClick={() => copyToClipboard(`backgroundColor: Color(0xFF${hexColor.slice(1).toUpperCase()})`, 'flutter-bg')}
                                            className="px-2 py-1 border border-black bg-white hover:bg-gray-200 text-xs"
                                        >
                                            {copied === 'flutter-bg' ? '✓' : 'Copy'}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <div className="text-xs text-gray-600 mb-1">Text color:</div>
                                    <div className="flex items-center gap-2">
                                        <code className="flex-1 bg-gray-100 p-2 text-sm font-mono border border-gray-300 text-xs">
                                            color: Color(0xFF{hexColor.slice(1).toUpperCase()})
                                        </code>
                                        <button
                                            onClick={() => copyToClipboard(`color: Color(0xFF${hexColor.slice(1).toUpperCase()})`, 'flutter-text')}
                                            className="px-2 py-1 border border-black bg-white hover:bg-gray-200 text-xs"
                                        >
                                            {copied === 'flutter-text' ? '✓' : 'Copy'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'palettes' && (
                <div className="space-y-6">
                    {Object.entries(colorPalettes).map(([paletteName, colors]) => (
                        <div key={paletteName} className="border border-black p-4">
                            <h3 className="font-semibold mb-3 capitalize">{paletteName} Colors</h3>
                            <div className="grid grid-cols-8 md:grid-cols-16 gap-2">
                                {colors.map((color, index) => (
                                    <div
                                        key={index}
                                        className="aspect-square border border-black cursor-pointer hover:scale-110 transition-transform p-2"
                                        style={{ backgroundColor: color }}
                                        onClick={() => updateFromHex(color)}
                                        title={color}
                                    >
                                        <span className='text-xs text-white text-mono bg-black'>{color}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === 'picker' && (
                <div className="space-y-6">
                    <div className="border border-black p-4">
                        <label className="block mb-2 font-semibold">Color Picker</label>
                        <div className="flex items-center gap-4">
                            <input
                                type="color"
                                value={hexColor}
                                onChange={(e) => updateFromHex(e.target.value)}
                                className="w-20 h-20 border border-black cursor-pointer"
                            />
                            <div>
                                <div className="text-sm text-gray-600">Selected Color:</div>
                                <div className="font-mono text-lg">{hexColor}</div>
                                <div className="text-xs text-gray-500">
                                    RGB: {rgbColor.r}, {rgbColor.g}, {rgbColor.b}
                                </div>
                                <div className="text-xs text-gray-500">
                                    HSL: {hslColor.h}°, {hslColor.s}%, {hslColor.l}%
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Random Color Generator */}
                    <div className="border border-black p-4">
                        <label className="block mb-2 font-semibold">Random Color Generator</label>
                        <button
                            onClick={() => {
                                const randomHex = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
                                updateFromHex(randomHex);
                            }}
                            className="px-4 py-2 border border-black bg-white hover:bg-gray-200"
                        >
                            Generate Random Color
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ColorConverterPage;