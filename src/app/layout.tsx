import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { cn } from "@/lib/utils";
import { BottomNav } from "@/components/bottom-nav";

export const metadata: Metadata = {
  title: "PPL Tracker",
  description: "AI-powered workout companion",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "PPL Tracker",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#09090b",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn("dark", GeistSans.variable, GeistMono.variable, "font-sans")}>
      <body className="font-sans antialiased bg-zinc-950 text-zinc-50">
        <main className="mx-auto max-w-md">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
