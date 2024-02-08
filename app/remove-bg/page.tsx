import { RmBg, TitlePage } from '@/components'
import React from 'react'

const page = () => {
  return (
    <div className=" min-h-screen p-3">
       <div className="h-20"></div>
    <TitlePage>
      Xóa nền ảnh
    </TitlePage>
    <RmBg/>
  </div>
  )
}

export default page