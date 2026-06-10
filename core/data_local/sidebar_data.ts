type SidebarModel = {
  title: string;
  items: SidebarItem[];
};

type SidebarItem = {
  name: string;
  href: string;
  icon: string;
  desc: string;
};

// conversion
const conversionItems: SidebarItem[] = [
  {
    name: "Extract text from image",
    href: "/image-to-text",
    icon: "",
    desc: "Extract text from images like JPG, PNG.",
  },
];
const conversion: SidebarModel = {
  title: "🚀 Conversion",
  items: conversionItems,
};

// tools

const toolsItems: SidebarItem[] = [
  {
    name: "Quick Note",
    href: "/quicknote",
    icon: "",
    desc: "Take quick notes.",
  },
  {
    name: "Emoji",
    href: "/emoji",
    icon: "",
    desc: "Emoji collection.",
  },

  {
    name: "Calculate percentage",
    href: "/percentity",
    icon: "",
    desc: "Quick percentage calculator (with formulas).",
  },
  {
    name: "Color Tools",
    href: "/color-tools",
    icon: "",
    desc: "Pick colors from images, convert HEX/RGB/HSL, get CSS & Flutter code.",
  },
  {
    name: "Quick image editor",
    href: "/quick-image-editor",
    icon: "",
    desc: "Provides quick image editing tools.",
  },
  {
    name: "Draw",
    href: "/draw",
    icon: "",
    desc: "Draw on screen."
  },
  {
    name: "Pomodoro",
    href: "/pomodoro",
    icon: "",
    desc: "Focus timer with tasks."
  },
  {
    name: "Create QR Code",
    href: "/create-qr",
    icon: "",
    desc: "Generate QR codes from text or URLs."
  }
];

const tools: SidebarModel = {
  title: "🛠 Tools ",
  items: toolsItems,
};

// developer tools

const developerToolsItems: SidebarItem[] = [
  {
    name: "Read Json",
    href: "/dev-tools/read-json",
    icon: "",
    desc: "",
  },
  {
    name: "CSV Viewer",
    href: "/dev-tools/csv-viewer",
    icon: "",
    desc: "View, analyze and visualize CSV data with statistics and charts",
  },
  {
    name: "Generate secret key",
    href: "/dev-tools/generate-secret-key",
    icon: "",
    desc: "",
  },
];

const developerTools: SidebarModel = {
  title: "💻 Developer Tools ",
  items: developerToolsItems,
};

export const sidebarData: SidebarModel[] = [conversion, tools, developerTools];

export const navData: SidebarItem[] = [
  {
    name: "Home",
    href: "/",
    icon: "",
    desc: "Home page",
  }
];
