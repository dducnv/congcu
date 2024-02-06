
import React from "react";
import { Container, ImageEditor, TitlePage } from "@/components";


const page = () => {

    const whiteTheme = {
    // "common.bi.image": "https://uicdn.toast.com/toastui/img/tui-image-editor-bi.png",

  
    "common.backgroundColor": "#fff",

    "header.backgroundImage": "none",
    "header.backgroundColor": "transparent",
    "header.border": "0px",

    };


  const props = {
    includeUI: {
      menu: ["shape", "filter", "text", "mask", "icon", "draw", "crop", "flip", "rotate"],
      initMenu: "crop",
      loadImage: {
        path: "https://images.pexels.com/photos/2662116/pexels-photo-2662116.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
        name: "SampleImage",
      },
    //   uiSize: {
    //     width: "100%",
    //     height: "100%",
    //   },
      theme: whiteTheme,
      
      menuBarPosition: "right",
      
    },
    cssMaxWidth: 700,
    cssMaxHeight: 500,
    selectionStyle: {
      cornerSize: 20,
      rotatingPointOffset: 70,
    },
  };
  return (
    <div className="max-h-screen overflow-hidden h-screen scroll-m-0">
      <TitlePage>Ghi chú nhanh</TitlePage>
      <Container width="max-w-6xl" className="p-0 h-[700px]">
        <ImageEditor {...props} />
      </Container>
    </div>
  );
};

export default page;
