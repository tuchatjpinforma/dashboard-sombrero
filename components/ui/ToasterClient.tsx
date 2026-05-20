"use client";

import { Toaster } from "react-hot-toast";

export default function ToasterClient() {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        style: {
          background: "rgb(var(--text-primary))",
          color: "rgb(var(--surface))",
          borderRadius: "10px",
        },
      }}
    />
  );
}

