// lib/apiClient.ts

interface RequestOptions extends RequestInit {
  // 可以添加一些自定义选项，例如 params 用于 GET 请求的查询参数
  params?: Record<string, string | number>;
}

const API_BASE_URL = process.env.API_BASE_URL;

async function apiClient<T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { params, ...fetchOptions } = options;
  let url = `${API_BASE_URL}${endpoint}`;

  if (params) {
    const queryParams = new URLSearchParams(params as Record<string, string>);
    url += `?${queryParams.toString()}`;
  }

  const defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    // 如果有需要，可以添加其他默认请求头，如认证 token
  };

  if (!(options.body instanceof FormData)) {
    // Check if body is FormData
    defaultHeaders["Content-Type"] = "application/json";
  }

  const config: RequestInit = {
    ...fetchOptions,
    headers: {
      ...defaultHeaders,
      ...fetchOptions.headers,
    },
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      // 如果 HTTP 状态码不在 200-299 范围，则抛出错误
      const errorData = await response.json().catch(() => ({
        // 尝试解析错误体，如果失败则返回空对象
        message: response.statusText || "An unknown error occurred",
        status: response.status,
      }));
      // 抛出一个包含状态码和错误信息的错误对象
      const error = new Error(
        errorData.message || `Request failed with status ${response.status}`
      ) as any;
      error.status = response.status;
      error.data = errorData;
      throw error;
    }

    // 如果响应体为空 (例如 204 No Content)，则返回 null 或 undefined
    if (response.status === 204) {
      return null as T;
    }

    // 尝试解析 JSON，如果失败则返回原始响应 (例如，如果后端返回文本)
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return (await response.json()) as T;
    }
    // 如果不是 JSON，可以考虑返回文本或其他格式，或者直接返回 Response 对象
    return (await response.text()) as T; // 或者 response.blob(), response.arrayBuffer()
  } catch (error) {
    console.error(`API Client Error: ${endpoint}`, error);
    // 重新抛出错误，以便上层调用者可以处理
    // 如果是网络错误或 fetch 本身抛出的错误，它可能没有 status 属性
    if (!(error as any).status) {
      const networkError = new Error("Network error or API unreachable") as any;
      networkError.isNetworkError = true;
      throw networkError;
    }
    throw error;
  }
}

export default apiClient;
