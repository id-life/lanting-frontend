import type { Metadata } from "next";
import type { ArchivePageParams as PageParams } from "@/lib/types";
import { fetchArchiveById } from "@/apis";

export async function generateMetadata({
  params,
}: {
  params: PageParams;
}): Promise<Metadata> {
  const { id } = params;

  if (!id || isNaN(Number(id))) {
    return {
      title: "无效文章 - 兰亭文存",
      description: "请求的文章ID无效。",
    };
  }

  try {
    const { data, success } = await fetchArchiveById(id);

    if (success && data) {
      const archive = data;
      const description = archive.remarks
        ? archive.remarks.substring(0, 160).replace(/\s+/g, " ").trim() +
          (archive.remarks.length > 160 ? "..." : "")
        : "兰亭文存中的一篇文章。";

      return {
        title: `${archive.title} - 兰亭文存`,
        description: description,
        keywords: archive.tag?.join(", ") || "",
        openGraph: {
          title: archive.title,
          description: description,
        },
      };
    } else {
      return {
        title: "文章未找到 - 兰亭文存",
        description: "您要查找的文章不存在或已被删除。",
      };
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_) {
    return {
      title: "文章加载错误 - 兰亭文存",
      description: "获取文章信息时发生错误。",
    };
  }
}

export default function ArchiveDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
