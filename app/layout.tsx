import type { Metadata, Viewport } from "next";
import React from "react";
import { ConfigProvider, App as AntdApp } from "antd";
import "@ant-design/v5-patch-for-react-19";

import { AntdRegistry } from "@/lib/AntdRegistry";
import theme from "@/lib/themeConfig";
import AppLayout from "@/components/AppLayout";
import QueryProvider from "@/lib/QueryProvider";

import "./globals.css";
import "./index.scss";

export const metadata: Metadata = {
  metadataBase: new URL("http://localhost:3000"),
  title: "兰亭文存 - 兰亭",
  description: "兰亭已矣, 梓泽丘墟. 何处世家? 几人游侠?",
  keywords:
    "创业,互联网,移动互联网,技术,计算机,商业,历史,阿里巴巴,腾讯,百度,字节跳动,美团",
  openGraph: {
    title: "兰亭文存 - 兰亭",
    description: "兰亭已矣, 梓泽丘墟. 何处世家? 几人游侠?",
    images: ["/favicon.ico"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh">
      <body>
        <QueryProvider>
          <AntdRegistry>
            <ConfigProvider theme={theme}>
              <AntdApp>
                <AppLayout>{children}</AppLayout>
              </AntdApp>
            </ConfigProvider>
          </AntdRegistry>
        </QueryProvider>
      </body>
    </html>
  );
}
