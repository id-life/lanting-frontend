// app/api/tribute/save/route.ts
import { NextRequest, NextResponse } from "next/server";
import apiClient from "@/lib/apiClient";

export async function POST(request: NextRequest) {
  const contentType = request.headers.get("content-type");

  try {
    let response;
    if (contentType && contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      // 真实后端 /api/archive/tribute/save 能够处理 FormData
      response = await apiClient<any>("/api/archive/tribute/save", {
        method: "POST",
        body: formData,
      });
    } else if (contentType && contentType.includes("application/json")) {
      const jsonData = await request.json();
      // 真实后端 /api/archive/tribute/save 也可能处理 JSON
      response = await apiClient<any>("/api/archive/tribute/save", {
        method: "POST",
        body: JSON.stringify(jsonData), // apiClient 默认 Content-Type 是 json
      });
    } else {
      return NextResponse.json(
        {
          status: "fail",
          code: "INVALID_CONTENT_TYPE",
          message: "Unsupported Content-Type",
        },
        { status: 415 }
      );
    }
    return NextResponse.json(response);
  } catch (error: any) {
    console.error("API Proxy Error (tribute/save):", error.message, error.data);
    let status = 500;
    let message = "Failed to save tribute to backend";
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
