import { NextResponse, NextRequest } from "next/server";
import apiClient from "@/lib/apiClient";
import type { LikesMap } from "@/lib/types";

interface LikesApiResponse {
  likes: LikesMap;
  // 根据您真实后端的返回结构调整
  message?: string;
  articleId?: string;
  currentLikes?: number;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const articleId = searchParams.get("articleId");
  try {
    // 假设真实后端 GET /api/likes/read?articleId=xxx
    const response = await apiClient<LikesApiResponse>(`/api/likes/read`, {
      params: articleId ? { articleId } : undefined,
    });
    return NextResponse.json({ likes: response.likes || {} });
  } catch (error: any) {
    console.error("API Proxy Error (GET likes):", error.message, error.data);
    return NextResponse.json(
      { error: error.message || "Failed to fetch likes", details: error.data },
      { status: error.status || 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // 假设真实后端 POST /api/likes/create
    const response = await apiClient<LikesApiResponse>("/api/likes/create", {
      method: "POST",
      body: JSON.stringify(body),
    });
    return NextResponse.json(response); // 直接返回真实后端的响应
  } catch (error: any) {
    console.error("API Proxy Error (POST likes):", error.message, error.data);
    return NextResponse.json(
      {
        error: error.message || "Failed to update like status",
        details: error.data,
      },
      { status: error.status || 500 }
    );
  }
}
