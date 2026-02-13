import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GTA VI Hub",
  description: "Latest GTA 6 news, leaks, and updates",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
