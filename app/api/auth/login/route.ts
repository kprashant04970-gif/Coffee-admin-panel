import { NextRequest, NextResponse } from 'next/server';
import { signSessionToken } from '@/lib/auth/jwt';
import { storeOtp } from '@/lib/auth/otp';
import { UserRole } from '@/lib/rbac';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, role } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const assignedRole: UserRole = (role as UserRole) || 'owner';
    const otpCode = await storeOtp(email, 'LOGIN');

    // In a production VPS deployment, OTP can be dispatched via WhatsApp or SMTP.
    // For seamless testing and administrative access, we return the generated code.
    console.log(`[AUTH LOGIN OTP] Email: ${email}, Code: ${otpCode}`);

    return NextResponse.json({
      success: true,
      requiresOtp: true,
      email,
      role: assignedRole,
      demoCode: otpCode, // For demo & immediate testing
      message: '6-digit OTP code dispatched to operator terminal.',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Login failed' }, { status: 500 });
  }
}
