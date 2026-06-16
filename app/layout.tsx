import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "会议室同传终端系统",
  description: "NVIDIA DGX Spark 离线会议翻译与纪要前端"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
