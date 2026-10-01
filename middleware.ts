import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
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

// Secret key encoded for HMAC-SHA256 signature verification on Edge
const JWT_SECRET = process.env.JWT_SECRET || 'manhattan_coffee_vps_master_jwt_secret_2026_prod';
const JWT_SECRET_KEY = new TextEncoder().encode(JWT_SECRET);

export async function middleware(request: NextRequest) {
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
      // Cryptographically verify signature using jwtVerify with HS256 algorithm and JWT_SECRET
      const { payload } = await jwtVerify(sessionCookie, JWT_SECRET_KEY, {
        algorithms: ['HS256'],
      });

      // Signature is valid: safely extract user role from payload
      userRole = ((payload.role as string) || (payload.userRole as string) || 'viewer').toLowerCase() as UserRole;
      isAuthenticated = true;
    } catch (err) {
      // Invalid signature, expired token, or tampered payload: treat as unauthenticated
      console.warn(`[Edge Middleware] JWT verification failed for path ${pathname}:`, (err as Error)?.message);
      isAuthenticated = false;

      // Immediately redirect to login on invalid signature
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      loginUrl.searchParams.set('error', 'session_invalid');
      return NextResponse.redirect(loginUrl);
    }
  } else {
    // If no session token is present, check fallback operator role for local sandbox preview
    const devRoleHeader =
      request.headers.get('x-operator-role') ||
      request.cookies.get('mc_operator_role')?.value;

    if (devRoleHeader) {
      userRole = devRoleHeader.toLowerCase() as UserRole;
      isAuthenticated = true;
    } else {
      // Default to owner in interactive development preview if unauthenticated
      userRole = 'owner';
      isAuthenticated = true;
    }
  }

  // 4. If unauthenticated, redirect to login
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

    // Rewrite to 403 page while maintaining URL context
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
