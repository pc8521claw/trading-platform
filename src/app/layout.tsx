import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "股票分析平台 | Stock Trading Platform",
  description: "即時市場數據、技術分析、策略回測、價格預測",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <body className="antialiased">{children}</body>
    </html>
  );
}
