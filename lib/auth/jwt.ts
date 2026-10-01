/**
 * Manhattan Coffee — Cryptographic JWT Token Authority
 * File: lib/auth/jwt.ts
 *
 * Implements HMAC-SHA256 JWT signing and verification using `jose`.
 * Replaces Supabase Auth with self-hosted cryptographic sessions.
 */

import { SignJWT, jwtVerify } from 'jose';
import { UserRole } from '@/lib/rbac';

// Secret key for HMAC-SHA256
const JWT_SECRET_STRING =
  process.env.JWT_SECRET || 'manhattan_coffee_vps_master_jwt_secret_2026_prod';

const JWT_SECRET_KEY = new TextEncoder().encode(JWT_SECRET_STRING);

export interface SessionTokenPayload {
  userId: string;
  email: string;
  fullName?: string;
  role: UserRole;
  mfaVerified: boolean;
  issuedAt?: number;
  exp?: number;
}

/**
 * Signs a cryptographically verified JWT session token
 */
export async function signSessionToken(
  payload: Omit<SessionTokenPayload, 'exp' | 'issuedAt'>,
  expiresIn = '7d'
): Promise<string> {
  const token = await new SignJWT({
    userId: payload.userId,
    email: payload.email,
    fullName: payload.fullName || 'Operator',
    role: payload.role,
    mfaVerified: payload.mfaVerified,
  })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .setIssuer('manhattan-coffee-auth')
    .setAudience('manhattan-admin-console')
    .sign(JWT_SECRET_KEY);

  return token;
}

/**
 * Cryptographically verifies a JWT session token with HS256 signature check.
 * Throws an error if expired, invalid, or tampered.
 */
export async function verifySessionToken(token: string): Promise<SessionTokenPayload> {
  const { payload } = await jwtVerify(token, JWT_SECRET_KEY, {
    algorithms: ['HS256'],
    issuer: 'manhattan-coffee-auth',
    audience: 'manhattan-admin-console',
  });

  return {
    userId: (payload.userId as string) || (payload.sub as string) || 'usr_anonymous',
    email: (payload.email as string) || 'operator@manhattancoffee.in',
    fullName: (payload.fullName as string) || 'Operator',
    role: ((payload.role as string) || 'viewer').toLowerCase() as UserRole,
    mfaVerified: Boolean(payload.mfaVerified),
    exp: payload.exp,
    issuedAt: payload.iat,
  };
}
