# Multitools – Free, Client‑Side Utilities for Work and Everyday Use

A fast, privacy‑friendly toolbox that runs in your browser. Generate secure secrets, hash text, convert colors, view CSV files, extract text from images, take quick notes, run a Pomodoro timer, and more — without sign‑ups or servers.

Live site: [tools4u.vercel.app](https://tools4u.vercel.app/)

- Blazing‑fast and simple UI
- Processes locally in your browser (client‑side)
- Open source and easy to contribute

Keywords: online secret key generator, SHA‑256 online, HMAC SHA‑256, random base64 generator, random hex generator, base64url, CSV viewer online, image to text OCR, quick image editor, color converter, color picker from image, percentage calculator, Pomodoro timer, quick notes.

---

## Table of Contents

- [Featured Tools](#featured-tools)
  - [Generate Secret Key](#generate-secret-key)
  - [Extract Text from Image (OCR)](#extract-text-from-image-ocr)
  - [CSV Viewer](#csv-viewer)
  - [Color Converter](#color-converter)
  - [Color Picker from Image](#color-picker-from-image)
  - [Quick Image Editor](#quick-image-editor)
  - [Quick Note](#quick-note)
  - [Emoji](#emoji)
  - [Calculate Percentage](#calculate-percentage)
  - [Draw](#draw)
  - [Pomodoro](#pomodoro)
  - [Read JSON](#read-json)
- [Security & Privacy](#security--privacy)
- [How to Use](#how-to-use)
- [Run Locally](#run-locally)
- [Tech Stack](#tech-stack)
- [Contributing](#contributing)
- [License](#license)
- [FAQ](#faq)

---

## Featured Tools

### Generate Secret Key
Open: [tools4u.vercel.app/dev-tools/generate-secret-key](https://tools4u.vercel.app/dev-tools/generate-secret-key)

Secure, developer‑friendly key generation for .env files, webhooks, tokens, and HMAC/JWT use cases.

- Hash/Sign
  - SHA‑256, SHA‑512 (Web Crypto API)
  - MD5 (legacy/compatibility only — not recommended for security)
  - HMAC‑SHA256
- Random key generation
  - Base64 or Hex with configurable byte length
  - Custom generator:
    - Length slider (e.g., 4–256)
    - Character sets: lowercase, UPPERCASE, digits, symbols, and custom characters
    - Exclude ambiguous characters (0/O, 1/l/I, etc.)
    - Option to require at least one character from each selected group
    - Unbiased randomness via rejection sampling
    - Estimated entropy (bits) with strength label
- Quality‑of‑life
  - “Random” source text button for hashing when input is empty
  - One‑click copy
  - Clear errors and helpful hints

Use cases: NEXTAUTH_SECRET, JWT HS256 secrets (oct), internal API secrets, CSRF tokens, GitHub/Stripe webhook secrets.

---

### Extract Text from Image (OCR)
Open: [tools4u.vercel.app/image-to-text](https://tools4u.vercel.app/image-to-text)

- Drag & drop images (JPG/PNG)
- Recognize text directly in the browser (tesseract.js)
- Copy the extracted text instantly

---

### CSV Viewer
Open: [tools4u.vercel.app/dev-tools/csv-viewer](https://tools4u.vercel.app/dev-tools/csv-viewer)

- Load and explore CSV files
- Table view, basic stats, quick charts
- Great for quick inspection without Excel

---

### Color Converter
Open: [tools4u.vercel.app/dev-tools/color-converter](https://tools4u.vercel.app/dev-tools/color-converter)

- Convert HEX ↔ RGB ↔ HSL
- Built‑in color picker
- Copy values instantly

---

### Color Picker from Image
Open: [tools4u.vercel.app/color-picker-from-image](https://tools4u.vercel.app/color-picker-from-image)

- Pick colors directly from an image
- Get HEX/RGB values for design and front‑end work

---

### Quick Image Editor
Open: [tools4u.vercel.app/quick-image-editor](https://tools4u.vercel.app/quick-image-editor)

- Lightweight in‑browser editor
- Crop, rotate, draw, add text/stickers, filters, and more

---

### Quick Note
Open: [tools4u.vercel.app/quicknote](https://tools4u.vercel.app/quicknote)

- Fast, distraction‑free notes
- Perfect for jotting down ideas and to‑dos

---

### Emoji
Open: [tools4u.vercel.app/emoji](https://tools4u.vercel.app/emoji)

- Search and copy emoji quickly
- Handy for posts, chats, and notes

---

### Calculate Percentage
Open: [tools4u.vercel.app/percentity](https://tools4u.vercel.app/percentity)

- Percentage, increase/decrease, reverse calculations
- Shows formulas for clarity

---

### Draw
Open: [tools4u.vercel.app/draw](https://tools4u.vercel.app/draw)

- Freehand drawing on the screen
- Ideal for sketching ideas or annotating

---

### Pomodoro
Open: [tools4u.vercel.app/pomodoro](https://tools4u.vercel.app/pomodoro)

- Pomodoro timer with simple task management
- Stay focused and keep a steady work rhythm

---

### Read JSON
Open: [tools4u.vercel.app/dev-tools/read-json](https://tools4u.vercel.app/dev-tools/read-json)

- View and navigate JSON data
- Handy for developers when inspecting API responses and configuration files

---

## Security & Privacy

- Processing happens locally in your browser for the tools listed above (e.g., secret generation, hashing, color conversion, OCR, image editing).
- No account required.
- We avoid sending your content to servers for these operations.
- You can verify this in your browser’s DevTools → Network tab (try switching to “Offline” after the page loads and perform the action).

Note: Some features rely on third‑party libraries that run entirely in the browser.

---

## How to Use

1. Open a tool from the navigation or use the direct links above.
2. Follow the on‑screen controls:
   - Secret Generator: choose algorithm or random mode, adjust length/character sets → Generate → Copy.
   - CSV Viewer: drag & drop a CSV → view table, stats, charts.
   - OCR: upload an image → wait for text recognition → copy text.
   - Color tools: pick or convert → copy results.
3. Use the one‑click copy buttons to move results into your workflow quickly.

---

## Run Locally

Requirements: Node.js 18+

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open in your browser
http://localhost:3000
```

---

## Tech Stack

- Next.js 14, React 18, Tailwind CSS
- Web Crypto API for hashing and secure randomness
- Utility libraries: tesseract.js, tui-image-editor, react-dropzone, recharts, and more

---

## Contributing

Contributions are welcome! Ideas that help most users:
- UX improvements (copy buttons, keyboard shortcuts)
- Presets for the Secret Generator (.env lines)
- Batch generation and exports
- Offline/PWA optimizations

Please open an issue or PR with a clear description of the proposed change.

---

## License

Open source. See the repository’s license file (if present) or contact the author for details.

---

## FAQ

- Is MD5 secure?
  - No. MD5 is provided only for legacy compatibility and should not be used for security purposes.

- Does this send my secrets to a server?
  - The tools described here are designed to work client‑side. You can verify in the Network tab that generation and hashing steps do not send your content to external servers.

- Can I customize the character set for secrets?
  - Yes. Use the Custom mode to pick lowercase/UPPERCASE/digits/symbols, add custom characters, exclude ambiguous characters, and require at least one from each selected group.
