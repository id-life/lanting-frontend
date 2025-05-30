import type { Metadata } from "next";
import type { ArchivePageParams as PageParams } from "@/lib/types";

export async function generateMetadata({
  params,
}: {
  params: PageParams;
}): Promise<Metadata> {
  const { id } = await params;

  try {
    const archive = await fetch(`/api/archives/${id}`, {
      cache: "no-store",
    }).then((res) => res.json());

    console.log({ archive });

    if (archive && archive.title) {
      // const description =
      // archive.remarks.substring(0, 160).replace(/\s+/g, " ").trim() + "...";

      return {
        title: `${archive.title} - 兰亭文存`,
        // description: description,
        keywords: archive.tag.join(", "),
        openGraph: {
          title: archive.title,
          // description: description,
        },
      };
    }

    return {
      title: "文章未找到 - 兰亭文存",
      description: "您要查找的文章不存在或已被删除。",
    };
  } catch (e) {
    console.log(1);
    return {
      title: "文章未找到 - 兰亭文存",
      description: "您要查找的文章不存在或已被删除。",
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
