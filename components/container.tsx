import React from "react";

export const Container = ({
  width,
  children,
}: {
  children: React.ReactNode;
  width: string;
}) => {
  return (
    <div className={` ${width} p-3 border border-black bg-white m-auto`}>
      {children}
    </div>
  );
};
