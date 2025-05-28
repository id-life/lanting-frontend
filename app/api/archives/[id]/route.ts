// app/api/archive/[id]/route.ts
import { NextResponse, NextRequest } from "next/server";
import apiClient from "@/lib/apiClient"; // 用于调用真实外部后端
import type { Archives } from "@/lib/types";
import { fakeArchivesData } from "@/lib/fakeData";

const FORCE_FAKE_API = process.env.FORCE_FAKE_SINGLE_ARCHIVE_API === "true";
// 假设真实后端没有直接按ID获取单个文章的接口，我们仍然需要获取列表后筛选
// 如果有，可以将 REAL_ARCHIVES_LIST_ENDPOINT 改为获取单个文章的端点
const REAL_ARCHIVES_LIST_ENDPOINT = "/archives/archives.json"; // 真实后端文章列表

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  const numericId = Number(id);

  if (isNaN(numericId)) {
    return NextResponse.json({ error: "Invalid article ID" }, { status: 400 });
  }

  // if (FORCE_FAKE_API) {
  //   console.warn(
  //     `Single Archive API (ID: ${id}): Serving fake data due to FORCE_FAKE_SINGLE_ARCHIVE_API=true`
  //   );
  //   const fakeArchive = fakeArchivesData.archives[numericId];
  //   if (fakeArchive) {
  //     return NextResponse.json(fakeArchive);
  //   }
  //   return NextResponse.json(
  //     { error: "Article not found in fake data" },
  //     { status: 404 }
  //   );
  // }

  try {
    // 尝试从真实后端获取所有文章数据
    // const allArchivesFromApi = await apiClient<Archives>(
    //   REAL_ARCHIVES_LIST_ENDPOINT
    // );

    // if (allArchivesFromApi && allArchivesFromApi.archives) {
    //   const targetArchive = allArchivesFromApi.archives[numericId];
    //   if (targetArchive) {
    //     // 确保ID是数字
    //     if (typeof targetArchive.id === "string") {
    //       targetArchive.id = parseInt(targetArchive.id, 10);
    //     }
    //     return NextResponse.json(targetArchive);
    //   }
    // }
    // 如果真实API没有返回有效数据或找不到文章，则降级
    // console.warn(
    //   `Single Archive API (ID: ${id}): Article not found in real API or API data invalid. Falling back to fake data.`
    // );
    const fakeArchive = (fakeArchivesData.archives as any[]).find(
      (item) => item.id == id
    );
    if (fakeArchive) {
      return NextResponse.json(fakeArchive);
    }
    return NextResponse.json(
      { error: `Article with ID ${id} not found` },
      { status: 404 }
    );
  } catch (error: any) {
    console.error(
      `Single Archive API (ID: ${id}): Error fetching from real backend, falling back to fake data. Error:`,
      error.message
    );
    const fakeArchive = fakeArchivesData.archives[numericId];
    if (fakeArchive) {
      return NextResponse.json(fakeArchive);
    }
    return NextResponse.json(
      {
        error: `Failed to fetch article ${id}, and not found in fallback data.`,
      },
      { status: 500 }
    );
  }
}
