import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import CopilotWidget from "@/components/CopilotWidget";
import Sidebar from "@/components/Sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AntiGravity | Data Science Platform",
  description: "AI-powered analytics and data science platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <div className="flex h-screen bg-[#0a0a0f] text-[#f0f0f5] overflow-hidden">
          <Sidebar />
          <div className="flex-1 overflow-y-auto relative custom-scrollbar">
            {children}
          </div>
        </div>
        <CopilotWidget />
      </body>
    </html>
  );
}
