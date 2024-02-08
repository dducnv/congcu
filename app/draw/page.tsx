import React from "react";
import { Container, DrawComponent } from "@/components";

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
