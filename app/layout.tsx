import type { Metadata, Viewport } from "next";
import Link from "next/link";
import React from "react";
import { ConfigProvider, App as AntdApp } from "antd";
import "@ant-design/v5-patch-for-react-19";
import { AntdRegistry } from "@/lib/AntdRegistry";
import theme from "@/lib/themeConfig"; // 假设主题配置在此
import Footer from "@/components/Footer";
import RightContent from "@/components/GlobalHeader/RightContent";
import logo from "@/public/favicon.ico"; // 确保路径正确
import "./globals.css"; // 引入全局样式
import "./index.scss";

export const metadata: Metadata = {
  title: "兰亭文存 LantingFlorilegium",
  description: "兰亭已矣, 梓泽丘墟. 何处世家? 几人游侠?",
  keywords:
    "创业,互联网,移动互联网,技术,计算机,商业,历史,阿里巴巴,腾讯,百度,字节跳动,美团",
  icons: [{ rel: "icon", url: "/public/favicon.ico" }],
  openGraph: {
    title: "兰亭文存 LantingFlorilegium",
    description: "兰亭已矣, 梓泽丘墟. 何处世家? 几人游侠?",
    images: [{ url: "/public/favicon.ico" }], // 需要提供一个绝对路径的图片
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
        <AntdRegistry>
          <ConfigProvider theme={theme}>
            <AntdApp>
              {/* Ant Design 的 message, notification 等需要包裹在 App 内 */}
              <div className="min-h-screen flex flex-col">
                <header className="bg-white shadow-sm sticky top-0 z-50">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                      <div className="flex items-center">
                        <Link href="/" className="flex items-center">
                          <img
                            className="h-8 w-8 mr-2"
                            src={logo.src}
                            alt="兰亭文存 Logo"
                          />
                          <h1 className="text-2xl font-bold text-primary">
                            兰亭文存
                          </h1>
                        </Link>
                      </div>
                      <div className="flex items-center">
                        <nav className="hidden md:flex space-x-4">
                          <Link
                            href="https://www.thenetworkstate-zh.com/foreword/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-600 hover:text-primary px-3 py-2 rounded-md text-sm font-medium"
                          >
                            网络国家
                          </Link>
                          <Link
                            href="https://blog.wangboyang.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-600 hover:text-primary px-3 py-2 rounded-md text-sm font-medium"
                          >
                            芦柑笔谈
                          </Link>
                        </nav>
                        <div className="ml-4">
                          <RightContent />
                        </div>
                      </div>
                    </div>
                  </div>
                </header>
                <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                  {children}
                </main>
                <Footer />
              </div>
            </AntdApp>
          </ConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
