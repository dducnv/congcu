import React from "react";


import dynamic from "next/dynamic";

const DrawComponent = dynamic(async () => import("@/components/page_components/draw_component"), {
  ssr: false,
});

const page = () => {

  return (
   <div>
     <div  className=" max-h-screen h-screen relative pl-1 overflow-hidden bg-white"> 
      <DrawComponent />
    </div>
   </div>
  );
};

export default page;
