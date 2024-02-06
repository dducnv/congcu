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
    name: "Chuyển đổi tiền tệ",
    href: "/currency-exchange",
    icon: "",
    desc: "Chức năng như tên.",
  },
  {
    name: "Trích xuất văn bản từ hình ảnh",
    href: "/image-to-text",
    icon: "",
    desc: "Trích xuất văn bản từ các hình ảnh như JPG, PNG.",
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
    name: "Xóa nền",
    href: "/remove-bg",
    icon: "",
    desc: "Chức năng như tên.",
  },
  {
    name: "Chỉnh sửa ảnh",
    href: "/quick-image-editor",
    icon: "",
    desc: "Cung cấp các công cụ chỉnh sửa ảnh nhanh.",
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
  },
  {
    name: "Giới thiệu",
    href: "/about",
    icon: "",
    desc: "Về chúng tôi",
  },
];
