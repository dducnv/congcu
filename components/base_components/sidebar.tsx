"use client";

import { navData, sidebarData } from "@/core/data_local/sidebar_data";
import { classNames } from "@/core/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export const Siderbar = () => {
  const pathName = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside className={`hidden flex-col lg:flex pl-4 min-h-screen bg-white transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-72'
      }`}>
      <div className="flex items-center justify-between mt-2">
        <Link
          href={"/"}
          className="text-3xl text-mono font-semibold text-gray-800"
        >
          {!isCollapsed && <h1>7TH.DEC</h1>}
        </Link>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 hover:bg-gray-100 rounded transition-colors"
        >
          {isCollapsed ? '→' : '←'}
        </button>
      </div>

      <div className="flex flex-col justify-between flex-1 mt-6 overflow-auto">
        <nav>
          {navData.map((item, index) => (
            <Link
              href={item.href}
              key={item.href}
              className={classNames(
                pathName === item.href
                  ? "border-l border-black"
                  : "text-gray-800",
                "flex items-center px-2 hover:underline hover:px-4 mt-5 text-gray-800 transition-colors duration-200 transform hover:text-gray-900",
                isCollapsed ? "justify-center" : ""
              )}
              title={isCollapsed ? item.name : undefined}
            >
              {!isCollapsed && item.name}
            </Link>
          ))}
          <hr className="my-6 border-gray-200" />

          {sidebarData.map((item, index) => (
            <div key={index}>
              {!isCollapsed && (
                <Link href={"/"}>
                  <h2 className="text-lg font-medium">{item.title}</h2>
                </Link>
              )}
              {item.items.map((itemlink, index) => (
                <Link
                  href={itemlink.href}
                  key={itemlink.name}
                  className={classNames(
                    pathName === itemlink.href
                      ? "border-l border-black"
                      : "text-gray-800",
                    "flex items-center px-2 hover:underline hover:px-4 mt-5 text-gray-800 transition-colors duration-200 transform hover:text-gray-900",
                    isCollapsed ? "justify-center" : ""
                  )}
                  title={isCollapsed ? itemlink.name : undefined}
                >
                  {!isCollapsed && <h2>{itemlink.name}</h2>}
                </Link>
              ))}
              {!isCollapsed && <hr className="my-3 border-gray-200" />}
            </div>
          ))}

        </nav>

      </div>
      {!isCollapsed && (
        <div>
          <h4>
            Made by{" "}
            <a href="https://dducnv.github.io" className="underline">
              Nguyen Van Duc
            </a>{" "}
            with all my heart ❤️
          </h4>
        </div>
      )}
    </aside>
  );
};
