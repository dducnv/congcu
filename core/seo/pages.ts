// Single source of truth for every page's search and social metadata.
// Metadata, Open Graph images, JSON-LD, the visible "About" section and the
// sitemap are all generated from these entries, so they cannot drift apart.

export type Faq = { q: string; a: string };

export type Section = "Conversion" | "Tools" | "Developer Tools" | "Site";

export type SeoPage = {
  path: string;
  /** Used for the Open Graph image URL: /og/<slug> */
  slug: string;
  /** Short product name, used in headings, breadcrumbs and the OG image. */
  name: string;
  /** Page title without the " | MultiTools" suffix. Keep it under ~47 characters. */
  title: string;
  /** 120–158 characters. */
  description: string;
  /** One line under the name on the Open Graph image. */
  tagline: string;
  keywords: string[];
  section: Section;
  /** schema.org applicationCategory */
  category?: string;
  features?: string[];
  /** Visible "About" section rendered under the tool. */
  intro?: string[];
  steps?: string[];
  faqs?: Faq[];
  /** The page already renders its own visible FAQ (FAQ JSON-LD must match visible text). */
  ownContent?: boolean;
  priority: number;
  changeFrequency: "daily" | "weekly" | "monthly" | "yearly";
  /** Keep out of search results and the sitemap (unfinished pages). */
  noindex?: boolean;
};

