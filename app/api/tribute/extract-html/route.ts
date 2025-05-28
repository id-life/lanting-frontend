// app/api/tribute/extract-html/route.ts
import { NextRequest, NextResponse } from "next/server";
import apiClient from "@/lib/apiClient";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    // 假设真实后端 /api/tribute/extract-html 期望接收 FormData
    const response = await apiClient<any>("/api/tribute/extract-html", {
      method: "POST",
      body: formData,
      // apiClient 会自动处理 FormData 的 Content-Type
    });
    return NextResponse.json(response);
  } catch (error: any) {
    console.error(
      "API Proxy Error (tribute/extract-html):",
      error.message,
      error.data
    );
    let status = 500;
    let message = "Failed to extract HTML info from backend";
    if (error && typeof error.status === "number") {
      status = error.status;
    }
    if (error && typeof error.message === "string") {
      message = error.message;
    }
    return NextResponse.json(
      { status: "fail", code: "SERVER_ERROR", message, details: error.data },
      { status }
    );
  }
}
