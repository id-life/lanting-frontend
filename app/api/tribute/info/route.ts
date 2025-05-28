// app/api/tribute/info/route.ts
import { NextRequest, NextResponse } from "next/server";
import apiClient from "@/lib/apiClient";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const link = searchParams.get("link");

  if (!link) {
    return NextResponse.json(
      { status: "fail", code: "MISSING_LINK", message: "Link is required" },
      { status: 400 }
    );
  }

  try {
    const response = await apiClient<any>(`/api/tribute/info`, {
      // 目标是真实后端的 /api/tribute/info
      params: { link },
    });
    // 直接透传真实后端的响应
    return NextResponse.json(response);
  } catch (error: any) {
    console.error("API Proxy Error (tribute/info):", error.message, error.data);
    return NextResponse.json(
      {
        status: "fail",
        code: "SERVER_ERROR",
        message: error.message || "Failed to fetch tribute info from backend",
        details: error.data,
      },
      { status: error.status || 500 }
    );
  }
}
