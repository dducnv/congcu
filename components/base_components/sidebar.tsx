"use client";

import { navData, sidebarData } from "@/core/data_local/sidebar_data";
import { classNames } from "@/core/utils";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export const Siderbar = () => {
  const pathName = usePathname();

  return (
    <aside className="hidden flex-col w-72  lg:flex  px-4 py-8 min-h-screen bg-white ">
      <Link
        href={"/"}
        className="text-3xl textMono font-semibold text-gray-800"
      >
        <h1>7TH.DEC</h1>
      </Link>

      <div className="flex flex-col justify-between flex-1 mt-6">
        <nav>
          {navData.map((item, index) => (
            <Link
              href={item.href}
              key={item.href}
              className={classNames(
                pathName === item.href
                  ? "border-l border-black"
                  : "text-gray-800",
                "flex items-center px-2 hover:underline hover:px-4  mt-5 text-gray-800 transition-colors duration-200 transform  hover:text-gray-900"
              )}
            >
              {item.name}
            </Link>
          ))}
          <hr className="my-6 border-gray-200" />

          {sidebarData.map((item, index) => (
            <div key={index}>
              <Link href={"/"}>
                <h2 className="text-lg font-medium">{item.title}</h2>
              </Link>
              {item.items.map((itemlink, index) => (
                <Link
                  href={itemlink.href}
                  key={itemlink.name}
                  className={classNames(
                    pathName === itemlink.href
                      ? "border-l border-black"
                      : "text-gray-800",
                    "flex items-center px-2 hover:underline hover:px-4  mt-5 text-gray-800 transition-colors duration-200 transform  hover:text-gray-900"
                  )}
                >
                  <h2>{itemlink.name}</h2>
                </Link>
              ))}
              <hr className="my-6 border-gray-200 " />
            </div>
          ))}
          <div>
            <h4>
              Made by{" "}
              <a href="https://dducnv.dev" className="underline">
                Nguyen Van Duc
              </a>{" "}
              with all my heart ❤️
            </h4>
          </div>
        </nav>
      </div>
    </aside>
  );
};
