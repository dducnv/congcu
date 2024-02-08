
"use client";
import React from 'react'
import { TDExport, Tldraw, TldrawApp, useFileSystem } from "@tldraw/tldraw";


export const DrawComponent = () => {
    const fileSystemEvents = useFileSystem();
  return (
    <Tldraw
    autofocus
    showPages={false}
    showMultiplayerMenu={false}
    darkMode={false}
    {...fileSystemEvents}

    />
  )
}
