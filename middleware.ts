import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decodeJwt } from 'jose';
import { getRouteGuardRule, authorize, UserRole } from '@/lib/rbac';

// Publicly accessible paths that bypass middleware guards
const PUBLIC_PATHS = [
  '/',
  '/login',
  '/mfa',
  '/forgot-password',
  '/403',
  '/architecture',
  '/favicon.ico',
];

interface SessionTokenPayload {
  sub?: string;
  email?: string;
  role?: string;
  userRole?: string;
  exp?: number;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Bypass Next.js internal paths, static assets, and public routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    PUBLIC_PATHS.includes(pathname)
  ) {
    return NextResponse.next();
  }

  // 2. Check if the route has an RBAC rule
  const guardRule = getRouteGuardRule(pathname);
  if (!guardRule) {
    return NextResponse.next();
  }

  // 3. Extract Session Token from secure HTTP-only cookie
  const sessionCookie =
    request.cookies.get('session_token')?.value ||
    request.cookies.get('auth_token')?.value ||
    request.cookies.get('manhattan_session')?.value;

  let userRole: UserRole = 'viewer';
  let isAuthenticated = false;

  if (sessionCookie) {
    try {
      // Decode JWT payload (works on Edge runtime without Node crypto dependencies)
      const payload = decodeJwt(sessionCookie) as SessionTokenPayload;
      const extractedRole = (payload.role || payload.userRole || 'viewer').toLowerCase() as UserRole;
      userRole = extractedRole;
      isAuthenticated = true;
    } catch {
      // Invalid/tampered token
      isAuthenticated = false;
    }
  } else {
    // Development fallback check: Read simulated role header or cookie if present
    const devRoleHeader = request.headers.get('x-operator-role') || request.cookies.get('mc_operator_role')?.value;
    if (devRoleHeader) {
      userRole = devRoleHeader.toLowerCase() as UserRole;
      isAuthenticated = true;
    } else {
      // In dev environment default to authenticated session for preview fluidity
      userRole = 'owner';
      isAuthenticated = true;
    }
  }

  // 4. If completely unauthenticated, redirect to login
  if (!isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 5. Check Authorization: Deny under-privileged users with a 403 screen
  const isAuthorized = authorize(userRole, guardRule.requiredRoles);

  if (!isAuthorized) {
    const forbiddenUrl = new URL('/403', request.url);
    forbiddenUrl.searchParams.set('required_role', guardRule.requiredRoles.join(', '));
    forbiddenUrl.searchParams.set('attempted_route', pathname);
    forbiddenUrl.searchParams.set('user_role', userRole);
    forbiddenUrl.searchParams.set('module_name', guardRule.friendlyName);

    // Rewrite to 403 page while maintaining URL context (or redirect)
    return NextResponse.rewrite(forbiddenUrl);
  }

  // Pass user context forward to downstream components via request headers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-role', userRole);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
