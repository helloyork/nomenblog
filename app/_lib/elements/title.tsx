"use client";

import React from "react";

export default function Title({ title, subtitle }: { title?: string; subtitle?: string }) {
  return (
    <header className="w-full text-white py-24">
      {title && (
        <h1 className="text-6xl md:text-8xl font-extrabold tracking-tight leading-none uppercase">
          {title}
        </h1>
      )}
      {subtitle && (
        <h2 className="mt-6 text-2xl md:text-3xl font-light max-w-prose opacity-80">
          {subtitle}
        </h2>
      )}
    </header>
  );
}
