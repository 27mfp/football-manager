import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Football Manager",
  description: "Manage 5v5 football matches",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-100">
        <nav className="bg-blue-600 text-white p-4">
          <h1 className="text-2xl font-bold">Football Manager</h1>
        </nav>
        <main className="container mx-auto mt-8 px-4">{children}</main>
      </body>
    </html>
  );
}
