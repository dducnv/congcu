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

// chuyển đổi
const chuyenDoiItems: SidebarItem[] = [
  {
    name: "Trích xuất văn bản từ hình ảnh",
    href: "/image-to-text",
    icon: "",
    desc: "Trích xuất văn bản từ các hình ảnh như JPG, PNG.",
  },
  {
    name: "Chuyển đổi file",
    href: "/file-converter",
    icon: "",
    desc: "Chuyển đổi file từ định dạng này sang định dạng khác.",
  },
];
const chuyenDoi: SidebarModel = {
  title: "🚀 Chuyển Đổi",
  items: chuyenDoiItems,
};

// cong cu

const congCuItems: SidebarItem[] = [
  {
    name: "Ghi chú",
    href: "/quicknote",
    icon: "",
    desc: "Ghi chú.",
  },
  {
    name: "Emoji",
    href: "/emoji",
    icon: "",
    desc: "Tổng hợp emoji.",
  },

  {
    name: "Tính tỉ lệ %",
    href: "/percentity",
    icon: "",
    desc: "Công cụ tính % nhanh (có công thức).",
  },
  {
    name: "Chọn màu từ ảnh",
    href: "/color-picker-from-image",
    icon: "",
    desc: "Chức năng như tên.",
  },
  {
    name: "Chỉnh sửa ảnh",
    href: "/quick-image-editor",
    icon: "",
    desc: "Cung cấp các công cụ chỉnh sửa ảnh nhanh.",
  },
  {
    name: "Vẽ",
    href: "/draw",
    icon: "",
    desc: "Vẽ trên màn hình."
  }
];

const congCu: SidebarModel = {
  title: "🛠 Công Cụ ",
  items: congCuItems,
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

export const sidebarData: SidebarModel[] = [chuyenDoi, congCu, developerTools];

export const navData: SidebarItem[] = [
  {
    name: "Trang chủ",
    href: "/",
    icon: "",
    desc: "Trang chủ",
  }
];