export const SEO_PAGES: SeoPage[] = [
  {
    path: "/",
    slug: "home",
    name: "MultiTools",
    title: "MultiTools: Free Online Developer Tools",
    description:
      "Free in-browser developer and productivity tools: JSON formatter, SQL & CSV viewer, QR code generator, OCR, regex tester and more. No signup, no uploads.",
    tagline: "Free developer & productivity tools that run in your browser",
    keywords: ["online developer tools", "free online tools", "browser tools", "json formatter", "qr code generator", "sql viewer"],
    section: "Site",
    priority: 1,
    changeFrequency: "weekly",
  },
  {
    path: "/about",
    slug: "about",
    name: "About MultiTools",
    title: "About MultiTools",
    description:
      "MultiTools is a set of free developer and productivity tools that run entirely in your browser, so your code, files and data never leave your device.",
    tagline: "Private, in-browser tools with no signup",
    keywords: ["about multitools", "privacy first tools", "client-side tools"],
    section: "Site",
    priority: 0.4,
    changeFrequency: "yearly",
  },

  // ---------- Conversion ----------
  {
    path: "/image-to-text",
    slug: "image-to-text",
    name: "Image to Text (OCR)",
    title: "Image to Text Converter: Free Online OCR",
    description:
      "Extract text from JPG, PNG and WebP images or screenshots with in-browser OCR. Supports English and Vietnamese. Your images are never uploaded.",
    tagline: "Extract text from images and screenshots",
    keywords: ["image to text", "ocr online", "extract text from image", "picture to text", "screenshot to text"],
    section: "Conversion",
    category: "UtilitiesApplication",
    features: [
      "Optical character recognition with Tesseract.js running in the browser",
      "Works with JPG, PNG, WebP images and screenshots",
      "English and Vietnamese recognition",
      "One-click copy of the extracted text",
    ],
    intro: [
      "Image to Text turns a photo, scan or screenshot into editable text. Recognition runs locally with Tesseract.js compiled to WebAssembly, so your image stays on your device the whole time.",
      "It is handy for copying text out of screenshots, receipts, slides, book pages and error messages that you cannot select.",
    ],
    steps: [
      "Choose the language of the text in the image (English or Vietnamese).",
      "Select an image file from your computer or phone.",
      "Wait a few seconds while the text is recognized.",
      "Review the result and copy it to your clipboard.",
    ],
    faqs: [
      {
        q: "Are my images uploaded to a server?",
        a: "No. The OCR engine runs entirely in your browser using WebAssembly. Your images never leave your computer or phone.",
      },
      {
        q: "Which languages are supported?",
        a: "English and Vietnamese. Pick the language that matches the text before selecting the image for the best accuracy.",
      },
      {
        q: "How can I get more accurate results?",
        a: "Use a sharp, well-lit image where the text is horizontal and large enough to read. Cropping away unrelated parts of the picture also helps.",
      },
    ],
    priority: 0.9,
    changeFrequency: "monthly",
  },

  // ---------- Tools ----------
  {
    path: "/quicknote",
    slug: "quicknote",
    name: "Quick Note",
    title: "Online Notepad & Markdown Editor",
    description:
      "Free online notepad with tabs and auto-save, plus a Markdown editor with live preview, checklists and HTML export. Your notes stay in your browser.",
    tagline: "Notepad with tabs, auto-save and a Markdown editor",
    keywords: ["online notepad", "markdown editor", "quick note", "notepad online", "text editor online", "markdown preview"],
    section: "Tools",
    category: "ProductivityApplication",
    features: [
      "Multiple tabs with automatic saving in the browser",
      "Markdown editor with split, write and read views",
      "Clickable checklists, code highlighting and Mermaid diagrams",
      "Text tools: change case, line prefixes, sort, remove duplicates",
      "Drag and drop .md and .txt files, export to HTML",
    ],
    intro: [
      "Quick Note is a fast notepad for jotting down ideas, prompts, to-do lists and release notes. Every tab is saved automatically in your browser, so you can close the page and pick up where you left off.",
      "Switch on Markdown mode for a full editor with live preview, a table of contents, synced scrolling and export to HTML or rich text.",
    ],
    steps: [
      "Start typing in the note. It saves automatically.",
      "Add tabs with the + button and double-click a tab to rename it.",
      "Use the Text row to change case, add bullets or numbers, sort or clean up lines.",
      "Turn on the MD switch to write Markdown with a live preview.",
    ],
    faqs: [
      {
        q: "Where are my notes stored?",
        a: "In your browser's local storage on this device. Nothing is sent to a server, so notes do not sync between devices. Use Backup to save a copy.",
      },
      {
        q: "Can I open my own Markdown or text files?",
        a: "Yes. Drag .md or .txt files onto the editor or use Open. Each file opens in its own tab.",
      },
      {
        q: "What Markdown features are supported?",
        a: "GitHub Flavored Markdown: headings, lists, checklists, tables, links, images, code blocks with syntax highlighting and Mermaid diagrams.",
      },
    ],
    priority: 0.8,
    changeFrequency: "monthly",
  },
  {
    path: "/emoji",
    slug: "emoji",
    name: "Emoji Picker",
    title: "Emoji Picker: Search, Copy & Paste Emojis",
    description:
      "Search every Unicode emoji by name or browse by category, then copy it to your clipboard in one click for messages, social posts and documents. Free.",
    tagline: "Find any emoji and copy it in one click",
    keywords: ["emoji picker", "copy paste emoji", "emoji search", "emoji list", "unicode emoji"],
    section: "Tools",
    category: "UtilitiesApplication",
    features: ["Search emojis by name", "Browse by category", "One-click copy to clipboard"],
    intro: [
      "Emoji Picker lists the full Unicode emoji set so you can find the right one quickly and paste it anywhere, including places that have no emoji keyboard.",
    ],
    steps: ["Type a word such as \"smile\" or \"rocket\", or browse a category.", "Click an emoji to copy it.", "Paste it into your message, post or document."],
    faqs: [
      {
        q: "Will the copied emoji look the same everywhere?",
        a: "The character is the same, but each platform (Apple, Google, Microsoft) draws emojis in its own style, so the look can differ slightly.",
      },
      {
        q: "Is it free to use?",
        a: "Yes. There is no signup and no limit on how many emojis you copy.",
      },
    ],
    priority: 0.6,
    changeFrequency: "monthly",
  },
  {
    path: "/percentity",
    slug: "percentity",
    name: "Percentage Calculator",
    title: "Percentage Calculator with Formulas",
    description:
      "Work out X% of a number, what percent one number is of another, percentage change, increase or decrease and reverse percentages, with every formula shown.",
    tagline: "Every percentage calculation, with the formula",
    keywords: ["percentage calculator", "percent calculator", "percentage change", "percent increase", "percent decrease", "reverse percentage"],
    section: "Tools",
    category: "UtilitiesApplication",
    features: [
      "X% of a number",
      "What percent one number is of another",
      "Percentage change between two values",
      "Increase or decrease a value by a percentage",
      "Reverse percentage to find the original value",
    ],
    intro: [
      "Percentage Calculator collects the everyday percentage questions in one place: discounts, tax, growth, grades and ratios. Results update as you type and each calculator shows the formula it uses.",
    ],
    steps: ["Pick the calculator that matches your question.", "Enter the numbers.", "Read the result and the formula beside it."],
    faqs: [
      {
        q: "How do I calculate a percentage of a number?",
        a: "Multiply the number by the percentage and divide by 100. For example, 15% of 80 is 80 × 15 / 100 = 12.",
      },
      {
        q: "How is percentage change calculated?",
        a: "Subtract the old value from the new value, divide by the old value and multiply by 100. Going from 50 to 65 is a 30% increase.",
      },
      {
        q: "How do I find the original price before a discount?",
        a: "Divide the discounted price by (1 − discount / 100). A $72 item after 20% off was originally 72 / 0.8 = $90.",
      },
    ],
    priority: 0.7,
    changeFrequency: "monthly",
  },
  {
    path: "/color-tools",
    slug: "color-tools",
    name: "Color Tools",
    title: "Color Picker, Converter & Palette Generator",
    description:
      "Pick colors from images, convert HEX, RGB, HSL and CMYK, check WCAG contrast, generate palettes and copy ready-made CSS or Flutter code. Free.",
    tagline: "Pick, convert and check colors",
    keywords: ["color picker", "color converter", "hex to rgb", "color picker from image", "contrast checker", "color palette generator"],
    section: "Tools",
    category: "DesignApplication",
    features: [
      "Eyedropper to pick colors from an uploaded image",
      "HEX, RGB, HSL and CMYK conversion",
      "WCAG contrast check",
      "Palette generator with saved palettes",
      "CSS and Flutter / Dart code snippets",
    ],
    intro: [
      "Color Tools brings a color picker, converter, contrast checker and palette generator together for designers and front-end developers. Everything runs in your browser, including picking colors from your own images.",
    ],
    steps: [
      "Choose a color with the picker, type a value, or upload an image and click a pixel.",
      "Copy the value in HEX, RGB, HSL or CMYK, or as CSS / Flutter code.",
      "Check text contrast against WCAG levels and build a palette.",
    ],
    faqs: [
      {
        q: "What contrast ratio do I need for accessible text?",
        a: "WCAG AA requires at least 4.5:1 for normal text and 3:1 for large text. AAA requires 7:1 and 4.5:1.",
      },
      {
        q: "Is my image uploaded when I pick colors from it?",
        a: "No. The image is read on a canvas in your browser and never sent anywhere.",
      },
    ],
    priority: 0.8,
    changeFrequency: "monthly",
  },
  {
    path: "/quick-image-editor",
    slug: "quick-image-editor",
    name: "Quick Image Editor",
    title: "Free Online Photo Editor: Crop, Rotate, Text",
    description:
      "Crop, rotate and flip photos, add text, shapes, icons and drawings, and apply filters right in your browser. No upload, no signup, download when done.",
    tagline: "Crop, rotate, annotate and filter images",
    keywords: ["online image editor", "photo editor online", "crop image", "rotate image", "add text to image", "image filters"],
    section: "Tools",
    category: "DesignApplication",
    features: ["Crop, flip and rotate", "Free drawing and shapes", "Text and icons", "Masks and filters", "Download the edited image"],
    intro: [
      "Quick Image Editor handles the small edits you need every day without installing software: crop a screenshot, rotate a photo, blur or annotate details, add a caption and download the result.",
    ],
    steps: ["Load an image from your device.", "Pick a tool from the bottom menu: crop, rotate, draw, text, filter and more.", "Apply your changes and download the image."],
    faqs: [
      {
        q: "Are my photos uploaded?",
        a: "No. Editing happens in your browser and the image stays on your device.",
      },
      {
        q: "Which formats can I edit?",
        a: "Common web formats such as JPG, PNG and WebP open directly in the editor.",
      },
    ],
    priority: 0.7,
    changeFrequency: "monthly",
  },
  {
    path: "/draw",
    slug: "draw",
    name: "Online Whiteboard",
    title: "Online Whiteboard & Drawing Tool",
    description:
      "Sketch, draw diagrams, flowcharts and mind maps on an infinite canvas powered by tldraw. Free online whiteboard in your browser, no account needed.",
    tagline: "Infinite canvas for sketches and diagrams",
    keywords: ["online whiteboard", "drawing tool online", "diagram tool", "sketch online", "mind map online", "tldraw"],
    section: "Tools",
    category: "DesignApplication",
    features: ["Infinite canvas", "Shapes, arrows, text and freehand drawing", "Drawings saved in your browser", "Export your board"],
    intro: [
      "The whiteboard gives you an infinite canvas for quick sketches, wireframes, flowcharts and mind maps. It is built on tldraw and keeps your drawing in the browser so it is still there when you come back.",
    ],
    steps: ["Pick a tool from the toolbar: draw, shapes, arrows or text.", "Drag on the canvas to create, and use the hand tool or trackpad to move around.", "Export or copy your drawing when you are done."],
    faqs: [
      {
        q: "Is my drawing saved?",
        a: "Yes, automatically in this browser on this device. Clearing site data removes it, so export important work.",
      },
      {
        q: "Do I need an account?",
        a: "No. Open the page and start drawing.",
      },
    ],
    priority: 0.7,
    changeFrequency: "monthly",
  },
  {
    path: "/pomodoro",
    slug: "pomodoro",
    name: "Pomodoro Timer",
    title: "Pomodoro Timer Online with Task List",
    description:
      "Free Pomodoro focus timer with custom focus and break lengths, a task list, sound alerts and a daily session count. Saved in your browser, no signup.",
    tagline: "Focus timer with breaks and a task list",
    keywords: ["pomodoro timer", "focus timer", "pomodoro online", "study timer", "productivity timer"],
    section: "Tools",
    category: "ProductivityApplication",
    features: ["Custom focus and break durations", "Task checklist", "Sound alert when a session ends", "Daily completed session count", "State saved in the browser"],
    intro: [
      "The Pomodoro Technique splits work into focused sessions, usually 25 minutes, separated by short breaks. This timer runs those cycles for you and keeps a simple task list beside it.",
    ],
    steps: ["Set the focus and break lengths, or keep the defaults.", "Add the tasks you want to finish.", "Start the timer and work until the alarm, then take the break."],
    faqs: [
      {
        q: "How long is a Pomodoro?",
        a: "Traditionally 25 minutes of focus followed by a 5-minute break, with a longer break after four sessions. You can change all of these.",
      },
      {
        q: "Does the timer keep running if I switch tabs?",
        a: "Yes. The end time is stored, so the countdown stays correct even if the tab is in the background or you reload the page.",
      },
    ],
    priority: 0.7,
    changeFrequency: "monthly",
  },
  {
    path: "/create-qr",
    slug: "create-qr",
    name: "QR Code Generator",
    title: "Free QR Code Generator: Text & URL to PNG",
    description:
      "Create static QR codes from any text or URL as you type. Choose the size and error correction level, then download a sharp PNG. Free, private, no expiry.",
    tagline: "Static QR codes that never expire",
    keywords: ["qr code generator", "free qr code", "url to qr code", "text to qr code", "qr code png"],
    section: "Tools",
    category: "UtilitiesApplication",
    features: [
      "Real-time QR generation while typing or pasting",
      "Error correction levels L, M, Q and H",
      "PNG download",
      "Static codes with no expiry or scan limit",
    ],
    ownContent: true,
    faqs: [
      {
        q: "Do these QR codes have an expiration date?",
        a: "No. MultiTools creates direct static QR codes. The encoded text or URL is permanently embedded into the matrix pattern and will work forever without relying on our server.",
      },
      {
        q: "Can I use generated QR codes for commercial projects?",
        a: "Yes, 100% free with no copyright restrictions or licensing fees. You can print them on packaging, business cards, merchandise, and digital advertising materials.",
      },
      {
        q: "Is there any scan limit?",
        a: "No scan limits whatsoever. Because the QR code is static and directly read by the scanning device, it can be scanned millions of times without restriction.",
      },
    ],
    priority: 0.9,
    changeFrequency: "monthly",
  },
  {
    path: "/currency-exchange",
    slug: "currency-exchange",
    name: "Currency Converter",
    title: "Currency Converter (Coming Soon)",
    description: "A free currency converter with live exchange rates is coming soon to MultiTools. In the meantime, explore our other free in-browser tools.",
    tagline: "Coming soon",
    keywords: [],
    section: "Tools",
    noindex: true,
    priority: 0.1,
    changeFrequency: "monthly",
  },

  // ---------- Developer Tools ----------
  {
    path: "/dev-tools/read-json",
    slug: "read-json",
    name: "JSON Formatter & Fixer",
    title: "JSON Formatter, Validator & Fixer Online",
    description:
      "Format, validate and repair broken JSON such as {key: value}, search inside it and compare two JSON documents. Free JSON tool that runs in your browser.",
    tagline: "Format, fix, search and compare JSON",
    keywords: ["json formatter", "json validator", "fix json", "json beautifier", "compare json", "json viewer"],
    section: "Developer Tools",
    category: "DeveloperApplication",
    features: ["Pretty-print with custom indentation", "Validate and show errors", "Repair malformed JSON such as unquoted keys", "Search keys and values", "Compare two JSON documents"],
    intro: [
      "The JSON tool formats and validates JSON and can repair common mistakes from hand-written or copied data: unquoted keys, single quotes and trailing commas. It also lets you search inside large documents and compare two versions.",
    ],
    steps: ["Paste JSON or open a .json file.", "Format it, or let the tool fix invalid JSON.", "Search for keys and values, or switch to compare mode to diff two documents."],
    faqs: [
      {
        q: "Can it fix invalid JSON?",
        a: "It repairs common problems such as unquoted keys, single-quoted strings and trailing commas. If it cannot fix the input safely, it tells you instead of guessing.",
      },
      {
        q: "Is my JSON sent to a server?",
        a: "No. Parsing, formatting and comparison all run in your browser.",
      },
    ],
    priority: 0.9,
    changeFrequency: "monthly",
  },
  {
    path: "/dev-tools/csv-viewer",
    slug: "csv-viewer",
    name: "Data & SQL Viewer",
    title: "CSV, Excel & SQLite Viewer with SQL Queries",
    description:
      "Open CSV, Excel, JSON, SQL dumps and SQLite .db files in your browser. Run real SQL queries, build charts and export the results without uploading data.",
    tagline: "Query CSV, Excel and SQLite files with SQL",
    keywords: ["csv viewer", "sqlite viewer online", "sql viewer online", "excel viewer", "query csv with sql", "db file viewer"],
    section: "Developer Tools",
    category: "DeveloperApplication",
    features: [
      "Open SQLite .db/.sqlite files and .sql dumps",
      "View CSV, TSV, Excel and JSON as tables",
      "SQL editor powered by SQLite compiled to WebAssembly",
      "Charts, pivot tables and column statistics",
      "Export to CSV, Excel, JSON or SQLite",
    ],
    intro: [
      "Data & SQL Viewer is a spreadsheet and database viewer that runs entirely in your browser. Load a file and query it with real SQL through SQLite compiled to WebAssembly, even for files you would rather not upload anywhere.",
    ],
    steps: ["Drop a CSV, Excel, JSON, .sql or SQLite .db file onto the page.", "Browse tables, sort and filter columns.", "Write SQL queries, build charts, then export the result."],
    faqs: [
      {
        q: "Is my data uploaded?",
        a: "No. Files are read and queried locally with SQLite running as WebAssembly in your browser.",
      },
      {
        q: "Which SQL dialect can I use?",
        a: "SQLite. Standard SELECT, JOIN, GROUP BY, window functions and common table expressions all work.",
      },
      {
        q: "How large can my files be?",
        a: "It depends on your device's memory. Files of tens of megabytes usually work well on a modern laptop.",
      },
    ],
    priority: 0.9,
    changeFrequency: "monthly",
  },
  {
    path: "/dev-tools/generate-secret-key",
    slug: "generate-secret-key",
    name: "Secret Key Generator",
    title: "Secret Key, SHA-256 & HMAC Generator",
    description:
      "Generate cryptographically secure API keys and .env secrets, plus SHA-256, SHA-512 and HMAC hashes, using the Web Crypto API. Nothing leaves your browser.",
    tagline: "Secure keys, hashes and HMAC signatures",
    keywords: ["secret key generator", "api key generator", "random key generator", "sha256 generator", "hmac generator", "jwt secret generator"],
    section: "Developer Tools",
    category: "SecurityApplication",
    features: [
      "Cryptographically secure randomness from crypto.getRandomValues",
      "Base64 and hex keys of configurable length",
      "SHA-256 and SHA-512 hashing",
      "HMAC-SHA256 signatures",
      "Estimated entropy in bits",
    ],
    intro: [
      "Secret Key Generator creates random keys for API tokens, JWT secrets, session keys and .env files, and calculates SHA hashes and HMAC signatures. It uses your browser's Web Crypto API, the same secure random source used by password managers.",
    ],
    steps: ["Choose the key format and length.", "Generate a key and check its estimated entropy.", "Copy it into your configuration, or switch to the hash and HMAC tools."],
    faqs: [
      {
        q: "Is it safe to generate production API keys here?",
        a: "Yes. Keys are generated exclusively within your local browser memory using the standard Web Crypto API. No keys or inputs are ever transmitted over the network.",
      },
      {
        q: "How is entropy calculated?",
        a: "Entropy is computed from the character pool size and key length: log2(pool^length) bits. 128 bits or more is considered very strong.",
      },
      {
        q: "How long should a JWT secret be?",
        a: "For HS256, use at least 256 bits (32 random bytes), for example a 44-character Base64 key.",
      },
    ],
    priority: 0.9,
    changeFrequency: "monthly",
  },
  {
    path: "/dev-tools/base64",
    slug: "base64",
    name: "Base64 Encoder & Decoder",
    title: "Base64 Encode & Decode Online (UTF-8)",
    description:
      "Encode text to Base64 or decode Base64 back to readable text instantly, with full UTF-8 support for accents and emoji. Free and runs in your browser.",
    tagline: "Text to Base64 and back, UTF-8 safe",
    keywords: ["base64 encode", "base64 decode", "base64 converter", "text to base64", "base64 to text"],
    section: "Developer Tools",
    category: "DeveloperApplication",
    features: ["Encode and decode in one place", "UTF-8 safe for any language and emoji", "Instant results"],
    intro: [
      "Base64 represents binary data as plain ASCII text. It is used in data URLs, email attachments, HTTP Basic auth headers and JSON payloads. This tool converts text both ways and handles UTF-8 correctly, including accented letters and emoji.",
    ],
    steps: ["Choose Encode or Decode.", "Paste your text or Base64 string.", "Copy the converted output."],
    faqs: [
      {
        q: "Is Base64 encryption?",
        a: "No. Base64 is an encoding, not encryption. Anyone can decode it, so never use it to protect secrets.",
      },
      {
        q: "Why does my decoded text look garbled?",
        a: "The input may not be valid Base64, or it may encode binary data such as an image rather than text.",
      },
    ],
    priority: 0.8,
    changeFrequency: "monthly",
  },
  {
    path: "/dev-tools/url-encode",
    slug: "url-encode",
    name: "URL Encoder & Decoder",
    title: "URL Encode & Decode Online",
    description:
      "Percent-encode or decode URLs, query string values and URI components instantly. Handy for building API requests and debugging links. Free, in-browser.",
    tagline: "Percent-encode and decode URL components",
    keywords: ["url encode", "url decode", "percent encoding", "encodeuricomponent", "query string encoder"],
    section: "Developer Tools",
    category: "DeveloperApplication",
    features: ["Encode with encodeURIComponent", "Decode percent-encoded strings", "Instant results"],
    intro: [
      "URLs can only contain a limited set of characters, so spaces, accents and symbols like & or = must be percent-encoded inside query values. This tool encodes and decodes URI components the same way JavaScript's encodeURIComponent does.",
    ],
    steps: ["Choose Encode or Decode.", "Paste the text or URL component.", "Copy the result."],
    faqs: [
      {
        q: "Should I encode the whole URL?",
        a: "Usually no. Encode each query value or path segment separately; encoding the whole URL also encodes the :// and / characters.",
      },
      {
        q: "Why is a space encoded as %20?",
        a: "%20 is the percent-encoding of the space character. Some HTML forms use + instead, which this tool does not convert.",
      },
    ],
    priority: 0.8,
    changeFrequency: "monthly",
  },
  {
    path: "/dev-tools/timestamp",
    slug: "timestamp",
    name: "Unix Timestamp Converter",
    title: "Unix Timestamp Converter: Epoch to Date",
    description:
      "Convert Unix epoch timestamps in seconds or milliseconds to readable dates and back, in UTC and your local time, with a live clock of the current time.",
    tagline: "Epoch time to dates and back",
    keywords: ["unix timestamp converter", "epoch converter", "timestamp to date", "date to timestamp", "epoch time"],
    section: "Developer Tools",
    category: "DeveloperApplication",
    features: ["Seconds and milliseconds", "UTC and local time", "Current time in Unix, milliseconds and ISO 8601"],
    intro: [
      "A Unix timestamp counts the seconds since 1 January 1970 UTC. APIs, databases and logs use it everywhere. Convert any timestamp to a readable date, or a date back to a timestamp, in seconds or milliseconds.",
    ],
    steps: ["Paste a timestamp and choose seconds or milliseconds.", "Read the date in UTC and your local time.", "Or pick a date to get its timestamp."],
    faqs: [
      {
        q: "Is my timestamp in seconds or milliseconds?",
        a: "Current timestamps in seconds have 10 digits; in milliseconds they have 13. JavaScript's Date.now() returns milliseconds.",
      },
      {
        q: "Do Unix timestamps depend on time zone?",
        a: "No. A timestamp is always relative to UTC. Only the human-readable date changes with the time zone.",
      },
    ],
    priority: 0.8,
    changeFrequency: "monthly",
  },
  {
    path: "/dev-tools/regex",
    slug: "regex",
    name: "Regex Tester",
    title: "Regex Tester: Test Regular Expressions Online",
    description:
      "Test JavaScript regular expressions with live match highlighting, capture groups and g, i, m, s flags. Includes ready-made patterns for email, URL and IP.",
    tagline: "Live regex matching with capture groups",
    keywords: ["regex tester", "regular expression tester", "regex online", "javascript regex", "regex match"],
    section: "Developer Tools",
    category: "DeveloperApplication",
    features: ["Live match highlighting", "Capture group details", "Global, case-insensitive, multiline and dotall flags", "Common pattern presets"],
    intro: [
      "Regex Tester shows matches as you type so you can build and debug regular expressions quickly. It uses the JavaScript regex engine, so results match what you get in browsers and Node.js.",
    ],
    steps: ["Type a pattern or choose a preset.", "Toggle flags such as g, i, m and s.", "Paste test text and inspect highlighted matches and groups."],
    faqs: [
      {
        q: "Which regex flavor does it use?",
        a: "JavaScript (ECMAScript). Most syntax is shared with PCRE and Python, but lookbehind support and some escapes differ.",
      },
      {
        q: "Why do I only get one match?",
        a: "Turn on the g (global) flag to find every match instead of stopping at the first one.",
      },
    ],
    priority: 0.8,
    changeFrequency: "monthly",
  },
];

export function getPage(path: string): SeoPage {
  const page = SEO_PAGES.find((p) => p.path === path);
  if (!page) throw new Error(`No SEO entry for ${path}`);
  return page;
}

export function getPageBySlug(slug: string) {
  return SEO_PAGES.find((p) => p.slug === slug);
}

/** Other tools in the same section (then any section) for internal links. */
export function relatedPages(page: SeoPage, count = 4) {
  const tools = SEO_PAGES.filter((p) => p.section !== "Site" && !p.noindex && p.path !== page.path);
  const same = tools.filter((p) => p.section === page.section);
  const rest = tools.filter((p) => p.section !== page.section).sort((a, b) => b.priority - a.priority);
  return [...same, ...rest].slice(0, count);
}
