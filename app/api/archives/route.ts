// import { NextResponse } from "next/server";
// import apiClient from "@/lib/apiClient"; // 引入封装的 apiClient
// import type { Archives } from "@/lib/types";

// export async function GET() {
//   try {
//     // 注意：原后端 archives.json 的路径是 /archives/archives.json
//     // 如果真实后端的 API 路径是 /api/archives，则使用 '/api/archives'
//     // 根据你真实后端的 API 路径来调整这里的 endpoint
//     const archivesData = await apiClient<Archives>("/api/archives"); // 假设真实后端 API 路径
//     return NextResponse.json(archivesData);
//   } catch (error: any) {
//     console.error("API Proxy Error (archives):", error.message, error.data);
//     return NextResponse.json(
//       {
//         error: error.message || "Failed to fetch archives from backend",
//         details: error.data,
//       },
//       { status: error.status || 500 }
//     );
//   }
// }

// app/api/archives/route.ts
import { NextResponse } from "next/server";
import apiClient from "@/lib/apiClient";
import type { Archives } from "@/lib/types";
import { fakeArchivesData } from "@/lib/fakeData"; // 导入本地假数据

// 从环境变量读取是否强制使用 Fake API
const FORCE_FAKE_API = process.env.FORCE_FAKE_ARCHIVES_API === "true";
const REAL_API_ENDPOINT = "/archives/archives"; // 真实后端提供 archives.json 的路径

export async function GET() {
  if (FORCE_FAKE_API) {
    console.warn(
      "Archives API: Serving fake data due to FORCE_FAKE_ARCHIVES_API=true"
    );
    return NextResponse.json(fakeArchivesData);
  }

  try {
    const archivesDataFromApi = await apiClient<Archives>(REAL_API_ENDPOINT);

    // 验证从真实 API 获取的数据是否有效
    if (
      archivesDataFromApi &&
      archivesDataFromApi.archives &&
      Object.keys(archivesDataFromApi.archives).length > 0
    ) {
      // 如果真实 API 返回了有效数据，则使用它
      // 可以考虑在此处对 id 类型进行转换，如果后端返回的是字符串 id
      const processedArchives = { ...archivesDataFromApi };
      if (processedArchives.archives) {
        Object.values(processedArchives.archives).forEach((archive) => {
          if (typeof archive.id === "string") {
            archive.id = parseInt(archive.id, 10);
          }
        });
      }
      return NextResponse.json(processedArchives);
    } else {
      // 如果真实 API 返回数据为空或无效，则降级到假数据
      console.warn(
        `Archives API: Real API returned invalid or empty data. Falling back to fake data. API Response:`,
        archivesDataFromApi
      );
      return NextResponse.json(fakeArchivesData);
    }
  } catch (error: any) {
    // 如果 API 请求本身失败 (网络错误、5xx 错误等)，则降级
    console.error(
      "Archives API: Error fetching from real backend, falling back to fake data. Error:",
      error.message,
      error.data || error
    );
    return NextResponse.json(fakeArchivesData);
  }
}
