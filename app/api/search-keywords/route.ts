import { NextResponse, NextRequest } from "next/server";
import apiClient from "@/lib/apiClient";

interface KeywordsApiResponse {
  keywords: { [keyword: string]: number };
  // 根据您真实后端的返回结构调整
  message?: string;
  keyword?: string;
  currentCount?: number;
}

export async function GET() {
  try {
    // 假设真实后端 GET /api/search-keyword/read
    const response = await apiClient<KeywordsApiResponse>(
      "/api/search-keyword/read"
    );
    return NextResponse.json({ keywords: response.keywords || {} });
  } catch (error: any) {
    console.error(
      "API Proxy Error (GET search-keywords):",
      error.message,
      error.data
    );
    return NextResponse.json(
      {
        error: error.message || "Failed to fetch search keywords",
        details: error.data,
      },
      { status: error.status || 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json(); // { keyword: "xxx" }
    // 真实后端的 /api/search-keyword/create 接口期望的 body 是一个字符串，而不是 JSON 对象
    // 所以我们需要从解析的 body 中取出 keyword 字符串
    const keywordToSubmit = body.keyword;

    if (!keywordToSubmit || typeof keywordToSubmit !== "string") {
      return NextResponse.json(
        { error: "keyword string is required in body" },
        { status: 400 }
      );
    }

    // 假设真实后端 POST /api/search-keyword/create
    const response = await apiClient<KeywordsApiResponse>(
      "/api/search-keyword/create",
      {
        method: "POST",
        headers: {
          // 真实后端期望的是 text/plain 或 application/x-www-form-urlencoded 等，而不是 application/json
          // 根据您 backend\api\search-keyword\create.ts 的 request.body，它似乎直接读取了请求体作为关键词。
          // 通常这意味着它期望一个简单的字符串体，或者一个简单的 application/x-www-form-urlencoded
          // 如果是简单字符串，Content-Type 应该是 text/plain
          "Content-Type": "text/plain",
        },
        body: keywordToSubmit, // 直接发送关键词字符串
      }
    );
    return NextResponse.json(response);
  } catch (error: any) {
    console.error(
      "API Proxy Error (POST search-keywords):",
      error.message,
      error.data
    );
    // 如果错误来自 apiClient 并且有 status，则使用它
    const status = error.status || 500;
    // 确保错误信息是字符串
    const errorMessage =
      typeof error.message === "string"
        ? error.message
        : "Failed to update search keyword";
    const errorDetails = error.data || (typeof error === "object" ? error : {});

    return NextResponse.json(
      { error: errorMessage, details: errorDetails },
      { status: status }
    );
  }
}
