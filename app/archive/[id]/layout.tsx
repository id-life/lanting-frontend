import type { Metadata, ResolvingMetadata } from "next";
import type { Archive, ArchivePageParams as PageParams } from "@/lib/types";

async function getArchiveMetaDataForLayout(
  id: string
): Promise<Archive | null> {
  try {
    const res = await fetch(`/api/archives/${id}`, {
      cache: "no-store",
    });
    console.log({ res });
    if (!res) {
      return null;
    }
    const archive: Archive = await res.json();
    // 进一步检查返回的 archive 是否真的是一个有效的 Archive 对象
    if (archive && typeof archive.title === "string") {
      return archive;
    }
    // console.warn(
    //   `Metadata: Fetched data for archive ${id} from /api/archive/${id} was not a valid archive object.`
    // );
    return null;
  } catch (error) {
    // console.error(
    //   `Metadata: Error fetching archive ${id} for metadata from /api/archive/${id}:`,
    //   error
    // );
    return null;
  }
}

export async function generateMetadata(
  { params }: { params: PageParams },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { id } = await params;
  const archive = await getArchiveMetaDataForLayout(id);

  if (!archive) {
    return {
      title: "文章未找到 - 兰亭文存",
      description: "您要查找的文章不存在或已被删除。",
    };
  }

  const description =
    archive.remarks.substring(0, 160).replace(/\s+/g, " ").trim() + "...";

  return {
    title: `${archive.title} - 兰亭文存`,
    description: description,
    keywords: archive.tag.join(", "),
    openGraph: {
      title: archive.title,
      description: description,
      // images: archive.image ? [archive.image] : [],
    },
  };
}

export default function ArchiveDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
