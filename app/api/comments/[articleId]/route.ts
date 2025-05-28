import { NextResponse, NextRequest } from "next/server";
import apiClient from "@/lib/apiClient";
import type { CommentData } from "@/lib/types";

interface CommentsApiResponse {
  comments?: CommentData[];
  comment?: CommentData;
  allComments?: CommentData[];
  message?: string;
  error?: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const articleId = searchParams.get("articleId");

  if (!articleId) {
    return NextResponse.json(
      { error: "articleId is required" },
      { status: 400 }
    );
  }

  try {
    // 假设真实后端 GET /api/comments/read?articleId=xxx
    const response = await apiClient<CommentsApiResponse>(
      `/api/comments/read`,
      {
        params: { articleId },
      }
    );
    return NextResponse.json({ comments: response.comments || [] });
  } catch (error: any) {
    console.error("API Proxy Error (GET comments):", error.message, error.data);
    return NextResponse.json(
      {
        error: error.message || "Failed to fetch comments",
        details: error.data,
      },
      { status: error.status || 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // 假设真实后端 POST /api/comments/create
    const response = await apiClient<CommentsApiResponse>(
      "/api/comments/create",
      {
        method: "POST",
        body: JSON.stringify(body),
      }
    );
    return NextResponse.json(response); // 直接返回真实后端的响应
  } catch (error: any) {
    console.error(
      "API Proxy Error (POST comments):",
      error.message,
      error.data
    );
    return NextResponse.json(
      { error: error.message || "Failed to add comment", details: error.data },
      { status: error.status || 500 }
    );
  }
}
