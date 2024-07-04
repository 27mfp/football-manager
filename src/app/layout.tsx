"use client";

import "./globals.css";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const isDarkMode = localStorage.getItem("darkMode") === "true";
    setDarkMode(isDarkMode);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("darkMode", darkMode.toString());
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <html lang="en" className={darkMode ? "dark" : ""}>
      <body className="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen">
        <nav className="bg-blue-600 dark:bg-slate-800 text-white p-4">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold">Football Manager</h1>
            <div className="space-x-4 flex items-center">
              <Link href="/" className="hover:text-gray-200">
                Home
              </Link>
              <Link href="/matches" className="hover:text-gray-200">
                Matches
              </Link>
              <Link href="/players" className="hover:text-gray-200">
                Players
              </Link>
              <Link href="/team-generator" className="hover:text-gray-200">
                Team Generator
              </Link>
              <button
                onClick={toggleDarkMode}
                className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-3 py-1 rounded-md"
              >
                {darkMode ? "☀️" : "🌙"}
              </button>
            </div>
          </div>
        </nav>
        <main className="container mx-auto mt-8 px-4">{children}</main>
      </body>
    </html>
  );
}
