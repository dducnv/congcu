import React from "react";

export const Container = ({
  width,
  children,
  className,
}: {
  children: React.ReactNode;
  width: string;
  className?: string;
}) => {
  return (
    <div className={` ${width} ${className}  border border-black bg-white m-auto`}>
      {children}
    </div>
  );
};
