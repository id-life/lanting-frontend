import { NextResponse } from "next/server";
import apiClient from "@/lib/apiClient";
import type { Archives } from "@/lib/types";
import { fakeArchivesData } from "@/lib/fakeData";

// 从环境变量读取是否强制使用 Fake API
const FORCE_FAKE_API = process.env.FORCE_FAKE_ARCHIVES_API === "true";
const REAL_API_ENDPOINT = "/archives/archives";

export async function GET() {
  if (FORCE_FAKE_API) {
    console.warn(
      "Archives API: Serving fake data due to FORCE_FAKE_ARCHIVES_API=true"
    );
    return NextResponse.json(fakeArchivesData);
  }

  try {
    const archivesDataFromApi = await apiClient<Archives>(REAL_API_ENDPOINT);

    if (
      archivesDataFromApi &&
      archivesDataFromApi.archives &&
      Object.keys(archivesDataFromApi.archives).length > 0
    ) {
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
      console.warn(
        `Archives API: Real API returned invalid or empty data. Falling back to fake data. API Response:`,
        archivesDataFromApi
      );
      return NextResponse.json(fakeArchivesData);
    }
  } catch (error: any) {
    console.error(
      "Archives API: Error fetching from real backend, falling back to fake data. Error:",
      error.message,
      error.data || error
    );
    return NextResponse.json(fakeArchivesData);
  }
}
