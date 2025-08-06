"use client";

import React from "react";

export default function Title({ title, subtitle }: { title?: string; subtitle?: string }) {
  return (
    <header className="w-full text-white py-12 sm:py-16 md:py-24 px-4 sm:px-6 md:px-8">
      {title && (
        <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-8xl font-extrabold tracking-tight leading-tight uppercase break-words text-overflow-safe">
          {title}
        </h1>
      )}
      {subtitle && (
        <h2 className="mt-4 sm:mt-6 text-lg sm:text-xl md:text-2xl lg:text-3xl font-light max-w-prose opacity-80 break-words text-overflow-safe leading-relaxed">
          {subtitle}
        </h2>
      )}
    </header>
  );
}
