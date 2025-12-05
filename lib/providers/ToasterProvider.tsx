"use client";

import { Toaster } from "react-hot-toast";
export function ToasterProvider() {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      toastOptions={{
        duration: 3000,
        style: {
          padding: "16px",
        },
      }}
    />
  );
}
