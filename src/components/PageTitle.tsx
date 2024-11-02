// components/PageTitle.tsx
"use client";

import { useEffect } from "react";

interface PageTitleProps {
  title: string;
}

export function PageTitle({ title }: PageTitleProps) {
  useEffect(() => {
    document.title = `${title} | BolaApp`;

    // Optional: Reset title when component unmounts
    return () => {
      document.title = "BolaApp";
    };
  }, [title]);

  return null;
}
