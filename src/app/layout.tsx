"use client";

import "./globals.css";
import { Inter } from "next/font/google";
import Link from "next/link";
import { useTheme } from "@/hooks/useTheme";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { darkMode, toggleTheme } = useTheme();

  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen`}>
        <nav className="bg-[var(--primary)] text-white p-4">
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
              <Link href="/leaderboard" className="hover:text-gray-200">
                Leaderboard
              </Link>
              <button
                onClick={toggleTheme}
                className="bg-[var(--secondary)] text-[var(--text)] px-3 py-1 rounded-md"
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
