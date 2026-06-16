import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import CopilotWidget from "@/components/CopilotWidget";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { Suspense } from "react";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Data Science Platform",
  description: "AI-powered analytics and data science platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body>
        <div className="flex h-screen bg-[#0a0a0f] text-[#f0f0f5] overflow-hidden">
          <Suspense fallback={<div className="w-64 bg-[#13141c] flex-shrink-0" />}>
            <Sidebar />
          </Suspense>
          <div className="flex-1 flex flex-col overflow-hidden relative" style={{ marginLeft: '48px', marginRight: '48px' }}>
            <Suspense fallback={<div className="h-16 bg-[#0a0a0f]/80" />}>
              <Header />
            </Suspense>
            <main className="flex-1 overflow-hidden flex flex-col" style={{ paddingLeft: '24px', paddingRight: '24px' }}>
              {children}
            </main>
          </div>
        </div>
        <CopilotWidget />
      </body>
    </html>
  );
}
