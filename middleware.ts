import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const authToken = request.cookies.get('auth_token')?.value;
  const { pathname } = request.nextUrl;

  // 保护需要登录的路由
  const protectedRoutes = ['/user', '/tribute', '/archive/[id]/edit'];
  const isProtectedRoute = protectedRoutes.some((route) => {
    if (route.includes('[id]')) {
      // 处理动态路由，例如 /archive/[id]/edit
      const routePattern = route.replace('[id]', '\\d+');
      const regex = new RegExp(`^${routePattern}$`);
      return regex.test(pathname);
    }
    return pathname.startsWith(route);
  });

  // 如果访问受保护的路由但没有 token，重定向到登录页
  if (isProtectedRoute && !authToken) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // 如果已登录用户访问登录页，重定向到首页
  if (pathname === '/login' && authToken) {
    const homeUrl = new URL('/', request.url);
    return NextResponse.redirect(homeUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * 匹配所有路径除了:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - 静态资源文件
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
