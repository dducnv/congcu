"use client";

import { Siderbar } from "@/components";
import { sidebarData } from "@/core/data_local/sidebar_data";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function Home() {
  const [search, setSearch] = useState("");
  const handleSearch = (value: string) => {
    setSearch(value);
  };
  return (
    <main>
      <div className=" max-w-6xl m-auto">
        <div className="flex justify-center mt-20 lg:pt-6">
          <input
            onChange={(value) => handleSearch(value.target.value)}
            className="border text-mono border-black w-full py-5 text-3xl px-6 max-w-4xl m-auto outline-none rounded-full shadow-blog-l"
            placeholder="Nhập từ khóa để tìm kiếm công cụ..."
          />
        </div>
        <div className="mt-16 ld:mt-20">
          {sidebarData?.map((item, index) => {
            const filterItems = item.items.filter((item) =>
              item.name.toLocaleLowerCase().includes(search.toLocaleLowerCase())
            );

            return (
              <>
                {filterItems.length > 0 && (
                  <>
                    <h1 className="px-3 mt-10 border-l-4 border-black text-3xl text-mono font-bold">
                      {item.title}
                    </h1>
                    <div className=" grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 pt-6 gap-8">
                      {filterItems.map((itemInItem, index) => (
                        <Link
                          href={itemInItem.href}
                          key={index}
                          className="w-full text-mono p-4 h-44 border border-black bg-white hover:shadow-blog-l hover:translate-y-blog-4m hover:translate-x-blog-4p  ease-in duration-200"
                        >
                          <span className="text-lg bg-black text-white ">
                            {itemInItem.name}
                          </span>
                          <p className="mt-2">{itemInItem.desc}</p>
                        </Link>
                      ))}
                    </div>
                  </>
                )}
              </>
            );
          })}
        </div>
      </div>
    </main>
  );
}
