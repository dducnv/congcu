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
    name: "Color picker from image",
    href: "/color-picker-from-image",
    icon: "",
    desc: "Pick colors from images.",
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
  {
    name: "Color Converter",
    href: "/dev-tools/color-converter",
    icon: "",
    desc: "Chuyển đổi màu HEX ↔ RGB ↔ HSL với color picker",
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
