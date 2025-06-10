import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "文章归档 - 兰亭文存",
  description: "提交新的文章链接或文件进行归档。",
};

export default function TributeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
