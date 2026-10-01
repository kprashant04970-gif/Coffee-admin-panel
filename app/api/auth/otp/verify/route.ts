import { NextRequest, NextResponse } from 'next/server';
import { verifyOtp } from '@/lib/auth/otp';
import { signSessionToken } from '@/lib/auth/jwt';
import { UserRole } from '@/lib/rbac';

export async function POST(req: NextRequest) {
  try {
    const { email, code, role } = await req.json();

    if (!email || !code) {
      return NextResponse.json({ error: 'Email and OTP code are required' }, { status: 400 });
    }

    const isValid = await verifyOtp(email, code, 'LOGIN');
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid or expired OTP code' }, { status: 401 });
    }

    const assignedRole: UserRole = (role as UserRole) || 'owner';

    // Sign cryptographic JWT session token (7-day validity)
    const token = await signSessionToken({
      userId: `usr_${email.split('@')[0]}`,
      email,
      fullName: 'Manhattan Operator',
      role: assignedRole,
      mfaVerified: true,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        email,
        role: assignedRole,
        mfaVerified: true,
      },
    });

    // Set secure HTTP-only cookie
    response.cookies.set('session_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    // Also set fallback operator role cookie for client-side context sync
    response.cookies.set('mc_operator_role', assignedRole, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Verification failed' }, { status: 500 });
  }
}
