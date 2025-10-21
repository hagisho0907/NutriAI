import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/components/providers/AppProvider";

export const metadata: Metadata = {
  title: "NutriAI - AI-Powered Nutrition Assistant",
  description: "健康的な食事と運動をAIでサポート",
  manifest: "/manifest.json",
  themeColor: "#42B883",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased min-h-screen bg-background font-sans">
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
